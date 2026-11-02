-- Prueba de las plantillas de docs/GUIA_CARGA_CASAS.md (casa nueva, fotos y plano,
-- publicar u ocultar). NO es una migración.
--
-- Se corre en el SQL Editor de Supabase, con aprobación del usuario. Igual que las demás
-- pruebas, todo corre en un solo bloque DO que SIEMPRE termina en error, y el error revierte
-- todo: las casas, las imágenes y los archivos simulados en Storage. El resultado se lee en
-- el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- La parte de cada plantilla desde "Debajo de esta línea no se edita nada" es copia exacta
-- de la guía (la arma un script desde la guía); aquí solo cambia el bloque de datos.
-- Casos:
--   Plantilla 1 (casa nueva)
--    1. Datos completos, planta Esparta: crea la casa sin publicar, lote de 100 m².
--    2. Un "<" olvidado (distrito): ALTO.          5. Planta Esparta con m²: ALTO.
--    3. Slug repetido: ALTO.                        6. Planta propia sin baños: ALTO.
--    4. Slug con mayúsculas y espacios: ALTO.       7. Departamento fuera de la lista: ALTO.
--    8. Planta propia completa y opcionales en null: crea con los valores por defecto.
--   Plantilla 2 (fotos y plano), sobre la casa 1
--    9. Archivos no subidos a Storage: ALTO.       12. Segundo plano: ALTO.
--   10. Plano de 2000 px: ALTO.                    13. Slug inexistente: ALTO.
--   11. Foto y plano subidos: crea 2 imágenes.     14. Archivo con carpeta: ALTO.
--   Plantilla 3 (publicar u ocultar)
--   15. Publicar la casa 8, sin foto de portada: ALTO.
--   16. Publicar la casa 1: queda publicada.       17. Ocultarla: queda oculta.
-- Los archivos de Storage se simulan con filas en storage.objects (sin archivo real), solo
-- dentro de la prueba.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.casas_venta;  -- igual que antes de la prueba

do $prueba$
declare
  -- Plantilla 1, caso 1: los demás casos cambian valores con replace()
  casa_base constant text := $d$
with
datos as materialized (
  select
    'prueba-casa-plantilla'::text                               as slug,
    'Casa de prueba plantilla'::text                            as nombre,
    'Esparta'::text                                             as modelo,
    null::text                                                  as descripcion,
    'Distrito de prueba'::text                                  as distrito,
    'Municipio de prueba'::text                                 as municipio,
    'La Libertad'::text                                         as departamento,
    'en_construccion'::text                                     as estado,
    'Paredes'::text                                             as etapa_actual,
    45000::integer                                              as precio_usd,
    5.00::numeric                                               as lote_frente_m,
    20.00::numeric                                              as lote_fondo_m,
    true::boolean                                               as planta_esparta,
    null::numeric                                               as construccion_m2,
    null::smallint                                              as dormitorios,
    null::smallint                                              as banos,
    1::smallint                                                 as parqueos,
    true::boolean                                               as agua,
    true::boolean                                               as electricidad,
    'fosa_septica'::text                                        as aguas_negras,
    array['La casa terminada.', 'El terreno.']::text[]          as incluye,
    'https://www.youtube.com/watch?v=aaaaaaaaaaa'::text         as video_url,
    null::smallint                                              as orden
),
$d$;
  -- Plantilla 1, caso 8: planta propia, todos los opcionales en null
  casa_propia constant text := $d$
with
datos as materialized (
  select
    'prueba-casa-propia'::text                                  as slug,
    'Casa de prueba con planta propia'::text                    as nombre,
    null::text                                                  as modelo,
    null::text                                                  as descripcion,
    'Distrito de prueba'::text                                  as distrito,
    'Municipio de prueba'::text                                 as municipio,
    'Cuscatlán'::text                                           as departamento,
    null::text                                                  as estado,
    null::text                                                  as etapa_actual,
    null::integer                                               as precio_usd,
    10.00::numeric                                              as lote_frente_m,
    20.00::numeric                                              as lote_fondo_m,
    false::boolean                                              as planta_esparta,
    60.00::numeric                                              as construccion_m2,
    3::smallint                                                 as dormitorios,
    2::smallint                                                 as banos,
    null::smallint                                              as parqueos,
    null::boolean                                               as agua,
    null::boolean                                               as electricidad,
    null::text                                                  as aguas_negras,
    null::text[]                                                as incluye,
    null::text                                                  as video_url,
    null::smallint                                              as orden
),
$d$;
  cuerpo_casa constant text := $c$
