-- Prueba de la migración 015 (foto de la tarjeta desde un avance). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 015, con aprobación del usuario.
-- Todo corre en un solo bloque DO que SIEMPRE termina en error, y el error revierte todo:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- Datos: administrador A; cliente C (miembro de la obra 1, NO administrador). Casa P publicada
-- en construcción con 3 fotos propias (f1, f2, f3 en orden 1, 2, 3); casa Q publicada sin fotos;
-- casa V vendida. Obra 1 → P con los avances a1 (publicación P1, visible, 01–03.jpg), a2 (P2,
-- visible, 01–02.jpg) y a3 (P3, oculta). Obra 2 → Q con a4 (Q1, visible, 01.jpg). Obra 3 → V con
-- a5 (V1, visible, 01.jpg). Los archivos de Storage se simulan con filas en storage.objects.
--
-- Comprueba:
--   1. Cliente C (autenticado, no administrador): la función da 42501 y no puede insertar,
--      cambiar ni borrar en casas_venta_imagenes; anon tampoco ejecuta la función. La portada
--      no cambia.
--   2. Administrador, TRES cambios seguidos en P (P1/02 → P2/01 → P1/03): después de cada uno,
--      orden exacto 1, 2, 3, 4 con la nueva en 1 y f1, f2, f3 en 2, 3, 4 (nunca bajan dos veces);
--      la fila de la portada anterior que salió de un avance desaparece; exactamente una portada.
--      Alt, ancho y alto guardados.
--   3. Casa Q sin fotos: la portada entra en 1 y es la única.
--   4. Candados (y que no cambian nada): la misma foto otra vez, foto que no está en la
--      publicación, nombre inválido, publicación oculta, casa vendida, publicación inexistente,
--      medidas fuera de rango; fijar fotos de P1 sin la que es portada; quitar de la ficha a1
--      (tiene la portada). Quitar de la ficha a2 (ya no es portada) sí funciona.
--   5. Registro: 4 filas "elegir_portada", ninguna de los candados.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.casas_venta_imagenes;  -- igual que antes de la prueba

