-- Prueba del catálogo de casas (migración 005). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 005, con aprobación del usuario.
-- Crea una casa publicada (P) y una oculta (O), con sus imágenes, y comprueba que:
--   1. Los candados de la tabla funcionan: planta Esparta con m² propios, planta propia sin
--      m², slug inválido o repetido, departamento fuera de la lista, video que no es de
--      YouTube/Vimeo, imagen en la carpeta de otra casa, plano de más de 1800 px y segundo
--      plano. El área del lote se recalcula al cambiar las medidas (5 × 20 → 10 × 20).
--   2. `anon` y `authenticated` ven SOLO la casa publicada y sus imágenes; la oculta y sus
--      imágenes no aparecen ni buscándolas por id.
--   3. Ninguno de los dos puede insertar, modificar ni borrar en las 2 tablas (42501).
--   4. El portal sigue cerrado: `anon` no lee `obras` ni `documentos` (42501).
--   5. Bucket `casas` público, 5 MB, solo JPEG/PNG/WebP; bucket `obras` sigue privado;
--      `anon` y `authenticated` no ven ni suben archivos en `casas`.
--
-- NO QUEDA NADA GUARDADO: todo corre dentro de un solo bloque DO que SIEMPRE termina con
-- un error a propósito, y el error revierte todo lo que hizo el bloque. Por eso el
-- resultado se lee en el mensaje de error:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
-- Cualquier otro error (por ejemplo, de sintaxis) también revierte todo.
-- Después de correrla se puede confirmar con una lectura que no quedaron filas:
--   select count(*) from public.casas_venta;  -- igual que antes de la prueba