-- ===== Debajo de esta línea no se edita nada =====
-- Revisa todo antes de crear nada. Si algo no cuadra, la consulta entera falla con un
-- mensaje "ALTO: ..." (Postgres lo muestra dentro de "invalid input syntax for type integer").
candado as materialized (
  select case
    when exists (select 1 from jsonb_each_text(to_jsonb(d)) where value like '%<%') then
      format('ALTO: quedan valores sin reemplazar (con "<") en: %s. No se creó nada.',
             (select string_agg(key, ', ' order by key)
              from jsonb_each_text(to_jsonb(d)) where value like '%<%'))
    when d.slug is null or char_length(d.slug) not between 3 and 80
         or d.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      format('ALTO: el slug "%s" solo puede llevar minúsculas sin tildes, números y guiones (de 3 a 80), por ejemplo casa-esparta-1. No se creó nada.',
             d.slug)
    when exists (select 1 from public.casas_venta c where c.slug = d.slug) then
      format('ALTO: ya existe una casa con el slug "%s". Usa otro. No se creó nada.', d.slug)
    when d.departamento is null or d.departamento not in (
           'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad',
           'La Paz', 'La Unión', 'Morazán', 'San Miguel', 'San Salvador',
           'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután') then
      format('ALTO: "%s" no es un departamento de la lista (escríbelo con tildes, por ejemplo Cuscatlán). No se creó nada.',
             d.departamento)
    when d.planta_esparta is null then
      'ALTO: planta_esparta va en true (planta del modelo Esparta) o false (planta propia). No se creó nada.'
    when d.planta_esparta and num_nonnulls(d.construccion_m2, d.dormitorios, d.banos) > 0 then
      'ALTO: con planta_esparta = true, construccion_m2, dormitorios y banos van en null (se toman del modelo Esparta). No se creó nada.'
    when not d.planta_esparta and num_nulls(d.construccion_m2, d.dormitorios, d.banos) > 0 then
      'ALTO: con planta_esparta = false (planta propia), construccion_m2, dormitorios y banos son obligatorios. No se creó nada.'
    when d.video_url is not null
         and d.video_url !~ '^https://((www\.|m\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/' then
      'ALTO: el video solo puede ser de YouTube o Vimeo (o null). No se creó nada.'
  end as error
  from datos d
),
casa as (
  insert into public.casas_venta (
    slug, publicada, orden, nombre, modelo, descripcion, distrito, municipio, departamento,
    estado, etapa_actual, precio_usd, lote_frente_m, lote_fondo_m, planta_esparta,
    construccion_m2, dormitorios, banos, parqueos, agua, electricidad, aguas_negras,
    incluye, video_url)
  select d.slug, false, coalesce(d.orden, 100), trim(d.nombre), coalesce(trim(d.modelo), 'Esparta'),
         d.descripcion, trim(d.distrito), trim(d.municipio), d.departamento,
         coalesce(d.estado, 'en_construccion'), d.etapa_actual, d.precio_usd,
         d.lote_frente_m, d.lote_fondo_m, d.planta_esparta,
         d.construccion_m2, d.dormitorios, d.banos, d.parqueos, d.agua, d.electricidad,
         d.aguas_negras, coalesce(d.incluye, '{}'), d.video_url
  from datos d, candado k
  -- Si hay un ALTO, convertirlo a número falla y detiene todo con ese mensaje
  where coalesce(k.error::int, 0) = 0
  returning id, slug, lote_m2, publicada
)
select
  (select coalesce(error::int, 0) from candado) as candado,
  (select id from casa)                         as casa_id,
  (select slug from casa)                       as slug,
  (select lote_m2 from casa)                    as lote_m2,
  (select publicada from casa)                  as publicada,
  (select id::text || '/' from casa)            as carpeta_en_storage
$c$;
  -- Plantilla 2, sobre la casa 1
  imagenes_base constant text := $d$
with
datos as materialized (
  select 'prueba-casa-plantilla'::text as slug
),
imagenes (tipo, orden, archivo, ancho, alto, alt) as materialized (
  values
    ('foto'::text, 1::smallint, 'fachada.jpg'::text, 1600::smallint, 1200::smallint, 'Fachada de prueba'::text),
    ('plano',      1,           'plano.png',         1800,           1737,           'Plano de prueba')
),
$d$;
  segundo_plano constant text := $d$
