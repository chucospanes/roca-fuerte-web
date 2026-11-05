# Guía: cargar obras, avances y documentos en el portal de clientes

> Para el constructor. No hay panel de administración: todo se carga desde el panel de
> Supabase (proyecto `roca-fuerte-web`). Requiere la migración `004_portal_obras.sql`
> aplicada. Los clientes **no pueden escribir nada**: solo ven lo que cargues aquí, y solo
> de las obras donde los agregues como miembros.
>
> Los nombres de los botones del panel pueden cambiar con las versiones de Supabase; si
> alguno no coincide, busca el equivalente.

## Antes de empezar
- **Cada `id` es un código largo** (uuid), por ejemplo `3f2b9c1e-...`. Se copia desde la
  fila en el Table Editor (clic en la celda → copiar). Varios pasos piden pegar un `id`
  que copiaste antes: ten a mano un bloc de notas.
- **Lo que cargas lo ve el cliente tal cual.** Revisa la ortografía y no pongas datos de
  otras personas ni comentarios internos en las descripciones.
- Las fechas se escriben `AAAA-MM-DD` (por ejemplo `2026-11-15`).

## Forma recomendada: una consulta SQL por obra
Es la forma más corta: después de crear la cuenta del cliente (paso 1), una sola consulta
en el **SQL Editor** crea la obra, la membresía, la primera etapa, el primer avance, un
material y la fila del documento, y devuelve los `id` y las carpetas donde van los
archivos. Los pasos 2 a 8 explican lo mismo con el Table Editor, columna por columna.

### Estructura de carpetas del bucket `obras`, nivel por nivel
Las rutas **no** llevan "obras/" al inicio: "obras" es el nombre del bucket, no una
carpeta.

```
bucket "obras"
└── {obra_id}/                 nivel 1: una carpeta por obra (el id de la fila en "obras").
    │                          El acceso se decide aquí: cada cliente solo ve las carpetas
    │                          de sus obras.
    ├── avances/               nivel 2: carpeta fija, siempre se llama "avances".
    │   └── {avance_id}/       nivel 3: una carpeta por avance (el id de la fila en "avances").
    │       ├── 01.jpg         nivel 4: las fotos de ese avance (JPG, PNG o WebP, hasta 10 MB).
    │       └── 02.jpg
    └── documentos/            nivel 2: carpeta fija, siempre se llama "documentos".
        ├── contrato.pdf       nivel 3: los documentos, en PDF o en foto (JPG, PNG o WebP).
        └── factura-001.jpg    Su ruta completa va en documentos.ruta.
```

- Fotos: `{obra_id}/avances/{avance_id}/archivo`
- Documentos: `{obra_id}/documentos/archivo`

### Plantilla: obra nueva completa
Llena **solo el bloque `datos` del inicio**: cambia cada `'<...>'` por el valor entre comillas
simples, o por `null` **sin comillas** si no lo tienes (siempre igual, sea texto o fecha).
Debajo de "no se edita nada" no se toca nada. Es una sola instrucción: **si algo falla, no se
crea nada**.

- Fechas en formato `'AAAA-MM-DD'`. Una fecha olvidada como `'<AAAA-MM-DD>'` falla antes del
  candado, con el error de Postgres `invalid input syntax for type date: "<AAAA-MM-DD>"`;
  tampoco crea nada.
- Estado de la obra o de la etapa en `null`: queda "por iniciar".
- Video, descripciones, modelo, ubicación y fechas de la obra y de la etapa: `null` si no hay.
- Material: con `material` y sus tres campos en `null`, no se crea material.
- Documento: con tipo, título y archivo en `null`, no se crea documento.
- `'null'` con comillas se guarda como el texto "null" y el cliente lo vería.

Candados: la consulta entera falla con un mensaje `ALTO: ...` (Postgres lo muestra dentro de
`invalid input syntax for type integer: "ALTO: ..."`) y no crea nada si:
- algún valor de `datos` todavía tiene `<` (el mensaje dice en qué columnas);
- el correo no existe en Authentication → Users;
- ese cliente ya tiene una obra con el mismo nombre (sin importar mayúsculas ni espacios al
  inicio o al final);
