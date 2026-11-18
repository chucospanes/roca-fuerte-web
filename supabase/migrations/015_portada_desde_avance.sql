-- 015_portada_desde_avance.sql — Elegir la foto de la tarjeta (portada) desde un avance publicado
--
-- La portada de una casa sigue siendo la foto de orden 1 en `casas_venta_imagenes` (005), la
-- misma regla que usó la plantilla 14 (portada de la fundación). Esta migración agrega una vía
-- desde /admin, sin SQL:
--   admin_elegir_portada(publicacion, foto, ancho, alto)
--     registra como portada una foto de un avance publicado en la ficha (la copia que ya está en
--     el bucket público `casas`, {casa_id}/avances/{publicacion_id}/NN.jpg; no se copia nada).
--     - Si la portada anterior también salió de un avance, se borra SU FILA (el archivo queda: es
--       del Diario de obra). Si era una foto propia de la casa, pasa a orden 2.
--     - Las fotos propias se renumeran siempre 2, 3, 4… en su orden actual (nunca se bajan dos
--       veces ni quedan huecos) y la nueva entra en 1. Se comprueba al final: 1, 2, 3… sin huecos
--       y exactamente una portada.
--   admin_despublicar_avance (modificada): no quita de la ficha un avance cuya foto es la portada
--     (la tarjeta quedaría apuntando a un archivo borrado).
--   admin_fijar_fotos_publicacion (modificada): no deja fuera de la lista la foto que es portada.
--   casas_venta_imagenes_lee_admin: el administrador lee las imágenes de todas las casas (para
--     marcar en el panel cuál es la portada, también en casas ocultas). Solo lectura.
-- Sin cambios de escritura: `casas_venta_imagenes` sigue sin INSERT, UPDATE ni DELETE para anon y
-- authenticated; la única vía es la función, que revisa es_admin().
--
-- ANTES DE APLICAR: 005, 009, 010 y 011 aplicadas.
-- Prueba con rollback: supabase/pruebas/015_portada_desde_avance.sql.
-- Ver docs/DECISIONES.md (2026-11-17).

begin;

-- ---------------------------------------------------------------------------------------
-- Lectura del administrador
-- ---------------------------------------------------------------------------------------

create policy casas_venta_imagenes_lee_admin on public.casas_venta_imagenes
  for select to authenticated using ((select public.es_admin()));

-- ---------------------------------------------------------------------------------------
-- Elegir la portada
-- ---------------------------------------------------------------------------------------

