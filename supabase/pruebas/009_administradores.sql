-- Prueba del panel de administración (migración 009). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 009, con aprobación del usuario.
-- Igual que las demás pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y
-- el error revierte todo (usuarios, casas, obras, etapas, avances, archivos simulados y
-- registro). El resultado se lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- Datos: administrador A; cliente C (miembro de la obra 1); casa P en construcción (etapas
-- públicas 1–4; la 4 se llama "Paredes") y casa V vendida; casa H oculta. Obra 1 ligada a P
-- (etapas 1 Terracería, 2 Trazo y zanjeado, 3 Fundaciones, 4 Muros, 5 Techo), obra 2 ligada
-- a V, obra 3 sin casa (etapa 1 por iniciar, sin fecha). Un avance existente en la obra 1.
-- Los archivos de Storage se simulan con filas en storage.objects (sin archivo real).
--
-- Comprueba:
--   Cliente C: ve solo su obra y ninguna casa oculta; es_admin() = false; las dos funciones
--     dan 42501; escribir directo en las tablas (portal, casas, administradores, registro) da
--     42501; no lee administradores ni registro; no sube archivos a Storage (ni a su carpeta).
--   anon: no ejecuta es_admin() ni las funciones.
--   Administrador A: es_admin() = true; ve todas las obras y la casa oculta; tampoco escribe
--     directo en las tablas (solo con las funciones).
--     admin_crear_avance: crea con etapa y sin etapa; 5 candados (obra inexistente, sin título,
--       etapa inexistente, fecha y título repetidos, video que no es de YouTube/Vimeo).
--     admin_cambiar_etapa: inicia y termina cambiando portal y casa a la vez; casa vendida y
--       obra sin casa cambian solo el portal; 6 candados (estado inválido, por iniciar con
--       fecha, en proceso sin fecha, nombres distintos, la casa no tiene la etapa, etapa
--       inexistente) sin cambiar nada.
--     Storage: sube una foto a la carpeta de un avance; rechaza avance inexistente, avance de
--       otra obra, PDF, "..", subcarpeta, carpeta de documentos y bucket `casas`; no borra ni
--       sobrescribe.
--   Registro: una fila por cada cambio hecho (4), ninguna por los candados.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.obras;           -- igual que antes de la prueba
--   select count(*) from public.registro_admin;  -- igual que antes de la prueba

do $prueba$
declare
  usuario_a  constant uuid := 'c0000000-0000-4000-8000-000000000a01';
  usuario_c  constant uuid := 'c0000000-0000-4000-8000-000000000a02';
  casa_p     constant uuid := 'c0000000-0000-4000-8000-000000000b01';
  casa_v     constant uuid := 'c0000000-0000-4000-8000-000000000b02';
  casa_h     constant uuid := 'c0000000-0000-4000-8000-000000000b03';
  obra_1     constant uuid := 'c0000000-0000-4000-8000-000000000d01';
  obra_2     constant uuid := 'c0000000-0000-4000-8000-000000000d02';
  obra_3     constant uuid := 'c0000000-0000-4000-8000-000000000d03';
  avance_0   constant uuid := 'c0000000-0000-4000-8000-000000000e01';
  nada       constant uuid := 'c0000000-0000-4000-8000-000000000fff';
  e1_2  uuid; e1_3 uuid; e1_4 uuid; e1_5 uuid; e2_1 uuid; e3_1 uuid;
  registro_0  bigint;
  avance_n    uuid;
  r           record;
  caso        record;
  sentencia   text;
  mensaje     text;
  antes       text;
  despues     text;
  n           bigint;
  b           boolean;
  q_huella    constant text := $q$
select (select string_agg(orden || estado || coalesce(fecha_inicio::text, '-'), '|' order by obra_id, orden)
        from public.etapas where obra_id in ($1, $2, $3))
    || '#' ||
       (select string_agg(orden || estado || coalesce(fecha_inicio::text, '-'), '|' order by casa_id, orden)
        from public.casas_venta_etapas where casa_id in ($4, $5))
    || '#' || (select count(*) from public.avances where obra_id in ($1, $2, $3))
