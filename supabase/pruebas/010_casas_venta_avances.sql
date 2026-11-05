-- Prueba de los avances publicados en la ficha (migración 010). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 010, con aprobación del usuario.
-- Igual que las demás pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y
-- el error revierte todo (usuarios, casas, obras, avances, publicaciones, archivos simulados y
-- registro). El resultado se lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- Datos: administrador A; cliente C (miembro de la obra 1). Casas: P en construcción y
-- publicada, V vendida y publicada, H oculta. Obras: 1 → P, 2 → V, 3 sin casa, 4 → H. Avances:
-- a1 y a2 en la obra 1, a3 en la 2, a4 en la 3, a5 en la 4. Un archivo de la casa P
-- ({P}/fachada.jpg) y uno del portal ({obra1}/avances/{a1}/01.jpg). Los archivos de Storage se
-- simulan con filas en storage.objects (sin archivo real).
--
-- Comprueba:
--   Cliente C: las 3 funciones dan 42501; no escribe en casas_venta_avances ni en avances; no
--     sube ni borra en el bucket casas; no ve publicaciones ocultas.
--   anon: no ejecuta las funciones; ve solo publicaciones visibles de casas publicadas; no lee
--     avances del portal.
--   Administrador A:
--     publicar: crea la publicación oculta con la copia de los datos y liga el avance;
--       4 candados (ya publicado, casa vendida, obra sin casa, avance inexistente).
--     Storage casas: sube un JPG a la carpeta de la publicación; rechaza otra publicación, PNG,
--       subcarpeta, la raíz de la casa y "..".
--     fijar fotos: 4 candados (foto que no está, nombre inválido, repetida, publicación
--       inexistente); con las fotos subidas, la publicación queda visible.
--     Casa vendida: no despublica ni borra las copias (congelado).
--     despublicar: borra la publicación, deja el avance del portal y su foto intactos, devuelve
--       los archivos a borrar; el administrador borra la copia; no puede borrar la foto de la casa.
--   Registro: publicar (2) + fijar (1) + despublicar (1) = 4 filas, ninguna de candados.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.casas_venta_avances;  -- igual que antes de la prueba

