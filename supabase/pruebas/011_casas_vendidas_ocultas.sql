-- Prueba de la migración 011 (casas vendidas ocultas). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 011, con aprobación del usuario.
-- Igual que las demás pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y
-- el error revierte todo. El resultado se lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- Datos: casas P (en construcción), T (terminada), R (reservada), V (vendida) y W (vendida sin
-- publicar), todas con modelo de prueba. P y V con foto, etapa pública y un avance publicado
-- (visible, con su copia en el bucket casas). Obra 1 (compra) ligada a V y obra 2 (compra)
-- ligada a P, con el avance de cada una publicado. Administrador A y cliente C (miembro de la
-- obra 1). Los archivos de Storage se simulan con filas en storage.objects.
--
-- Comprueba:
--   anon y cliente: ven P, T y R; NO ven V (ni por su slug, como el proxy) ni su foto, etapa ni
--     diario; sí ven los de P. casas_vendidas() devuelve el modelo y el departamento de V y
--     nada de W (sin publicar).
--   Administrador: ve V con su foto, etapa y diario; no puede publicar en V (casa vendida);
--     SÍ puede quitar de la ficha el avance de V y borrar su copia; no puede borrar la foto de
--     la casa.
--   Candado obras_casa_solo_compra: rechaza una obra a pedido con casa y pasar a
--     "inversionista" una obra de compra ligada.
--   Registro: 1 fila (quitar de la ficha), ninguna del intento de publicar.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.casas_venta;  -- igual que antes de la prueba

