-- Prueba de la migración 014 (clics por modalidad al borrar una casa). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 014, con aprobación del usuario.
-- Todo corre en un solo bloque DO que SIEMPRE termina en error, y el error revierte todo:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
-- Después de esta, la prueba de la 013 también debe dar "PRUEBA SUPERADA".
--
-- Datos: casas P y Q (sin publicar), P con modalidades P1 y P2, Q con Q1. Los clics se crean
-- en esta misma transacción: es el caso que hizo fallar a la 013.
--
-- Comprueba:
--   1. Borrar la casa P con un clic en P2 (y otro en P1, y otro sin modalidad): no falla; los 3
--      clics se conservan sin casa ni modalidad. Q y su clic no se tocan.
--   2. Borrar la modalidad Q1: el clic queda con la casa Q y sin modalidad.
--   3. Clic con modalidad y sin casa: rechazado (23514). Clic con la modalidad de otra casa:
--      rechazado (23503). Clic con una modalidad inexistente: rechazado (23503).
--   4. Pasar a null la casa de un clic a mano: la modalidad también queda en null.
--   5. Llaves: solo la compuesta hacia las modalidades.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.clics_venta;  -- igual que antes de la prueba

do $prueba$
declare
  casa_p   constant uuid := 'c0000000-0000-4000-8000-000000014b01';
  casa_q   constant uuid := 'c0000000-0000-4000-8000-000000014b02';
  mod_p1   constant uuid := 'c0000000-0000-4000-8000-000000014c01';
  mod_p2   constant uuid := 'c0000000-0000-4000-8000-000000014c02';
  mod_q1   constant uuid := 'c0000000-0000-4000-8000-000000014c03';
  clics_p  bigint[];
  clic_q   bigint;
  clic_x   bigint;
  n        bigint;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-014-p', false, 'Casa de prueba P', 'Distrito P', 'Municipio P', 'La Libertad', 10, 20),
    (casa_q, 'prueba-014-q', false, 'Casa de prueba Q', 'Distrito Q', 'Municipio Q', 'La Libertad', 5, 20);
  insert into public.casas_venta_modalidades (id, casa_id, orden, nombre, lote_frente_m, lote_fondo_m) values
    (mod_p1, casa_p, 1, 'Lote de 5 × 20 m',  5,  20),
    (mod_p2, casa_p, 2, 'Lote de 10 × 20 m', 10, 20),
    (mod_q1, casa_q, 1, 'Lote de 5 × 20 m',  5,  20);

  with nuevos as (
    insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id) values
      ('casa', 'casa', casa_p, mod_p2),
      ('casa', 'casa', casa_p, mod_p1),
      ('casa', 'casa', casa_p, null)
    returning id
  )
  select array_agg(id) into clics_p from nuevos;
  insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id)
  values ('casa', 'casa', casa_q, mod_q1) returning id into clic_q;

  -- -------------------------------------------------------------------------------------
  -- 1. Borrar la casa P (el caso que fallaba en la 013)
  -- -------------------------------------------------------------------------------------
  begin
    delete from public.casas_venta where id = casa_p;
  exception when others then
    raise exception 'FALLA 1: borrar la casa con clics por modalidad dio % (%)', sqlstate, sqlerrm;
  end;
  select count(*) into n from public.clics_venta
  where id = any(clics_p) and casa_id is null and modalidad_id is null;
  if n <> 3 then raise exception 'FALLA 1: % de 3 clics de P quedaron sin casa ni modalidad', n; end if;
  select count(*) into n from public.casas_venta_modalidades where casa_id = casa_p;
  if n <> 0 then raise exception 'FALLA 1: quedaron modalidades de la casa borrada'; end if;
  select count(*) into n from public.clics_venta where id = clic_q and casa_id = casa_q and modalidad_id = mod_q1;
  if n <> 1 then raise exception 'FALLA 1: se tocó el clic de la casa Q'; end if;

  -- -------------------------------------------------------------------------------------
  -- 2. Borrar la modalidad Q1
  -- -------------------------------------------------------------------------------------
  delete from public.casas_venta_modalidades where id = mod_q1;
  select count(*) into n from public.clics_venta where id = clic_q and casa_id = casa_q and modalidad_id is null;
  if n <> 1 then raise exception 'FALLA 2: al borrar la modalidad, el clic no quedó con la casa y sin modalidad'; end if;

  -- -------------------------------------------------------------------------------------
  -- 3. Clics inválidos
  -- -------------------------------------------------------------------------------------
  insert into public.casas_venta_modalidades (id, casa_id, orden, nombre, lote_frente_m, lote_fondo_m)
  values (mod_q1, casa_q, 1, 'Lote de 5 × 20 m', 5, 20);

  begin
    insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id) values ('general', 'hero', null, mod_q1);
    raise exception 'FALLA 3: aceptó un clic con modalidad y sin casa';
  exception when check_violation then null;
  end;
  begin
    insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id) values ('casa', 'casa', casa_q, mod_p1);
    raise exception 'FALLA 3: aceptó una modalidad que ya no existe';
  exception when foreign_key_violation then null;
  end;
  insert into public.casas_venta (id, slug, publicada, nombre, distrito, municipio, departamento, lote_frente_m, lote_fondo_m)
  values (casa_p, 'prueba-014-p', false, 'Casa de prueba P', 'Distrito P', 'Municipio P', 'La Libertad', 10, 20);
  insert into public.casas_venta_modalidades (id, casa_id, orden, nombre, lote_frente_m, lote_fondo_m)
  values (mod_p1, casa_p, 1, 'Lote de 5 × 20 m', 5, 20);
  begin
    insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id) values ('casa', 'casa', casa_q, mod_p1);
    raise exception 'FALLA 3: aceptó la modalidad de otra casa';
  exception when foreign_key_violation then null;
  end;

  -- -------------------------------------------------------------------------------------
  -- 4. Casa a null a mano: la modalidad la sigue
  -- -------------------------------------------------------------------------------------
  insert into public.clics_venta (opcion, ubicacion, casa_id, modalidad_id)
  values ('casa', 'casa', casa_q, mod_q1) returning id into clic_x;
  update public.clics_venta set casa_id = null where id = clic_x;
  select count(*) into n from public.clics_venta where id = clic_x and casa_id is null and modalidad_id is null;
  if n <> 1 then raise exception 'FALLA 4: la modalidad no siguió a la casa en null'; end if;

  -- -------------------------------------------------------------------------------------
  -- 5. Llaves
  -- -------------------------------------------------------------------------------------
  select count(*) into n from pg_constraint
  where conrelid = 'public.clics_venta'::regclass
    and confrelid = 'public.casas_venta_modalidades'::regclass and contype = 'f';
  if n <> 1 then raise exception 'FALLA 5: hay % llaves hacia las modalidades (se esperaba 1, la compuesta)', n; end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: borrar una casa con clics por modalidad (creados en la misma transacción) no falla y los clics quedan sin casa ni modalidad; borrar una modalidad deja el clic con su casa; modalidad sin casa, inexistente o de otra casa rechazadas; la modalidad sigue a la casa en null; solo queda la llave compuesta. Todo revertido.';
end;
$prueba$;
