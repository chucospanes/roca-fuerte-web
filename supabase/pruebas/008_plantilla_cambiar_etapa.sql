-- Prueba de la plantilla 5 de docs/GUIA_CARGA_CASAS.md (cambiar etapa: lo público y el
-- portal a la vez). NO es una migración. Requiere 004 y 008 aplicadas.
--
-- Se corre en el SQL Editor de Supabase, con aprobación del usuario. Igual que las demás
-- pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y el error revierte
-- todo (usuarios, casas, obras y etapas de prueba). El resultado se lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- La parte desde "Debajo de esta línea no se edita nada" es copia exacta de la guía (la arma
-- un script desde la guía); aquí solo cambia el bloque de datos.
-- Datos de prueba: casa P (en construcción, etapas 1–5) y casa V (vendida); obra O con el
-- usuario U como miembro (etapas 1–4; la 4 con otro nombre, sin la 5) y obra O2 con el MISMO
-- nombre, de la que U no es miembro.
-- Casos (en cada ALTO se comprueba además que no cambió ninguna etapa):
--    1. Un "<" olvidado: ALTO.                    8. Nombre de obra que no existe: ALTO.
--    2. Orden 0: ALTO.                            9. Correo que no es miembro: ALTO.
--    3. Estado fuera de la lista: ALTO.          10. Dos obras con ese nombre y el correo: ALTO.
--    4. Por iniciar con fecha: ALTO.             11. La obra no tiene la etapa de ese orden: ALTO.
--    5. Slug inexistente: ALTO.                  12. Nombres distintos en los dos lados: ALTO.
--    6. Casa vendida: ALTO.                      13. En proceso sin fecha (no hay): ALTO.
--    7. La casa no tiene etapa de ese orden: ALTO.
--   14. Arrancar la 3 (correo con mayúsculas y espacios): cambia los dos lados; O2 intacta.
--   15. Terminar la 2 sin fecha: los dos lados conservan su fecha de inicio.
--   16. Volver la 3 a por iniciar: los dos lados sin fecha.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.casas_venta_etapas;  -- igual que antes de la prueba

do $prueba$
declare
  usuario_u constant uuid := 'c0000000-0000-4000-8000-0000000008a1';
  usuario_x constant uuid := 'c0000000-0000-4000-8000-0000000008a2';
  casa_p    constant uuid := 'c0000000-0000-4000-8000-0000000008b1';
  casa_v    constant uuid := 'c0000000-0000-4000-8000-0000000008b2';
  obra_o    constant uuid := 'c0000000-0000-4000-8000-0000000008d1';
  obra_o2   constant uuid := 'c0000000-0000-4000-8000-0000000008d2';
  -- Bloque de datos de la plantilla; cada caso pone sus valores con format(%L)
  datos constant text := $d$
with
datos as materialized (
  select %L::text     as slug,
         %L::text     as obra,
         %L::text     as correo,
         %L::smallint as orden,
         %L::text     as estado,
         %L::date     as fecha_inicio
),
$d$;
  cuerpo constant text := $plantilla$
