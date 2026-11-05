-- Prueba de las plantillas "avance nuevo", "documento nuevo" y "materiales" de
-- docs/GUIA_CARGA_OBRAS.md. NO es una migración. Requiere 004 y 007 aplicadas.
--
-- Se corre en el SQL Editor de Supabase, con aprobación del usuario. Igual que las demás
-- pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y el error revierte
-- todo (obras, etapas, avances, documentos, materiales y archivos simulados). El resultado se
-- lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- La parte de cada plantilla desde "Debajo de esta línea no se edita nada" es copia exacta
-- de la guía (la arma un script desde la guía); aquí solo cambia el bloque de datos.
-- Postgres muestra el ALTO dentro de "invalid input syntax for type integer: ...": por eso
-- cada mensaje esperado se busca con % adelante. En cada ALTO se comprueba además que no
-- cambió nada (avances, documentos y materiales de las obras de prueba).
-- Los archivos de Storage se simulan con filas en storage.objects (sin archivo real), solo
-- dentro de la prueba.
-- Datos: obra A (etapas 1 y 2, un avance, un material "Bloque de concreto", un documento
-- "otro.pdf" ya cargado) y obra B vacía.
-- Casos:
--   Avance nuevo
--    1. Un "<" olvidado: ALTO.                     4. Etapa 9 (no existe): ALTO.
--    2. Obra inexistente: ALTO.                    5. Misma fecha y título (otras mayúsculas): ALTO.
--    3. Sin título: ALTO.
--    6. Con la etapa 2: crea el avance, título sin espacios, carpeta de fotos correcta.
--    7. Sin etapa (null): crea el avance sin etapa.
--   Documento nuevo
--    8. Un "<" olvidado: ALTO.                    12. Archivo con carpeta: ALTO.
--    9. Obra inexistente: ALTO.                   13. Archivo .heic: ALTO.
--   10. Tipo fuera de la lista: ALTO.             14. Archivo no subido: ALTO.
--   11. Sin título: ALTO.                         15. Subido en la carpeta de OTRA obra: ALTO.
--   16. Ruta que ya tiene documento: ALTO.
--   17. Factura en JPG subida: crea el documento.  18. Contrato en PDF subido: lo crea.
--   Materiales
--   19. Un "<" olvidado: ALTO.                    22. Repetido en la lista: ALTO.
--   20. Obra inexistente: ALTO.                   23. La obra ya lo tiene: ALTO.
--   21. Fila sin material: ALTO.
--   24. Tres materiales (marca opcional): crea 3, con orden 2, 3 y 4.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.obras;  -- igual que antes de la prueba

do $prueba$
declare
  obra_a     constant uuid := 'c0000000-0000-4000-8000-0000000009a1';
  obra_b     constant uuid := 'c0000000-0000-4000-8000-0000000009b1';
  obra_nada  constant uuid := 'c0000000-0000-4000-8000-0000000009ff';
  etapa_2    uuid;
  avance_datos constant text := $d$
with
datos as materialized (
  select %L::uuid     as obra_id,
         %L::smallint as etapa_orden,
         %L::date     as fecha,
         %L::text     as titulo,
         %L::text     as descripcion,
         %L::text     as video_url
),
$d$;
  avance_cuerpo constant text := $plantilla$
