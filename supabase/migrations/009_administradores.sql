-- 009_administradores.sql — Panel de administración (/admin), v1
--
-- El permiso vive en la base, no en el código:
--   - `administradores`: quién es administrador. Nadie la lee ni la escribe desde la web; el
--     alta se hace por SQL en el panel de Supabase.
--   - `es_admin()`: ¿la sesión actual es de un administrador?
--   - Clientes y administradores siguen SIN permisos de escritura en las tablas. El panel
--     escribe solo con estas funciones, que revisan es_admin() y llevan los mismos candados
--     que las plantillas SQL:
--       admin_crear_avance   (avance nuevo; devuelve la carpeta de sus fotos)
--       admin_cambiar_etapa  (etapa del portal y, si la obra tiene casa ligada y no está
--                             vendida, la etapa pública de la casa; todo o nada)
--   - Lectura de todo para administradores: políticas extra que se suman a las de 004/005/008
--     (los miembros siguen viendo solo sus obras; el público, solo lo publicado).
--   - Storage (bucket `obras`): un administrador sube SOLO fotos a la carpeta de un avance que
--     exista en esa obra ({obra_id}/avances/{avance_id}/archivo). Sin políticas de update ni
--     delete: desde la web nadie borra ni sobrescribe archivos.
--   - `obras.casa_id`: liga una obra con su casa del catálogo.
--   - `registro_admin`: quién hizo qué y cuándo (lo escriben las funciones).
--
-- ANTES DE APLICAR: 004, 005, 007 y 008 aplicadas.
-- Prueba con rollback: supabase/pruebas/009_administradores.sql.
-- Ver docs/DECISIONES.md (2026-11-05).

begin;

-- ---------------------------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------------------------

