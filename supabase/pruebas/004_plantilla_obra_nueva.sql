-- Prueba de la plantilla "obra nueva completa" de docs/GUIA_CARGA_OBRAS.md. NO es una migración.
--
-- Se corre en el SQL Editor de Supabase, con aprobación del usuario. Igual que la prueba de
-- aislamiento, todo corre en un solo bloque DO que SIEMPRE termina en error, y el error
-- revierte todo: el usuario de prueba, las obras y las filas que se crearon. El resultado
-- se lee en el mensaje:
--   "PRUEBA SUPERADA: ..."  → todo bien (y revertido).
--   "FALLA: ..."            → algo no cumple; también revertido.
--
-- La parte de la plantilla desde "Debajo de esta línea no se edita nada" es copia exacta de
-- la guía; aquí solo cambia el bloque `datos` de cada caso.
-- Casos:
--   1. Datos completos: crea obra, membresía, etapa, avance con video, material y documento.
--   2. Un "<" olvidado (en material_marca): falla con ALTO y no crea nada.
--   3. Correo inexistente: falla con ALTO y no crea nada.
--   4. Repetir el caso 1 (mismo cliente y mismo nombre de obra): falla con ALTO.
--   5. Opcionales en null (video, material y documento): crea la obra sin material ni
--      documento.
-- Después de correrla se puede confirmar con una lectura que no quedó nada:
--   select count(*) from public.obras;  -- igual que antes de la prueba

do $prueba$
declare
  usuario constant uuid := 'c0000000-0000-4000-8000-00000000000c';
  -- Bloque `datos` del caso 1; los demás casos cambian valores con replace()
  datos_base constant text := $datos$
with
datos as materialized (
  select
    'prueba-plantilla@ejemplo.invalid'::text                  as correo,
    'Obra de prueba plantilla'::text                          as obra_nombre,
    'construccion_terreno'::text                              as obra_modalidad,
    'Casa Modelo Esparta'::text                               as obra_modelo,
    'Municipio, Departamento'::text                           as obra_ubicacion,
    'en_obra'::text                                           as obra_estado,
    '2026-11-01'::date                                        as obra_fecha_inicio,
    '2027-03-01'::date                                        as obra_fecha_entrega,
    'Terreno y trazo'::text                                   as etapa_nombre,
    'en_proceso'::text                                        as etapa_estado,
    '2026-11-01'::date                                        as etapa_fecha_inicio,
    'Descripción de prueba'::text                             as etapa_descripcion,
    '2026-11-02'::date                                        as avance_fecha,
    'Avance de prueba'::text                                  as avance_titulo,
    null::text                                                as avance_descripcion,
    'https://www.youtube.com/watch?v=aaaaaaaaaaa'::text       as avance_video_url,
    'Bloque de concreto'::text                                as material,
    '15 x 20 x 40 cm'::text                                   as material_especificacion,
    'Marca de prueba'::text                                   as material_marca,
    '100 unidades'::text                                      as material_cantidad,
    'contrato'::text                                          as documento_tipo,
    'Contrato de prueba'::text                                as documento_titulo,
    'contrato.pdf'::text                                      as documento_archivo
),
$datos$;
  cuerpo constant text := $plantilla$