-- ===== Debajo de esta línea no se edita nada =====
obra as (
  select o.id from public.obras o, datos d where o.id = d.obra_id
),
etapa as (
  select e.id from public.etapas e, datos d where e.obra_id = d.obra_id and e.orden = d.etapa_orden
),
candado as materialized (
  select case
    when exists (select 1 from jsonb_each_text(to_jsonb(d)) where value like '%<%') then
      format('ALTO: quedan valores sin reemplazar (con "<") en: %s. No se creó nada.',
             (select string_agg(key, ', ' order by key)
              from jsonb_each_text(to_jsonb(d)) where value like '%<%'))
    when not exists (select 1 from obra) then
      format('ALTO: no existe una obra con el id "%s". No se creó nada.', d.obra_id)
    when d.fecha is null or d.titulo is null then
      'ALTO: la fecha y el título del avance son obligatorios. No se creó nada.'
    when d.etapa_orden is not null and not exists (select 1 from etapa) then
      format('ALTO: la obra no tiene etapa de orden %s (o pon etapa_orden en null). No se creó nada.',
             d.etapa_orden)
    when exists (select 1 from public.avances a
                 where a.obra_id = d.obra_id and a.fecha = d.fecha
                   and lower(trim(a.titulo)) = lower(trim(d.titulo))) then
      'ALTO: esta obra ya tiene un avance con esa fecha y ese título. No se creó nada.'
  end as error
  from datos d
),
nuevo as (
  insert into public.avances (obra_id, etapa_id, fecha, titulo, descripcion, video_url)
  select d.obra_id, (select id from etapa), d.fecha, trim(d.titulo), d.descripcion, d.video_url
  from datos d, candado k
  where coalesce(k.error::int, 0) = 0
  returning id, obra_id
)
select
  (select coalesce(error::int, 0) from candado)                          as candado,
  (select id from nuevo)                                                 as avance_id,
  (select obra_id::text || '/avances/' || id::text || '/' from nuevo)    as carpeta_fotos
$plantilla$;
  documento_datos constant text := $d$
with
datos as materialized (
  select %L::uuid as obra_id,
         %L::text as tipo,
         %L::text as titulo,
         %L::text as archivo
),
$d$;
  documento_cuerpo constant text := $plantilla$
-- ===== Debajo de esta línea no se edita nada =====
ruta as (
  select d.obra_id::text || '/documentos/' || d.archivo as ruta from datos d
),
candado as materialized (
  select case
    when exists (select 1 from jsonb_each_text(to_jsonb(d)) where value like '%<%') then
      format('ALTO: quedan valores sin reemplazar (con "<") en: %s. No se creó nada.',
             (select string_agg(key, ', ' order by key)
              from jsonb_each_text(to_jsonb(d)) where value like '%<%'))
    when not exists (select 1 from public.obras o where o.id = d.obra_id) then
      format('ALTO: no existe una obra con el id "%s". No se creó nada.', d.obra_id)
    when d.tipo is null or d.tipo not in ('contrato', 'plano', 'permiso', 'factura', 'otro') then
      'ALTO: tipo va en contrato, plano, permiso, factura u otro. No se creó nada.'
    when d.titulo is null then
      'ALTO: el título del documento es obligatorio. No se creó nada.'
    when d.archivo is null or d.archivo !~* '^[a-z0-9._-]+\.(pdf|jpe?g|png|webp)$'
         or position('..' in d.archivo) > 0 then
      'ALTO: archivo es solo el nombre (sin carpetas ni espacios), terminado en .pdf, .jpg, .jpeg, .png o .webp. No se creó nada.'
    when not exists (select 1 from storage.objects o, ruta r
                     where o.bucket_id = 'obras' and o.name = r.ruta) then
      format('ALTO: falta subir a Storage → obras: %s. Sube primero el archivo. No se creó nada.',
             (select ruta from ruta))
    when exists (select 1 from public.documentos x, ruta r where x.ruta = r.ruta) then
      format('ALTO: ya hay un documento con la ruta %s. No se creó nada.', (select ruta from ruta))
  end as error
  from datos d
),
nuevo as (
  insert into public.documentos (obra_id, tipo, titulo, ruta)
  select d.obra_id, d.tipo, trim(d.titulo), r.ruta
  from datos d, ruta r, candado k
  where coalesce(k.error::int, 0) = 0
  returning id, tipo, titulo, ruta
)
select
  (select coalesce(error::int, 0) from candado) as candado,
  (select id from nuevo)                        as documento_id,
  (select tipo || ' · ' || titulo from nuevo)   as documento,
  (select ruta from nuevo)                      as ruta
$plantilla$;
  materiales_datos constant text := $d$
with
datos as materialized (
  select %L::uuid as obra_id
),
materiales (material, especificacion, cantidad, marca) as materialized (
  values
%s
),
$d$;
  materiales_cuerpo constant text := $plantilla$
