-- Prueba de la migración 013 (modalidades de venta). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 013, con aprobación del usuario.
-- Igual que las demás pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y
-- el error revierte todo. El resultado se lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- Datos: casas P (publicada, en construcción), O (sin publicar) y V (vendida, publicada). P con
-- 3 modalidades: 5 × 20 ($69,000), 10 × 20 ($85,000) y una no disponible. O y V con una cada una.
-- Administrador A.
--
-- Comprueba:
--   1. Carga inicial de la migración: toda casa que ya existía tiene al menos una modalidad.
--   2. Candados: orden repetido, orden 0, nombre vacío, lote 0, estacionamientos negativos,
--      precio fuera de rango, nota de 1 o 201 letras y 9 detalles. lote_m2 se calcula.
--   3. anon y authenticated (sin ser admin): ven solo las 2 disponibles de P; nada de O, V ni la
--      no disponible. No insertan, modifican ni borran (42501).
--   4. Administrador: ve las 5.
--   5. clics_venta: acepta un clic con una modalidad de SU casa; rechaza una modalidad de otra
--      casa (23503); al borrar la modalidad, el clic queda con la casa y sin modalidad; al borrar
--      la casa, el clic queda sin casa ni modalidad. La vista de resumen trae la columna modalidad.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.casas_venta_modalidades;  -- igual que antes de la prueba

do $prueba$
declare
  usuario_a  constant uuid := 'c0000000-0000-4000-8000-000000013a01';
  usuario_c  constant uuid := 'c0000000-0000-4000-8000-000000013a02';
  casa_p     constant uuid := 'c0000000-0000-4000-8000-000000013b01';
  casa_o     constant uuid := 'c0000000-0000-4000-8000-000000013b02';
  casa_v     constant uuid := 'c0000000-0000-4000-8000-000000013b03';
  mod_p1     constant uuid := 'c0000000-0000-4000-8000-000000013c01';
  mod_p2     constant uuid := 'c0000000-0000-4000-8000-000000013c02';
  mod_p3     constant uuid := 'c0000000-0000-4000-8000-000000013c03';
  mod_o      constant uuid := 'c0000000-0000-4000-8000-000000013c04';
  mod_v      constant uuid := 'c0000000-0000-4000-8000-000000013c05';
  clic_1     bigint;
  todas      uuid[];
  rol        text;
  n          bigint;
  m2         numeric;
  r          record;