- `material` está en `null` pero hay especificación, marca o cantidad;
- el documento está a medias (va completo o con los tres en `null`).

```sql
with
datos as materialized (
  select
    -- Cliente: el correo de su cuenta en Authentication → Users (obligatorio)
    '<correo-del-cliente>'::text                              as correo,
    -- Obra. Obligatorios: nombre y modalidad. Estado en null = por_iniciar
    '<Nombre de la obra>'::text                               as obra_nombre,
    '<compra | construccion_terreno | inversionista>'::text   as obra_modalidad,
    '<Casa Modelo Esparta>'::text                             as obra_modelo,
    '<Municipio, Departamento>'::text                         as obra_ubicacion,
    '<por_iniciar | en_obra | pausada | entregada>'::text     as obra_estado,
    '<AAAA-MM-DD>'::date                                      as obra_fecha_inicio,
    '<AAAA-MM-DD>'::date                                      as obra_fecha_entrega,
    -- Primera etapa (orden 1). Obligatorio: nombre. Estado en null = por_iniciar
    '<Terreno y trazo>'::text                                 as etapa_nombre,
    '<por_iniciar | en_proceso | terminada>'::text            as etapa_estado,
    '<AAAA-MM-DD>'::date                                      as etapa_fecha_inicio,
    '<Descripción de la etapa>'::text                         as etapa_descripcion,
    -- Primer avance. Obligatorios: fecha y título. Video: solo YouTube o Vimeo, o null
    '<AAAA-MM-DD>'::date                                      as avance_fecha,
    '<Título del avance>'::text                               as avance_titulo,
    '<Descripción del avance>'::text                          as avance_descripcion,
    '<https://www.youtube.com/watch?v=...>'::text             as avance_video_url,
    -- Material (opcional): con los cuatro en null no se crea
    '<Bloque de concreto>'::text                              as material,
    '<Especificación>'::text                                  as material_especificacion,
    '<Marca>'::text                                           as material_marca,
    '<Cantidad con unidad>'::text                             as material_cantidad,
    -- Documento (opcional): con los tres en null no se crea
    '<contrato | plano | permiso | factura | otro>'::text     as documento_tipo,
    '<Título del documento>'::text                            as documento_titulo,
    '<contrato.pdf>'::text                                    as documento_archivo
),
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
  (select ruta from documento)                                as ruta_documento;
```

Después de correrla:
1. Revisa que `membresias_creadas` sea 1 y anota `obra_id`, `etapa_id` y `avance_id`.
2. En **Storage → `obras`**, crea las carpetas de `carpeta_fotos` y sube ahí las fotos.
3. Si cargaste documento, sube el archivo (PDF o foto) de modo que su ruta sea exactamente
   `ruta_documento`.
4. Lo que no tengas todavía (video, material o documento) se deja en `null` en `datos`; no se
   borra ningún bloque. Se agrega después con los pasos 5, 7 u 8.

La prueba de esta plantilla (datos completos, un `<` olvidado, correo inexistente, obra
repetida y opcionales en `null`, todo revertido) está en
`supabase/pruebas/004_plantilla_obra_nueva.sql`.

### Plantilla: avance nuevo en una obra existente
Llena solo el bloque `datos`, igual que en la plantilla de obra nueva (`null` sin comillas si
no lo tienes). La etapa se indica por su **número de orden** (1, 2, 3…), no por su id; `null`
si el avance no es de ninguna etapa. Devuelve la carpeta exacta donde van sus fotos. Es una
sola instrucción: si algo falla, no crea nada. En las tres plantillas de esta sección, un id,
número o fecha que quede como `'<...>'` falla antes del candado con el error de Postgres
`invalid input syntax for type ...`; tampoco crea nada.

Candados (`ALTO`): quedan valores con `<`; no existe una obra con ese id; falta la fecha o el
título; la obra no tiene etapa con ese número; la obra ya tiene un avance con la misma fecha y
el mismo título (sin importar mayúsculas ni espacios: así no se duplica si la corres dos
veces). El video, si lo hay, solo YouTube o Vimeo (la base rechaza otros).