create function public.admin_elegir_portada(
  p_publicacion_id uuid,
  p_foto text,
  p_ancho integer,
  p_alto integer
)
returns table (casa_id uuid, ruta text, fotos_casa integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pub      public.casas_venta_avances%rowtype;
  v_estado   text;
  v_ruta     text;
  v_anterior public.casas_venta_imagenes%rowtype;
  v_propias  int;
  v_total    int;
  v_obra     uuid;
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  select * into v_pub from public.casas_venta_avances x where x.id = p_publicacion_id;
  if not found then
    raise exception 'ALTO: no existe la publicación.';
  end if;
  -- Una sola elección a la vez por casa (bloquea la fila de la casa)
  select c.estado into v_estado from public.casas_venta c where c.id = v_pub.casa_id for update;
  if v_estado = 'vendida' then
    raise exception 'ALTO: la casa está vendida: no se ve en lo público.';
  end if;
  if not v_pub.visible then
    raise exception 'ALTO: la publicación todavía no se ve en la ficha; termínala primero.';
  end if;
  if p_foto is null or p_foto !~ '^[0-9]{2,3}\.jpg$' or not (p_foto = any (v_pub.fotos)) then
    raise exception 'ALTO: esa foto no está publicada en este avance.';
  end if;
  if p_ancho is null or p_alto is null
     or p_ancho not between 200 and 4000 or p_alto not between 200 and 4000 then
    raise exception 'ALTO: la foto debe medir entre 200 y 4000 px por lado.';
  end if;

  v_ruta := v_pub.casa_id::text || '/avances/' || v_pub.id::text || '/' || p_foto;
  if not exists (select 1 from storage.objects o where o.bucket_id = 'casas' and o.name = v_ruta) then
    raise exception 'ALTO: falta la foto en el bucket casas (%).', v_ruta;
  end if;
  if exists (select 1 from public.casas_venta_imagenes i where i.ruta = v_ruta and i.orden = 1 and i.tipo = 'foto') then
    raise exception 'ALTO: esa foto ya es la foto de la tarjeta.';
  end if;
  if exists (select 1 from public.casas_venta_imagenes i where i.ruta = v_ruta) then
    raise exception 'ALTO: esa foto ya está registrada como foto de la casa.';
  end if;

  -- La portada anterior: si salió de un avance, se quita su fila (el archivo queda en el diario)
  select * into v_anterior from public.casas_venta_imagenes i
  where i.casa_id = v_pub.casa_id and i.tipo = 'foto' and i.orden = 1;
  if found and v_anterior.ruta like v_pub.casa_id::text || '/avances/%' then
    delete from public.casas_venta_imagenes i where i.id = v_anterior.id;
  end if;
  -- Por si quedó alguna otra fila de avance fuera del orden 1 (cargada a mano): tampoco es galería
  delete from public.casas_venta_imagenes i
  where i.casa_id = v_pub.casa_id and i.tipo = 'foto' and i.ruta like v_pub.casa_id::text || '/avances/%';

  -- Fotos propias: 2, 3, 4… en su orden actual. Dos pasos (+50 y luego el número final) para no
  -- chocar con la regla de orden único por casa.
  select count(*) into v_propias from public.casas_venta_imagenes i
  where i.casa_id = v_pub.casa_id and i.tipo = 'foto';
  if v_propias > 48 or exists (select 1 from public.casas_venta_imagenes i
                               where i.casa_id = v_pub.casa_id and i.tipo = 'foto' and i.orden > 50) then
    raise exception 'ALTO: la casa tiene más de 48 fotos o alguna con orden mayor que 50; no se pueden renumerar.';
  end if;
  -- Paso 1: 51, 52… (no choca con nada por debajo de 51, aunque el orden actual tenga huecos)
  update public.casas_venta_imagenes i set orden = x.n + 50
  from (select y.id, row_number() over (order by y.orden, y.created_at) as n
        from public.casas_venta_imagenes y
        where y.casa_id = v_pub.casa_id and y.tipo = 'foto') x
  where i.id = x.id;
  -- Paso 2: 2, 3, 4…
  update public.casas_venta_imagenes i set orden = i.orden - 49
  where i.casa_id = v_pub.casa_id and i.tipo = 'foto';

  insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt)
  values (v_pub.casa_id, 'foto', 1, v_ruta, p_ancho, p_alto,
          left('Foto de la obra: ' || v_pub.titulo, 300));

  -- Revisión final: 1, 2, 3… sin huecos y la nueva en el 1
  select count(*) into v_total from public.casas_venta_imagenes i
  where i.casa_id = v_pub.casa_id and i.tipo = 'foto';
  if v_total <> v_propias + 1
     or exists (select 1 from (select y.orden, row_number() over (order by y.orden) as n
                               from public.casas_venta_imagenes y
                               where y.casa_id = v_pub.casa_id and y.tipo = 'foto') z
                where z.orden <> z.n)
     or (select count(*) from public.casas_venta_imagenes i
         where i.casa_id = v_pub.casa_id and i.tipo = 'foto' and i.orden = 1 and i.ruta = v_ruta) <> 1 then
    raise exception 'ALTO: el orden de las fotos no quedó como se esperaba. No se cambió nada.';
  end if;

  select a.obra_id into v_obra from public.avances a where a.publicacion_id = v_pub.id;
  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'elegir_portada', v_obra,
          jsonb_build_object('casa_id', v_pub.casa_id, 'publicacion_id', v_pub.id, 'foto', p_foto,
                             'anterior', v_anterior.ruta));

  return query select v_pub.casa_id, v_ruta, v_total;
end;
$$;

comment on function public.admin_elegir_portada(uuid, text, integer, integer) is
  'Panel /admin: la foto de un avance publicado pasa a ser la portada (foto de orden 1) de su casa.';

-- ---------------------------------------------------------------------------------------
-- Quitar de la ficha: no si una de sus fotos es la portada (igual que 011, más ese candado)
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

  if exists (select 1 from public.casas_venta_imagenes i
             where i.casa_id = v_pub.casa_id
               and i.ruta like v_pub.casa_id::text || '/avances/' || v_pub.id::text || '/%') then
    raise exception 'ALTO: una foto de este avance es la foto de la tarjeta. Elige otra foto de la tarjeta antes de quitarlo de la ficha.';
  end if;

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

-- ---------------------------------------------------------------------------------------
-- Fijar fotos: no puede dejar fuera la foto que es portada (igual que 010, más ese candado)
-- ---------------------------------------------------------------------------------------