-- ===== Debajo de esta línea no se edita nada =====
casa as (
  select c.id, c.estado from public.casas_venta c, datos d where c.slug = d.slug
),
publica as (
  select e.id, e.nombre, e.fecha_inicio
  from public.casas_venta_etapas e, casa c, datos d
  where e.casa_id = c.id and e.orden = d.orden
),
obra as (
  select distinct o.id
  from public.obras o
  join public.obra_miembros m on m.obra_id = o.id
  join auth.users u on u.id = m.user_id
  cross join datos d
  where o.nombre = d.obra and u.email = lower(trim(d.correo))
),
portal as (
  select e.id, e.nombre, e.fecha_inicio
  from public.etapas e, obra o, datos d
  where e.obra_id = o.id and e.orden = d.orden
),
-- Revisa todo antes de cambiar nada (mensaje "ALTO: ...", como en las demás plantillas)
candado as materialized (
  select case
    when exists (select 1 from jsonb_each_text(to_jsonb(d)) where value like '%<%') then
      format('ALTO: quedan valores sin reemplazar (con "<") en: %s. No se cambió nada.',
             (select string_agg(key, ', ' order by key)
              from jsonb_each_text(to_jsonb(d)) where value like '%<%'))
    when d.orden is null or d.orden not between 1 and 99 then
      'ALTO: orden va de 1 a 99 (el número de la etapa). No se cambió nada.'
    when d.estado is null or d.estado not in ('por_iniciar', 'en_proceso', 'terminada') then
      'ALTO: estado va en por_iniciar, en_proceso o terminada. No se cambió nada.'
    when d.estado = 'por_iniciar' and d.fecha_inicio is not null then
      'ALTO: una etapa por iniciar va sin fecha (fecha_inicio en null). No se cambió nada.'
    when not exists (select 1 from casa) then
      format('ALTO: no existe una casa con el slug "%s". No se cambió nada.', d.slug)
    when (select estado from casa) = 'vendida' then
      'ALTO: la casa está vendida: su avance público se congeló. Carga el cambio solo en el portal (docs/GUIA_CARGA_OBRAS.md). No se cambió nada.'
    when not exists (select 1 from publica) then
      format('ALTO: la casa no tiene etapa pública de orden %s. No se cambió nada.', d.orden)
    when (select count(*) from obra) <> 1 then
      format('ALTO: hay %s obras llamadas "%s" de las que el correo "%s" es miembro; tiene que haber exactamente una. No se cambió nada.',
             (select count(*) from obra), d.obra, d.correo)
    when not exists (select 1 from portal) then
      format('ALTO: la obra del portal no tiene etapa de orden %s. No se cambió nada.', d.orden)
    when lower(trim((select nombre from publica))) <> lower(trim((select nombre from portal))) then
      format('ALTO: la etapa %s se llama "%s" en lo público y "%s" en el portal. Revisa el orden. No se cambió nada.',
             d.orden, (select nombre from publica), (select nombre from portal))
    when d.estado = 'en_proceso' and d.fecha_inicio is null
         and ((select fecha_inicio from publica) is null or (select fecha_inicio from portal) is null) then
      'ALTO: una etapa en proceso necesita su fecha de inicio (fecha_inicio). No se cambió nada.'
  end as error
  from datos d
),
cambio_publica as (
  update public.casas_venta_etapas e
  set estado       = d.estado,
      fecha_inicio = case when d.estado = 'por_iniciar' then null
                          else coalesce(d.fecha_inicio, e.fecha_inicio) end
  from datos d, publica p, candado k
  where e.id = p.id and coalesce(k.error::int, 0) = 0
  returning e.orden, e.nombre, e.estado, e.fecha_inicio
),
cambio_portal as (
  update public.etapas e
  set estado       = d.estado,
      fecha_inicio = case when d.estado = 'por_iniciar' then null
                          else coalesce(d.fecha_inicio, e.fecha_inicio) end
  from datos d, portal p, candado k
  where e.id = p.id and coalesce(k.error::int, 0) = 0
  returning e.orden, e.nombre, e.estado, e.fecha_inicio
)
select
  (select coalesce(error::int, 0) from candado)                                  as candado,
  (select orden || '. ' || nombre || ' · ' || estado || ' · '
          || coalesce(fecha_inicio::text, 'sin fecha') from cambio_publica)     as etapa_publica,
  (select orden || '. ' || nombre || ' · ' || estado || ' · '
          || coalesce(fecha_inicio::text, 'sin fecha') from cambio_portal)      as etapa_portal
$plantilla$;
  -- Huella de todas las etapas de prueba (para comprobar que un ALTO no cambió nada)
  q_huella constant text := $q$
select (select string_agg(orden || nombre || estado || coalesce(fecha_inicio::text, '-'), '|' order by casa_id, orden)
        from public.casas_venta_etapas where casa_id in ($1, $2))
    || '#' ||
       (select string_agg(orden || nombre || estado || coalesce(fecha_inicio::text, '-'), '|' order by obra_id, orden)
        from public.etapas where obra_id in ($3, $4))