create table public.administradores (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

comment on table public.administradores is
  'Cuentas con acceso a /admin. Sin acceso desde la web: el alta se hace por SQL.';

alter table public.administradores enable row level security;
revoke all on table public.administradores from anon, authenticated;
-- Sin políticas: con RLS activo y sin permisos, nadie la lee ni la escribe desde la web.

-- Corre como su dueño para poder leer `administradores`; search_path vacío para que nadie
-- pueda colarle otra tabla con el mismo nombre.
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

-- ---------------------------------------------------------------------------------------
-- Liga obra ↔ casa del catálogo y registro
-- ---------------------------------------------------------------------------------------

alter table public.obras
  add column casa_id uuid unique references public.casas_venta (id) on delete set null;

comment on column public.obras.casa_id is
  'Casa del catálogo que es esta obra (opcional). "Cambiar etapa" del panel actualiza también su avance público.';

create table public.registro_admin (
  id          bigint generated always as identity primary key,
  -- Sin FK: el registro se conserva aunque se borre la cuenta
  user_id     uuid not null,
  accion      text not null,
  obra_id     uuid,
  detalle     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

comment on table public.registro_admin is
  'Acciones del panel /admin. Lo escriben solo las funciones admin_*; no se lee desde la web.';

alter table public.registro_admin enable row level security;
revoke all on table public.registro_admin from anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- Lectura de todo para administradores (se suma a las políticas existentes)
-- ---------------------------------------------------------------------------------------

create policy obras_lee_admin on public.obras
  for select to authenticated using ((select public.es_admin()));
create policy etapas_lee_admin on public.etapas
  for select to authenticated using ((select public.es_admin()));
create policy avances_lee_admin on public.avances
  for select to authenticated using ((select public.es_admin()));
create policy obra_materiales_lee_admin on public.obra_materiales
  for select to authenticated using ((select public.es_admin()));
create policy documentos_lee_admin on public.documentos
  for select to authenticated using ((select public.es_admin()));
create policy casas_venta_lee_admin on public.casas_venta
  for select to authenticated using ((select public.es_admin()));
create policy casas_venta_etapas_lee_admin on public.casas_venta_etapas
  for select to authenticated using ((select public.es_admin()));

-- ---------------------------------------------------------------------------------------
-- Escritura: solo con funciones
-- ---------------------------------------------------------------------------------------

-- Avance nuevo. La etapa va por su número de orden (null = sin etapa). Devuelve el id y la
-- carpeta de las fotos en el bucket `obras`.
create function public.admin_crear_avance(
  p_obra_id      uuid,
  p_etapa_orden  smallint,
  p_fecha        date,
  p_titulo       text,
  p_descripcion  text default null,
  p_video_url    text default null
)
returns table (avance_id uuid, carpeta_fotos text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_titulo  text := nullif(trim(p_titulo), '');
  v_etapa   uuid;
  v_id      uuid;
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.obras o where o.id = p_obra_id) then
    raise exception 'ALTO: no existe la obra.';
  end if;
  if p_fecha is null or v_titulo is null then
    raise exception 'ALTO: la fecha y el título del avance son obligatorios.';
  end if;
  if p_etapa_orden is not null then
    select e.id into v_etapa from public.etapas e
    where e.obra_id = p_obra_id and e.orden = p_etapa_orden;
    if v_etapa is null then
      raise exception 'ALTO: la obra no tiene etapa de orden %.', p_etapa_orden;
    end if;
  end if;
  if exists (select 1 from public.avances a
             where a.obra_id = p_obra_id and a.fecha = p_fecha
               and lower(trim(a.titulo)) = lower(v_titulo)) then
    raise exception 'ALTO: esta obra ya tiene un avance con esa fecha y ese título.';
  end if;

  insert into public.avances (obra_id, etapa_id, fecha, titulo, descripcion, video_url)
  values (p_obra_id, v_etapa, p_fecha, v_titulo,
          nullif(trim(p_descripcion), ''), nullif(trim(p_video_url), ''))
  returning id into v_id;

  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'crear_avance', p_obra_id,
          jsonb_build_object('avance_id', v_id, 'fecha', p_fecha, 'titulo', v_titulo,
                             'etapa_orden', p_etapa_orden));

  return query select v_id, p_obra_id::text || '/avances/' || v_id::text || '/';
end;
$$;

-- Cambiar etapa: misma regla que la plantilla 5 de GUIA_CARGA_CASAS.md.
--   en_proceso: con fecha de inicio (si es null, conserva la que tiene; si no tiene, ALTO).
--   terminada:  fecha null conserva la de inicio.
--   por_iniciar: sin fecha (borra la de inicio).
-- Si la obra tiene casa ligada y la casa no está vendida, cambia también la etapa pública con
-- el mismo orden (ALTO si no existe o se llama distinto). Casa vendida: solo el portal.
create function public.admin_cambiar_etapa(
  p_etapa_id  uuid,
  p_estado    text,
  p_fecha     date default null
)
returns table (etapa_portal text, etapa_publica text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_etapa         public.etapas%rowtype;
  v_publica       public.casas_venta_etapas%rowtype;
  v_casa          uuid;
  v_casa_estado   text;
  v_texto_portal  text;
  v_texto_publica text;
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if p_estado is null or p_estado not in ('por_iniciar', 'en_proceso', 'terminada') then
    raise exception 'ALTO: estado va en por_iniciar, en_proceso o terminada.';
  end if;
  if p_estado = 'por_iniciar' and p_fecha is not null then
    raise exception 'ALTO: una etapa por iniciar va sin fecha.';
  end if;

  select * into v_etapa from public.etapas e where e.id = p_etapa_id for update;
  if not found then
    raise exception 'ALTO: no existe la etapa.';
  end if;
  if p_estado = 'en_proceso' and coalesce(p_fecha, v_etapa.fecha_inicio) is null then
    raise exception 'ALTO: una etapa en proceso necesita su fecha de inicio.';
  end if;

  select o.casa_id into v_casa from public.obras o where o.id = v_etapa.obra_id;
  if v_casa is null then
    v_texto_publica := 'sin casa del catálogo ligada';
  else
    select c.estado into v_casa_estado from public.casas_venta c where c.id = v_casa;
    if v_casa_estado = 'vendida' then
      v_texto_publica := 'casa vendida: el avance público no cambia';
    else
      select * into v_publica from public.casas_venta_etapas x
      where x.casa_id = v_casa and x.orden = v_etapa.orden for update;
      if not found then
        raise exception 'ALTO: la casa del catálogo ligada no tiene etapa de orden %.', v_etapa.orden;
      end if;
      if lower(trim(v_publica.nombre)) <> lower(trim(v_etapa.nombre)) then
        raise exception 'ALTO: la etapa % se llama "%" en el portal y "%" en la casa del catálogo.',
          v_etapa.orden, v_etapa.nombre, v_publica.nombre;
      end if;
      if p_estado = 'en_proceso' and coalesce(p_fecha, v_publica.fecha_inicio) is null then
        raise exception 'ALTO: una etapa en proceso necesita su fecha de inicio.';
      end if;
      update public.casas_venta_etapas x
      set estado = p_estado,
          fecha_inicio = case when p_estado = 'por_iniciar' then null
                              else coalesce(p_fecha, x.fecha_inicio) end
      where x.id = v_publica.id
      returning x.orden || '. ' || x.nombre || ' · ' || x.estado || ' · '
                || coalesce(x.fecha_inicio::text, 'sin fecha')
      into v_texto_publica;
    end if;
  end if;

  update public.etapas e
  set estado = p_estado,
      fecha_inicio = case when p_estado = 'por_iniciar' then null
                          else coalesce(p_fecha, e.fecha_inicio) end
  where e.id = v_etapa.id
  returning e.orden || '. ' || e.nombre || ' · ' || e.estado || ' · '
            || coalesce(e.fecha_inicio::text, 'sin fecha')
  into v_texto_portal;

  insert into public.registro_admin (user_id, accion, obra_id, detalle)
  values ((select auth.uid()), 'cambiar_etapa', v_etapa.obra_id,
          jsonb_build_object('etapa_id', v_etapa.id, 'orden', v_etapa.orden,
                             'antes', v_etapa.estado, 'estado', p_estado, 'fecha', p_fecha,
                             'publica', v_texto_publica));

  return query select v_texto_portal, v_texto_publica;
end;
$$;

-- Solo usuarios con sesión pueden llamarlas (y adentro se revisa que sean administradores)
revoke all on function public.admin_crear_avance(uuid, smallint, date, text, text, text) from public, anon;
revoke all on function public.admin_cambiar_etapa(uuid, text, date) from public, anon;
grant execute on function public.admin_crear_avance(uuid, smallint, date, text, text, text) to authenticated;
grant execute on function public.admin_cambiar_etapa(uuid, text, date) to authenticated;

-- ---------------------------------------------------------------------------------------
-- Storage: bucket `obras`
-- ---------------------------------------------------------------------------------------

-- Un administrador lista y firma todo el bucket (para ver qué fotos ya subió)
create policy obras_archivos_lee_admin on storage.objects
  for select to authenticated
  using (bucket_id = 'obras' and (select public.es_admin()));

-- Un administrador sube SOLO fotos, SOLO a {obra_id}/avances/{avance_id}/archivo, con un
-- avance que exista en esa obra. Sin update ni delete: no se sobrescribe ni se borra nada.
create policy obras_archivos_admin_sube_fotos on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'obras'
    and (select public.es_admin())
    and position('..' in name) = 0
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and array_length(storage.foldername(name), 1) = 3
    and (storage.foldername(name))[2] = 'avances'
    and exists (
      select 1 from public.avances a
      where a.id::text = (storage.foldername(name))[3]
        and a.obra_id::text = (storage.foldername(name))[1]
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
    -- Nadie escribe en las tablas desde la web
    foreach tabla in array array[
      'public.obras', 'public.obra_miembros', 'public.etapas', 'public.avances',
      'public.obra_materiales', 'public.documentos', 'public.casas_venta',
      'public.casas_venta_imagenes', 'public.casas_venta_etapas',
      'public.administradores', 'public.registro_admin'] loop
      foreach permiso in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
        if has_table_privilege(rol, tabla, permiso) then
          raise exception 'ALTO: % tiene % sobre %. No se aplicó nada.', rol, permiso, tabla;
        end if;
      end loop;
    end loop;
    -- Nadie lee administradores ni el registro
    foreach tabla in array array['public.administradores', 'public.registro_admin'] loop
      if has_table_privilege(rol, tabla, 'SELECT') then
        raise exception 'ALTO: % puede leer %. No se aplicó nada.', rol, tabla;
      end if;
    end loop;
  end loop;

  foreach funcion in array array[
    'public.es_admin()',
    'public.admin_crear_avance(uuid, smallint, date, text, text, text)',
    'public.admin_cambiar_etapa(uuid, text, date)'] loop
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