with
datos as materialized (
  select 'prueba-casa-plantilla'::text as slug
),
imagenes (tipo, orden, archivo, ancho, alto, alt) as materialized (
  values
    ('plano'::text, 2::smallint, 'plano-2.png'::text, 1800::smallint, 1737::smallint, 'Segundo plano de prueba'::text)
),
$d$;
  cuerpo_imagenes constant text := $c$
-- ===== Debajo de esta línea no se edita nada =====
casa as (
  select c.id from public.casas_venta c, datos d where c.slug = d.slug
),
filas as (
  select i.*, (select id::text from casa) || '/' || i.archivo as ruta from imagenes i
),
-- Revisa todo antes de crear nada (mensaje "ALTO: ...", como en la plantilla 1)
candado as materialized (
  select case
    when exists (select 1 from datos d, jsonb_each_text(to_jsonb(d)) where value like '%<%')
      or exists (select 1 from imagenes i, jsonb_each_text(to_jsonb(i)) where value like '%<%') then
      'ALTO: quedan valores sin reemplazar (con "<"). No se creó nada.'
    when not exists (select 1 from casa) then
      format('ALTO: no existe una casa con el slug "%s". No se creó nada.', (select slug from datos))
    when exists (select 1 from imagenes where tipo is null or tipo not in ('foto', 'plano')) then
      'ALTO: tipo va en foto o plano. No se creó nada.'
    when exists (select 1 from imagenes
                 where archivo is null or archivo !~* '^[a-z0-9._-]+\.(jpe?g|png|webp)$'
                       or position('..' in archivo) > 0) then
      'ALTO: archivo es solo el nombre (sin carpetas ni espacios), terminado en .jpg, .jpeg, .png o .webp. No se creó nada.'
    when exists (select 1 from filas f
                 where not exists (select 1 from storage.objects o
                                   where o.bucket_id = 'casas' and o.name = f.ruta)) then
      format('ALTO: falta subir a Storage → casas: %s. Sube primero los archivos. No se creó nada.',
             (select string_agg(f.ruta, ', ' order by f.ruta) from filas f
              where not exists (select 1 from storage.objects o
                                where o.bucket_id = 'casas' and o.name = f.ruta)))
    when exists (select 1 from imagenes where tipo = 'plano' and greatest(ancho, alto) > 1800) then
      'ALTO: el plano va a resolución media: su lado mayor no puede pasar de 1800 px. Redúcelo y vuelve a subirlo. No se creó nada.'
    when (select count(*) from imagenes where tipo = 'plano')
         + (select count(*) from public.casas_venta_imagenes x, casa c
            where x.casa_id = c.id and x.tipo = 'plano') > 1 then
      'ALTO: cada casa lleva un solo plano (pusiste dos, o la casa ya tiene uno). No se creó nada.'
    when exists (select 1 from imagenes group by tipo, orden having count(*) > 1)
      or exists (select 1 from imagenes i, public.casas_venta_imagenes x, casa c
                 where x.casa_id = c.id and x.tipo = i.tipo and x.orden = i.orden) then
      'ALTO: hay dos imágenes del mismo tipo con el mismo orden, o la casa ya usa ese orden. No se creó nada.'
    when exists (select 1 from imagenes where alt is null or char_length(trim(alt)) < 5) then
      'ALTO: cada imagen necesita su alt (qué se ve en ella, al menos 5 letras). No se creó nada.'
  end as error
),
nuevas as (
  insert into public.casas_venta_imagenes (casa_id, tipo, orden, ruta, ancho, alto, alt)
  select c.id, f.tipo, f.orden, f.ruta, f.ancho, f.alto, trim(f.alt)
  from filas f, casa c, candado k
  where coalesce(k.error::int, 0) = 0
  returning tipo, orden, ruta
)
select
  (select coalesce(error::int, 0) from candado)  as candado,
  (select count(*) from nuevas)                  as imagenes_creadas,
  (select string_agg(tipo || ' ' || orden || ': ' || ruta, ' | ' order by tipo, orden)
   from nuevas)                                  as rutas
$c$;
  -- Plantilla 3
  publicar constant text := $d$
with
datos as materialized (
  select 'prueba-casa-plantilla'::text as slug,
         true::boolean                 as publicada
),
$d$;
  cuerpo_publicar constant text := $c$
