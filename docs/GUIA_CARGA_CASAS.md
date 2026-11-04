# Guía: cargar casas en venta en el catálogo (`/casas`)

> Para el constructor. No hay panel de administración: todo se carga desde el panel de
> Supabase (proyecto `roca-fuerte-web`). Requiere la migración `005_casas_venta.sql`
> aplicada. Lo que cargues aquí es **público** en cuanto la casa esté publicada: nada de
> direcciones exactas, nombres de compradores ni comentarios internos.
>
> Los nombres de los botones del panel pueden cambiar con las versiones de Supabase; si
> alguno no coincide, busca el equivalente.

## Antes de empezar
- **Una casa del catálogo no es una obra del portal.** El portal (`docs/GUIA_CARGA_OBRAS.md`)
  es privado y por cliente; el catálogo es público. No se relacionan: una misma casa puede
  estar en los dos, cargada por separado.
- **Lo del modelo Esparta no se repite aquí.** Si la casa es el modelo Esparta tal cual
  (`planta_esparta = true`), los m² construidos, dormitorios y baños salen de la portada;
  en la fila van en `null`. Solo una casa con planta propia los trae.
- **Las fotos son públicas desde que se suben.** El bucket `casas` es público: cualquier
  archivo se puede abrir con su dirección, aunque la casa no esté publicada (la dirección
  lleva un código largo y no se adivina, pero no es secreta). Sube solo fotos que ya se
  puedan ver.
- **Formatos:** JPG, PNG o WebP, hasta 5 MB por archivo. El plano, con su lado mayor de
  **1800 px como máximo** (resolución media, como el de la portada): redúcelo antes de
  subirlo. Necesitas el ancho y alto de cada imagen en píxeles (en Windows: clic derecho →
  Propiedades → Detalles).
- **Los cambios tardan unos minutos en verse** en el sitio (la web guarda el catálogo en
  caché un rato); no hace falta desplegar nada.

## Orden de carga
1. **Casa nueva** (plantilla 1): crea la fila **sin publicar** y devuelve la carpeta de
   Storage.
2. **Subir los archivos** en *Storage → `casas`*, dentro de esa carpeta.
3. **Fotos y plano** (plantilla 2): registra los archivos subidos. La foto de orden 1 es la
   portada.
4. **Publicar** (plantilla 3): la casa aparece en `/casas` y, si no está vendida, en la
   portada.

### Estructura del bucket `casas`
Las rutas **no** llevan "casas/" al inicio: "casas" es el nombre del bucket.

```
bucket "casas"
└── {casa_id}/            una carpeta por casa (el id que devuelve la plantilla 1)
    ├── fachada.jpg       fotos: el nombre que quieras, sin carpetas adentro
    ├── sala.jpg
    └── plano.png         el plano (uno por casa)
```

## Plantillas SQL (SQL Editor)
Igual que en la guía de obras: llena **solo el bloque `datos`** (y en la plantilla 2,
también `imagenes`); cambia cada `'<...>'` por el valor entre comillas simples, o por
`null` **sin comillas** si no lo tienes. Debajo de "no se edita nada" no se toca nada. Cada
plantilla es una sola instrucción: **si algo falla, no se crea ni cambia nada**.

- Los números y los `true`/`false` también van entre comillas en la plantilla (`'<5.00>'`):
  cámbialos por el valor (con o sin comillas, da igual). Si se te olvida uno, falla antes
  del candado con el error de Postgres `invalid input syntax for type ...: "<...>"`; tampoco
  crea nada.
- `'null'` con comillas se guarda como el texto "null" y se vería en la página.
- Candados: la consulta falla con un mensaje `ALTO: ...` (Postgres lo muestra dentro de
  `invalid input syntax for type integer: "ALTO: ..."`) y no crea nada. Cada plantilla
  lista los suyos.

### Plantilla 1: casa nueva
- Obligatorios: slug, nombre, distrito, municipio, departamento, medidas del lote y
  `planta_esparta`.
- `slug`: la dirección de la página (`/casas/el-slug`). Solo minúsculas sin tildes, números
  y guiones, por ejemplo `casa-esparta-santa-tecla-1`. No se cambia después de publicar (los
  enlaces compartidos dejarían de funcionar).
