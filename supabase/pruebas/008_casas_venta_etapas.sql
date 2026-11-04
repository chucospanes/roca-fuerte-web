-- Prueba del avance público de las casas (migración 008). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 008, con aprobación del usuario.
-- Crea una casa publicada (P) y una oculta (O), con sus etapas, y comprueba que:
--   1. Los candados de la tabla funcionan: estado fuera de la lista, orden repetido en la
--      misma casa, orden fuera de rango, etapa por iniciar con fecha, video que no es de
--      YouTube/Vimeo. El mismo orden en otra casa sí se acepta.
--   2. updated_at se actualiza solo al modificar una etapa.
--   3. `anon` y `authenticated` ven SOLO las etapas de la casa publicada; las de la oculta no
--      aparecen ni buscándolas por casa.
--   4. Ninguno de los dos puede insertar, modificar ni borrar etapas (42501).
--   5. El portal sigue cerrado: `anon` no lee `etapas` ni `obras` (42501).
--   6. Al borrar una casa se borran sus etapas.
--
-- NO QUEDA NADA GUARDADO: todo corre dentro de un solo bloque DO que SIEMPRE termina con
-- un error a propósito, y el error revierte todo lo que hizo el bloque. Por eso el
-- resultado se lee en el mensaje de error:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
-- Cualquier otro error (por ejemplo, de sintaxis) también revierte todo.
-- Después de correrla se puede confirmar con una lectura que no quedaron filas de prueba:
--   select count(*) from public.casas_venta_etapas;  -- igual que antes de la prueba

do $$
declare
  casa_p   constant uuid := 'c0000000-0000-4000-8000-0000000008c1';
  casa_o   constant uuid := 'c0000000-0000-4000-8000-0000000008c2';
  rol      text;
  t        text;
  n        bigint;
  antes    timestamptz;
  despues  timestamptz;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-008-publicada', true,  'Casa de prueba 008 publicada', 'Distrito P',
     'Municipio P', 'La Libertad', 5, 20),
    (casa_o, 'prueba-008-oculta',    false, 'Casa de prueba 008 oculta',    'Distrito O',
     'Municipio O', 'San Salvador', 5, 20);

  insert into public.casas_venta_etapas (casa_id, orden, nombre, estado, fecha_inicio, descripcion, video_url)
  values
    (casa_p, 1, 'Terracería',       'terminada',   '2026-10-25', 'Etapa terminada P', 'https://youtu.be/aaaaaaaaaaa'),
    (casa_p, 2, 'Trazo y zanjeado', 'en_proceso',  '2026-11-03', 'Etapa en proceso P', null),
    (casa_p, 3, 'Fundaciones',      'por_iniciar', null,         'Etapa futura P', null),
    -- mismo orden 1 en otra casa: permitido
    (casa_o, 1, 'Terracería',       'en_proceso',  '2026-10-01', 'Etapa de la oculta', null);

  -- -------------------------------------------------------------------------------------
  -- 1. Candados de la tabla
  -- -------------------------------------------------------------------------------------
  begin
    insert into public.casas_venta_etapas (casa_id, orden, nombre, estado)
    values (casa_p, 4, 'Paredes', 'pendiente');
    raise exception 'FALLA: se aceptó un estado fuera de la lista';
  exception when check_violation then null;
  end;

  begin
    insert into public.casas_venta_etapas (casa_id, orden, nombre)
    values (casa_p, 1, 'Etapa repetida');
    raise exception 'FALLA: se aceptó un orden repetido en la misma casa';
  exception when unique_violation then null;
  end;

  begin
    insert into public.casas_venta_etapas (casa_id, orden, nombre)
    values (casa_p, 100, 'Orden fuera de rango');
    raise exception 'FALLA: se aceptó un orden de 100';
  exception when check_violation then null;
  end;

  begin
    update public.casas_venta_etapas set fecha_inicio = '2026-12-01'
    where casa_id = casa_p and orden = 3;
    raise exception 'FALLA: una etapa por iniciar aceptó fecha de inicio';
  exception when check_violation then null;
  end;

  begin
    update public.casas_venta_etapas set video_url = 'https://www.tiktok.com/@x/video/1'
    where casa_id = casa_p and orden = 2;
    raise exception 'FALLA: se aceptó un video que no es de YouTube ni de Vimeo';
  exception when check_violation then null;
  end;

  -- -------------------------------------------------------------------------------------
  -- 2. updated_at automático (now() es fijo dentro de la transacción: se compara con un
  --    valor viejo puesto a mano)
  -- -------------------------------------------------------------------------------------
  update public.casas_venta_etapas set updated_at = '2000-01-01'
  where casa_id = casa_p and orden = 3;
  select updated_at into antes from public.casas_venta_etapas where casa_id = casa_p and orden = 3;
  update public.casas_venta_etapas set estado = 'en_proceso', fecha_inicio = '2026-12-01'
  where casa_id = casa_p and orden = 3;
  select updated_at into despues from public.casas_venta_etapas where casa_id = casa_p and orden = 3;
  if despues <= '2000-01-02' then
    raise exception 'FALLA: updated_at no se actualizó al modificar la etapa (antes %, después %)', antes, despues;
  end if;

  -- -------------------------------------------------------------------------------------
  -- 3, 4 y 5. Como visitante sin sesión (anon) y como usuario con sesión (authenticated)
  -- -------------------------------------------------------------------------------------
  foreach rol in array array['anon', 'authenticated'] loop
    perform set_config('request.jwt.claims',
      json_build_object('sub', 'c0000000-0000-4000-8000-0000000008ff', 'role', rol)::text, true);
    perform set_config('role', rol, true);

    select count(*) into n from public.casas_venta_etapas where casa_id in (casa_p, casa_o);
    if n <> 3 then
      raise exception 'FALLA: % ve % etapa(s) de prueba (se esperaban 3, las de la publicada)', rol, n;
    end if;
    select count(*) into n from public.casas_venta_etapas where casa_id = casa_o;
    if n <> 0 then
      raise exception 'FALLA: % ve etapas de la casa oculta', rol;
    end if;

    begin
      insert into public.casas_venta_etapas (casa_id, orden, nombre) values (casa_p, 9, 'Intrusa');
      raise exception 'FALLA: % pudo insertar una etapa', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      update public.casas_venta_etapas set nombre = 'Cambiada' where casa_id = casa_p;
      raise exception 'FALLA: % pudo modificar etapas', rol;
    exception when insufficient_privilege then null;
    end;
    begin
      delete from public.casas_venta_etapas where casa_id = casa_p;
      raise exception 'FALLA: % pudo borrar etapas', rol;
    exception when insufficient_privilege then null;
    end;

    reset role;
  end loop;

  -- 5. El portal sigue cerrado para anon
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  foreach t in array array['etapas', 'obras'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      raise exception 'FALLA: anon pudo leer % (% filas)', t, n;
    exception when insufficient_privilege then null;
    end;
  end loop;
  reset role;

  -- -------------------------------------------------------------------------------------
  -- 6. Al borrar la casa se borran sus etapas
  -- -------------------------------------------------------------------------------------
  delete from public.casas_venta where id = casa_o;
  select count(*) into n from public.casas_venta_etapas where casa_id = casa_o;
  if n <> 0 then
    raise exception 'FALLA: al borrar la casa quedaron % etapa(s)', n;
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: 5 candados, updated_at y borrado en cascada correctos; anon y authenticated ven solo las 3 etapas de la casa publicada y no escriben; el portal sigue cerrado. Todo revertido.';
end;
$$;