-- ===== Debajo de esta línea no se edita nada =====
casa as (
  select c.id from public.casas_venta c, datos d where c.slug = d.slug
),
candado as materialized (
  select case
    when d.slug like '%<%' then
      'ALTO: el slug todavía tiene "<". No se cambió nada.'
    when d.publicada is null then
      'ALTO: publicada va en true (publicar) o false (ocultar). No se cambió nada.'
    when not exists (select 1 from casa) then
      format('ALTO: no existe una casa con el slug "%s". No se cambió nada.', d.slug)
    when d.publicada and not exists (
           select 1 from public.casas_venta_imagenes x, casa c
           where x.casa_id = c.id and x.tipo = 'foto' and x.orden = 1) then
      'ALTO: la casa no tiene foto de portada (foto de orden 1). Cárgala con la plantilla 2 antes de publicarla. No se cambió nada.'
  end as error
  from datos d
),
cambio as (
  update public.casas_venta c
  set publicada = d.publicada
  from datos d, candado k
  where c.slug = d.slug and coalesce(k.error::int, 0) = 0
  returning c.slug, c.publicada
)
select
  (select coalesce(error::int, 0) from candado) as candado,
  (select slug from cambio)                     as slug,
  (select publicada from cambio)                as publicada
$c$;
  r        record;
  mensaje  text;
  casas_0  bigint;
  n        bigint;
  casa_1   uuid;
  casa_8   uuid;