do $prueba$
declare
  usuario_a  constant uuid := 'c0000000-0000-4000-8000-000000001a01';
  usuario_c  constant uuid := 'c0000000-0000-4000-8000-000000001a02';
  casa_p     constant uuid := 'c0000000-0000-4000-8000-000000001b01';
  casa_v     constant uuid := 'c0000000-0000-4000-8000-000000001b02';
  casa_h     constant uuid := 'c0000000-0000-4000-8000-000000001b03';
  obra_1     constant uuid := 'c0000000-0000-4000-8000-000000001d01';
  obra_2     constant uuid := 'c0000000-0000-4000-8000-000000001d02';
  obra_3     constant uuid := 'c0000000-0000-4000-8000-000000001d03';
  obra_4     constant uuid := 'c0000000-0000-4000-8000-000000001d04';
  a1  constant uuid := 'c0000000-0000-4000-8000-000000001e01';
  a2  constant uuid := 'c0000000-0000-4000-8000-000000001e02';
  a3  constant uuid := 'c0000000-0000-4000-8000-000000001e03';
  a4  constant uuid := 'c0000000-0000-4000-8000-000000001e04';
  a5  constant uuid := 'c0000000-0000-4000-8000-000000001e05';
  nada       constant uuid := 'c0000000-0000-4000-8000-000000001fff';
  pub_1      uuid;
  pub_5      uuid;
  registro_0 bigint;
  r          record;
  caso       record;
  sentencia  text;
  mensaje    text;
  n          bigint;
  archivos   text[];
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  select count(*) into registro_0 from public.registro_admin;
  -- Por si Storage protege el borrado directo con esta opción (sin efecto si no existe)
  perform set_config('storage.allow_delete_query', 'true', true);

  insert into auth.users (id, email, aud, role) values
    (usuario_a, 'prueba-admin-010@ejemplo.invalid',   'authenticated', 'authenticated'),
    (usuario_c, 'prueba-cliente-010@ejemplo.invalid', 'authenticated', 'authenticated');
  insert into public.administradores (user_id) values (usuario_a);

  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, estado, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-010-p', true,  'Casa de prueba P', 'Distrito P', 'Municipio P', 'La Libertad', 'en_construccion', 5, 20),
    (casa_v, 'prueba-010-v', true,  'Casa de prueba V', 'Distrito V', 'Municipio V', 'La Libertad', 'vendida',         5, 20),
    (casa_h, 'prueba-010-h', false, 'Casa de prueba H', 'Distrito H', 'Municipio H', 'La Libertad', 'en_construccion', 5, 20);

  insert into public.obras (id, nombre, modalidad, casa_id) values
    (obra_1, 'Obra de prueba 010 (1)', 'compra', casa_p),
    (obra_2, 'Obra de prueba 010 (2)', 'compra', casa_v),
    (obra_3, 'Obra de prueba 010 (3)', 'construccion_terreno', null),
    (obra_4, 'Obra de prueba 010 (4)', 'compra', casa_h);
  insert into public.obra_miembros (obra_id, user_id) values (obra_1, usuario_c);
  insert into public.avances (id, obra_id, fecha, titulo, descripcion, video_url) values
    (a1, obra_1, '2026-11-04', 'Zanjeado para las fundaciones', 'Excavación de las zanjas.', 'https://youtube.com/shorts/aaaaaaaaaaa'),
    (a2, obra_1, '2026-11-05', 'Otro avance', null, null),
    (a3, obra_2, '2026-10-01', 'Avance de la vendida', null, null),
    (a4, obra_3, '2026-10-02', 'Avance sin casa', null, null),
    (a5, obra_4, '2026-10-03', 'Avance de la oculta', null, null);

  begin
    insert into storage.objects (bucket_id, name) values
      ('casas', casa_p::text || '/fachada.jpg'),
      ('obras', obra_1::text || '/avances/' || a1::text || '/01.jpg');
  exception when others then
    raise exception 'FALLA preparación: no se pudieron simular los archivos en storage.objects: %', sqlerrm;
  end;

  -- -------------------------------------------------------------------------------------
  -- Administrador A: publicar
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select * into r from public.admin_publicar_avance(a1);
  pub_1 := r.publicacion_id;
  if pub_1 is null or r.casa_id <> casa_p
     or r.carpeta <> casa_p::text || '/avances/' || pub_1::text || '/' then
    raise exception 'FALLA publicar a1: (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.casas_venta_avances
                 where id = pub_1 and casa_id = casa_p and not visible and fotos = '{}'
                   and fecha = '2026-11-04' and titulo = 'Zanjeado para las fundaciones'
                   and descripcion = 'Excavación de las zanjas.'
                   and video_url = 'https://youtube.com/shorts/aaaaaaaaaaa')
     or not exists (select 1 from public.avances where id = a1 and publicacion_id = pub_1) then
    raise exception 'FALLA publicar a1: la copia o la liga no son las esperadas';
  end if;
  select publicacion_id into pub_5 from public.admin_publicar_avance(a5);

  for caso in
    select * from (values
      (format('select * from public.admin_publicar_avance(%L)', a1),   'ALTO: este avance ya está publicado%'),
      (format('select * from public.admin_publicar_avance(%L)', a3),   'ALTO: la casa está vendida%'),
      (format('select * from public.admin_publicar_avance(%L)', a4),   'ALTO: la obra no está ligada a una casa%'),
      (format('select * from public.admin_publicar_avance(%L)', nada), 'ALTO: no existe el avance%')
    ) as c (sql, esperado)
  loop
    begin
      execute caso.sql into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like ('%' || caso.esperado) then
      raise exception 'FALLA publicar: % → %', caso.sql, coalesce(mensaje, 'no dio error');
    end if;
  end loop;
  select count(*) into n from public.casas_venta_avances where casa_id in (casa_p, casa_v, casa_h);
  if n <> 2 then raise exception 'FALLA publicar: % publicaciones (se esperaban 2)', n; end if;

  -- Storage casas: sube a la carpeta de la publicación; rechaza lo demás
  begin
    insert into storage.objects (bucket_id, name)
    values ('casas', casa_p::text || '/avances/' || pub_1::text || '/01.jpg');
  exception when others then
    raise exception 'FALLA admin: no pudo subir la copia a la carpeta de la publicación: %', sqlerrm;
  end;
  foreach sentencia in array array[
    casa_p::text || '/avances/' || nada::text || '/01.jpg',          -- publicación inexistente
    casa_p::text || '/avances/' || pub_5::text || '/01.jpg',         -- publicación de otra casa
    casa_p::text || '/avances/' || pub_1::text || '/02.png',         -- no es JPG
    casa_p::text || '/avances/' || pub_1::text || '/sub/02.jpg',     -- subcarpeta
    casa_p::text || '/avances/' || pub_1::text || '/../02.jpg',      -- ".."
    casa_p::text || '/intruso.jpg'                                   -- raíz de la casa
  ] loop
    begin
      insert into storage.objects (bucket_id, name) values ('casas', sentencia);
      raise exception 'FALLA admin: subió a una ruta no permitida: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;

  -- Fijar fotos: candados
  for caso in
    select * from (values
      (format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', pub_1, '{01.jpg,02.jpg}'), 'ALTO: faltan en el bucket casas: 02.jpg%'),
      (format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', pub_1, '{foto.jpg}'),      'ALTO: cada foto se llama%'),
      (format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', pub_1, '{01.jpg,01.jpg}'), 'ALTO: hay fotos repetidas%'),
      (format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', nada,  '{01.jpg}'),        'ALTO: no existe la publicación%')
    ) as c (sql, esperado)
  loop
    begin
      execute caso.sql into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like ('%' || caso.esperado) then
      raise exception 'FALLA fijar fotos: % → %', caso.sql, coalesce(mensaje, 'no dio error');
    end if;
  end loop;
  if (select visible from public.casas_venta_avances where id = pub_1) then
    raise exception 'FALLA fijar fotos: un ALTO dejó la publicación visible';
  end if;

  -- Fijar fotos: con la copia subida, queda visible
  select * into r from public.admin_fijar_fotos_publicacion(pub_1, '{01.jpg}');
  if r.fotos <> 1 or not exists (select 1 from public.casas_venta_avances
                                 where id = pub_1 and visible and fotos = '{01.jpg}') then
    raise exception 'FALLA fijar fotos: (%)', row_to_json(r);
  end if;
  reset role;

  -- -------------------------------------------------------------------------------------
  -- Cliente C
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_c, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  foreach sentencia in array array[
    format('select * from public.admin_publicar_avance(%L)', a2),
    format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', pub_1, '{}'),
    format('select * from public.admin_despublicar_avance(%L)', a1),
    format('insert into public.casas_venta_avances (casa_id, fecha, titulo, visible) values (%L, %L, %L, true)',
           casa_p, '2026-11-05', 'Intrusa'),
    format('update public.casas_venta_avances set titulo = %L where id = %L', 'Cambiada', pub_1),
    format('delete from public.casas_venta_avances where id = %L', pub_1),
    format('update public.avances set publicacion_id = null where id = %L', a1),
    format('insert into storage.objects (bucket_id, name) values (%L, %L)',
           'casas', casa_p::text || '/avances/' || pub_1::text || '/09.jpg')
  ] loop
    begin
      execute sentencia;
      raise exception 'FALLA cliente: pudo ejecutar: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;
  -- Borrar en Storage: sin política para él (0 filas o error; nunca borra)
  begin
    delete from storage.objects
    where bucket_id = 'casas' and name = casa_p::text || '/avances/' || pub_1::text || '/01.jpg';
  exception when others then null;
  end;
  -- Ve la publicación visible de la casa publicada, no la de la casa oculta
  select count(*) into n from public.casas_venta_avances where id in (pub_1, pub_5);
  if n <> 1 then raise exception 'FALLA cliente: ve % publicaciones de prueba (se esperaba 1)', n; end if;
  reset role;
  if not exists (select 1 from storage.objects
                 where bucket_id = 'casas' and name = casa_p::text || '/avances/' || pub_1::text || '/01.jpg') then
    raise exception 'FALLA cliente: pudo borrar la copia pública';
  end if;

  -- -------------------------------------------------------------------------------------
  -- anon
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  foreach sentencia in array array[
    format('select * from public.admin_publicar_avance(%L)', a2),
    format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', pub_1, '{}'),
    format('select * from public.admin_despublicar_avance(%L)', a1),
    'select count(*) from public.avances'
  ] loop
    begin
      execute sentencia;
      raise exception 'FALLA anon: pudo ejecutar: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;
  select count(*) into n from public.casas_venta_avances where id in (pub_1, pub_5);
  if n <> 1 then raise exception 'FALLA anon: ve % publicaciones de prueba (se esperaba 1, la visible de la casa publicada)', n; end if;
  reset role;

  -- -------------------------------------------------------------------------------------
  -- Casa vendida: lo publicado se congela
  -- -------------------------------------------------------------------------------------
  update public.casas_venta set estado = 'vendida' where id = casa_p;
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  for caso in
    select * from (values
      (format('select * from public.admin_despublicar_avance(%L)', a1),                     'ALTO: la casa está vendida%'),
      (format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', pub_1, '{}'),  'ALTO: la casa está vendida%'),
      (format('select * from public.admin_publicar_avance(%L)', a2),                        'ALTO: la casa está vendida%')
    ) as c (sql, esperado)
  loop
    begin
      execute caso.sql into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like ('%' || caso.esperado) then
      raise exception 'FALLA casa vendida: % → %', caso.sql, coalesce(mensaje, 'no dio error');
    end if;
  end loop;
  begin
    delete from storage.objects
    where bucket_id = 'casas' and name = casa_p::text || '/avances/' || pub_1::text || '/01.jpg';
  exception when others then null;
  end;
  begin
    insert into storage.objects (bucket_id, name)
    values ('casas', casa_p::text || '/avances/' || pub_1::text || '/02.jpg');
    raise exception 'FALLA casa vendida: subió una copia nueva';
  exception when insufficient_privilege then null;
  end;
  reset role;
  if not exists (select 1 from storage.objects
                 where bucket_id = 'casas' and name = casa_p::text || '/avances/' || pub_1::text || '/01.jpg')
     or not exists (select 1 from public.casas_venta_avances where id = pub_1 and visible) then
    raise exception 'FALLA casa vendida: cambió lo publicado';
  end if;
  update public.casas_venta set estado = 'en_construccion' where id = casa_p;

  -- -------------------------------------------------------------------------------------
  -- Administrador A: despublicar
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  select array_agg(archivo) into archivos from public.admin_despublicar_avance(a1);
  if archivos is distinct from array[casa_p::text || '/avances/' || pub_1::text || '/01.jpg'] then
    raise exception 'FALLA despublicar: archivos devueltos %', archivos;
  end if;
  begin
    execute format('select * from public.admin_despublicar_avance(%L)', a1) into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: este avance no está publicado%' then
    raise exception 'FALLA despublicar dos veces: %', coalesce(mensaje, 'no dio error');
  end if;
  -- Borra la copia; la foto de la casa no se puede borrar
  begin
    delete from storage.objects
    where bucket_id = 'casas' and name = casa_p::text || '/avances/' || pub_1::text || '/01.jpg';
  exception when others then
    raise exception 'FALLA despublicar: el borrado de la copia dio error (¿Storage bloquea el borrado directo por SQL?): %', sqlerrm;
  end;
  begin
    delete from storage.objects where bucket_id = 'casas' and name = casa_p::text || '/fachada.jpg';
  exception when others then null;
  end;
  reset role;

  if exists (select 1 from public.casas_venta_avances where id = pub_1) then
    raise exception 'FALLA despublicar: la publicación sigue';
  end if;
  if not exists (select 1 from public.avances
                 where id = a1 and publicacion_id is null and titulo = 'Zanjeado para las fundaciones') then
    raise exception 'FALLA despublicar: el avance del portal cambió o desapareció';
  end if;
  if not exists (select 1 from storage.objects
                 where bucket_id = 'obras' and name = obra_1::text || '/avances/' || a1::text || '/01.jpg') then
    raise exception 'FALLA despublicar: se tocó la foto del portal';
  end if;
  if exists (select 1 from storage.objects
             where bucket_id = 'casas' and name = casa_p::text || '/avances/' || pub_1::text || '/01.jpg') then
    raise exception 'FALLA despublicar: el administrador no pudo borrar la copia pública';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'casas' and name = casa_p::text || '/fachada.jpg') then
    raise exception 'FALLA: se pudo borrar la foto de la casa';
  end if;

  -- Registro: publicar (a1, a5) + fijar + despublicar = 4 filas nuevas
  select count(*) into n from public.registro_admin;
  if n - registro_0 <> 4 then
    raise exception 'FALLA registro: % filas nuevas (se esperaban 4)', n - registro_0;
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: publicar crea la copia oculta y liga el avance (4 candados); Storage casas solo JPG en la carpeta de la publicación (6 rutas rechazadas); fijar fotos la hace visible (4 candados); cliente y anon sin escritura y sin ver lo oculto; casa vendida congelada; despublicar borra la publicación y su copia sin tocar el portal ni la foto de la casa; registro con 4 filas. Todo revertido.';
end;
$prueba$;
