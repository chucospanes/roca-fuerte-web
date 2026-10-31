-- Prueba de aislamiento del portal (migración 004). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase DESPUÉS de aplicar 004, con aprobación del usuario.
-- Crea dos usuarios y dos obras de prueba, se hace pasar por cada cliente y comprueba que:
--   1. El cliente A ve solo su obra (y sus etapas, avances, materiales, documentos y
--      membresía), nunca las de B. Y al revés.
--   2. Ningún cliente puede insertar, modificar ni borrar en las 6 tablas (error 42501).
--   3. `anon` no puede leer ninguna tabla (error 42501).
--
-- NO QUEDA NADA GUARDADO: todo corre dentro de un solo bloque DO que SIEMPRE termina con
-- un error a propósito, y el error revierte todo lo que hizo el bloque. Por eso el
-- resultado se lee en el mensaje de error:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
-- Cualquier otro error (por ejemplo, de sintaxis) también revierte todo.
-- Después de correrla se puede confirmar con una lectura que no quedaron filas:
--   select count(*) from public.obras;  -- igual que antes de la prueba

do $$
declare
  usuario_a constant uuid := 'a0000000-0000-4000-8000-00000000000a';
  usuario_b constant uuid := 'b0000000-0000-4000-8000-00000000000b';
  obra_a    constant uuid := 'a0000000-0000-4000-8000-0000000000a1';
  obra_b    constant uuid := 'b0000000-0000-4000-8000-0000000000b1';
  etapa_a   constant uuid := 'a0000000-0000-4000-8000-0000000000a2';
  etapa_b   constant uuid := 'b0000000-0000-4000-8000-0000000000b2';
  tablas    constant text[] := array['obras', 'obra_miembros', 'etapas', 'avances',
                                     'obra_materiales', 'documentos'];
  cliente   record;
  t         text;
  n         bigint;
  ajenas    bigint;
begin
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  insert into auth.users (id, email, aud, role)
  values (usuario_a, 'prueba-portal-a@ejemplo.invalid', 'authenticated', 'authenticated'),
         (usuario_b, 'prueba-portal-b@ejemplo.invalid', 'authenticated', 'authenticated');

  insert into public.obras (id, nombre, modalidad)
  values (obra_a, 'Obra de prueba A', 'compra'),
         (obra_b, 'Obra de prueba B', 'inversionista');

  insert into public.obra_miembros (obra_id, user_id)
  values (obra_a, usuario_a), (obra_b, usuario_b);

  insert into public.etapas (id, obra_id, orden, nombre)
  values (etapa_a, obra_a, 1, 'Etapa A'), (etapa_b, obra_b, 1, 'Etapa B');

  insert into public.avances (obra_id, etapa_id, fecha, titulo, video_url)
  values (obra_a, etapa_a, current_date, 'Avance A', 'https://youtu.be/aaaaaaaaaaa'),
         (obra_b, etapa_b, current_date, 'Avance B', 'https://vimeo.com/123456');

  insert into public.obra_materiales (obra_id, material)
  values (obra_a, 'Material A'), (obra_b, 'Material B');

  insert into public.documentos (obra_id, tipo, titulo, ruta)
  values (obra_a, 'contrato', 'Contrato A', obra_a::text || '/documentos/contrato.pdf'),
         (obra_b, 'contrato', 'Contrato B', obra_b::text || '/documentos/contrato.pdf');

  -- Cada cliente, uno tras otro
  for cliente in
    select * from (values ('A', usuario_a, obra_a, obra_b),
                          ('B', usuario_b, obra_b, obra_a)) as c(nombre, usuario, propia, ajena)
  loop
    perform set_config('request.jwt.claims',
      json_build_object('sub', cliente.usuario, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);

    if (select auth.uid()) is distinct from cliente.usuario then
      raise exception 'FALLA: auth.uid() no devuelve al cliente %', cliente.nombre;
    end if;

    -- Lectura: exactamente 1 fila propia en cada tabla y 0 de la otra obra
    foreach t in array tablas loop
      execute format(
        'select count(*), count(*) filter (where %I <> $1) from public.%I',
        case when t = 'obras' then 'id' else 'obra_id' end, t)
        into n, ajenas using cliente.propia;
      if ajenas <> 0 then
        raise exception 'FALLA: el cliente % ve % fila(s) de otra obra en %', cliente.nombre, ajenas, t;
      end if;
      if n <> 1 then
        raise exception 'FALLA: el cliente % ve % fila(s) en % (se esperaba 1, la suya)', cliente.nombre, n, t;
      end if;
    end loop;

    -- Escritura: insert, update y delete deben fallar con 42501 en todas las tablas
    foreach t in array tablas loop
      begin
        execute format('insert into public.%I default values', t);
        raise exception 'FALLA: el cliente % pudo insertar en %', cliente.nombre, t;
      exception when insufficient_privilege then null;
      end;
      begin
        execute format('update public.%I set created_at = created_at', t);
        raise exception 'FALLA: el cliente % pudo modificar %', cliente.nombre, t;
      exception when insufficient_privilege then null;
      end;
      begin
        execute format('delete from public.%I', t);
        raise exception 'FALLA: el cliente % pudo borrar en %', cliente.nombre, t;
      exception when insufficient_privilege then null;
      end;
    end loop;

    -- Vuelve al rol del SQL Editor para el siguiente cliente
    reset role;
  end loop;

  -- anon (visitante sin sesión): sin permiso de lectura en ninguna tabla
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
  foreach t in array tablas loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      raise exception 'FALLA: anon pudo leer % (% filas)', t, n;
    exception when insufficient_privilege then null;
    end;
  end loop;
  reset role;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: A y B ven solo su obra en las 6 tablas, no pueden escribir y anon no lee nada. Todo revertido.';
end;
$$;
