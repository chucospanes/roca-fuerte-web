-- 010_casas_venta_avances.sql — Avances del portal publicados en la ficha de la casa
--
-- "Diario de obra" en /casas/[slug]: un administrador publica un avance de una obra ligada a
-- una casa del catálogo (obras.casa_id, 009). Lo público es una COPIA:
--   - `casas_venta_avances`: fecha, título, descripción, video y nombres de fotos copiados del
--     avance. Sin ninguna referencia a las tablas del portal. Lectura pública solo si la
--     publicación está `visible` y la casa publicada.
--   - Fotos copiadas al bucket PÚBLICO `casas` en {casa_id}/avances/{publicacion_id}/NN.jpg.
--     Nada del bucket privado `obras` se vuelve público.
--   - La liga vive del lado privado: `avances.publicacion_id`.
-- Escritura solo con funciones que revisan es_admin() (009), con candados y registro:
--   admin_publicar_avance          crea la publicación OCULTA y devuelve su carpeta
--   admin_fijar_fotos_publicacion  comprueba que las fotos estén en esa carpeta y la hace visible
--   admin_despublicar_avance       borra la publicación (no el avance) y devuelve los archivos a
--                                  borrar del bucket `casas`
-- Casa vendida: lo publicado se congela (las tres funciones y el borrado en Storage se niegan).
-- Storage `casas`: un administrador sube SOLO JPG a la carpeta de una publicación que exista en
-- esa casa, y borra SOLO dentro de {casa_id}/avances/ (copias). Las fotos y el plano de la
-- casa ({casa_id}/archivo) siguen sin poder subirse ni borrarse desde la web.
--
-- ANTES DE APLICAR: 004, 005, 008 y 009 aplicadas.
-- Prueba con rollback: supabase/pruebas/010_casas_venta_avances.sql.
-- Ver docs/DECISIONES.md (2026-11-05).

begin;

-- ---------------------------------------------------------------------------------------
-- Tabla pública y liga privada
-- ---------------------------------------------------------------------------------------

create table public.casas_venta_avances (
  id           uuid primary key default gen_random_uuid(),
  casa_id      uuid not null references public.casas_venta (id) on delete cascade,
  fecha        date not null,
  titulo       text not null check (char_length(titulo) between 2 and 160),
  descripcion  text check (char_length(descripcion) <= 4000),
  -- Igual que avances.video_url (004): solo YouTube y Vimeo; la web arma el reproductor
  video_url    text check (
                 char_length(video_url) <= 300
                 and video_url ~ '^https://((www\.|m\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/'
               ),
  -- Nombres de las fotos en {casa_id}/avances/{id}/, en el orden en que se muestran
  fotos        text[] not null default '{}'
               check (cardinality(fotos) <= 50
                      and array_to_string(fotos, '/') ~ '^([0-9]{2,3}\.jpg(/|$))*$'),
  -- Oculta hasta terminar de copiar las fotos: nunca se ve a medias
  visible      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index casas_venta_avances_casa_fecha on public.casas_venta_avances (casa_id, fecha);

comment on table public.casas_venta_avances is
  'Diario de obra público de cada casa: copia de avances del portal publicados desde /admin. Sin referencias al portal. Fotos en el bucket público "casas", {casa_id}/avances/{id}/.';

create trigger casas_venta_avances_updated_at before update on public.casas_venta_avances
  for each row execute function public.casas_actualizar_updated_at();

-- Del lado privado: qué publicación salió de este avance (solo la ven miembros y administradores)
alter table public.avances
  add column publicacion_id uuid unique references public.casas_venta_avances (id) on delete set null;

comment on column public.avances.publicacion_id is
  'Publicación de este avance en la ficha de su casa (casas_venta_avances), o null.';

alter table public.casas_venta_avances enable row level security;
revoke all on table public.casas_venta_avances from anon, authenticated;
grant select on table public.casas_venta_avances to anon, authenticated;

create policy casas_venta_avances_lee_visibles on public.casas_venta_avances
  for select to anon, authenticated
  using (visible and exists (select 1 from public.casas_venta c
                             where c.id = casas_venta_avances.casa_id and c.publicada));

create policy casas_venta_avances_lee_admin on public.casas_venta_avances
  for select to authenticated using ((select public.es_admin()));

-- ---------------------------------------------------------------------------------------
-- Funciones (solo administradores)
-- ---------------------------------------------------------------------------------------

-- Crea la publicación OCULTA con una copia de los datos del avance. Devuelve su id y la
-- carpeta del bucket `casas` donde van las copias de las fotos.
create function public.admin_publicar_avance(p_avance_id uuid)
returns table (publicacion_id uuid, casa_id uuid, carpeta text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_avance  public.avances%rowtype;
  v_casa    uuid;
  v_estado  text;
  v_id      uuid;
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  select * into v_avance from public.avances a where a.id = p_avance_id for update;
  if not found then
    raise exception 'ALTO: no existe el avance.';
  end if;
  if v_avance.publicacion_id is not null then
    raise exception 'ALTO: este avance ya está publicado en la ficha.';
  end if;
  select o.casa_id into v_casa from public.obras o where o.id = v_avance.obra_id;
  if v_casa is null then
    raise exception 'ALTO: la obra no está ligada a una casa del catálogo.';
  end if;
  select c.estado into v_estado from public.casas_venta c where c.id = v_casa;
  if v_estado = 'vendida' then
    raise exception 'ALTO: la casa está vendida: lo publicado quedó congelado.';
  end if;

  insert into public.casas_venta_avances (casa_id, fecha, titulo, descripcion, video_url)
  values (v_casa, v_avance.fecha, v_avance.titulo, v_avance.descripcion, v_avance.video_url)
  returning id into v_id;

  update public.avances a set publicacion_id = v_id where a.id = v_avance.id;

  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'publicar_avance', v_avance.obra_id,
          jsonb_build_object('avance_id', v_avance.id, 'publicacion_id', v_id, 'casa_id', v_casa));

  return query select v_id, v_casa, v_casa::text || '/avances/' || v_id::text || '/';
end;
$$;

-- Fija las fotos de la publicación (en orden) y la hace visible. Cada foto debe estar ya en
-- {casa_id}/avances/{publicacion_id}/ del bucket `casas`. Con la lista vacía, se publica sin fotos.
create function public.admin_fijar_fotos_publicacion(p_publicacion_id uuid, p_fotos text[])
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

  update public.casas_venta_avances x set fotos = p_fotos, visible = true where x.id = v_pub.id;

  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'fijar_fotos_publicacion',
          (select a.obra_id from public.avances a where a.publicacion_id = v_pub.id),
          jsonb_build_object('publicacion_id', v_pub.id, 'fotos', cardinality(p_fotos)));

  return query select v_pub.id, cardinality(p_fotos);