create or replace function public.admin_fijar_fotos_publicacion(p_publicacion_id uuid, p_fotos text[])
returns table (publicacion_id uuid, fotos integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pub     public.casas_venta_avances%rowtype;
  v_estado  text;
  v_falta   text;
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  select * into v_pub from public.casas_venta_avances x where x.id = p_publicacion_id for update;
  if not found then
    raise exception 'ALTO: no existe la publicación.';
  end if;
  select c.estado into v_estado from public.casas_venta c where c.id = v_pub.casa_id;
  if v_estado = 'vendida' then
    raise exception 'ALTO: la casa está vendida: lo publicado quedó congelado.';
  end if;
  if p_fotos is null or cardinality(p_fotos) > 50 then
    raise exception 'ALTO: la lista de fotos va de 0 a 50 nombres.';
  end if;
  if exists (select 1 from unnest(p_fotos) f where f !~ '^[0-9]{2,3}\.jpg$') then
    raise exception 'ALTO: cada foto se llama 01.jpg, 02.jpg…';
  end if;
  if (select count(distinct f) from unnest(p_fotos) f) <> cardinality(p_fotos) then
    raise exception 'ALTO: hay fotos repetidas en la lista.';
  end if;
  select string_agg(f, ', ') into v_falta
  from unnest(p_fotos) f
  where not exists (select 1 from storage.objects o
                    where o.bucket_id = 'casas'
                      and o.name = v_pub.casa_id::text || '/avances/' || v_pub.id::text || '/' || f);
  if v_falta is not null then
    raise exception 'ALTO: faltan en el bucket casas: %.', v_falta;
  end if;
  if exists (select 1 from public.casas_venta_imagenes i
             where i.casa_id = v_pub.casa_id
               and i.ruta like v_pub.casa_id::text || '/avances/' || v_pub.id::text || '/%'
               and not (substring(i.ruta from '[^/]+$') = any (p_fotos))) then
    raise exception 'ALTO: la foto de la tarjeta es de este avance y no puede quedar fuera de la lista.';
  end if;

  update public.casas_venta_avances x set fotos = p_fotos, visible = true where x.id = v_pub.id;

  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'fijar_fotos_publicacion',
          (select a.obra_id from public.avances a where a.publicacion_id = v_pub.id),
          jsonb_build_object('publicacion_id', v_pub.id, 'fotos', cardinality(p_fotos)));

  return query select v_pub.id, cardinality(p_fotos);
end;
$$;

revoke all on function public.admin_elegir_portada(uuid, text, integer, integer) from public, anon;
revoke all on function public.admin_despublicar_avance(uuid) from public, anon;
revoke all on function public.admin_fijar_fotos_publicacion(uuid, text[]) from public, anon;
grant execute on function public.admin_elegir_portada(uuid, text, integer, integer) to authenticated;
grant execute on function public.admin_despublicar_avance(uuid) to authenticated;
grant execute on function public.admin_fijar_fotos_publicacion(uuid, text[]) to authenticated;

-- ---------------------------------------------------------------------------------------
-- Comprobación: si algo no cumple, se revierte toda la migración
-- ---------------------------------------------------------------------------------------
do $$
declare
  rol     text;
  permiso text;
  funcion text;
begin
  foreach rol in array array['anon', 'authenticated'] loop
    foreach permiso in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
      if has_table_privilege(rol, 'public.casas_venta_imagenes', permiso) then
        raise exception 'ALTO: % tiene % sobre casas_venta_imagenes. No se aplicó nada.', rol, permiso;
      end if;
    end loop;
  end loop;
  foreach funcion in array array[
    'public.admin_elegir_portada(uuid, text, integer, integer)',
    'public.admin_despublicar_avance(uuid)',
    'public.admin_fijar_fotos_publicacion(uuid, text[])'] loop
    if has_function_privilege('anon', funcion, 'EXECUTE') then
      raise exception 'ALTO: anon puede ejecutar %. No se aplicó nada.', funcion;
    end if;
    if not has_function_privilege('authenticated', funcion, 'EXECUTE') then
      raise exception 'ALTO: authenticated no puede ejecutar %. No se aplicó nada.', funcion;
    end if;
    if not (select p.prosecdef and p.proconfig is not null
            from pg_proc p where p.oid = funcion::regprocedure) then
      raise exception 'ALTO: % no es security definer con search_path fijo. No se aplicó nada.', funcion;
    end if;
  end loop;
end;
$$;

commit;