- Departamento escrito igual que en la lista, con tildes: Ahuachapán, Cabañas,
  Chalatenango, Cuscatlán, La Libertad, La Paz, La Unión, Morazán, San Miguel, San
  Salvador, San Vicente, Santa Ana, Sonsonate, Usulután.
- En `null`: estado = en construcción; precio = "Consultar"; modelo = Esparta; orden = 100;
  servicios = por confirmar (se ven con el sello de pendiente); incluye = nada.

Candados (`ALTO`):
- algún valor de `datos` todavía tiene `<` (el mensaje dice en qué columnas);
- el slug no tiene el formato, o ya existe otra casa con ese slug;
- el departamento no es uno de la lista;
- `planta_esparta` en `null`; con `true` hay m², dormitorios o baños; con `false` falta
  alguno de los tres;
- el video no es de YouTube ni de Vimeo.

```sql
with
datos as materialized (
  select
    -- Identificación. slug: minúsculas sin tildes, números y guiones (dirección de la página)
    '<casa-esparta-ejemplo-1>'::text                            as slug,
    '<Casa Esparta Ejemplo 1>'::text                            as nombre,
    '<Esparta>'::text                                           as modelo,
    '<Descripción corta de la casa>'::text                      as descripcion,
    -- Ubicación pública: sin dirección exacta
    '<Distrito>'::text                                          as distrito,
    '<Municipio>'::text                                         as municipio,
    '<La Libertad>'::text                                       as departamento,
    -- Estado (null = en_construccion), etapa actual y precio en USD (null = "Consultar")
    '<en_construccion | terminada | reservada | vendida>'::text as estado,
    '<Paredes>'::text                                           as etapa_actual,
    '<45000>'::integer                                          as precio_usd,
    -- Lote en metros (rectangular): el área se calcula sola
    '<5.00>'::numeric                                           as lote_frente_m,
    '<20.00>'::numeric                                          as lote_fondo_m,
    -- Planta. true = la del modelo Esparta (m², dormitorios y baños en null).
    -- false = planta propia (los tres obligatorios)
    '<true | false>'::boolean                                   as planta_esparta,
    '<43.60>'::numeric                                          as construccion_m2,
    '<2>'::smallint                                             as dormitorios,
    '<1>'::smallint                                             as banos,
    '<1>'::smallint                                             as parqueos,
    -- Servicios: true, false o null (= por confirmar)
    '<true | false>'::boolean                                   as agua,
    '<true | false>'::boolean                                   as electricidad,
    '<alcantarillado | fosa_septica>'::text                     as aguas_negras,
    -- Qué incluye: una línea por elemento (o null)
    array['<La casa terminada.>', '<El terreno.>']::text[]      as incluye,
    -- Video: solo YouTube o Vimeo (o null)
    '<https://www.youtube.com/watch?v=...>'::text               as video_url,
    -- Orden en el catálogo, menor primero (null = 100)
    '<100>'::smallint                                           as orden
),
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
  (select id::text || '/' from casa)            as carpeta_en_storage;
```

Después de correrla: anota `casa_id` y crea en *Storage → `casas`* la carpeta
`carpeta_en_storage` (sin la barra final) y sube ahí las fotos y el plano. La casa queda con
`publicada = false`: todavía no se ve.

### Plantilla 2: fotos y plano
Primero sube los archivos (paso 2); la plantilla revisa que estén en Storage. Una fila por
imagen en `imagenes`: copia la línea de ejemplo tantas veces como fotos tengas (separadas
por coma, la última sin coma). Sin plano, borra su línea.

- `tipo`: `foto` o `plano`. La **foto de orden 1 es la portada** (tarjeta del catálogo,
  portada del sitio y vista previa al compartir el enlace).
- `archivo`: solo el nombre del archivo como lo subiste (`fachada.jpg`), sin la carpeta.
- `ancho` y `alto`: las medidas reales de la imagen en píxeles (si no cuadran, la página
  la muestra deformada).
- `alt`: qué se ve en la imagen, para quien no puede verla (lectores de pantalla y
  buscadores). Por ejemplo: "Fachada de la casa, con la jardinera y el corredor".