begin
  select count(*) into casas_0 from public.casas_venta;

  -- ===== Plantilla 1 =====
  -- Caso 1: datos completos, planta Esparta
  execute casa_base || cuerpo_casa into r;
  if r.casa_id is null or r.candado <> 0 or r.slug <> 'prueba-casa-plantilla' or r.lote_m2 <> 100
     or r.publicada or r.carpeta_en_storage <> r.casa_id::text || '/' then
    raise exception 'FALLA caso 1: (%)', row_to_json(r);
  end if;
  casa_1 := r.casa_id;
  if not exists (select 1 from public.casas_venta
                 where id = casa_1 and estado = 'en_construccion' and precio_usd = 45000
                   and planta_esparta and construccion_m2 is null and parqueos = 1
                   and aguas_negras = 'fosa_septica' and cardinality(incluye) = 2 and orden = 100) then
    raise exception 'FALLA caso 1: la fila no tiene los datos esperados';
  end if;

  -- Caso 2: un "<" olvidado
  begin
    execute replace(casa_base, '''Distrito de prueba''', '''<Distrito>''') || cuerpo_casa into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: quedan valores sin reemplazar%distrito%' then
    raise exception 'FALLA caso 2: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 3: slug repetido (el mismo caso 1 otra vez)
  begin
    execute casa_base || cuerpo_casa into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: ya existe una casa con el slug%' then
    raise exception 'FALLA caso 3: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 4: slug con mayúsculas y espacios
  begin
    execute replace(casa_base, '''prueba-casa-plantilla''', '''Casa Uno''') || cuerpo_casa into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: el slug "Casa Uno" solo puede llevar%' then
    raise exception 'FALLA caso 4: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 5: planta Esparta con m² propios
  begin
    execute replace(replace(casa_base, '''prueba-casa-plantilla''', '''prueba-casa-5'''),
                    'null::numeric                                               as construccion_m2',
                    '43.60::numeric as construccion_m2') || cuerpo_casa into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: con planta_esparta = true%' then
    raise exception 'FALLA caso 5: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 6: planta propia sin baños
  begin
    execute replace(replace(replace(replace(casa_base,
                    '''prueba-casa-plantilla''', '''prueba-casa-6'''),
                    'true::boolean                                               as planta_esparta',
                    'false::boolean as planta_esparta'),
                    'null::numeric                                               as construccion_m2',
                    '60.00::numeric as construccion_m2'),
                    'null::smallint                                              as dormitorios',
                    '3::smallint as dormitorios') || cuerpo_casa into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: con planta_esparta = false%' then
    raise exception 'FALLA caso 6: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 7: departamento fuera de la lista
  begin
    execute replace(replace(casa_base, '''prueba-casa-plantilla''', '''prueba-casa-7'''),
                    '''La Libertad''', '''Santa Tecla''') || cuerpo_casa into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: "Santa Tecla" no es un departamento%' then
    raise exception 'FALLA caso 7: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Los casos 2 a 7 no crearon nada
  select count(*) into n from public.casas_venta;
  if n <> casas_0 + 1 then
    raise exception 'FALLA: hay % casas nuevas después de los casos 2 a 7 (se esperaba 1)', n - casas_0;
  end if;

  -- Caso 8: planta propia completa, opcionales en null
  execute casa_propia || cuerpo_casa into r;
  if r.casa_id is null or r.lote_m2 <> 200 or r.publicada then
    raise exception 'FALLA caso 8: (%)', row_to_json(r);
  end if;
  casa_8 := r.casa_id;
  if not exists (select 1 from public.casas_venta
                 where id = casa_8 and modelo = 'Esparta' and estado = 'en_construccion'
                   and precio_usd is null and orden = 100 and incluye = '{}'
                   and not planta_esparta and construccion_m2 = 60 and dormitorios = 3 and banos = 2
                   and agua is null and aguas_negras is null and video_url is null) then
    raise exception 'FALLA caso 8: la fila no tiene los valores por defecto esperados';
  end if;

  -- ===== Plantilla 2 =====
  -- Caso 9: archivos todavía no subidos
  begin
    execute imagenes_base || cuerpo_imagenes into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: falta subir a Storage%' || casa_1::text || '/fachada.jpg%' then
    raise exception 'FALLA caso 9: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Archivos simulados en Storage (solo filas, sin archivo; se revierten con la prueba)
  begin
    insert into storage.objects (bucket_id, name)
    values ('casas', casa_1::text || '/fachada.jpg'),
           ('casas', casa_1::text || '/plano.png'),
           ('casas', casa_1::text || '/plano-2.png');
  exception when others then
    raise exception 'FALLA preparación: no se pudieron simular los archivos en storage.objects: %', sqlerrm;
  end;

  -- Caso 10: plano de 2000 px
  begin
    execute replace(imagenes_base, '1800,           1737', '2000, 1900') || cuerpo_imagenes into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: el plano va a resolución media%' then
    raise exception 'FALLA caso 10: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 11: foto y plano subidos
  execute imagenes_base || cuerpo_imagenes into r;
  if r.candado <> 0 or r.imagenes_creadas <> 2
     or r.rutas <> 'foto 1: ' || casa_1::text || '/fachada.jpg | plano 1: ' || casa_1::text || '/plano.png' then
    raise exception 'FALLA caso 11: (%)', row_to_json(r);
  end if;

  -- Caso 12: segundo plano para la misma casa
  begin
    execute segundo_plano || cuerpo_imagenes into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: cada casa lleva un solo plano%' then
    raise exception 'FALLA caso 12: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 13: slug inexistente
  begin
    execute replace(imagenes_base, '''prueba-casa-plantilla''', '''no-existe-esta-casa''') || cuerpo_imagenes into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: no existe una casa con el slug "no-existe-esta-casa"%' then
    raise exception 'FALLA caso 13: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 14: archivo con carpeta
  begin
    execute replace(imagenes_base, '''fachada.jpg''', '''fotos/fachada.jpg''') || cuerpo_imagenes into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: archivo es solo el nombre%' then
    raise exception 'FALLA caso 14: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Los casos 9, 10, 12, 13 y 14 no crearon imágenes
  select count(*) into n from public.casas_venta_imagenes where casa_id in (casa_1, casa_8);
  if n <> 2 then
    raise exception 'FALLA: hay % imágenes de prueba (se esperaban las 2 del caso 11)', n;
  end if;

  -- ===== Plantilla 3 =====
  -- Caso 15: publicar una casa sin foto de portada
  begin
    execute replace(publicar, '''prueba-casa-plantilla''', '''prueba-casa-propia''') || cuerpo_publicar into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: la casa no tiene foto de portada%' then
    raise exception 'FALLA caso 15: %', coalesce(mensaje, 'no dio error');
  end if;
  if (select publicada from public.casas_venta where id = casa_8) then
    raise exception 'FALLA caso 15: la casa sin portada quedó publicada';
  end if;

  -- Caso 16: publicar la casa 1
  execute publicar || cuerpo_publicar into r;
  if r.candado <> 0 or r.slug <> 'prueba-casa-plantilla' or not r.publicada
     or not (select publicada from public.casas_venta where id = casa_1) then
    raise exception 'FALLA caso 16: (%)', row_to_json(r);
  end if;

  -- Caso 17: ocultarla
  execute replace(publicar, 'true::boolean                 as publicada', 'false::boolean as publicada')
          || cuerpo_publicar into r;
  if r.candado <> 0 or r.publicada or (select publicada from public.casas_venta where id = casa_1) then
    raise exception 'FALLA caso 17: (%)', row_to_json(r);
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: 17 casos. Casa nueva (Esparta y planta propia) con sus 6 candados; fotos y plano con sus 5 candados; publicar exige portada y ocultar funciona. Todo revertido.';
end;
$prueba$;