```sql
with
datos as materialized (
  select '<obra_id>'::uuid                             as obra_id,
         '<1>'::smallint                               as etapa_orden,
         '<AAAA-MM-DD>'::date                          as fecha,
         '<Título del avance>'::text                   as titulo,
         '<Descripción del avance>'::text              as descripcion,
         '<https://www.youtube.com/watch?v=...>'::text as video_url
),
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
  (select obra_id::text || '/avances/' || id::text || '/' from nuevo)    as carpeta_fotos;
```

Después: en **Storage → `obras`**, crea la carpeta de `carpeta_fotos` (un nivel a la vez) y
sube ahí las fotos (paso 6).

Para cambiar el estado de una etapa de una obra **sin** avance público (las obras de clientes):
```sql
update public.etapas set estado = '<en_proceso | terminada>', fecha_fin = '<AAAA-MM-DD>'
where id = '<etapa_id>'
returning orden, nombre, estado;
```
Si la obra es una casa propia del catálogo, usa la plantilla 5 de `docs/GUIA_CARGA_CASAS.md`:
cambia lo público y el portal a la vez.

### Plantilla: documento nuevo
**Primero sube el archivo** a `{obra_id}/documentos/` en Storage → `obras` (paso 8); la
plantilla comprueba que esté ahí. En `archivo` va solo el nombre, tal cual lo subiste (por
ejemplo `factura-001.jpg`): la ruta la arma la plantilla. Se aceptan PDF y fotos (JPG, PNG o
WebP), hasta 10 MB.

Candados (`ALTO`): quedan valores con `<`; no existe una obra con ese id; tipo fuera de la
lista; falta el título; el nombre del archivo tiene carpetas, espacios o `..`, o no termina en
.pdf, .jpg, .jpeg, .png o .webp; **el archivo no está subido en esa ruta**; ya hay un documento
con esa ruta.

```sql
with
datos as materialized (
  select '<obra_id>'::uuid                                    as obra_id,
         '<contrato | plano | permiso | factura | otro>'::text as tipo,
         '<Título del documento>'::text                       as titulo,
         '<archivo.pdf>'::text                                as archivo
),
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
  (select ruta from nuevo)                      as ruta;
```

### Plantilla: materiales (varias filas a la vez)
Llena `datos` (la obra) y una fila por material en `materiales`. Especificación, cantidad y
marca son opcionales (`null` sin comillas); la marca solo se ve en el portal, nunca en el sitio
público. Los materiales se agregan en el orden de la lista, después de los que ya tiene la
obra.

Candados (`ALTO`): quedan valores con `<`; no existe una obra con ese id; una fila sin
material; un material repetido en la lista o que la obra ya tiene (sin importar mayúsculas ni
espacios).

```sql
with
datos as materialized (
  select '<obra_id>'::uuid as obra_id
),
materiales (material, especificacion, cantidad, marca) as materialized (
  values
    ('<Bloque de concreto>'::text, '<15 x 20 x 40 cm, ASTM C90>'::text, '<1,200 unidades>'::text, null::text),
    ('<Hierro corrugado>',         '<Grado 40, ASTM A615>',             '<120 varillas>',           null)
),
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
  (select string_agg(orden || '. ' || material, ' | ' order by orden) from nuevos) as materiales;
```

La prueba de estas tres plantillas (cada candado, sin crear nada en los ALTO, y los casos que
sí crean, todo revertido) está en
`supabase/pruebas/004_plantillas_avance_documento_materiales.sql`.

## 1. Crear la cuenta del cliente (una vez por cliente)
1. **Authentication → Users → Add user → Create new user.**
2. Correo: el que el cliente usará para entrar (en minúsculas).
3. Contraseña: pon una cualquiera, larga; el cliente **no la usa** (entra con el código que
   le llega al correo). Marca **Auto Confirm User**.
4. Guarda. Copia el **User UID** de la fila nueva: es el `user_id`.