do $prueba$
declare
  usuario_a  constant uuid := 'c0000000-0000-4000-8000-000000015a01';
  usuario_c  constant uuid := 'c0000000-0000-4000-8000-000000015a02';
  casa_p     constant uuid := 'c0000000-0000-4000-8000-000000015b01';
  casa_q     constant uuid := 'c0000000-0000-4000-8000-000000015b02';
  casa_v     constant uuid := 'c0000000-0000-4000-8000-000000015b03';
  obra_1     constant uuid := 'c0000000-0000-4000-8000-000000015d01';
  obra_2     constant uuid := 'c0000000-0000-4000-8000-000000015d02';
  obra_3     constant uuid := 'c0000000-0000-4000-8000-000000015d03';
  a1  constant uuid := 'c0000000-0000-4000-8000-000000015e01';
  a2  constant uuid := 'c0000000-0000-4000-8000-000000015e02';
  a3  constant uuid := 'c0000000-0000-4000-8000-000000015e03';
  a4  constant uuid := 'c0000000-0000-4000-8000-000000015e04';
  a5  constant uuid := 'c0000000-0000-4000-8000-000000015e05';
  p1  constant uuid := 'c0000000-0000-4000-8000-000000015c01';
  p2  constant uuid := 'c0000000-0000-4000-8000-000000015c02';
  p3  constant uuid := 'c0000000-0000-4000-8000-000000015c03';
  q1  constant uuid := 'c0000000-0000-4000-8000-000000015c04';
  v1  constant uuid := 'c0000000-0000-4000-8000-000000015c05';
  nada constant uuid := 'c0000000-0000-4000-8000-000000015fff';
  f1  text;
  f2  text;
  f3  text;
  caso       record;
  sentencia  text;
  rutas      text[];
  ordenes    int[];
  n          bigint;
  esperado   text[];
  paso       int;
  foto_pub   uuid;
  foto_nom   text;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  f1 := casa_p::text || '/f1.jpg';
  f2 := casa_p::text || '/f2.jpg';
  f3 := casa_p::text || '/f3.jpg';

  insert into auth.users (id, email, aud, role) values
    (usuario_a, 'prueba-admin-015@ejemplo.invalid',   'authenticated', 'authenticated'),
    (usuario_c, 'prueba-cliente-015@ejemplo.invalid', 'authenticated', 'authenticated');
  insert into public.administradores (user_id) values (usuario_a);

  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, estado, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-015-p', true, 'Casa de prueba P', 'Distrito P', 'Municipio P', 'La Libertad', 'en_construccion', 5, 20),
    (casa_q, 'prueba-015-q', true, 'Casa de prueba Q', 'Distrito Q', 'Municipio Q', 'La Libertad', 'en_construccion', 5, 20),
    (casa_v, 'prueba-015-v', true, 'Casa de prueba V', 'Distrito V', 'Municipio V', 'La Libertad', 'vendida',         5, 20);
  insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt) values
    (casa_p, 'foto', 1, f1, 1600, 900, 'Foto propia 1'),
    (casa_p, 'foto', 2, f2, 1600, 900, 'Foto propia 2'),
    (casa_p, 'foto', 3, f3, 1600, 900, 'Foto propia 3');

  insert into public.obras (id, nombre, modalidad, casa_id) values
    (obra_1, 'Obra de prueba 015 (1)', 'compra', casa_p),
    (obra_2, 'Obra de prueba 015 (2)', 'compra', casa_q),
    (obra_3, 'Obra de prueba 015 (3)', 'compra', casa_v);
  insert into public.obra_miembros (obra_id, user_id) values (obra_1, usuario_c);

  insert into public.casas_venta_avances (id, casa_id, fecha, titulo, fotos, visible) values
    (p1, casa_p, '2026-11-10', 'Fundación terminada', '{01.jpg,02.jpg,03.jpg}', true),
    (p2, casa_p, '2026-11-12', 'Bastones listos',     '{01.jpg,02.jpg}',        true),
    (p3, casa_p, '2026-11-13', 'Publicación a medias', '{}',                    false),
    (q1, casa_q, '2026-11-10', 'Zanjeado de Q',       '{01.jpg}',               true),
    (v1, casa_v, '2026-10-10', 'Avance de la vendida', '{01.jpg}',              true);
  insert into public.avances (id, obra_id, fecha, titulo, publicacion_id) values
    (a1, obra_1, '2026-11-10', 'Fundación terminada',  p1),
    (a2, obra_1, '2026-11-12', 'Bastones listos',      p2),
    (a3, obra_1, '2026-11-13', 'Publicación a medias', p3),
    (a4, obra_2, '2026-11-10', 'Zanjeado de Q',        q1),
    (a5, obra_3, '2026-10-10', 'Avance de la vendida', v1);

  begin
    insert into storage.objects (bucket_id, name) values
      ('casas', casa_p::text || '/avances/' || p1::text || '/01.jpg'),
      ('casas', casa_p::text || '/avances/' || p1::text || '/02.jpg'),
      ('casas', casa_p::text || '/avances/' || p1::text || '/03.jpg'),
      ('casas', casa_p::text || '/avances/' || p2::text || '/01.jpg'),
      ('casas', casa_p::text || '/avances/' || p2::text || '/02.jpg'),
      ('casas', casa_q::text || '/avances/' || q1::text || '/01.jpg'),
      ('casas', casa_v::text || '/avances/' || v1::text || '/01.jpg');
  exception when others then
    raise exception 'FALLA preparación: no se pudieron simular los archivos en storage.objects: %', sqlerrm;
  end;

  -- -------------------------------------------------------------------------------------
  -- 1. Cliente C (autenticado, no administrador) y anon: rechazados
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_c, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  foreach sentencia in array array[
    format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', p1, '02.jpg'),
    format('insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt) values (%L, %L, 9, %L, 800, 800, %L)',
           casa_p, 'foto', casa_p::text || '/intrusa.jpg', 'Foto intrusa'),
    format('update public.casas_venta_imagenes set orden = 9 where ruta = %L', f1),
    format('delete from public.casas_venta_imagenes where ruta = %L', f1)
  ] loop
    begin
      execute sentencia;
      raise exception 'FALLA 1: el cliente pudo: %', sentencia;
    exception when insufficient_privilege then null;
    end;
  end loop;
  perform set_config('role', 'none', true);

  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  begin
    perform * from public.admin_elegir_portada(p1, '02.jpg', 1200, 1600);
    raise exception 'FALLA 1: anon pudo ejecutar admin_elegir_portada';
  exception when insufficient_privilege then null;
  end;
  perform set_config('role', 'none', true);

  select array_agg(ruta order by orden) into rutas from public.casas_venta_imagenes where casa_id = casa_p and tipo = 'foto';
  if rutas is distinct from array[f1, f2, f3] then
    raise exception 'FALLA 1: las fotos de P cambiaron tras los intentos rechazados: %', rutas;
  end if;

  -- -------------------------------------------------------------------------------------
  -- 2. Administrador: tres cambios seguidos en P
  -- -------------------------------------------------------------------------------------
  perform set_config('request.jwt.claims',
    json_build_object('sub', usuario_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  for paso in 1..3 loop
    foto_pub := case paso when 1 then p1 when 2 then p2 else p1 end;
    foto_nom := case paso when 1 then '02.jpg' when 2 then '01.jpg' else '03.jpg' end;
    perform * from public.admin_elegir_portada(foto_pub, foto_nom, 1200, 1600);

    esperado := array[casa_p::text || '/avances/' || foto_pub::text || '/' || foto_nom, f1, f2, f3];
    select array_agg(ruta order by orden), array_agg(orden::int order by orden)
      into rutas, ordenes
    from public.casas_venta_imagenes where casa_id = casa_p and tipo = 'foto';
    if rutas is distinct from esperado or ordenes is distinct from array[1, 2, 3, 4] then
      raise exception 'FALLA 2 (cambio %): orden % con rutas %; se esperaba 1, 2, 3, 4 con %',
        paso, ordenes, rutas, esperado;
    end if;
    select count(*) into n from public.casas_venta_imagenes where casa_id = casa_p and tipo = 'foto' and orden = 1;
    if n <> 1 then raise exception 'FALLA 2 (cambio %): hay % portadas', paso, n; end if;
  end loop;

  if not exists (select 1 from public.casas_venta_imagenes
                 where casa_id = casa_p and orden = 1 and ancho = 1200 and alto = 1600
                   and alt = 'Foto de la obra: Fundación terminada') then
    raise exception 'FALLA 2: la portada no guardó alt, ancho y alto';
  end if;

  -- -------------------------------------------------------------------------------------
  -- 3. Casa sin fotos
  -- -------------------------------------------------------------------------------------
  perform * from public.admin_elegir_portada(q1, '01.jpg', 1600, 1200);
  select array_agg(orden::int order by orden) into ordenes from public.casas_venta_imagenes where casa_id = casa_q;
  if ordenes is distinct from array[1] then
    raise exception 'FALLA 3: la casa sin fotos quedó con %', ordenes;
  end if;

  -- -------------------------------------------------------------------------------------
  -- 4. Candados
  -- -------------------------------------------------------------------------------------
  for caso in
    select * from (values
      (format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', p1, '03.jpg'), 'ALTO: esa foto ya es la foto de la tarjeta%'),
      (format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', p1, '09.jpg'), 'ALTO: esa foto no está publicada%'),
      (format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', p1, '../x.jpg'), 'ALTO: esa foto no está publicada%'),
      (format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', p3, '01.jpg'), 'ALTO: la publicación todavía no se ve%'),
      (format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', v1, '01.jpg'), 'ALTO: la casa está vendida%'),
      (format('select * from public.admin_elegir_portada(%L, %L, 1200, 1600)', nada, '01.jpg'), 'ALTO: no existe la publicación%'),
      (format('select * from public.admin_elegir_portada(%L, %L, 100, 1600)', p1, '01.jpg'), 'ALTO: la foto debe medir%'),
      (format('select * from public.admin_fijar_fotos_publicacion(%L, %L)', p1, '{01.jpg,02.jpg}'), 'ALTO: la foto de la tarjeta es de este avance%'),
      (format('select * from public.admin_despublicar_avance(%L)', a1), 'ALTO: una foto de este avance es la foto de la tarjeta%')
    ) as t(sentencia, patron)
  loop
    begin
      execute caso.sentencia;
      raise exception 'FALLA 4: no se detuvo: %', caso.sentencia;
    exception when raise_exception then
      if sqlerrm not like caso.patron then
        raise exception 'FALLA 4: % dio "%" (se esperaba %)', caso.sentencia, sqlerrm, caso.patron;
      end if;
    end;
  end loop;

  select array_agg(ruta order by orden) into rutas from public.casas_venta_imagenes where casa_id = casa_p and tipo = 'foto';
  if rutas is distinct from array[casa_p::text || '/avances/' || p1::text || '/03.jpg', f1, f2, f3]
     or not exists (select 1 from public.casas_venta_avances where id = p1 and fotos = '{01.jpg,02.jpg,03.jpg}') then
    raise exception 'FALLA 4: un candado cambió algo (%)', rutas;
  end if;

  -- a2 ya no tiene la portada: se puede quitar de la ficha
  perform * from public.admin_despublicar_avance(a2);
  if exists (select 1 from public.casas_venta_avances where id = p2) then
    raise exception 'FALLA 4: no se quitó de la ficha el avance que ya no es portada';
  end if;
  perform set_config('role', 'none', true);

  -- -------------------------------------------------------------------------------------
  -- 5. Registro
  -- -------------------------------------------------------------------------------------
  select count(*) into n from public.registro_admin where accion = 'elegir_portada'
    and user_id = usuario_a;
  if n <> 4 then raise exception 'FALLA 5: % filas "elegir_portada" en el registro (se esperaban 4)', n; end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: cliente no administrador y anon rechazados (función y escritura directa); tres cambios seguidos de portada con orden exacto 1, 2, 3, 4 y una sola portada; casa sin fotos; 9 candados sin cambios; quitar de la ficha bloqueado solo para el avance de la portada; registro con 4 filas. Todo revertido.';
end;
$prueba$;