Candados (`ALTO`):
- algún valor todavía tiene `<`;
- no existe una casa con ese slug;
- un `tipo` que no es `foto` ni `plano`, o un `archivo` con carpetas o con otra extensión;
- un archivo que no está subido en la carpeta de la casa;
- el plano con su lado mayor de más de 1800 px;
- dos planos, o un plano nuevo para una casa que ya tiene uno;
- dos imágenes del mismo tipo con el mismo orden, o un orden que la casa ya usa;
- un `alt` vacío o de menos de 5 letras.

```sql
with
datos as materialized (
  select '<casa-esparta-ejemplo-1>'::text as slug
),
imagenes (tipo, orden, archivo, ancho, alto, alt) as materialized (
  values
    ('<foto>'::text, '<1>'::smallint, '<fachada.jpg>'::text, '<1600>'::smallint, '<1200>'::smallint, '<Fachada de la casa, vista desde la calle>'::text),
    ('<plano>',      '<1>',           '<plano.png>',         '<1800>',           '<1737>',           '<Plano de la casa: distribución de los ambientes>')
),
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
   from nuevas)                                  as rutas;
```

### Plantilla 3: publicar u ocultar
`true` publica la casa (aparece en `/casas` y, si no está vendida, en la portada); `false`
la oculta. Para publicar, la casa necesita su foto de portada (foto de orden 1).

Candados (`ALTO`): el slug todavía tiene `<` o no existe; publicar una casa sin foto de
portada.

```sql
with
datos as materialized (
  select '<casa-esparta-ejemplo-1>'::text as slug,
         '<true | false>'::boolean        as publicada
),
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
  (select publicada from cambio)                as publicada;
```

## Avance de la obra (bitácora)
Requiere la migración `008_casas_venta_etapas.sql`. Cada casa puede tener su avance público,
etapa por etapa, en `casas_venta_etapas`: es **la única fuente** de la bitácora de la portada y
de la sección "Avance de la obra" de su ficha. Solo se ve si la casa está publicada.

- **Es público y es aparte del portal.** Las etapas del portal de clientes (`etapas`) son
  privadas y se cargan por separado (`docs/GUIA_CARGA_OBRAS.md`). Aquí va solo lo que se
  puede publicar: nombre, estado, fecha de inicio, descripción y, si hay, un video.
- **Sin porcentajes**: solo el estado (`por_iniciar`, `en_proceso`, `terminada`). Una etapa
  por iniciar va **sin fecha**; la fecha real se pone cuando arranca (la base rechaza una etapa
  por iniciar con fecha).
- **Video**: solo YouTube o Vimeo, como el resto del catálogo.
- **La portada** muestra la primera casa del catálogo (vendidas al final) que tenga etapas.
- **Etapa actual de la ficha**: sale de la etapa `en_proceso`; la columna `etapa_actual` de la
  casa solo se usa si la casa no tiene etapas cargadas.
- **Al venderse la casa, su avance público se congela**: no se carga nada más aquí y el avance
  sigue solo en el portal del comprador. La bitácora dice "ya vendida" y que el avance sigue
  en el portal privado de su dueño.

### Plantilla 4: carga inicial de las etapas
Una sola instrucción: si algo falla, no se crea nada. Candados (`ALTO`): la casa no existe, o
ya tiene etapas cargadas. Una fila por etapa en `etapas`; la fecha va en `null` mientras la
etapa esté por iniciar.