> No uses "Send invitation": manda un enlace, y el portal funciona con código.
> Si el cliente ya pidió la ficha técnica con ese correo, la cuenta ya existe: búscala en
> la lista y copia su User UID.

## 2. Crear la obra
**Table Editor → `obras` → Insert → Insert row.**

| Columna | Qué poner |
|---|---|
| `nombre` | Cómo la verá el cliente, por ejemplo "Casa Esparta — Santa Tecla". |
| `modalidad` | `compra` (casa del catálogo, ya construida o en obra), `construccion_terreno` (el portal la muestra como "Casa a pedido": toda casa que se vende antes de construirse, en terreno nuestro o del cliente) o `inversionista`. |
| `modelo` | Opcional, por ejemplo "Casa Modelo Esparta" o "Esparta adaptada". |
| `ubicacion` | Opcional, por ejemplo "Santa Tecla, La Libertad". |
| `estado` | `por_iniciar`, `en_obra`, `pausada` o `entregada`. |
| `fecha_inicio`, `fecha_entrega_estimada` | Opcionales. |

Deja vacíos `id`, `created_at` y `updated_at` (se llenan solos). Guarda y **copia el `id`**
de la obra: es el `obra_id` de todos los pasos siguientes.

## 3. Dar acceso al cliente
**Table Editor → `obra_miembros` → Insert row:** `obra_id` (paso 2) y `user_id` (paso 1).

Una obra puede tener varios miembros (por ejemplo, una pareja) y un cliente puede tener
varias obras: una fila por cada par. Cada cliente ve solo sus filas; no ve quién más tiene
acceso.

## 4. Etapas
**Table Editor → `etapas` → Insert row** por cada etapa:

| Columna | Qué poner |
|---|---|
| `obra_id` | El de la obra. |
| `orden` | 1, 2, 3… (no se puede repetir en la misma obra). |
| `nombre` | Por ejemplo "Terreno y trazo", "Cimentación". |
| `estado` | `por_iniciar`, `en_proceso` o `terminada`. |
| `fecha_inicio`, `fecha_fin` | Opcionales. La fecha de fin no puede ser antes de la de inicio. |
| `descripcion` | Opcional. |

Para actualizar una etapa, edita su fila (doble clic en la celda).

## 5. Avances (diario de obra)
**Table Editor → `avances` → Insert row:**

| Columna | Qué poner |
|---|---|
| `obra_id` | El de la obra. |
| `etapa_id` | Opcional: el `id` de una etapa **de la misma obra** (si es de otra, la base lo rechaza). |
| `fecha` | Fecha del avance. |
| `titulo` | Por ejemplo "Colado de la solera de fundación". |
| `descripcion` | Opcional. |
| `video_url` | Opcional. **Solo YouTube o Vimeo** (ver abajo). |

Guarda y **copia el `id` del avance**: lo necesitas para las fotos.

**Videos:** sube el video a YouTube (como **No listado**) o a Vimeo y pega el enlace normal:
`https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, `https://www.youtube.com/shorts/...`
o `https://vimeo.com/123456789`. Otros sitios (TikTok, Instagram, Drive) no se aceptan: la
base de datos rechaza el enlace. Si el enlace es de YouTube o Vimeo pero no tiene un formato
reconocible, el portal muestra el avance sin video.

## 6. Fotos de un avance
Las fotos no van en una tabla: el portal muestra todas las fotos de la carpeta del avance.

1. **Storage → bucket `obras`.**
2. Entra (o crea) la carpeta con el **`obra_id`**, dentro la carpeta **`avances`**, y dentro
   una carpeta con el **`id` del avance**. Ruta en el bucket "obras" (sin prefijo obras/):
   ```
   {obra_id}/avances/{avance_id}/archivo
   ```
   donde `{obra_id}` es el id de la obra, `{avance_id}` el id del avance y `archivo` el
   nombre de la foto (por ejemplo `01.jpg`).
3. Sube las fotos ahí (**Upload file**).

Reglas:
- Solo **JPG, PNG o WebP**, de **hasta 10 MB** cada una. Las fotos HEIC del iPhone no se
  aceptan: en el iPhone, Ajustes → Cámara → Formatos → **Más compatible**, o envíalas como
  JPG.
