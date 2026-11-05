-- 011_casas_vendidas_ocultas.sql — Lo público muestra solo casas nuestras no vendidas
--
-- 1. La política pública de `casas_venta` excluye las vendidas. Las políticas públicas de
--    `casas_venta_imagenes` (005), `casas_venta_etapas` (008) y `casas_venta_avances` (010)
--    consultan `casas_venta`, y esa consulta pasa por esta política: en cascada, nada de una
--    vendida se ve desde la web (fila, fotos, etapas ni diario). No se borra nada. Los
--    administradores siguen viendo todo (casas_venta_lee_admin, 009).
-- 2. `casas_vendidas()`: lo único público de una vendida, modelo y departamento, para la tarjeta
--    mínima del catálogo.
-- 3. Candado `obras_casa_solo_compra`: solo una obra de compra se liga a una casa del catálogo
--    (una obra a pedido o de inversionista nunca llega a lo público).
-- 4. Con la casa vendida, el administrador puede "Quitar de la ficha" y borrar las copias
--    públicas de sus fotos (antes se negaba: "congelado"). Publicar sigue negado.
--
-- ANTES DE APLICAR: 005, 008, 009 y 010 aplicadas.
-- Prueba con rollback: supabase/pruebas/011_casas_vendidas_ocultas.sql.
-- Ver docs/DECISIONES.md (2026-11-05, "Lo público muestra solo casas nuestras no vendidas").

begin;

-- ---------------------------------------------------------------------------------------
-- 1. Lectura pública: publicadas y no vendidas
-- ---------------------------------------------------------------------------------------

drop policy casas_venta_lee_publicadas on public.casas_venta;
create policy casas_venta_lee_publicadas on public.casas_venta
  for select to anon, authenticated
  using (publicada and estado <> 'vendida');

-- ---------------------------------------------------------------------------------------
-- 2. Tarjeta mínima de las vendidas: solo modelo y departamento
-- ---------------------------------------------------------------------------------------

create function public.casas_vendidas()
returns table (modelo text, departamento text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.modelo, c.departamento
  from public.casas_venta c
  where c.publicada and c.estado = 'vendida'
  order by c.orden, c.created_at;
$$;

comment on function public.casas_vendidas() is
  'Lo único público de una casa vendida: modelo y departamento (tarjeta mínima del catálogo).';

revoke all on function public.casas_vendidas() from public;
grant execute on function public.casas_vendidas() to anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- 3. Solo una obra de compra se liga a una casa del catálogo
-- ---------------------------------------------------------------------------------------

-- Si alguna obra existente no cumple, falla aquí y no se aplica nada
alter table public.obras
  add constraint obras_casa_solo_compra check (casa_id is null or modalidad = 'compra');

-- ---------------------------------------------------------------------------------------
-- 4. Quitar de la ficha también con la casa vendida (igual que 010, sin ese candado)
-- ---------------------------------------------------------------------------------------

create or replace function public.admin_despublicar_avance(p_avance_id uuid)
returns table (archivo text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_avance    public.avances%rowtype;
  v_pub       public.casas_venta_avances%rowtype;
  v_archivos  text[];
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  select * into v_avance from public.avances a where a.id = p_avance_id for update;
  if not found then
    raise exception 'ALTO: no existe el avance.';
  end if;
  if v_avance.publicacion_id is null then
    raise exception 'ALTO: este avance no está publicado en la ficha.';
  end if;
  select * into v_pub from public.casas_venta_avances x where x.id = v_avance.publicacion_id for update;

  -- Archivos de la carpeta de la publicación (también los copiados y no fijados)
  select coalesce(array_agg(o.name order by o.name), '{}') into v_archivos
  from storage.objects o
  where o.bucket_id = 'casas'
    and o.name like v_pub.casa_id::text || '/avances/' || v_pub.id::text || '/%';

  -- avances.publicacion_id queda en null por la FK (on delete set null)
  delete from public.casas_venta_avances x where x.id = v_pub.id;

  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'despublicar_avance', v_avance.obra_id,
          jsonb_build_object('avance_id', v_avance.id, 'publicacion_id', v_pub.id,
                             'archivos', cardinality(v_archivos)));

  return query select unnest(v_archivos);
end;
$$;

revoke all on function public.admin_despublicar_avance(uuid) from public, anon;
grant execute on function public.admin_despublicar_avance(uuid) to authenticated;

-- Borrar copias: ya no exige que la casa no esté vendida (solo dentro de {casa_id}/avances/)
drop policy casas_avances_admin_borra on storage.objects;
create policy casas_avances_admin_borra on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'casas'
    and (select public.es_admin())
    and array_length(storage.foldername(name), 1) = 3
    and (storage.foldername(name))[2] = 'avances'
    and exists (select 1 from public.casas_venta c where c.id::text = (storage.foldername(name))[1])
  );

-- ---------------------------------------------------------------------------------------
-- Comprobación: si algo no cumple, se revierte toda la migración
-- ---------------------------------------------------------------------------------------
do $$
declare
  rol     text;
  tabla   text;
  permiso text;
  funcion text;
begin
  foreach rol in array array['anon', 'authenticated'] loop
    foreach tabla in array array[
      'public.casas_venta', 'public.casas_venta_imagenes', 'public.casas_venta_etapas',
      'public.casas_venta_avances', 'public.obras'] loop
      foreach permiso in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
        if has_table_privilege(rol, tabla, permiso) then
          raise exception 'ALTO: % tiene % sobre %. No se aplicó nada.', rol, permiso, tabla;
        end if;
      end loop;
    end loop;
    if not has_function_privilege(rol, 'public.casas_vendidas()', 'EXECUTE') then
      raise exception 'ALTO: % no puede ejecutar casas_vendidas(). No se aplicó nada.', rol;
    end if;
  end loop;
  if has_function_privilege('anon', 'public.admin_despublicar_avance(uuid)', 'EXECUTE') then
    raise exception 'ALTO: anon puede ejecutar admin_despublicar_avance. No se aplicó nada.';
  end if;
  foreach funcion in array array['public.casas_vendidas()', 'public.admin_despublicar_avance(uuid)'] loop
    if not (select p.prosecdef and p.proconfig is not null
            from pg_proc p where p.oid = funcion::regprocedure) then
      raise exception 'ALTO: % no es security definer con search_path fijo. No se aplicó nada.', funcion;
    end if;
  end loop;
end;
$$;

commit;