-- ===== Debajo de esta línea no se edita nada =====
filas as materialized (
  select row_number() over () as n, nullif(trim(m.material), '') as material,
         m.especificacion, m.cantidad, m.marca
  from materiales m
),
candado as materialized (
  select case
    when exists (select 1 from jsonb_each_text(to_jsonb(d)) where value like '%<%')
      or exists (select 1 from materiales m, jsonb_each_text(to_jsonb(m)) where value like '%<%') then
      'ALTO: quedan valores sin reemplazar (con "<"). No se creó nada.'
    when not exists (select 1 from public.obras o where o.id = d.obra_id) then
      format('ALTO: no existe una obra con el id "%s". No se creó nada.', d.obra_id)
    when exists (select 1 from filas f where f.material is null) then
      'ALTO: cada fila necesita el nombre del material. No se creó nada.'
    when exists (select 1 from filas f group by lower(f.material) having count(*) > 1) then
      format('ALTO: material repetido en la lista: %s. No se creó nada.',
             (select string_agg(distinct f.material, ', ') from filas f
              where lower(f.material) in (select lower(g.material) from filas g
                                          group by lower(g.material) having count(*) > 1)))
    when exists (select 1 from public.obra_materiales x, filas f
                 where x.obra_id = d.obra_id and lower(trim(x.material)) = lower(f.material)) then
      format('ALTO: la obra ya tiene: %s. Quítalo de la lista (o cámbialo en su fila). No se creó nada.',
             (select string_agg(distinct f.material, ', ')
              from public.obra_materiales x, filas f
              where x.obra_id = d.obra_id and lower(trim(x.material)) = lower(f.material)))
  end as error
  from datos d
),
nuevos as (
  insert into public.obra_materiales (obra_id, orden, material, especificacion, cantidad, marca)
  select d.obra_id,
         coalesce((select max(x.orden) from public.obra_materiales x where x.obra_id = d.obra_id), 0) + f.n,
         f.material, f.especificacion, f.cantidad, f.marca
  from datos d, filas f, candado k
  where coalesce(k.error::int, 0) = 0
  returning orden, material
)
select
  (select coalesce(error::int, 0) from candado)                                as candado,
  (select count(*) from nuevos)                                                as materiales_creados,
  (select string_agg(orden || '. ' || material, ' | ' order by orden) from nuevos) as materiales
$plantilla$;
  -- Huella de lo que crean las plantillas en las obras de prueba
  q_huella constant text := $q$
select (select count(*) from public.avances where obra_id in ($1, $2)) || '/'
    || (select count(*) from public.documentos where obra_id in ($1, $2)) || '/'
    || (select count(*) from public.obra_materiales where obra_id in ($1, $2))
$q$;
  caso     record;
  r        record;
  sql_caso text;
  mensaje  text;
  antes    text;
  despues  text;
