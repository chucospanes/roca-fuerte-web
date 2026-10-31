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
        └── contrato.pdf       nivel 3: el PDF. Su ruta completa va en documentos.ruta.
```

- Fotos: `{obra_id}/avances/{avance_id}/archivo`
- Documentos: `{obra_id}/documentos/archivo`

### Plantilla: obra nueva completa
Cambia todo lo que está entre `<...>` (deja las comillas simples). Para un dato opcional
que no tengas, escribe `null` sin comillas. Es una sola instrucción: **si algo falla, no se
crea nada**. Si el correo del cliente no existe en Authentication, tampoco se crea nada y
la columna `cliente_encontrado` sale en `false`.

```sql
with
cliente as (
  select id from auth.users where email = lower('<correo-del-cliente>')
),
obra as (
  insert into public.obras (nombre, modalidad, modelo, ubicacion, estado,
                            fecha_inicio, fecha_entrega_estimada)
  select '<Nombre de la obra>',
         '<compra | construccion_terreno | inversionista>',
         '<Casa Modelo Esparta>',
         '<Municipio, Departamento>',
         '<por_iniciar | en_obra | pausada | entregada>',
         '<AAAA-MM-DD>'::date,
         '<AAAA-MM-DD>'::date
  where exists (select 1 from cliente)
  returning id
),
miembro as (
  insert into public.obra_miembros (obra_id, user_id)
  select obra.id, cliente.id from obra, cliente
  returning obra_id
),
etapa as (
  insert into public.etapas (obra_id, orden, nombre, estado, fecha_inicio, descripcion)
  select id, 1, '<Terreno y trazo>', '<por_iniciar | en_proceso | terminada>',
         '<AAAA-MM-DD>'::date, '<Descripción de la etapa>'
  from obra
  returning id, obra_id
),
avance as (
  insert into public.avances (obra_id, etapa_id, fecha, titulo, descripcion, video_url)
  select obra_id, id, '<AAAA-MM-DD>'::date, '<Título del avance>',
         '<Descripción del avance>', '<https://www.youtube.com/watch?v=... o null>'
  from etapa
  returning id, obra_id
),
mat as (
  insert into public.obra_materiales (obra_id, orden, material, especificacion, marca, cantidad)
  select id, 1, '<Bloque de concreto>', '<Especificación>', '<Marca>', '<Cantidad con unidad>'
  from obra
  returning id
),
documento as (
  insert into public.documentos (obra_id, tipo, titulo, ruta)
  select id, '<contrato | plano | permiso | otro>', '<Título del documento>',
         id::text || '/documentos/<contrato.pdf>'
  from obra
  returning id, ruta
)
select
  exists (select 1 from cliente)                              as cliente_encontrado,
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
1. Revisa que `cliente_encontrado` sea `true` y `membresias_creadas` sea 1.
2. En **Storage → `obras`**, crea las carpetas de `carpeta_fotos` y sube ahí las fotos.
3. Sube el PDF de modo que su ruta sea exactamente `ruta_documento`.
4. Si no vas a cargar video, material o documento todavía, borra ese bloque de la plantilla
   (y su línea en el `select` final) antes de correrla, en vez de dejar los `<...>`.

### Plantilla: avance nuevo en una obra existente
```sql
insert into public.avances (obra_id, etapa_id, fecha, titulo, descripcion, video_url)
values ('<obra_id>', '<etapa_id o null>', '<AAAA-MM-DD>', '<Título del avance>',
        '<Descripción>', '<URL de YouTube o Vimeo, o null>')
returning id as avance_id,
          obra_id::text || '/avances/' || id::text || '/' as carpeta_fotos;
```
Sube las fotos del avance a `carpeta_fotos`. Para cambiar el estado de una etapa:
```sql
update public.etapas set estado = '<en_proceso | terminada>', fecha_fin = '<AAAA-MM-DD>'
where id = '<etapa_id>'
returning orden, nombre, estado;
```

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
| `modalidad` | `compra`, `construccion_terreno` o `inversionista`. |
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
**Table Editor → `obra_materiales` → Insert row:** `obra_id`, `orden` (1, 2, 3…),
`material`, y opcionales `especificacion`, `marca` y `cantidad` (texto con unidad, por
ejemplo "1,200 unidades").

## 8. Documentos (contrato, planos, permisos)
1. **Storage → bucket `obras`** → carpeta `{obra_id}` → carpeta **`documentos`** → sube el PDF
   (hasta 10 MB). Ruta en el bucket "obras" (sin prefijo obras/):
   ```
   {obra_id}/documentos/archivo
   ```
   donde `archivo` es el nombre del PDF (por ejemplo `contrato.pdf`).
2. **Table Editor → `documentos` → Insert row:**
   - `obra_id`: el de la obra.
   - `tipo`: `contrato`, `plano`, `permiso` u `otro`.
   - `titulo`: por ejemplo "Contrato de construcción firmado".
   - `ruta`: **la ruta exacta del archivo**, con el formato `{obra_id}/documentos/archivo`
     (sin prefijo obras/; mayúsculas y minúsculas cuentan). Copia el `obra_id` real y el
     nombre del PDF tal cual lo subiste. La base rechaza una ruta que no esté en la carpeta
     de documentos de esa misma obra.

El cliente abre el documento desde el portal; el enlace dura 60 segundos y se genera cada
vez que lo toca.

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