-- ===== Debajo de esta línea no se edita nada =====
cliente as (
  select u.id
  from auth.users u, datos d
  where u.email = lower(trim(d.correo))
),
-- Revisa todo antes de crear nada. Si algo no cuadra, la consulta entera falla con un
-- mensaje "ALTO: ..." (Postgres lo muestra dentro de "invalid input syntax for type integer").
candado as materialized (
  select case
    when exists (select 1 from jsonb_each_text(to_jsonb(d)) where value like '%<%') then
      format('ALTO: quedan valores sin reemplazar (con "<") en: %s. No se creó nada.',
             (select string_agg(key, ', ' order by key)
              from jsonb_each_text(to_jsonb(d)) where value like '%<%'))
    when not exists (select 1 from cliente) then
      format('ALTO: el correo "%s" no existe en Authentication → Users. Crea la cuenta primero. No se creó nada.',
             d.correo)
    when exists (
      select 1
      from public.obras o
      join public.obra_miembros m on m.obra_id = o.id
      join cliente c on c.id = m.user_id
      where lower(trim(o.nombre)) = lower(trim(d.obra_nombre))
    ) then
      format('ALTO: este cliente ya tiene una obra llamada "%s". No se creó nada.', d.obra_nombre)
    when d.material is null
         and coalesce(d.material_especificacion, d.material_marca, d.material_cantidad) is not null then
      'ALTO: "material" está en null pero hay especificación, marca o cantidad. Pon los cuatro en null o llena "material". No se creó nada.'
    when num_nulls(d.documento_tipo, d.documento_titulo, d.documento_archivo) not in (0, 3) then
      'ALTO: el documento va completo (tipo, título y archivo) o con los tres en null. No se creó nada.'
  end as error
  from datos d
),
obra as (
  insert into public.obras (nombre, modalidad, modelo, ubicacion, estado,
                            fecha_inicio, fecha_entrega_estimada)
  select trim(d.obra_nombre), d.obra_modalidad, d.obra_modelo, d.obra_ubicacion,
         coalesce(d.obra_estado, 'por_iniciar'), d.obra_fecha_inicio, d.obra_fecha_entrega
  from datos d, candado k
  -- Si hay un ALTO, convertirlo a número falla y detiene todo con ese mensaje
  where coalesce(k.error::int, 0) = 0
  returning id
),
miembro as (
  insert into public.obra_miembros (obra_id, user_id)
  select o.id, c.id from obra o, cliente c
  returning obra_id
),
etapa as (
  insert into public.etapas (obra_id, orden, nombre, estado, fecha_inicio, descripcion)
  select o.id, 1, d.etapa_nombre, coalesce(d.etapa_estado, 'por_iniciar'),
         d.etapa_fecha_inicio, d.etapa_descripcion
  from obra o, datos d
  returning id, obra_id
),
avance as (
  insert into public.avances (obra_id, etapa_id, fecha, titulo, descripcion, video_url)
  select e.obra_id, e.id, d.avance_fecha, d.avance_titulo, d.avance_descripcion, d.avance_video_url
  from etapa e, datos d
  returning id, obra_id
),
mat as (
  insert into public.obra_materiales (obra_id, orden, material, especificacion, marca, cantidad)
  select o.id, 1, d.material, d.material_especificacion, d.material_marca, d.material_cantidad
  from obra o, datos d
  where d.material is not null
  returning id
),
documento as (
  insert into public.documentos (obra_id, tipo, titulo, ruta)
  select o.id, d.documento_tipo, d.documento_titulo,
         o.id::text || '/documentos/' || d.documento_archivo
  from obra o, datos d
  where d.documento_titulo is not null
  returning id, ruta
)
select
  (select id from obra)                                       as obra_id,
  (select count(*) from miembro)                              as membresias_creadas,
  (select id from etapa)                                      as etapa_id,
  (select id from avance)                                     as avance_id,
  (select id from mat)                                        as material_id,
  (select id from documento)                                  as documento_id,
  (select obra_id::text || '/avances/' || id::text || '/' from avance) as carpeta_fotos,
  (select ruta from documento)                                as ruta_documento
$plantilla$;
  r        record;
  mensaje  text;
  obras_0  bigint;
  n        bigint;