do $$
declare
  casa_p   constant uuid := 'c0000000-0000-4000-8000-0000000000c1';
  casa_o   constant uuid := 'c0000000-0000-4000-8000-0000000000c2';
  tablas   constant text[] := array['casas_venta', 'casas_venta_imagenes'];
  rol      text;
  t        text;
  n        bigint;
  m2       numeric;
  b        record;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento,
     lote_frente_m, lote_fondo_m, video_url, incluye)
  values
    (casa_p, 'prueba-casa-publicada', true, 'Casa de prueba publicada', 'Distrito P',
     'Municipio P', 'La Libertad', 5, 20, 'https://youtu.be/aaaaaaaaaaa',
     array['La casa terminada.', 'El terreno.']),
    (casa_o, 'prueba-casa-oculta', false, 'Casa de prueba oculta', 'Distrito O',
     'Municipio O', 'San Salvador', 5, 20, null, '{}');

  insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt)
  values
    (casa_p, 'foto',  1, casa_p::text || '/fachada.jpg', 1600, 1200, 'Fachada de prueba P'),
    (casa_p, 'plano', 1, casa_p::text || '/plano.png',   1800, 1737, 'Plano de prueba P'),
    (casa_o, 'foto',  1, casa_o::text || '/fachada.jpg', 1600, 1200, 'Fachada de prueba O');

  -- -------------------------------------------------------------------------------------
  -- 1. Candados de la tabla
  -- -------------------------------------------------------------------------------------
  begin
    update public.casas_venta set construccion_m2 = 43.60 where id = casa_p;
    raise exception 'FALLA: una casa con planta Esparta aceptó m² propios';
  exception when check_violation then null;
  end;

  begin
    update public.casas_venta set planta_esparta = false where id = casa_p;
    raise exception 'FALLA: una casa con planta propia quedó sin m², dormitorios ni baños';
  exception when check_violation then null;
  end;

  begin
    update public.casas_venta set slug = 'Casa Uno' where id = casa_p;
    raise exception 'FALLA: se aceptó un slug con mayúsculas y espacios';
  exception when check_violation then null;
  end;

  begin
    update public.casas_venta set slug = 'prueba-casa-oculta' where id = casa_p;
    raise exception 'FALLA: se aceptó un slug repetido';
  exception when unique_violation then null;
  end;

  begin
    update public.casas_venta set departamento = 'Santa Tecla' where id = casa_p;
    raise exception 'FALLA: se aceptó un departamento fuera de la lista';
  exception when check_violation then null;
  end;

  begin
    update public.casas_venta set video_url = 'https://www.tiktok.com/@x/video/1' where id = casa_p;
    raise exception 'FALLA: se aceptó un video que no es de YouTube ni de Vimeo';
  exception when check_violation then null;
  end;

  begin
    insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt)
    values (casa_p, 'foto', 2, casa_o::text || '/otra.jpg', 1600, 1200, 'Foto en otra carpeta');
    raise exception 'FALLA: se aceptó una imagen en la carpeta de otra casa';
  exception when check_violation then null;
  end;

  begin
    insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt)
    values (casa_o, 'plano', 1, casa_o::text || '/plano.png', 2000, 1900, 'Plano demasiado grande');
    raise exception 'FALLA: se aceptó un plano de más de 1800 px';
  exception when check_violation then null;
  end;

  begin
    insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt)
    values (casa_p, 'plano', 2, casa_p::text || '/plano-2.png', 1800, 1737, 'Segundo plano');
    raise exception 'FALLA: se aceptó un segundo plano para la misma casa';
  exception when unique_violation then null;
  end;

  select lote_m2 into m2 from public.casas_venta where id = casa_p;
  if m2 <> 100 then
    raise exception 'FALLA: el lote de 5 × 20 dio % m² (se esperaban 100)', m2;
  end if;
  update public.casas_venta set lote_frente_m = 10 where id = casa_p;
  select lote_m2 into m2 from public.casas_venta where id = casa_p;
  if m2 <> 200 then
    raise exception 'FALLA: al cambiar el lote a 10 × 20 dio % m² (se esperaban 200)', m2;
  end if;

  -- -------------------------------------------------------------------------------------
  -- 5a. Buckets (como el rol del SQL Editor)
  -- -------------------------------------------------------------------------------------
  select * into b from storage.buckets where id = 'casas';
  if not found then
    raise exception 'FALLA: no existe el bucket casas';
  end if;
  if not b.public or b.file_size_limit <> 5242880
     or b.allowed_mime_types::text[] <> array['image/jpeg', 'image/png', 'image/webp'] then
    raise exception 'FALLA: el bucket casas no es público con 5 MB y JPEG/PNG/WebP (public %, límite %, tipos %)',
      b.public, b.file_size_limit, b.allowed_mime_types;
  end if;
  if (select public from storage.buckets where id = 'obras') is distinct from false then
    raise exception 'FALLA: el bucket obras ya no es privado';
  end if;

  -- -------------------------------------------------------------------------------------
  -- 2, 3, 4 y 5b. Como visitante sin sesión (anon) y como usuario con sesión (authenticated)
  -- -------------------------------------------------------------------------------------
  foreach rol in array array['anon', 'authenticated'] loop
    perform set_config('request.jwt.claims',
      json_build_object('sub', 'c0000000-0000-4000-8000-0000000000ff', 'role', rol)::text, true);
    perform set_config('role', rol, true);

    -- Solo la casa publicada
    select count(*) into n from public.casas_venta;
    if n <> 1 then
      raise exception 'FALLA: % ve % casa(s) (se esperaba 1, la publicada)', rol, n;
    end if;
    select count(*) into n from public.casas_venta where id = casa_o;
    if n <> 0 then
      raise exception 'FALLA: % ve la casa oculta', rol;
    end if;

    -- Solo las imágenes de la casa publicada
    select count(*) into n from public.casas_venta_imagenes;
    if n <> 2 then
      raise exception 'FALLA: % ve % imagen(es) (se esperaban 2, las de la publicada)', rol, n;
    end if;
    select count(*) into n from public.casas_venta_imagenes where casa_id = casa_o;
    if n <> 0 then
      raise exception 'FALLA: % ve imágenes de la casa oculta', rol;
    end if;

    -- Escritura: insert, update y delete deben fallar con 42501 en las 2 tablas
    foreach t in array tablas loop
      begin
        execute format('insert into public.%I default values', t);
        raise exception 'FALLA: % pudo insertar en %', rol, t;
      exception when insufficient_privilege then null;
      end;
      begin
        execute format('update public.%I set created_at = created_at', t);
        raise exception 'FALLA: % pudo modificar %', rol, t;
      exception when insufficient_privilege then null;
      end;
      begin
        execute format('delete from public.%I', t);
        raise exception 'FALLA: % pudo borrar en %', rol, t;
      exception when insufficient_privilege then null;
      end;
    end loop;

    -- Storage: no lista ni sube archivos en `casas`
    select count(*) into n from storage.objects where bucket_id = 'casas';
    if n <> 0 then
      raise exception 'FALLA: % puede listar % archivo(s) del bucket casas', rol, n;
    end if;
    begin
      insert into storage.objects (bucket_id, name) values ('casas', casa_p::text || '/subida.jpg');
      raise exception 'FALLA: % pudo subir un archivo al bucket casas', rol;
    exception when insufficient_privilege then null;
    end;

    reset role;
  end loop;

  -- 4. El portal sigue cerrado para anon
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  foreach t in array array['obras', 'documentos'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      raise exception 'FALLA: anon pudo leer % (% filas)', t, n;
    exception when insufficient_privilege then null;
    end;
  end loop;
  reset role;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: 9 candados y el lote correctos; anon y authenticated ven solo la casa publicada y sus 2 imágenes, no escriben ni suben archivos; el portal sigue cerrado y el bucket obras privado. Todo revertido.';
end;
$$;