do $prueba$
declare
  usuario_a  constant uuid := 'c0000000-0000-4000-8000-000000002a01';
  usuario_c  constant uuid := 'c0000000-0000-4000-8000-000000002a02';
  casa_p     constant uuid := 'c0000000-0000-4000-8000-000000002b01';
  casa_t     constant uuid := 'c0000000-0000-4000-8000-000000002b02';
  casa_r     constant uuid := 'c0000000-0000-4000-8000-000000002b03';
  casa_v     constant uuid := 'c0000000-0000-4000-8000-000000002b04';
  casa_w     constant uuid := 'c0000000-0000-4000-8000-000000002b05';
  obra_1     constant uuid := 'c0000000-0000-4000-8000-000000002d01';
  obra_2     constant uuid := 'c0000000-0000-4000-8000-000000002d02';
  av_v       constant uuid := 'c0000000-0000-4000-8000-000000002e01';
  av_v2      constant uuid := 'c0000000-0000-4000-8000-000000002e02';
  av_p       constant uuid := 'c0000000-0000-4000-8000-000000002e03';
  pub_v      constant uuid := 'c0000000-0000-4000-8000-000000002f01';
  pub_p      constant uuid := 'c0000000-0000-4000-8000-000000002f02';
  todas      uuid[];
  registro_0 bigint;
  rol        text;
  n          bigint;
  r          record;
  mensaje    text;
  archivos   text[];
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  todas := array[casa_p, casa_t, casa_r, casa_v, casa_w];
  select count(*) into registro_0 from public.registro_admin;
  perform set_config('storage.allow_delete_query', 'true', true);

  insert into auth.users (id, email, aud, role) values
    (usuario_a, 'prueba-admin-011@ejemplo.invalid',   'authenticated', 'authenticated'),
    (usuario_c, 'prueba-cliente-011@ejemplo.invalid', 'authenticated', 'authenticated');
  insert into public.administradores (user_id) values (usuario_a);

  insert into public.casas_venta
    (id, slug, publicada, nombre, modelo, distrito, municipio, departamento, estado, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-011-p', true,  'Casa de prueba P', 'Prueba011P', 'Distrito P', 'Municipio P', 'La Libertad', 'en_construccion', 5, 20),
    (casa_t, 'prueba-011-t', true,  'Casa de prueba T', 'Prueba011T', 'Distrito T', 'Municipio T', 'La Libertad', 'terminada',       5, 20),
    (casa_r, 'prueba-011-r', true,  'Casa de prueba R', 'Prueba011R', 'Distrito R', 'Municipio R', 'La Libertad', 'reservada',       5, 20),
    (casa_v, 'prueba-011-v', true,  'Casa de prueba V', 'Prueba011V', 'Distrito V', 'Municipio V', 'Cuscatlán',   'vendida',         5, 20),
    (casa_w, 'prueba-011-w', false, 'Casa de prueba W', 'Prueba011W', 'Distrito W', 'Municipio W', 'Chalatenango','vendida',         5, 20);

  insert into storage.objects (bucket_id, name) values
    ('casas', casa_p::text || '/foto.jpg'),
    ('casas', casa_v::text || '/foto.jpg'),
    ('casas', casa_v::text || '/avances/' || pub_v::text || '/01.jpg'),
    ('casas', casa_p::text || '/avances/' || pub_p::text || '/01.jpg');
  insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt) values
    (casa_p, 'foto', 1, casa_p::text || '/foto.jpg', 1600, 1200, 'Foto de P'),
    (casa_v, 'foto', 1, casa_v::text || '/foto.jpg', 1600, 1200, 'Foto de V');
  insert into public.casas_venta_etapas (casa_id, orden, nombre, estado, fecha_inicio) values
    (casa_p, 1, 'Terracería', 'en_proceso', '2026-11-01'),
    (casa_v, 1, 'Terracería', 'terminada',  '2026-10-01');
  insert into public.casas_venta_avances (id, casa_id, fecha, titulo, fotos, visible) values
    (pub_v, casa_v, '2026-10-02', 'Avance de V', '{01.jpg}', true),
    (pub_p, casa_p, '2026-11-02', 'Avance de P', '{01.jpg}', true);

  insert into public.obras (id, nombre, modalidad, casa_id) values
    (obra_1, 'Obra de prueba 011 (1)', 'compra', casa_v),
    (obra_2, 'Obra de prueba 011 (2)', 'compra', casa_p);
  insert into public.obra_miembros (obra_id, user_id) values (obra_1, usuario_c);
  insert into public.avances (id, obra_id, fecha, titulo, publicacion_id) values
    (av_v,  obra_1, '2026-10-02', 'Avance de V', pub_v),
    (av_v2, obra_1, '2026-10-03', 'Otro avance de V', null),
    (av_p,  obra_2, '2026-11-02', 'Avance de P', pub_p);

  -- -------------------------------------------------------------------------------------
  -- anon y cliente: la vendida no se ve; las demás sí
  -- -------------------------------------------------------------------------------------
  foreach rol in array array['anon', 'authenticated'] loop
    perform set_config('request.jwt.claims',
      (case when rol = 'anon' then json_build_object('role', 'anon')
            else json_build_object('sub', usuario_c, 'role', 'authenticated') end)::text, true);
    perform set_config('role', rol, true);

    select count(*) into n from public.casas_venta where id = any(todas);
    if n <> 3 then raise exception 'FALLA %: ve % casas de prueba (se esperaban 3: P, T y R)', rol, n; end if;
    select count(*) into n from public.casas_venta where id in (casa_v, casa_w);
    if n <> 0 then raise exception 'FALLA %: ve una casa vendida', rol; end if;
    select count(*) into n from public.casas_venta where slug = 'prueba-011-v' and publicada;
    if n <> 0 then raise exception 'FALLA %: encuentra la vendida por su slug (el proxy no daría 404)', rol; end if;

    select count(*) into n from public.casas_venta_imagenes where casa_id = casa_v;
    if n <> 0 then raise exception 'FALLA %: ve la foto de la vendida', rol; end if;
    select count(*) into n from public.casas_venta_etapas where casa_id = casa_v;
    if n <> 0 then raise exception 'FALLA %: ve las etapas de la vendida', rol; end if;
    select count(*) into n from public.casas_venta_avances where casa_id = casa_v;
    if n <> 0 then raise exception 'FALLA %: ve el diario de la vendida', rol; end if;

    select count(*) into n from public.casas_venta_imagenes where casa_id = casa_p;
    if n <> 1 then raise exception 'FALLA %: no ve la foto de P', rol; end if;
    select count(*) into n from public.casas_venta_etapas where casa_id = casa_p;
    if n <> 1 then raise exception 'FALLA %: no ve la etapa de P', rol; end if;
    select count(*) into n from public.casas_venta_avances where casa_id = casa_p;
    if n <> 1 then raise exception 'FALLA %: no ve el diario de P', rol; end if;

    select count(*) into n from public.casas_vendidas() v where v.modelo = 'Prueba011V' and v.departamento = 'Cuscatlán';
    if n <> 1 then raise exception 'FALLA %: casas_vendidas() no devuelve la vendida publicada', rol; end if;
    select count(*) into n from public.casas_vendidas() v where v.modelo in ('Prueba011P', 'Prueba011T', 'Prueba011R', 'Prueba011W');
    if n <> 0 then raise exception 'FALLA %: casas_vendidas() devuelve una casa que no debe', rol; end if;

    if rol = 'authenticated' then
      begin
        perform * from public.admin_despublicar_avance(av_v);
        raise exception 'FALLA cliente: pudo quitar de la ficha';
      exception when insufficient_privilege then null;
      end;
    end if;
    reset role;
  end loop;

  -- -------------------------------------------------------------------------------------
  -- Administrador
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into n from public.casas_venta where id = any(todas);
  if n <> 5 then raise exception 'FALLA admin: ve % casas de prueba (se esperaban 5)', n; end if;
  if (select count(*) from public.casas_venta_imagenes where casa_id = casa_v) <> 1
     or (select count(*) from public.casas_venta_etapas where casa_id = casa_v) <> 1
     or (select count(*) from public.casas_venta_avances where casa_id = casa_v) <> 1 then
    raise exception 'FALLA admin: no ve la foto, la etapa o el diario de la vendida';
  end if;

  -- Publicar en la vendida: sigue negado
  begin
    perform * from public.admin_publicar_avance(av_v2);
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: la casa está vendida%' then
    raise exception 'FALLA admin: publicar en la vendida → %', coalesce(mensaje, 'no dio error');
  end if;

  -- Quitar de la ficha con la casa vendida: ahora sí
  select array_agg(archivo) into archivos from public.admin_despublicar_avance(av_v);
  if archivos is distinct from array[casa_v::text || '/avances/' || pub_v::text || '/01.jpg'] then
    raise exception 'FALLA admin: quitar de la ficha en la vendida devolvió %', archivos;
  end if;
  begin
    delete from storage.objects
    where bucket_id = 'casas' and name = casa_v::text || '/avances/' || pub_v::text || '/01.jpg';
  exception when others then
    raise exception 'FALLA admin: el borrado de la copia dio error (¿Storage bloquea el borrado directo por SQL?): %', sqlerrm;
  end;
  begin
    delete from storage.objects where bucket_id = 'casas' and name = casa_v::text || '/foto.jpg';
  exception when others then null;
  end;
  reset role;

  if exists (select 1 from public.casas_venta_avances where id = pub_v)
     or not exists (select 1 from public.avances where id = av_v and publicacion_id is null) then
    raise exception 'FALLA admin: la publicación de la vendida no se quitó bien';
  end if;
  if exists (select 1 from storage.objects
             where bucket_id = 'casas' and name = casa_v::text || '/avances/' || pub_v::text || '/01.jpg') then
    raise exception 'FALLA admin: no pudo borrar la copia de la vendida';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'casas' and name = casa_v::text || '/foto.jpg') then
    raise exception 'FALLA admin: pudo borrar la foto de la casa';
  end if;

  -- -------------------------------------------------------------------------------------
  -- Candado obras_casa_solo_compra
  -- -------------------------------------------------------------------------------------
  begin
    insert into public.obras (nombre, modalidad, casa_id) values ('Obra a pedido con casa', 'construccion_terreno', casa_t);
    raise exception 'FALLA candado: se aceptó una obra a pedido ligada a una casa';
  exception when check_violation then null;
  end;
  begin
    update public.obras set modalidad = 'inversionista' where id = obra_2;
    raise exception 'FALLA candado: una obra ligada pasó a inversionista';
  exception when check_violation then null;
  end;

  -- Registro: solo "quitar de la ficha"
  select count(*) into n from public.registro_admin;
  if n - registro_0 <> 1 then
    raise exception 'FALLA registro: % filas nuevas (se esperaba 1)', n - registro_0;
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: anon y cliente no ven la vendida (fila, slug, foto, etapa ni diario) y sí P, T y R; casas_vendidas() solo da modelo y departamento de la publicada; admin la ve, no publica en ella, la quita de la ficha y borra su copia sin tocar la foto de la casa; candado obras_casa_solo_compra activo; registro con 1 fila. Todo revertido.';
end;
$prueba$;
