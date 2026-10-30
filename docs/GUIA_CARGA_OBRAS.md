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