- Se muestran ordenadas por nombre de archivo y hasta 50 por avance. Para ordenarlas,
  nómbralas `01.jpg`, `02.jpg`…
- Reduce las fotos antes de subirlas (unos 2000 px de ancho bastan): el cliente las ve
  desde el celular, a veces con datos móviles.
- Si la carpeta tiene un nombre equivocado, las fotos no aparecen (y nadie más las ve).

## 7. Materiales usados
Varios a la vez: plantilla "materiales" (arriba). Uno por uno: **Table Editor → `obra_materiales` → Insert row:** `obra_id`, `orden` (1, 2, 3…),
`material`, y opcionales `especificacion`, `marca` y `cantidad` (texto con unidad, por
ejemplo "1,200 unidades").

## 8. Documentos (contrato, planos, permisos, facturas)
Lo más seguro es subir el archivo (punto 1) y después correr la plantilla "documento nuevo"
(arriba), que comprueba que el archivo esté subido. Con el Table Editor:

1. **Storage → bucket `obras`** → carpeta `{obra_id}` → carpeta **`documentos`** → sube el
   archivo: **PDF o foto (JPG, PNG o WebP)**, hasta 10 MB. Las facturas y permisos en foto
   sirven igual; las fotos HEIC del iPhone no se aceptan (ver paso 6). Ruta en el bucket "obras" (sin prefijo obras/):
   ```
   {obra_id}/documentos/archivo
   ```
   donde `archivo` es el nombre del archivo (por ejemplo `contrato.pdf` o `factura-001.jpg`).
2. **Table Editor → `documentos` → Insert row:**
   - `obra_id`: el de la obra.
   - `tipo`: `contrato`, `plano`, `permiso`, `factura` u `otro`. Las facturas salen en su
     propio apartado ("Facturas"), debajo de "Documentos"; si la obra no tiene facturas, ese
     apartado no aparece. `factura` solo se acepta con la migración
     `007_documentos_factura.sql` aplicada (antes, la base la rechaza).
   - `titulo`: por ejemplo "Contrato de construcción firmado".
   - `ruta`: **la ruta exacta del archivo**, con el formato `{obra_id}/documentos/archivo`
     (sin prefijo obras/; mayúsculas y minúsculas cuentan). Copia el `obra_id` real y el
     nombre del archivo tal cual lo subiste. La base rechaza una ruta que no esté en la carpeta
     de documentos de esa misma obra.

El cliente abre el documento desde el portal (la tarjeta dice si es PDF o imagen); el enlace
dura 60 segundos y se genera cada vez que lo toca.

## 9. Revisar lo que ve el cliente
La forma más segura es agregarte a ti mismo como miembro (paso 3, con tu propio usuario),
entrar a `/portal` con tu correo y revisar. Al terminar, borra esa fila de
`obra_miembros`.

## 10. Quitar el acceso o borrar
- **Quitar el acceso a un cliente:** borra su fila en `obra_miembros`. Si borras al usuario
  en Authentication, pierde el acceso a todas sus obras.
- **Borrar una obra:** al borrar la fila en `obras` se borran sus membresías, etapas,
  avances, materiales y documentos de la base. **Los archivos de Storage NO se borran
  solos:** borra también la carpeta `{obra_id}` del bucket.
- Antes de borrar algo con datos reales, descarga una copia (Table Editor → Export to CSV y
  los archivos de Storage).

## Errores comunes
| Mensaje al guardar | Causa |
|---|---|
| `violates check constraint ... video_url` | El enlace no es de YouTube o Vimeo, o no empieza con `https://`. |
| `violates check constraint ... ruta` | La ruta del documento no sigue `{obra_id}/documentos/archivo` con el id de esa obra. |
| `violates foreign key constraint ... etapas` | El `etapa_id` es de otra obra o no existe. |
| `duplicate key ... obra_id, orden` | Ya hay una etapa con ese orden en la obra. |
| `violates check constraint ... estado` / `modalidad` / `tipo` | El valor no está en la lista; cópialo tal cual de esta guía. |