begin
  -- -------------------------------------------------------------------------------------
  -- Datos de prueba (como el rol del SQL Editor, que salta RLS)
  -- -------------------------------------------------------------------------------------
  insert into public.obras (id, nombre, modalidad) values
    (obra_a, 'Obra de prueba A (plantillas)', 'compra'),
    (obra_b, 'Obra de prueba B (plantillas)', 'compra');
  insert into public.etapas (obra_id, orden, nombre, estado) values
    (obra_a, 1, 'Terracería', 'terminada'),
    (obra_a, 2, 'Trazo y zanjeado', 'en_proceso');
  select id into etapa_2 from public.etapas where obra_id = obra_a and orden = 2;
  insert into public.avances (obra_id, fecha, titulo) values
    (obra_a, '2026-10-25', 'Inicio de la terracería');
  insert into public.obra_materiales (obra_id, orden, material) values
    (obra_a, 1, 'Bloque de concreto');
  begin
    insert into storage.objects (bucket_id, name) values
      ('obras', obra_a::text || '/documentos/factura-001.jpg'),
      ('obras', obra_a::text || '/documentos/contrato.pdf'),
      ('obras', obra_a::text || '/documentos/otro.pdf'),
      ('obras', obra_b::text || '/documentos/solo-en-b.pdf');
  exception when others then
    raise exception 'FALLA preparación: no se pudieron simular los archivos en storage.objects: %', sqlerrm;
  end;
  insert into public.documentos (obra_id, tipo, titulo, ruta) values
    (obra_a, 'otro', 'Documento ya cargado', obra_a::text || '/documentos/otro.pdf');

  execute q_huella into antes using obra_a, obra_b;

  -- -------------------------------------------------------------------------------------
  -- Candados (ninguno cambia nada)
  -- -------------------------------------------------------------------------------------
  for caso in
    select n, esperado,
           case plantilla
             when 'avance' then
               format(avance_datos, v[1], v[2], v[3], v[4], v[5], v[6]) || avance_cuerpo
             when 'documento' then
               format(documento_datos, v[1], v[2], v[3], v[4]) || documento_cuerpo
             else
               format(materiales_datos, v[1], v[2]) || materiales_cuerpo
           end as sql
    from (values
      ( 1, 'avance', array[obra_a::text, '2', '2026-11-04', '<Título del avance>', null, null],
           'ALTO: quedan valores sin reemplazar%titulo%'),
      ( 2, 'avance', array[obra_nada::text, '2', '2026-11-04', 'Zanjas', null, null],
           'ALTO: no existe una obra con el id%'),
      ( 3, 'avance', array[obra_a::text, '2', '2026-11-04', null, 'Sin título', null],
           'ALTO: la fecha y el título del avance son obligatorios%'),
      ( 4, 'avance', array[obra_a::text, '9', '2026-11-04', 'Zanjas', null, null],
           'ALTO: la obra no tiene etapa de orden 9%'),
      ( 5, 'avance', array[obra_a::text, '1', '2026-10-25', '  INICIO de la terracería ', null, null],
           'ALTO: esta obra ya tiene un avance con esa fecha y ese título%'),
      ( 8, 'documento', array[obra_a::text, 'factura', '<Título del documento>', 'factura-001.jpg'],
           'ALTO: quedan valores sin reemplazar%titulo%'),
      ( 9, 'documento', array[obra_nada::text, 'factura', 'Factura 001', 'factura-001.jpg'],
           'ALTO: no existe una obra con el id%'),
      (10, 'documento', array[obra_a::text, 'recibo', 'Factura 001', 'factura-001.jpg'],
           'ALTO: tipo va en contrato, plano, permiso, factura u otro%'),
      (11, 'documento', array[obra_a::text, 'factura', null, 'factura-001.jpg'],
           'ALTO: el título del documento es obligatorio%'),
      (12, 'documento', array[obra_a::text, 'factura', 'Factura 001', 'facturas/factura-001.jpg'],
           'ALTO: archivo es solo el nombre%'),
      (13, 'documento', array[obra_a::text, 'factura', 'Factura 001', 'factura-001.heic'],
           'ALTO: archivo es solo el nombre%'),
      (14, 'documento', array[obra_a::text, 'factura', 'Factura 002', 'factura-002.jpg'],
           'ALTO: falta subir a Storage → obras: ' || obra_a::text || '/documentos/factura-002.jpg%'),
      (15, 'documento', array[obra_a::text, 'permiso', 'Permiso', 'solo-en-b.pdf'],
           'ALTO: falta subir a Storage → obras%'),
      (16, 'documento', array[obra_a::text, 'otro', 'Otro documento', 'otro.pdf'],
           'ALTO: ya hay un documento con la ruta%'),
      (19, 'materiales', array[obra_a::text,
             $v$    ('<Arena>'::text, null::text, '3 m3'::text, null::text)$v$],
           'ALTO: quedan valores sin reemplazar%'),
      (20, 'materiales', array[obra_nada::text,
             $v$    ('Arena'::text, null::text, '3 m3'::text, null::text)$v$],
           'ALTO: no existe una obra con el id%'),
      (21, 'materiales', array[obra_a::text,
             $v$    ('Arena'::text, null::text, '3 m3'::text, null::text),
    ('   ', null, '1 bolsa', null)$v$],
           'ALTO: cada fila necesita el nombre del material%'),
      (22, 'materiales', array[obra_a::text,
             $v$    ('Arena'::text, null::text, '3 m3'::text, null::text),
    (' arena ', null, '1 m3', null)$v$],
           'ALTO: material repetido en la lista%'),
      (23, 'materiales', array[obra_a::text,
             $v$    ('Arena'::text, null::text, '3 m3'::text, null::text),
    ('bloque de CONCRETO', null, '100 unidades', null)$v$],
           'ALTO: la obra ya tiene: bloque de CONCRETO%')
    ) as c (n, plantilla, v, esperado)
  loop
    begin
      execute caso.sql into r;
      mensaje := null;
    exception when others then mensaje := sqlerrm;
    end;
    if mensaje is null or mensaje not like ('%' || caso.esperado) then
      raise exception 'FALLA caso %: %', caso.n, coalesce(mensaje, 'no dio error (' || row_to_json(r)::text || ')');
    end if;
    execute q_huella into despues using obra_a, obra_b;
    if despues is distinct from antes then
      raise exception 'FALLA caso %: el ALTO cambió datos (% → %)', caso.n, antes, despues;
    end if;
  end loop;

  -- -------------------------------------------------------------------------------------
  -- Casos que sí crean
  -- -------------------------------------------------------------------------------------
  -- Caso 6: avance con la etapa 2
  execute format(avance_datos, obra_a, '2', '2026-11-04', '  Zanjas para las fundaciones ',
                 'Zanjeado del perímetro.', 'https://youtu.be/aaaaaaaaaaa') || avance_cuerpo into r;
  if r.candado <> 0 or r.avance_id is null
     or r.carpeta_fotos <> obra_a::text || '/avances/' || r.avance_id::text || '/' then
    raise exception 'FALLA caso 6: (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.avances where id = r.avance_id and etapa_id = etapa_2
                 and titulo = 'Zanjas para las fundaciones' and fecha = '2026-11-04'
                 and video_url = 'https://youtu.be/aaaaaaaaaaa') then
    raise exception 'FALLA caso 6: la fila no tiene los datos esperados';
  end if;

  -- Caso 7: avance sin etapa
  execute format(avance_datos, obra_a, null, '2026-11-05', 'Visita a la obra', null, null)
          || avance_cuerpo into r;
  if r.candado <> 0 or r.avance_id is null
     or not exists (select 1 from public.avances where id = r.avance_id and etapa_id is null) then
    raise exception 'FALLA caso 7: (%)', row_to_json(r);
  end if;

  -- Caso 17: factura en JPG
  execute format(documento_datos, obra_a, 'factura', '  Factura 001 ', 'factura-001.jpg')
          || documento_cuerpo into r;
  if r.candado <> 0 or r.documento_id is null or r.documento <> 'factura · Factura 001'
     or r.ruta <> obra_a::text || '/documentos/factura-001.jpg' then
    raise exception 'FALLA caso 17: (%)', row_to_json(r);
  end if;

  -- Caso 18: contrato en PDF
  execute format(documento_datos, obra_a, 'contrato', 'Contrato firmado', 'contrato.pdf')
          || documento_cuerpo into r;
  if r.candado <> 0 or r.documento_id is null
     or r.ruta <> obra_a::text || '/documentos/contrato.pdf' then
    raise exception 'FALLA caso 18: (%)', row_to_json(r);
  end if;

  -- Caso 24: tres materiales, marca opcional
  execute format(materiales_datos, obra_a, $v$    (' Arena '::text, 'Lavada'::text, '3 m3'::text, null::text),
    ('Cemento', 'Tipo GU', '40 bolsas', null),
    ('Hierro corrugado', 'Grado 40, ASTM A615', '120 varillas', 'Marca de prueba')$v$)
          || materiales_cuerpo into r;
  if r.candado <> 0 or r.materiales_creados <> 3
     or r.materiales <> '2. Arena | 3. Cemento | 4. Hierro corrugado' then
    raise exception 'FALLA caso 24: (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.obra_materiales where obra_id = obra_a and orden = 4
                 and especificacion = 'Grado 40, ASTM A615' and cantidad = '120 varillas'
                 and marca = 'Marca de prueba')
     or not exists (select 1 from public.obra_materiales where obra_id = obra_a and orden = 3
                    and marca is null) then
    raise exception 'FALLA caso 24: las filas no tienen los datos esperados';
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: 24 casos. Avance nuevo (5 candados, con y sin etapa), documento nuevo (9 candados, factura en JPG y contrato en PDF) y materiales (5 candados, 3 filas con marca opcional); ningún ALTO cambió nada. Todo revertido.';
end;
$prueba$;