$q$;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  select count(*) into registro_0 from public.registro_admin;

  insert into auth.users (id, email, aud, role) values
    (usuario_a, 'prueba-admin@ejemplo.invalid',   'authenticated', 'authenticated'),
    (usuario_c, 'prueba-cliente@ejemplo.invalid', 'authenticated', 'authenticated');
  insert into public.administradores (user_id) values (usuario_a);

  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, estado, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-009-p', true,  'Casa de prueba P', 'Distrito P', 'Municipio P', 'La Libertad', 'en_construccion', 5, 20),
    (casa_v, 'prueba-009-v', true,  'Casa de prueba V', 'Distrito V', 'Municipio V', 'La Libertad', 'vendida',         5, 20),
    (casa_h, 'prueba-009-h', false, 'Casa de prueba H', 'Distrito H', 'Municipio H', 'La Libertad', 'en_construccion', 5, 20);
  insert into public.casas_venta_etapas (casa_id, orden, nombre, estado, fecha_inicio) values
    (casa_p, 1, 'Terracería',       'terminada',   '2026-10-25'),
    (casa_p, 2, 'Trazo y zanjeado', 'en_proceso',  '2026-11-03'),
    (casa_p, 3, 'Fundaciones',      'por_iniciar', null),
    (casa_p, 4, 'Paredes',          'por_iniciar', null),
    (casa_v, 1, 'Terracería',       'en_proceso',  '2026-10-01');

  insert into public.obras (id, nombre, modalidad, casa_id) values
    (obra_1, 'Obra de prueba 009 (1)', 'compra', casa_p),
    (obra_2, 'Obra de prueba 009 (2)', 'compra', casa_v),
    (obra_3, 'Obra de prueba 009 (3)', 'construccion_terreno', null);
  insert into public.obra_miembros (obra_id, user_id) values (obra_1, usuario_c);
  insert into public.etapas (obra_id, orden, nombre, estado, fecha_inicio) values
    (obra_1, 1, 'Terracería',       'terminada',   '2026-10-25'),
    (obra_1, 2, 'Trazo y zanjeado', 'en_proceso',  '2026-11-03'),
    (obra_1, 3, 'Fundaciones',      'por_iniciar', null),
    (obra_1, 4, 'Muros',            'por_iniciar', null),
    (obra_1, 5, 'Techo',            'por_iniciar', null),
    (obra_2, 1, 'Terracería',       'en_proceso',  '2026-10-01'),
    (obra_3, 1, 'Inicio',           'por_iniciar', null);
  select id into e1_2 from public.etapas where obra_id = obra_1 and orden = 2;
  select id into e1_3 from public.etapas where obra_id = obra_1 and orden = 3;
  select id into e1_4 from public.etapas where obra_id = obra_1 and orden = 4;
  select id into e1_5 from public.etapas where obra_id = obra_1 and orden = 5;
  select id into e2_1 from public.etapas where obra_id = obra_2 and orden = 1;
  select id into e3_1 from public.etapas where obra_id = obra_3 and orden = 1;
  insert into public.avances (id, obra_id, fecha, titulo) values
    (avance_0, obra_1, '2026-10-25', 'Inicio de la terracería');

  -- -------------------------------------------------------------------------------------
  -- Cliente C
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_c, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into n from public.obras where id in (obra_1, obra_2, obra_3);
  if n <> 1 then raise exception 'FALLA cliente: ve % obras de prueba (se esperaba 1, la suya)', n; end if;
  select count(*) into n from public.casas_venta where id = casa_h;
  if n <> 0 then raise exception 'FALLA cliente: ve la casa oculta'; end if;
  select public.es_admin() into b;
  if b then raise exception 'FALLA cliente: es_admin() dio true'; end if;

  foreach sentencia in array array[
    format('select * from public.admin_crear_avance(%L, 2::smallint, %L, %L)', obra_1, '2026-11-04', 'Intruso'),
    format('select * from public.admin_cambiar_etapa(%L, %L, %L)', e1_3, 'en_proceso', '2026-12-01'),
    format('insert into public.avances (obra_id, fecha, titulo) values (%L, %L, %L)', obra_1, '2026-11-04', 'Intruso'),
    format('update public.etapas set estado = %L where id = %L', 'terminada', e1_3),
    format('delete from public.avances where id = %L', avance_0),
    format('insert into public.documentos (obra_id, tipo, titulo, ruta) values (%L, %L, %L, %L)',
           obra_1, 'otro', 'Intruso', obra_1::text || '/documentos/x.pdf'),
    format('insert into public.obra_materiales (obra_id, material) values (%L, %L)', obra_1, 'Intruso'),
    format('insert into public.obra_miembros (obra_id, user_id) values (%L, %L)', obra_2, usuario_c),
    format('update public.obras set casa_id = null where id = %L', obra_1),
    format('update public.casas_venta_etapas set estado = %L where casa_id = %L', 'terminada', casa_p),
    format('update public.casas_venta set precio_usd = 1 where id = %L', casa_p),
    format('insert into public.administradores (user_id) values (%L)', usuario_c),
    'select count(*) from public.administradores',
    'select count(*) from public.registro_admin',
    format('insert into public.registro_admin (user_id, accion) values (%L, %L)', usuario_c, 'intruso'),
    format('insert into storage.objects (bucket_id, name) values (%L, %L)',
           'obras', obra_1::text || '/avances/' || avance_0::text || '/intruso.jpg')
  ] loop
    begin
      execute sentencia;
      raise exception 'FALLA cliente: pudo ejecutar: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;
  reset role;

  -- -------------------------------------------------------------------------------------
  -- anon
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  foreach sentencia in array array[
    'select public.es_admin()',
    format('select * from public.admin_crear_avance(%L, 2::smallint, %L, %L)', obra_1, '2026-11-04', 'Intruso'),
    format('select * from public.admin_cambiar_etapa(%L, %L, %L)', e1_3, 'en_proceso', '2026-12-01')
  ] loop
    begin
      execute sentencia;
      raise exception 'FALLA anon: pudo ejecutar: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;
  reset role;

  -- -------------------------------------------------------------------------------------
  -- Administrador A
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select public.es_admin() into b;
  if not b then raise exception 'FALLA admin: es_admin() dio false'; end if;
  select count(*) into n from public.obras where id in (obra_1, obra_2, obra_3);
  if n <> 3 then raise exception 'FALLA admin: ve % obras de prueba (se esperaban 3)', n; end if;
  select count(*) into n from public.casas_venta where id = casa_h;
  if n <> 1 then raise exception 'FALLA admin: no ve la casa oculta'; end if;

  -- Tampoco escribe directo en las tablas
  foreach sentencia in array array[
    format('insert into public.avances (obra_id, fecha, titulo) values (%L, %L, %L)', obra_1, '2026-11-04', 'Directo'),
    format('update public.etapas set estado = %L where id = %L', 'terminada', e1_3),
    format('update public.casas_venta_etapas set estado = %L where casa_id = %L', 'terminada', casa_p),
    format('insert into public.administradores (user_id) values (%L)', usuario_c)
  ] loop
    begin
      execute sentencia;
      raise exception 'FALLA admin: pudo escribir directo: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;

  -- admin_crear_avance: candados (ninguno cambia nada)
  execute q_huella into antes using obra_1, obra_2, obra_3, casa_p, casa_v;
  for caso in
    select * from (values
      (format('select * from public.admin_crear_avance(%L, 2::smallint, %L, %L)', nada, '2026-11-04', 'Zanjas'),
       'ALTO: no existe la obra%'),
      (format('select * from public.admin_crear_avance(%L, 2::smallint, %L, %L)', obra_1, '2026-11-04', '   '),
       'ALTO: la fecha y el título del avance son obligatorios%'),
      (format('select * from public.admin_crear_avance(%L, 9::smallint, %L, %L)', obra_1, '2026-11-04', 'Zanjas'),
       'ALTO: la obra no tiene etapa de orden 9%'),
      (format('select * from public.admin_crear_avance(%L, 1::smallint, %L, %L)', obra_1, '2026-10-25', ' INICIO de la terracería '),
       'ALTO: esta obra ya tiene un avance con esa fecha y ese título%'),
      (format('select * from public.admin_crear_avance(%L, 2::smallint, %L, %L, null, %L)', obra_1, '2026-11-04', 'Zanjas',
              'https://www.tiktok.com/@x/video/1'),
       '%avances_video_url_check%')
    ) as c (sql, esperado)
  loop
    begin
      execute caso.sql into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like ('%' || caso.esperado) then
      raise exception 'FALLA admin_crear_avance: % → %', caso.sql, coalesce(mensaje, 'no dio error');
    end if;
  end loop;
  execute q_huella into despues using obra_1, obra_2, obra_3, casa_p, casa_v;
  if despues is distinct from antes then
    raise exception 'FALLA admin_crear_avance: un ALTO cambió datos';
  end if;

  -- admin_crear_avance: con etapa (título y descripción sin espacios de más) y sin etapa
  select * into r from public.admin_crear_avance(obra_1, 2::smallint, '2026-11-04',
    '  Zanjas para las fundaciones ', '  Zanjeado del perímetro. ', 'https://youtu.be/aaaaaaaaaaa');
  avance_n := r.avance_id;
  if avance_n is null or r.carpeta_fotos <> obra_1::text || '/avances/' || avance_n::text || '/' then
    raise exception 'FALLA admin_crear_avance con etapa: (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.avances where id = avance_n and etapa_id = e1_2
                 and titulo = 'Zanjas para las fundaciones' and descripcion = 'Zanjeado del perímetro.'
                 and video_url = 'https://youtu.be/aaaaaaaaaaa') then
    raise exception 'FALLA admin_crear_avance con etapa: la fila no tiene los datos esperados';
  end if;
  select * into r from public.admin_crear_avance(obra_3, null, '2026-11-05', 'Visita a la obra');
  if r.avance_id is null
     or not exists (select 1 from public.avances where id = r.avance_id and etapa_id is null and descripcion is null) then
    raise exception 'FALLA admin_crear_avance sin etapa: (%)', row_to_json(r);
  end if;

  -- admin_cambiar_etapa: candados (ninguno cambia nada)
  execute q_huella into antes using obra_1, obra_2, obra_3, casa_p, casa_v;
  for caso in
    select * from (values
      (format('select * from public.admin_cambiar_etapa(%L, %L)', e1_3, 'pendiente'),
       'ALTO: estado va en%'),
      (format('select * from public.admin_cambiar_etapa(%L, %L, %L)', e1_3, 'por_iniciar', '2026-12-01'),
       'ALTO: una etapa por iniciar va sin fecha%'),
      (format('select * from public.admin_cambiar_etapa(%L, %L)', e3_1, 'en_proceso'),
       'ALTO: una etapa en proceso necesita su fecha de inicio%'),
      (format('select * from public.admin_cambiar_etapa(%L, %L, %L)', e1_4, 'en_proceso', '2026-12-01'),
       'ALTO: la etapa 4 se llama "Muros" en el portal y "Paredes" en la casa del catálogo%'),
      (format('select * from public.admin_cambiar_etapa(%L, %L, %L)', e1_5, 'en_proceso', '2026-12-01'),
       'ALTO: la casa del catálogo ligada no tiene etapa de orden 5%'),
      (format('select * from public.admin_cambiar_etapa(%L, %L, %L)', nada, 'en_proceso', '2026-12-01'),
       'ALTO: no existe la etapa%')
    ) as c (sql, esperado)
  loop
    begin
      execute caso.sql into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like ('%' || caso.esperado) then
      raise exception 'FALLA admin_cambiar_etapa: % → %', caso.sql, coalesce(mensaje, 'no dio error');
    end if;
  end loop;
  execute q_huella into despues using obra_1, obra_2, obra_3, casa_p, casa_v;
  if despues is distinct from antes then
    raise exception 'FALLA admin_cambiar_etapa: un ALTO cambió datos';
  end if;

  -- Iniciar la 3: portal y casa a la vez
  select * into r from public.admin_cambiar_etapa(e1_3, 'en_proceso', '2026-12-01');
  if r.etapa_portal  is distinct from '3. Fundaciones · en_proceso · 2026-12-01'
     or r.etapa_publica is distinct from '3. Fundaciones · en_proceso · 2026-12-01' then
    raise exception 'FALLA iniciar etapa 3: (%)', row_to_json(r);
  end if;
  -- Terminar la 2 sin fecha: conserva la de inicio en los dos lados
  select * into r from public.admin_cambiar_etapa(e1_2, 'terminada');
  if r.etapa_portal  is distinct from '2. Trazo y zanjeado · terminada · 2026-11-03'
     or r.etapa_publica is distinct from '2. Trazo y zanjeado · terminada · 2026-11-03' then
    raise exception 'FALLA terminar etapa 2: (%)', row_to_json(r);
  end if;
  -- Casa vendida: solo el portal
  select * into r from public.admin_cambiar_etapa(e2_1, 'terminada');
  if r.etapa_portal is distinct from '1. Terracería · terminada · 2026-10-01'
     or r.etapa_publica not like 'casa vendida%' then
    raise exception 'FALLA casa vendida: (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.casas_venta_etapas where casa_id = casa_v and orden = 1 and estado = 'en_proceso') then
    raise exception 'FALLA casa vendida: cambió la etapa pública';
  end if;
  -- Obra sin casa: solo el portal
  select * into r from public.admin_cambiar_etapa(e3_1, 'en_proceso', '2026-11-05');
  if r.etapa_portal is distinct from '1. Inicio · en_proceso · 2026-11-05'
     or r.etapa_publica not like 'sin casa%' then
    raise exception 'FALLA obra sin casa: (%)', row_to_json(r);
  end if;

  -- Storage: sube una foto a la carpeta del avance nuevo
  begin
    insert into storage.objects (bucket_id, name)
    values ('obras', obra_1::text || '/avances/' || avance_n::text || '/01.jpg');
  exception when others then
    raise exception 'FALLA admin: no pudo subir la foto a la carpeta del avance: %', sqlerrm;
  end;
  -- Storage: rutas rechazadas
  foreach sentencia in array array[
    obra_1::text || '/avances/' || nada::text || '/01.jpg',        -- avance inexistente
    obra_2::text || '/avances/' || avance_n::text || '/01.jpg',    -- avance de otra obra
    obra_1::text || '/avances/' || avance_n::text || '/01.pdf',    -- no es foto
    obra_1::text || '/avances/' || avance_n::text || '/../01.jpg', -- ".."
    obra_1::text || '/avances/' || avance_n::text || '/sub/01.jpg',-- subcarpeta
    obra_1::text || '/documentos/01.jpg',                          -- documentos (v2)
    obra_1::text || '/01.jpg'                                      -- raíz de la obra
  ] loop
    begin
      insert into storage.objects (bucket_id, name) values ('obras', sentencia);
      raise exception 'FALLA admin: subió a una ruta no permitida: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;
  begin
    insert into storage.objects (bucket_id, name)
    values ('casas', casa_p::text || '/intruso.jpg');
    raise exception 'FALLA admin: subió al bucket casas';
  exception when insufficient_privilege then null;
  end;
  -- Storage: no borra ni sobrescribe (sin políticas: 0 filas o error, nunca cambia)
  begin
    delete from storage.objects
    where bucket_id = 'obras' and name = obra_1::text || '/avances/' || avance_n::text || '/01.jpg';
  exception when others then null;
  end;
  begin
    update storage.objects set name = obra_1::text || '/avances/' || avance_n::text || '/02.jpg'
    where bucket_id = 'obras' and name = obra_1::text || '/avances/' || avance_n::text || '/01.jpg';
  exception when others then null;
  end;
  reset role;
  if not exists (select 1 from storage.objects
                 where bucket_id = 'obras' and name = obra_1::text || '/avances/' || avance_n::text || '/01.jpg') then
    raise exception 'FALLA admin: pudo borrar o renombrar una foto';
  end if;

  -- Registro: 2 avances + 4 cambios de etapa = 6 filas del administrador, ninguna de candados
  select count(*) into n from public.registro_admin;
  if n - registro_0 <> 6 then
    raise exception 'FALLA registro: % filas nuevas (se esperaban 6)', n - registro_0;
  end if;
  if exists (select 1 from public.registro_admin
             where created_at >= now() and user_id <> usuario_a) then
    raise exception 'FALLA registro: hay filas de otro usuario';
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: cliente sin escritura (16 intentos en 42501) y sin ver lo ajeno; anon sin funciones; admin ve todo, no escribe directo, crea avances (5 candados) y cambia etapas en portal y casa (6 candados; vendida y sin casa solo el portal); Storage solo fotos en la carpeta de un avance, sin borrar ni sobrescribir; registro con 6 filas. Todo revertido.';
end;
$prueba$;