begin
  -- -------------------------------------------------------------------------------------
  -- 1. Carga inicial (antes de crear datos de prueba)
  -- -------------------------------------------------------------------------------------
  select count(*) into n from public.casas_venta c
  where not exists (select 1 from public.casas_venta_modalidades m where m.casa_id = c.id);
  if n <> 0 then raise exception 'FALLA carga inicial: % casas sin modalidad', n; end if;

  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  todas := array[mod_p1, mod_p2, mod_p3, mod_o, mod_v];
  insert into auth.users (id, email, aud, role) values
    (usuario_a, 'prueba-admin-013@ejemplo.invalid',   'authenticated', 'authenticated'),
    (usuario_c, 'prueba-cliente-013@ejemplo.invalid', 'authenticated', 'authenticated');
  insert into public.administradores (user_id) values (usuario_a);

  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, estado, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-013-p', true,  'Casa de prueba P', 'Distrito P', 'Municipio P', 'La Libertad', 'en_construccion', 10, 20),
    (casa_o, 'prueba-013-o', false, 'Casa de prueba O', 'Distrito O', 'Municipio O', 'La Libertad', 'en_construccion', 5, 20),
    (casa_v, 'prueba-013-v', true,  'Casa de prueba V', 'Distrito V', 'Municipio V', 'La Libertad', 'vendida',         5, 20);

  insert into public.casas_venta_modalidades
    (id, casa_id, orden, nombre, lote_frente_m, lote_fondo_m, estacionamientos, precio_usd, detalles, nota, disponible)
  values
    (mod_p1, casa_p, 1, 'Casa con lote propio', 5, 20, 1, 69000, '{}',
     'Lote de 5 × 20 m sujeto a segregación en trámite', true),
    (mod_p2, casa_p, 2, 'Casa con lote completo', 10, 20, 2, 85000,
     '{"Espacio para ampliar o para un jardín más grande"}', null, true),
    (mod_p3, casa_p, 3, 'Modalidad retirada', 5, 20, 1, 70000, '{}', null, false),
    (mod_o,  casa_o, 1, 'Lote de 5 × 20 m', 5, 20, 1, 60000, '{}', null, true),
    (mod_v,  casa_v, 1, 'Lote de 5 × 20 m', 5, 20, 1, 60000, '{}', null, true);

  -- -------------------------------------------------------------------------------------
  -- 2. Candados
  -- -------------------------------------------------------------------------------------
  select lote_m2 into m2 from public.casas_venta_modalidades where id = mod_p2;
  if m2 <> 200 then raise exception 'FALLA candado: lote_m2 de 10 × 20 dio %', m2; end if;
  update public.casas_venta_modalidades set lote_fondo_m = 25 where id = mod_p2;
  select lote_m2 into m2 from public.casas_venta_modalidades where id = mod_p2;
  if m2 <> 250 then raise exception 'FALLA candado: lote_m2 no se recalculó (dio %)', m2; end if;

  begin
    insert into public.casas_venta_modalidades (casa_id, orden, nombre, lote_frente_m, lote_fondo_m)
    values (casa_p, 1, 'Orden repetido', 5, 20);
    raise exception 'FALLA candado: aceptó un orden repetido en la misma casa';
  exception when unique_violation then null;
  end;

  for r in
    select * from (values
      ('orden 0',                   0, 'Nombre', 5::numeric, 20::numeric, 1, 69000, '{}'::text[], null::text),
      ('nombre de 1 letra',         5, 'X',      5,          20,          1, 69000, '{}',           null),
      ('lote de frente 0',          5, 'Nombre', 0,          20,          1, 69000, '{}',           null),
      ('estacionamientos negativos',5, 'Nombre', 5,          20,         -1, 69000, '{}',           null),
      ('precio de 999',             5, 'Nombre', 5,          20,          1,   999, '{}',           null),
      ('precio de 5,000,001',       5, 'Nombre', 5,          20,          1, 5000001,'{}',          null),
      ('nota de 1 letra',           5, 'Nombre', 5,          20,          1, 69000, '{}',           'x'),
      ('nota de 201 letras',        5, 'Nombre', 5,          20,          1, 69000, '{}',           repeat('x', 201)),
      ('9 detalles',                5, 'Nombre', 5,          20,          1, 69000,
       '{a,b,c,d,e,f,g,h,i}',                                                                     null)
    ) as t(caso, orden, nombre, frente, fondo, est, precio, detalles, nota)
  loop
    begin
      insert into public.casas_venta_modalidades
        (casa_id, orden, nombre, lote_frente_m, lote_fondo_m, estacionamientos, precio_usd, detalles, nota)
      values (casa_p, r.orden, r.nombre, r.frente, r.fondo, r.est, r.precio, r.detalles, r.nota);
      raise exception 'FALLA candado: aceptó %', r.caso;
    exception when check_violation then null;
    end;
  end loop;

  -- -------------------------------------------------------------------------------------
  -- 3. anon y authenticated (no admin): solo las disponibles de una casa publicada no vendida
  -- -------------------------------------------------------------------------------------
  foreach rol in array array['anon', 'authenticated'] loop
    perform set_config('request.jwt.claims',
      (case when rol = 'anon' then json_build_object('role', 'anon')
            else json_build_object('sub', usuario_c, 'role', 'authenticated') end)::text, true);
    perform set_config('role', rol, true);

    select count(*) into n from public.casas_venta_modalidades where id = any(todas);
    if n <> 2 then raise exception 'FALLA %: ve % modalidades de prueba (se esperaban 2, las de P disponibles)', rol, n; end if;
    select count(*) into n from public.casas_venta_modalidades where id in (mod_p3, mod_o, mod_v);
    if n <> 0 then raise exception 'FALLA %: ve una modalidad no disponible, de una casa sin publicar o de una vendida', rol; end if;
    select min(precio_usd) into n from public.casas_venta_modalidades where casa_id = casa_p;
    if n <> 69000 then raise exception 'FALLA %: el precio "desde" de P dio %', rol, n; end if;

    begin
      insert into public.casas_venta_modalidades (casa_id, nombre, lote_frente_m, lote_fondo_m, orden)
      values (casa_p, 'Intruso', 5, 20, 7);
      raise exception 'FALLA %: pudo insertar una modalidad', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      update public.casas_venta_modalidades set precio_usd = 1000 where id = mod_p1;
      raise exception 'FALLA %: pudo cambiar un precio', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      delete from public.casas_venta_modalidades where id = mod_p1;
      raise exception 'FALLA %: pudo borrar una modalidad', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      perform 1 from public.clics_venta limit 1;
      raise exception 'FALLA %: pudo leer clics_venta', rol;
    exception when insufficient_privilege then null;
    end;

    perform set_config('role', 'none', true);
  end loop;

  -- -------------------------------------------------------------------------------------
  -- 4. Administrador: ve todas
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  select count(*) into n from public.casas_venta_modalidades where id = any(todas);
  if n <> 5 then raise exception 'FALLA admin: ve % modalidades de prueba (se esperaban 5)', n; end if;
  perform set_config('role', 'none', true);

  -- -------------------------------------------------------------------------------------
  -- 5. clics_venta con modalidad
  -- -------------------------------------------------------------------------------------
  insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id)
  values ('casa', 'casa', casa_p, mod_p1)
  returning id into clic_1;

  begin
    insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id)
    values ('casa', 'casa', casa_p, mod_o);
    raise exception 'FALLA clics: aceptó una modalidad de otra casa';
  exception when foreign_key_violation then null;
  end;

  select count(*) into n from public.clics_venta_resumen where casa = 'prueba-013-p' and modalidad = 'Casa con lote propio';
  if n <> 1 then raise exception 'FALLA clics: la vista no trae la modalidad'; end if;

  delete from public.casas_venta_modalidades where id = mod_p1;
  select count(*) into n from public.clics_venta where id = clic_1 and casa_id = casa_p and modalidad_id is null;
  if n <> 1 then raise exception 'FALLA clics: al borrar la modalidad, el clic no quedó con la casa y sin modalidad'; end if;

  update public.clics_venta set modalidad_id = mod_p2 where id = clic_1;
  delete from public.casas_venta where id = casa_p;
  select count(*) into n from public.clics_venta where id = clic_1 and casa_id is null and modalidad_id is null;
  if n <> 1 then raise exception 'FALLA clics: al borrar la casa, el clic no quedó sin casa ni modalidad'; end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: carga inicial completa; 11 candados (orden repetido y 9 CHECK, más lote_m2 calculado); anon y cliente ven solo las 2 disponibles de la casa publicada (desde $69,000), nada de la sin publicar, la vendida ni la retirada, y no escriben; admin ve las 5; clics con modalidad de su casa sí, de otra casa no, y se conservan al borrar modalidad o casa. Todo revertido.';
end;
$prueba$;