```sql
with
datos as materialized (
  select '<casa-esparta-ejemplo-1>'::text as slug
),
etapas (orden, nombre, estado, fecha_inicio, descripcion) as materialized (
  values
    (1::smallint, '<Terracería>'::text,  '<terminada>'::text,   '<AAAA-MM-DD>'::date, '<Descripción>'::text),
    (2,           '<Trazo y zanjeado>',   '<en_proceso>',        '<AAAA-MM-DD>',       '<Descripción>'),
    (3,           '<Fundaciones>',        'por_iniciar',         null,                 '<Descripción>')
),
-- ===== Debajo de esta línea no se edita nada =====
casa as (
  select c.id from public.casas_venta c, datos d where c.slug = d.slug
),
candado as materialized (
  select case
    when exists (select 1 from datos d, jsonb_each_text(to_jsonb(d)) where value like '%<%')
      or exists (select 1 from etapas e, jsonb_each_text(to_jsonb(e)) where value like '%<%') then
      'ALTO: quedan valores sin reemplazar (con "<"). No se creó nada.'
    when not exists (select 1 from casa) then
      format('ALTO: no existe una casa con el slug "%s". No se creó nada.', d.slug)
    when exists (select 1 from public.casas_venta_etapas e, casa c where e.casa_id = c.id) then
      'ALTO: esta casa ya tiene etapas cargadas. No se creó nada.'
  end as error
  from datos d
),
nuevas as (
  insert into public.casas_venta_etapas (casa_id, orden, nombre, estado, fecha_inicio, descripcion)
  select c.id, e.orden, e.nombre, e.estado, e.fecha_inicio, e.descripcion
  from etapas e, casa c, candado k
  where coalesce(k.error::int, 0) = 0
  returning orden, nombre, estado
)
select
  (select coalesce(error::int, 0) from candado)                                  as candado,
  (select count(*) from nuevas)                                                  as etapas_creadas,
  (select string_agg(orden || '. ' || nombre || ' (' || estado || ')', ' | ' order by orden)
   from nuevas)                                                                  as etapas;
```

### Cuando avanza la obra
Se cambia la etapa por su número de orden. La base rechaza valores fuera de lo permitido; cada
`update` devuelve la fila cambiada (si no devuelve nada, el slug o el orden no existen).

```sql
-- Arranca una etapa (con su fecha real de inicio)
update public.casas_venta_etapas set estado = 'en_proceso', fecha_inicio = '<AAAA-MM-DD>'
where casa_id = (select id from public.casas_venta where slug = '<slug>') and orden = <n>
returning orden, nombre, estado, fecha_inicio;

-- Termina una etapa
update public.casas_venta_etapas set estado = 'terminada'
where casa_id = (select id from public.casas_venta where slug = '<slug>') and orden = <n>
returning orden, nombre, estado;

-- Video de una etapa (solo YouTube o Vimeo)
update public.casas_venta_etapas set video_url = 'https://youtu.be/<id>'
where casa_id = (select id from public.casas_venta where slug = '<slug>') and orden = <n>
returning orden, nombre, video_url;
```

## Cambios del día a día (Table Editor o SQL)
Se hacen editando la fila de la casa en *Table Editor → `casas_venta`* (o con un `update`
en el SQL Editor). La base rechaza los valores fuera de lo permitido. Ejemplos:

```sql
-- Cambiar el lote (el área se recalcula sola)
update public.casas_venta set lote_frente_m = 10, lote_fondo_m = 20 where slug = 'casa-esparta-ejemplo-1';
-- Precio (null = "Consultar")
update public.casas_venta set precio_usd = 45000 where slug = 'casa-esparta-ejemplo-1';
-- Etapa actual y estado
update public.casas_venta set etapa_actual = 'Techo', estado = 'en_construccion' where slug = 'casa-esparta-ejemplo-1';
```

- **Reservada:** `estado = 'reservada'`. Se ve con la etiqueta "Reservada", sin precio y con
  el botón de WhatsApp.
- **Vendida:** `estado = 'vendida'`. Se ve al final del catálogo con la etiqueta "Vendida",
  sin precio ni botón, y sale de la portada. Para que no se vea, ocúltala con la plantilla 3.
- **Quitar una foto:** borra su fila en `casas_venta_imagenes` y después el archivo en
  Storage. Si era la de orden 1, otra foto debe pasar a orden 1 (o la casa queda sin
  portada).
- **Borrar una casa:** mejor ocultarla. Si se borra la fila, se borran sus filas de
  imágenes, pero los archivos de Storage hay que borrarlos a mano; los clics ya contados se
  conservan sin la casa.

La prueba de las tres plantillas (casa completa y con planta propia, cada candado, fotos y
plano, publicar y ocultar, todo revertido) está en `supabase/pruebas/005_plantillas_casas.sql`.