$q$;
  caso     record;
  r        record;
  mensaje  text;
  antes    text;
  despues  text;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  insert into auth.users (id, email, aud, role) values
    (usuario_u, 'prueba-etapa@ejemplo.invalid',      'authenticated', 'authenticated'),
    (usuario_x, 'prueba-etapa-otro@ejemplo.invalid', 'authenticated', 'authenticated');

  insert into public.casas_venta
    (id, slug, publicada, nombre, distrito, municipio, departamento, estado, lote_frente_m, lote_fondo_m)
  values
    (casa_p, 'prueba-008-etapa',   true, 'Casa de prueba etapa',   'Distrito P', 'Municipio P', 'La Libertad', 'en_construccion', 5, 20),
    (casa_v, 'prueba-008-vendida', true, 'Casa de prueba vendida', 'Distrito V', 'Municipio V', 'La Libertad', 'vendida',         5, 20);

  insert into public.casas_venta_etapas (casa_id, orden, nombre, estado, fecha_inicio) values
    (casa_p, 1, 'Terracería',       'terminada',   '2026-10-25'),
    (casa_p, 2, 'Trazo y zanjeado', 'en_proceso',  '2026-11-03'),
    (casa_p, 3, 'Fundaciones',      'por_iniciar', null),
    (casa_p, 4, 'Paredes',          'por_iniciar', null),
    (casa_p, 5, 'Techo',            'por_iniciar', null),
    (casa_v, 1, 'Terracería',       'en_proceso',  '2026-10-01');

  insert into public.obras (id, nombre, modalidad) values
    (obra_o,  'Obra de prueba 008', 'compra'),
    (obra_o2, 'Obra de prueba 008', 'compra');
  insert into public.obra_miembros (obra_id, user_id) values
    (obra_o, usuario_u), (obra_o2, usuario_x);

  insert into public.etapas (obra_id, orden, nombre, estado, fecha_inicio) values
    (obra_o,  1, 'Terracería',       'terminada',   '2026-10-25'),
    (obra_o,  2, 'Trazo y zanjeado', 'en_proceso',  '2026-11-03'),
    (obra_o,  3, 'Fundaciones',      'por_iniciar', null),
    (obra_o,  4, 'Muros',            'por_iniciar', null),
    (obra_o2, 3, 'Fundaciones',      'por_iniciar', null);

  -- -------------------------------------------------------------------------------------
  -- Casos 1–13: candados. Ninguno cambia nada.
  -- -------------------------------------------------------------------------------------
  execute q_huella into antes using casa_p, casa_v, obra_o, obra_o2;

  for caso in
    select * from (values
      ( 1, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '3', '<en_proceso>', '2026-12-01',
           'ALTO: quedan valores sin reemplazar%estado%'),
      ( 2, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '0', 'en_proceso',   '2026-12-01',
           'ALTO: orden va de 1 a 99%'),
      ( 3, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '3', 'pendiente',    null,
           'ALTO: estado va en%'),
      ( 4, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '3', 'por_iniciar',  '2026-12-01',
           'ALTO: una etapa por iniciar va sin fecha%'),
      ( 5, 'no-existe-esta-casa', 'Obra de prueba 008', 'prueba-etapa@ejemplo.invalid',      '3', 'en_proceso',   '2026-12-01',
           'ALTO: no existe una casa con el slug%'),
      ( 6, 'prueba-008-vendida', 'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '1', 'terminada',    null,
           'ALTO: la casa está vendida%'),
      ( 7, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '9', 'en_proceso',   '2026-12-01',
           'ALTO: la casa no tiene etapa pública de orden 9%'),
      ( 8, 'prueba-008-etapa',   'Obra que no existe',  'prueba-etapa@ejemplo.invalid',      '3', 'en_proceso',   '2026-12-01',
           'ALTO: hay 0 obras llamadas%'),
      ( 9, 'prueba-008-etapa',   'Obra de prueba 008',  'nadie@ejemplo.invalid',             '3', 'en_proceso',   '2026-12-01',
           'ALTO: hay 0 obras llamadas%'),
      (11, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '5', 'en_proceso',   '2026-12-01',
           'ALTO: la obra del portal no tiene etapa de orden 5%'),
      (12, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '4', 'en_proceso',   '2026-12-01',
           'ALTO: la etapa 4 se llama "Paredes" en lo público y "Muros" en el portal%'),
      (13, 'prueba-008-etapa',   'Obra de prueba 008',  'prueba-etapa@ejemplo.invalid',      '3', 'en_proceso',   null,
           'ALTO: una etapa en proceso necesita su fecha de inicio%')
    ) as c (n, slug, obra, correo, orden, estado, fecha, esperado)
  loop
    begin
      execute format(datos, caso.slug, caso.obra, caso.correo, caso.orden, caso.estado, caso.fecha) || cuerpo into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like caso.esperado then
      raise exception 'FALLA caso %: %', caso.n, coalesce(mensaje, 'no dio error (' || row_to_json(r)::text || ')');
    end if;
    execute q_huella into despues using casa_p, casa_v, obra_o, obra_o2;
    if despues is distinct from antes then
      raise exception 'FALLA caso %: el ALTO cambió etapas', caso.n;
    end if;
  end loop;

  -- Caso 10: dos obras con ese nombre de las que el correo es miembro
  insert into public.obra_miembros (obra_id, user_id) values (obra_o2, usuario_u);
  begin
    execute format(datos, 'prueba-008-etapa', 'Obra de prueba 008', 'prueba-etapa@ejemplo.invalid',
                   '3', 'en_proceso', '2026-12-01') || cuerpo into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like 'ALTO: hay 2 obras llamadas%' then
    raise exception 'FALLA caso 10: %', coalesce(mensaje, 'no dio error');
  end if;
  execute q_huella into despues using casa_p, casa_v, obra_o, obra_o2;
  if despues is distinct from antes then
    raise exception 'FALLA caso 10: el ALTO cambió etapas';
  end if;
  delete from public.obra_miembros where obra_id = obra_o2 and user_id = usuario_u;

  -- -------------------------------------------------------------------------------------
  -- Caso 14: arrancar la etapa 3 (correo con mayúsculas y espacios)
  -- -------------------------------------------------------------------------------------
  execute format(datos, 'prueba-008-etapa', 'Obra de prueba 008', '  Prueba-Etapa@Ejemplo.INVALID ',
                 '3', 'en_proceso', '2026-12-01') || cuerpo into r;
  if r.candado <> 0
     or r.etapa_publica is distinct from '3. Fundaciones · en_proceso · 2026-12-01'
     or r.etapa_portal  is distinct from '3. Fundaciones · en_proceso · 2026-12-01' then
    raise exception 'FALLA caso 14: (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.casas_venta_etapas
                 where casa_id = casa_p and orden = 3 and estado = 'en_proceso' and fecha_inicio = '2026-12-01')
     or not exists (select 1 from public.etapas
                    where obra_id = obra_o and orden = 3 and estado = 'en_proceso' and fecha_inicio = '2026-12-01') then
    raise exception 'FALLA caso 14: las filas no quedaron en proceso con su fecha';
  end if;
  if not exists (select 1 from public.etapas
                 where obra_id = obra_o2 and orden = 3 and estado = 'por_iniciar' and fecha_inicio is null) then
    raise exception 'FALLA caso 14: cambió la etapa de la otra obra con el mismo nombre';
  end if;

  -- Caso 15: terminar la etapa 2 sin fecha (conserva la de inicio)
  execute format(datos, 'prueba-008-etapa', 'Obra de prueba 008', 'prueba-etapa@ejemplo.invalid',
                 '2', 'terminada', null) || cuerpo into r;
  if r.candado <> 0
     or r.etapa_publica is distinct from '2. Trazo y zanjeado · terminada · 2026-11-03'
     or r.etapa_portal  is distinct from '2. Trazo y zanjeado · terminada · 2026-11-03' then
    raise exception 'FALLA caso 15: (%)', row_to_json(r);
  end if;

  -- Caso 16: volver la etapa 3 a por iniciar (borra la fecha en los dos lados)
  execute format(datos, 'prueba-008-etapa', 'Obra de prueba 008', 'prueba-etapa@ejemplo.invalid',
                 '3', 'por_iniciar', null) || cuerpo into r;
  if r.candado <> 0
     or r.etapa_publica is distinct from '3. Fundaciones · por_iniciar · sin fecha'
     or r.etapa_portal  is distinct from '3. Fundaciones · por_iniciar · sin fecha' then
    raise exception 'FALLA caso 16: (%)', row_to_json(r);
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: 16 casos. 13 candados sin cambiar nada; arrancar, terminar y volver a por iniciar cambian igual lo público y el portal, sin tocar la otra obra con el mismo nombre. Todo revertido.';
end;
$prueba$;