end;
$$;

-- Quita el avance de la ficha: borra la publicación (el avance del portal queda igual, con
-- publicacion_id en null) y devuelve los archivos del bucket `casas` que hay que borrar.
create function public.admin_despublicar_avance(p_avance_id uuid)
returns table (archivo text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_avance  public.avances%rowtype;
  v_pub       public.casas_venta_avances%rowtype;
  v_estado    text;
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
  select c.estado into v_estado from public.casas_venta c where c.id = v_pub.casa_id;
  if v_estado = 'vendida' then
    raise exception 'ALTO: la casa está vendida: lo publicado quedó congelado.';
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

revoke all on function public.admin_publicar_avance(uuid) from public, anon;
revoke all on function public.admin_fijar_fotos_publicacion(uuid, text[]) from public, anon;
revoke all on function public.admin_despublicar_avance(uuid) from public, anon;
grant execute on function public.admin_publicar_avance(uuid) to authenticated;
grant execute on function public.admin_fijar_fotos_publicacion(uuid, text[]) to authenticated;
grant execute on function public.admin_despublicar_avance(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------
-- Storage: bucket público `casas`, solo la subcarpeta avances/ de cada casa
-- ---------------------------------------------------------------------------------------

-- Un administrador ve los archivos de las publicaciones (para borrarlos con la API de Storage)
create policy casas_avances_lee_admin on storage.objects
  for select to authenticated
  using (
    bucket_id = 'casas'
    and (select public.es_admin())
    and (storage.foldername(name))[2] = 'avances'
  );

-- Sube SOLO JPG a {casa_id}/avances/{publicacion_id}/archivo, de una publicación que exista en
-- esa casa, con la casa sin vender
create policy casas_avances_admin_sube on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'casas'
    and (select public.es_admin())
    and position('..' in name) = 0
    and lower(storage.extension(name)) = 'jpg'
    and array_length(storage.foldername(name), 1) = 3
    and (storage.foldername(name))[2] = 'avances'
    and exists (
      select 1 from public.casas_venta_avances x
      join public.casas_venta c on c.id = x.casa_id
      where x.id::text = (storage.foldername(name))[3]
        and x.casa_id::text = (storage.foldername(name))[1]
        and c.estado <> 'vendida'
    )
  );

-- Borra SOLO dentro de {casa_id}/avances/ (copias), con la casa sin vender. Las fotos y el
-- plano de la casa ({casa_id}/archivo) no se pueden borrar desde la web.
create policy casas_avances_admin_borra on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'casas'
    and (select public.es_admin())
    and array_length(storage.foldername(name), 1) = 3
    and (storage.foldername(name))[2] = 'avances'
    and exists (
      select 1 from public.casas_venta c
      where c.id::text = (storage.foldername(name))[1] and c.estado <> 'vendida'
    )
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
    foreach tabla in array array['public.casas_venta_avances', 'public.avances'] loop
      foreach permiso in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
        if has_table_privilege(rol, tabla, permiso) then
          raise exception 'ALTO: % tiene % sobre %. No se aplicó nada.', rol, permiso, tabla;
        end if;
      end loop;
    end loop;
    if not has_table_privilege(rol, 'public.casas_venta_avances', 'SELECT') then
      raise exception 'ALTO: % no puede leer casas_venta_avances. No se aplicó nada.', rol;
    end if;
  end loop;
  if has_table_privilege('anon', 'public.avances', 'SELECT') then
    raise exception 'ALTO: anon puede leer avances (portal). No se aplicó nada.';
  end if;

  foreach funcion in array array[
    'public.admin_publicar_avance(uuid)',
    'public.admin_fijar_fotos_publicacion(uuid, text[])',
    'public.admin_despublicar_avance(uuid)'] loop
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