begin
  insert into auth.users (id, email, aud, role)
  values (usuario, 'prueba-plantilla@ejemplo.invalid', 'authenticated', 'authenticated');
  select count(*) into obras_0 from public.obras;

  -- Caso 1: datos completos
  execute datos_base || cuerpo into r;
  if r.obra_id is null or r.membresias_creadas <> 1 or r.etapa_id is null
     or r.avance_id is null or r.material_id is null or r.documento_id is null then
    raise exception 'FALLA caso 1: faltan filas (%)', row_to_json(r);
  end if;
  if r.carpeta_fotos <> r.obra_id::text || '/avances/' || r.avance_id::text || '/'
     or r.ruta_documento <> r.obra_id::text || '/documentos/contrato.pdf' then
    raise exception 'FALLA caso 1: rutas inesperadas (%)', row_to_json(r);
  end if;
  if not exists (select 1 from public.obra_miembros where obra_id = r.obra_id and user_id = usuario)
     or not exists (select 1 from public.avances where id = r.avance_id and etapa_id = r.etapa_id
                    and video_url is not null and descripcion is null)
     or not exists (select 1 from public.obras where id = r.obra_id and estado = 'en_obra') then
    raise exception 'FALLA caso 1: las filas no tienen los datos esperados';
  end if;

  -- Caso 2: un "<" olvidado
  begin
    execute replace(replace(datos_base, '''Marca de prueba''', '''<Marca>'''),
                    '''Obra de prueba plantilla''', '''Obra caso 2''') || cuerpo into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: quedan valores sin reemplazar%material_marca%' then
    raise exception 'FALLA caso 2: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 3: correo inexistente
  begin
    execute replace(replace(datos_base, 'prueba-plantilla@ejemplo.invalid', 'no-existe-plantilla@ejemplo.invalid'),
                    '''Obra de prueba plantilla''', '''Obra caso 3''') || cuerpo into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: el correo%no existe%' then
    raise exception 'FALLA caso 3: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Caso 4: misma obra para el mismo cliente
  begin
    execute datos_base || cuerpo into r;
    mensaje := null;
  exception when others then mensaje := sqlerrm;
  end;
  if mensaje is null or mensaje not like '%ALTO: este cliente ya tiene una obra%' then
    raise exception 'FALLA caso 4: %', coalesce(mensaje, 'no dio error');
  end if;

  -- Los casos 2, 3 y 4 no crearon nada
  select count(*) into n from public.obras;
  if n <> obras_0 + 1 then
    raise exception 'FALLA: hay % obras nuevas después de los casos 2 a 4 (se esperaba 1)', n - obras_0;
  end if;

  -- Caso 5: video, material y documento en null
  execute replace(replace(replace(replace(replace(replace(replace(replace(replace(datos_base,
      '''Obra de prueba plantilla''', '''Obra caso 5'''),
      '''https://www.youtube.com/watch?v=aaaaaaaaaaa''', 'null'),
      '''Bloque de concreto''', 'null'),
      '''15 x 20 x 40 cm''', 'null'),
      '''Marca de prueba''', 'null'),
      '''100 unidades''', 'null'),
      '''contrato''::text', 'null::text'),
      '''Contrato de prueba''', 'null'),
      '''contrato.pdf''', 'null') || cuerpo into r;
  if r.obra_id is null or r.avance_id is null
     or r.material_id is not null or r.documento_id is not null or r.ruta_documento is not null then
    raise exception 'FALLA caso 5: (%)', row_to_json(r);
  end if;
  select count(*) into n from public.obra_materiales where obra_id = r.obra_id;
  if n <> 0 then raise exception 'FALLA caso 5: se creó material'; end if;
  select count(*) into n from public.documentos where obra_id = r.obra_id;
  if n <> 0 then raise exception 'FALLA caso 5: se creó documento'; end if;
  if exists (select 1 from public.avances where id = r.avance_id and video_url is not null) then
    raise exception 'FALLA caso 5: el avance tiene video';
  end if;

  -- Siempre termina en error: así se revierte todo lo que hizo la prueba
  raise exception 'PRUEBA SUPERADA: datos completos crean todo; "<" olvidado, correo inexistente y obra repetida dan ALTO sin crear nada; video, material y documento en null se omiten. Todo revertido.';
end;
$prueba$;
