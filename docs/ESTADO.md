# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-11-02
**Versión:** v1.0.0 — desplegado en el dominio, sin lanzar (noindex); portal de clientes encendido

## Fase actual
**Fases 6 y 7 cerradas en `v1.0.0` (2026-10-31): el sitio está desplegado en
https://constructorarocafuerte.com, sin lanzar.** `site.lanzado` apagado (todo con
`noindex`), acceso premium apagado y portal de clientes encendido (`site.portalClientes` es
la constante `true`; la variable `NEXT_PUBLIC_PORTAL_CLIENTES` ya no existe y se puede
quitar de `.env.local`). Lo que falta para lanzar está en "Siguiente".

### Catálogo de casas en venta (rama `feat/catalogo-casas`, en curso)
- Migración 005 aplicada por el usuario (2026-11-02) y su prueba con rollback superada
  ("PRUEBA SUPERADA: 9 candados…"). Verificado con lecturas: `casas_venta` y
  `casas_venta_imagenes` en 0 filas; con la clave publishable, lectura 200 vacía, inserción
  401/42501 en las dos y las 6 tablas del portal en 401; bucket `casas` público (5 MB,
  JPEG/PNG/WebP) y vacío para la publishable; `obras` sigue privado.
- Guía `docs/GUIA_CARGA_CASAS.md` con 3 plantillas (casa nueva sin publicar, fotos y plano,
  publicar u ocultar) y su prueba `supabase/pruebas/005_plantillas_casas.sql` (17 casos,
  armada desde la guía). **Falta que el usuario corra esa prueba.**
- `/casas` (tarjetas: vendidas al final, sin precio en reservadas y vendidas, "Consultar" sin
  precio; vacío o con error: aviso y WhatsApp) y `/casas/[slug]` (fotos, datos del lote y la
  planta, servicios, qué incluye, video y plano protegido; planta Esparta toma m² y plano de la
  portada). Datos con la clave publishable, caché `minutes`. "Casas" en el menú (escritorio
  desde 1024 px: con 9 enlaces desbordaba a 768) y en el pie. Probado con el build de
  producción: contra Supabase real (catálogo vacío) y contra una simulación local de la API
  con 4 casas (sin tocar Supabase), capturas de 360 a 1280 px sin desborde.
- Casa inexistente: 404 real desde `proxy.ts`, con `X-Robots-Tag: noindex` y meta noindex,
  también con el sitio lanzado (ver DECISIONES.md). Probado: slug inexistente o inválido →
  404; casa publicada → 200 con su contenido; Supabase caído → 200 "No pudimos cargar esta
  casa" con noindex en encabezado y meta.
- Botón "Quiero esta casa" por casa (no en vendidas) con conteo `casa` + `casa_id`, y
  `catalogo` en los WhatsApp de `/casas` vacío o con error. Probado contra la simulación
  local: esquema (22 casos), ruta (casa publicada 204 e insertada; oculta, inexistente,
  inválida, sin id o id en otra opción 400 sin insertar; base caída 204 sin insertar) y clic
  real en el navegador (mensaje con la casa y "(Ref: …)", clic con `casa_id` y UTM).
- Portada: bloque "Casas disponibles" (3 primeras no vendidas; sin casas o si Supabase falla,
  no se muestra) debajo del hero. Precios: "Comprar una casa" sin datos propios, lleva a
  `/casas` (o a la casa, si hay una sola disponible). Hero: "Ver casas en venta". Contacto:
  "Quiero más información" con el mensaje general. Sale `site.precios.comprarCasa` y el
  desglose de compra de la ficha premium. Probado con 4 casas simuladas, una sola, Supabase
  caído y Supabase real (vacío). Ojo: `next build` reusa en `.next` lo guardado con
  `use cache` de un build anterior; en producción se corrige al revalidar (1 min).
- Migración `006_clics_casas.sql` escrita (solo archivo): opción y ubicación `casa`,
  ubicación `catalogo`, columna `casa_id` y vista de resumen con la casa; comprueba al final
  que anon y authenticated no tienen permisos sobre la tabla ni la vista. **Esperando la
  revisión del usuario antes de aplicarla.** Aplicada por el usuario (2026-11-02); verificado con
  lecturas: `clics_venta` y `clics_venta_resumen` en 401 con la publishable; `casa_id` y la
  columna `casa` de la vista existen. Prueba de plantillas de casas superada (17 casos). Sigue: SEO (commit 9).
- Siguen: guía y plantilla de carga, `/casas` y `/casas/[slug]`, bloque en la portada y
  Precios, migración 006 (clics por casa), botón por casa y SEO. La rama se une a `main` solo
  con la 005 y la 006 aplicadas. Diseño en DECISIONES.md (2026-11-02).

### Hero, lema y pilares (2026-11-02)
- "Casas que duran. Y te lo demostramos." + "Cada material, cada etapa y cada refuerzo,
  documentados en video. Tú lo compruebas antes de comprar." Metadata sin cambios (no usaba
  el título anterior). Ver DECISIONES.md.
- Lema en el pie (páginas públicas) y sección 01 en dos pilares: Calidad comprobable y
  Comunidad. Capturas a 390 y 1280 px revisadas, sin desborde. Ver DECISIONES.md.

### Plano de la casa: resolución media y protección ligera (2026-11-01)
- La web sirve `public/plano-casa-esparta-v4-1800.png` (1800 × 1737, reducido del original
  sin recortar ni cambiar colores); el PNG de 3550 px salió de `public/` (sigue en el
  historial de git). Sin menú contextual, arrastre, menú de mantener presionado ni selección
  en esa imagen; `alt` sin cambios. Ver DECISIONES.md.

### Plano de la casa v4 (2026-11-01, pendiente 27 del inventario: hecho)
- Lámina A-01 v4 (nota del techo con el pretil, cuadro de "Notas generales" y marcas de
  autoría): `public/plano-casa-esparta-v4.png` (3550 × 3425) y
  `assets/plano-casa-esparta-v4.pdf`, copiados de Descargas byte a byte (mismo SHA-256, sin
  recortar ni reprocesar; `next/image` sirve las versiones reducidas, igual que antes). La
  descarga premium pasa a `/descargas/plano-casa-esparta-v4.pdf`. Borrados los
  `plano-casa-esparta` anteriores. Capturas revisadas a 390 px (sin desborde) y 1280 px, y
  ampliado en el celular (sirve la imagen a resolución completa): las notas y el pie de
  autoría se leen; la microlínea de autoría se conserva, diminuta como en el original.

### Despliegue (verificado con lecturas el 2026-10-31)
- **Vercel** (cuenta chucospanes-9163, plan Hobby hasta el lanzamiento) despliega cada push a
  `main`; autor de los commits: la cuenta chucospanes (ver DECISIONES.md).
- **Dominio:** `constructorarocafuerte.com` con registro A a Vercel y `www` por CNAME (DNS en
  Namecheap; los registros de Resend no se tocaron). HTTPS activo en los dos. `https://www`
  → 308 al dominio sin www conservando ruta y parámetros; `http://` → 308 a `https://`.
  Al principio Vercel tenía `www` como principal; el usuario lo corrigió.
- **Supabase Auth → URL Configuration:** Site URL `https://constructorarocafuerte.com`;
  Redirect URLs del dominio, `www`, `roca-fuerte-web.vercel.app` y `localhost`.
- **En el dominio:** `/`, `/portal`, `/privacidad`, `/robots.txt`, `/sitemap.xml` y
  `/opengraph-image` responden 200; `/esparta/ficha` y `/descargas/…` 404; todas con
  `X-Robots-Tag: noindex, nofollow`, y `/` y `/portal` también con la meta `noindex`.
  Canonical, `og:url` y `og:image` con `https://constructorarocafuerte.com`. `robots.txt`
  con `Allow: /`, sin sitemap (solo excluye ficha, descargas y API); sitemap vacío. "Acceso
  clientes" y "Para inversionistas" visibles; `/portal` muestra el formulario del código.

### Fase 7 — inversionistas y portal privado de clientes (en `main`, portal encendido)
- **Landing:** sección "Para inversionistas" (07) con botón de WhatsApp
  `inversionista`/`inversionistas`, menú en el celular con `<details>` y enlaces en el pie.
  Pregunta frecuente de permisos respondida con el mismo texto que la sección.
- **Portal `/portal`** (`site.portalClientes`): código por correo sin crear cuentas, lista
  de obras, `/portal/obras/[id]` y `/portal/documentos/[id]` (URL firmada de 60 s). Todo se
  lee con la sesión del usuario; `noindex` + `X-Robots-Tag`, sin Disallow.
- **Supabase:** 003 y 004 aplicadas por el usuario el 2026-10-30 (PostgreSQL 17.11) y
  verificadas con lecturas (sin sesión, 401 en las 6 tablas; bucket `obras` privado).
- **Prueba de aislamiento (SQL, revertida):** superada.
- **Prueba de punta a punta (2026-10-30, cuentas `<tu-correo>+portal-a@…`, `+portal-b`,
  `+portal-c` y `+portal-x`):** en el navegador, A 1–7 y B 1–7 correctas (cada uno ve
  solo su obra, foto, video, material y documento; la URL del documento vence a los 60 s;
  la obra y el documento del otro dan "no encontrado"/404; sin sesión vuelve a `/portal`);
  correo inexistente (8): mensaje genérico, sin correo y sin usuario creado; cuenta sin
  obras (9): "Este correo no tiene obras asignadas". Storage por SQL de solo lectura: "A ve
  2 propios y 0 de B. B ve 2 propios y 0 de A."
- **Limpieza:** el usuario borró carpetas, obras y usuarios de prueba; su consulta dio las 8
  filas en 0. Confirmado con lecturas el 2026-10-31: 6 tablas del portal, objetos del
  bucket y usuarios `+portal-*` en 0; `leads` (3) y `clics_venta` (0) sin cambios.
- **Incidente en desarrollo (no es del código):** con la PC sin memoria (644 MB libres de
  8 GB) y el servidor encendido desde la mañana, se cayó el proceso auxiliar de Next que
  prepara `/portal/obras/[id]` ("Jest worker encountered 2 child process exceptions"):
  fallaban igual la obra de A, la de B y un id inexistente, antes de leer datos. Se
  resolvió reiniciando `npm run dev`.
- **Portal encendido (2026-10-31), verificado con lecturas en `roca-fuerte-web.vercel.app`:**
  `/` 200 con `noindex, nofollow` (metadata y `X-Robots-Tag`), "Acceso clientes" y "Para
  inversionistas" visibles; `/portal` 200 con `noindex, nofollow` y el formulario del
  código; `/esparta/ficha` 404. Canonical: `https://constructorarocafuerte.com`.
- **Autor de los commits: la cuenta chucospanes** (`git config` local del repo, ver
  DECISIONES.md). Vercel bloqueó `2148a9b` por el autor; se destrabó con el commit vacío
  `28f4d44`. `Co-Authored-By` no bloquea: `8aa05e0` se desplegó (Ready).
- **Vercel en plan Hobby mientras `site.lanzado` sea `false`;** se pasa a Pro antes de
  encender el lanzamiento (decisión del 2026-10-31, en la lista de verificación del README).
- **Plantilla SQL de obra nueva reescrita** (bloque `datos` único, candados de `<`, correo
  y obra repetida, material y documento opcionales). **Probada** (2026-10-31): el usuario corrió
  `supabase/pruebas/004_plantilla_obra_nueva.sql` en el SQL Editor y dio "PRUEBA SUPERADA"
  en los 5 casos (datos completos, `<` olvidado, correo inexistente, obra repetida y
  opcionales en `null`), todo revertido. Confirmado con lecturas: las 6 tablas del portal en
  0, ningún usuario `prueba-plantilla` ni `@ejemplo.invalid` en Auth; `leads` (3) y
  `clics_venta` (0) sin cambios. Falta usarla con la primera obra real (y la plantilla de
  avance nuevo sigue con el formato anterior).
- **Antes de cargar la obra del primer cliente:** aviso de privacidad con los datos del
  portal (contratos y documentos) y decidir Supabase Pro.
- Las cuentas de quienes pidieron la ficha premium también están en Supabase Auth: pueden
  pedir el código en `/portal` y ven "Este correo no tiene obras asignadas" (no ven datos).

## Hecho
- **Cambio de nombre a Casa Modelo Esparta** (en `main`). Nombre nuevo en textos, metadata, imagen
  Open Graph, schema.org, mensajes de WhatsApp y docs (DECISIONES.md conserva las entradas
  viejas y el nombre anterior). Ruta `/esparta/ficha` sin redirección; `proxy.ts`, `robots.txt` y la lista
  cerrada de `/descargas` actualizados. `src/content/esparta.ts`. Plano en lote de
  5 × 20 m y fachada con pretil con nombres de archivo nuevos; archivos del nombre anterior y
  su script generador viejo borrados. `assets/og-fachada.png` recortado de la
  fachada nueva. "La casa" y la ficha premium muestran el lote, el pretil, el desagüe
  tras el pretil y los acabados. Lint, typecheck y build pasan; en el build de producción
  la landing, las imágenes nuevas y la imagen Open Graph responden 200 y las rutas viejas
  404; capturas a 390 px de "La casa" revisadas. El usuario confirmó que el lote de
  5 × 20 m es el real (segregado de un terreno de 10 × 20 m en dos lotes).
  "La casa" muestra el plano de la casa sola (`plano-casa-esparta-v4`), el del lote y la
  fachada, los tres ampliables; en escritorio, casa y fachada arriba y el lote a todo el
  ancho abajo. El PDF de la casa está en la lista cerrada de `/descargas` y en la ficha
  premium.
- **Fase 6 (cerrada en `v1.0.0`):**
  - Interruptor de lanzamiento `site.lanzado` (apagado; solo se enciende con un commit).
    Verificado en el build de producción en los dos estados (el encendido con un build
    temporal, sin commit): apagado, las 9 rutas probadas (páginas, `robots.txt`,
    `sitemap.xml`, imagen Open Graph, descargas, 404 y `POST /api/clic`) responden con
    `X-Robots-Tag: noindex, nofollow`, la landing y `/privacidad` llevan
    `<meta name="robots" content="noindex, nofollow">`, `robots.txt` permite el acceso
    sin sitemap y el sitemap va vacío; encendido, nada de eso y `robots.txt` con el
    sitemap (landing y `/privacidad`).
  - Página `/privacidad`: lee `docs/AVISO_PRIVACIDAD.md` al compilar, con aviso visible de
    borrador pendiente de revisión legal y los `[PENDIENTE: …]` con sello. Enlazada desde
    el pie y desde el paso 1 del desbloqueo. Revisada con capturas a 360 y 390 px, sin
    desborde horizontal.
  - README con desarrollo local, Supabase (migraciones y Auth → URL Configuration), Vercel
    Pro, DNS en Namecheap, interruptor y lista de verificación previa al lanzamiento.
- **Fase 5 (cerrada, `v0.5.0`):** migración `002_clics_venta.sql` aplicada por el usuario desde el
  SQL Editor (2026-10-24); él verificó RLS activo y la vista con `security_invoker`.
  Verificado con lecturas: con la clave secreta, `clics_venta` (9 columnas) y
  `clics_venta_resumen` existen y están vacías; con la publishable, la tabla y la vista
  responden 401 (`permission denied` en la vista). Bloqueo de escritura comprobado por el
  usuario en el SQL Editor con rol `anon` dentro de una transacción con `rollback`:
  `ERROR 42501 permission denied for table clics_venta`.
- Fase 5, implementado y verificado:
  - **SEO:** metadata con descripción, canonical, Open Graph y Twitter; imagen
    `opengraph-image.tsx` (fachada + modelo + marca, 1200×630); `robots.txt` (excluye
    `/esparta/ficha`, `/descargas/`, `/api/`); `sitemap.xml` (solo la landing); schema.org
    `HomeAndConstructionBusiness` solo con datos confirmados (teléfono y redes se agregan
    solos cuando sean reales). Verificado en el build de producción.
  - **Conteo de clics de venta:** `data-venta`/`data-ubicacion` en los 8 botones de
    WhatsApp; el script en línea cuenta el clic (aunque React no haya cargado) y agrega
    "(Ref: fuente · campaña)" al mensaje si hay UTM; `POST /api/clic` valida Origin,
    Sec-Fetch-Site, tamaño y zod. Probado con número ficticio temporal (sin commit) y todo
    el tráfico interceptado: 9 comprobaciones en navegador + 7 rechazos de peticiones
    inválidas; `clics_venta` siguió en 0 filas. **Falta la prueba real** con el número de
    WhatsApp definitivo.
  - **Lighthouse 13.5.0** (móvil, build de producción en el puerto 3100): Performance
    79–85 (mediana 82), Accesibilidad 100, Buenas prácticas 100, SEO 100. LCP 2.9–3.2 s
    (párrafo del hero), CLS 0, peso 288 KB. La primera corrida tras arrancar el servidor
    sale siempre baja (arranque en frío) y la máquina mete ruido: se toman varias.
  - Contraste corregido (gris `piedra-500` → `piedra-600` en fondos claros, `piedra-300`
    en el pie, verde del botón flotante `#1c8147`) y objetivos táctiles de al menos 44 px.
    Sin desborde horizontal a 360, 390 y 412 px.
  - **Salto de diseño por fuentes corregido:** Archivo (títulos) con `display: "optional"`.
    Medido con red lenta (400 ms, ~400 kbps) y caché vacía, 6 cargas por variante: con
    `swap` las 6 dieron CLS 0.292 (el titular del hero cambia de alto al llegar Archivo);
    con `optional`, CLS 0 en las 6. Contrapartida: en la primera visita lenta los títulos
    salen con la fuente del sistema.
  - **Imagen Open Graph con Archivo** (Bold y ExtraBold, TTF estáticos del repositorio
    oficial Omnibus-Type/Archivo en `assets/fonts/`, con `OFL.txt`: SIL OFL 1.1). Excluidos
    de la traza de `/descargas`.
  - **Lighthouse tras los cambios** (3 corridas): Performance 83/83/93, el resto 100.
    LCP 2.9 s en las tres (sin cambio: el LCP es el párrafo del hero, en Source Sans 3, no
    en Archivo), CLS 0, peso 288 KB. El Speed Index varió de 2.4 a 18.8 s por la carga de
    la máquina (las corridas 1 y 2 tardaron 9–13 s en cargar en localhost).
- Repositorio en GitHub (`origin` = `chucospanes/roca-fuerte-web`); push al cerrar cada fase.
- Proyecto de Supabase `roca-fuerte-web` (East US) creado; claves en `.env.local`.
- Migración `001_leads.sql` aplicada por el usuario desde el SQL Editor de Supabase
  (2026-10-23) y verificada: RLS activo y los dos triggers creados.
- Fase 4 en curso (rama `feat/fase-4-leads`): dependencias instaladas
  (`@supabase/supabase-js` 2.117.3, `@supabase/ssr` 0.12.7, `zod` 4.6.7).
  - `src/lib/supabase/`: `navegador.ts` (publishable, pide y verifica el código),
    `servidor.ts` (sesión en cookies + `sesionVerificada()` con `getClaims()`), `admin.ts`
    (clave secreta, `server-only`), `tipos.ts` (tipos de `leads`), `entorno.ts`.
  - `src/proxy.ts`: renueva la sesión solo en `/esparta/ficha` y `/descargas`; la landing
    sigue estática.
  - `src/lib/validacion.ts`: esquemas zod de desbloqueo, código, registro (sin correo: sale
    de la sesión) y calificación. Probados con 23 casos.
  - Verificado contra Supabase: la clave secreta lee `leads`; la publishable no puede leer
    (401) ni insertar (42501).
  - Botones de venta ("Quiero esta casa", "Construir Esparta en mi terreno") en hero,
    precios y contacto: WhatsApp directo con mensaje por opción (`BotonWhatsApp`,
    `mensajesVenta`). La sección Contacto ya no tiene formulario.
  - Server Actions `registrarLead` y `calificarLead` (`src/app/acciones.ts`) sobre la capa
    `src/lib/leads.ts`. Lógica de base probada contra Supabase con un registro de prueba
    (borrado): upsert sin duplicados, UTM de primer contacto intacto, "comprar" borra datos
    del terreno, checks rechazan valores fuera de lista.
  - `site.accesoPremium`: apagado; en desarrollo se prueba con `NEXT_PUBLIC_ACCESO_PREMIUM=1`,
    en producción solo se activa cambiando el código.
  - Página `/esparta/ficha` (`src/components/premium/`): sin sesión, paso 1 con código;
    con sesión y registro, contenido premium (PDF, ficha técnica, materiales con marca y
    cantidad, qué incluye el precio; lo pendiente como "Próximamente") + paso 2 precargado
    + cerrar sesión. Lee la sesión dentro de `<Suspense>`; `noindex`.
  - Ruta `/descargas/[archivo]`: lista cerrada de 2 PDF leídos de `assets/`, exige sesión
    verificada y registro; `Cache-Control: private, no-store`. Solo esos 2 PDF entran en
    el despliegue de la ruta (verificado en la traza del build).
  - Captura de UTM y referrer externo de la primera visita en `localStorage` con un
    script en línea en el layout (`SCRIPT_CAPTURA_ORIGEN` en `src/lib/origen.ts`), que
    corre al leer el HTML, sin esperar a React; se envía con `registrarLead`.
  - SMTP de Resend configurado por el usuario (dominio verificado), plantillas con el
    código y Email OTP Length = 6 / Expiration = 600. Todo lo que vive fuera del repo
    está en `docs/CONFIGURACION_EXTERNA.md`.
  - **Prueba de punta a punta exitosa (2026-10-24, la hizo el usuario):** el código
    desbloqueó la ficha. Verificado con lecturas: usuario en Supabase Auth con correo
    confirmado; una fila en `leads` con `user_id` y correo que coinciden, correo en
    minúsculas, WhatsApp en E.164, fechas de aviso y verificación, `estado = 'nuevo'`.
    Sin UTM (no se entró con parámetros) y sin calificación (paso 2 no enviado).
  - El código acepta 6 a 8 dígitos (la causa del primer fallo fue Email OTP Length = 8).
  - Sin doble envío (`useEnvioUnico`): los botones de enviar del paso 1, del código y del
    paso 2 se desactivan y muestran "Enviando…" desde el primer toque; si el envío sale
    bien no se reactivan mientras carga lo siguiente. "Pedir otro código" también se
    bloquea. Si la red falla en una Server Action, se avisa y se ofrece WhatsApp. Probado
    en el navegador con todo el tráfico a Supabase interceptado (paso 1 y código; el
    paso 2 usa el mismo mecanismo pero requiere sesión real).
  - Corregido: con sesión, `/esparta/ficha` daba en desarrollo el error "Next.js
    encountered the unstable value `Date.now()` while prerendering" (supabase-js compara
    el vencimiento de la sesión con la hora). `AreaPremium` llama a `connection()` antes
    de leer la sesión. Reproducido con una cookie de sesión ficticia: sin la corrección
    aparece, con ella no.
  - Verificado con lecturas (2026-10-24): la fila de la prueba tiene la calificación
    (construir, La Libertad, "Municipio o distrito" lleno) en un solo registro.
  - Prueba de UTM del usuario (alias `+prueba1`, 08:17 UTC): la fila se creó bien pero
    **sin UTM**. Diagnóstico: el formulario y el servidor procesan bien el UTM (verificado
    con el tráfico interceptado), pero se capturaba solo después de hidratar (~6 s en
    desarrollo); al tocar "Ver la ficha técnica" antes, se perdía. Corregido con el
    script en línea: ahora queda guardado al ~1 s, antes de hidratar. Prueba real repetida
    con `+prueba2` tocando el enlace de inmediato: la fila tiene `utm_source = prueba` y
    `utm_campaign = e2e` (verificado con lecturas).
  - El usuario confirmó que los dos PDF se descargan y abren bien.
- Next.js 16.4.3 + TypeScript + Tailwind 4 (Fase 1, `v0.1.0`).
- `src/config/site.ts`: marca (único lugar), URL, WhatsApp placeholder, precios PENDIENTE,
  condiciones de construcción en terreno del cliente, redes PENDIENTE, `textoPrecio()`.
- `src/content/esparta.ts`: áreas, ambientes, muros, plano y tabla de materiales
  (PENDIENTE salvo el bloque, cuyo espesor viene del plano). Las áreas cuadran: suma de
  ambientes = 38.07 m² útiles; 8×5 + 1.5×2.4 = 43.60 m² construidos.
- `src/content/bitacora.ts`: 7 etapas; Terreno y trazo en proceso, el resto pendientes.
- `.env.example` con `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` (solo servidor).
- Fase 3: componentes en `src/components/`, textos generales en `src/content/landing.ts`
  (FAQ con respuestas PENDIENTE), utilidades `src/lib/whatsapp.ts` y `src/lib/video.ts`.
  Revisado con capturas a 390 px (móvil) y 1280 px: sin desborde horizontal; plano
  ampliable verificado abriéndose.
- Plano y fachada corregidos para casa entre colindancias (techo a dos aguas, sin ventanas
  laterales): en `assets/` y `public/`, fachada visible y ampliable en "La casa". Los PNG
  se generaron desde los PDF (no venían los PNG corregidos en Descargas).
- `npm run typecheck` (= `next typegen && tsc --noEmit`).

## Siguiente
**Pendientes antes del lanzamiento** (`site.lanzado = true`; lista completa en el README,
sección 6):
1. Prueba real del conteo de clics: el número real (`+503 7821-6321`) ya está en
   `site.whatsapp` (2026-10-31); falta el clic del usuario desde su celular y la
   verificación con lecturas en `clics_venta`.
2. Precio "desde" de construir en tu terreno en `site.precios`; el precio de cada casa a la
   venta va en su fila de `casas_venta`.
3. Aviso de privacidad revisado por un abogado (razón social, domicilio, correo y plazo de
   conservación), incluidos los datos del portal (contratos y documentos); al aprobarlo,
   quitar el aviso de "borrador" de `/privacidad`.
4. Decidir qué PENDIENTE se aceptan visibles el día del lanzamiento (redes, preguntas
   frecuentes, video del hero, materiales, profesional que firma).
5. Publicar los primeros videos de materiales y refuerzo (lo promete el hero).
6. Borrar los datos de prueba (`leads` y luego sus usuarios de Auth; lo hace el usuario) y
   verificar con lecturas.
7. Vercel en plan Pro.
8. DMARC y límites de envío anotados en `CONFIGURACION_EXTERNA.md`; vista previa del enlace
   en WhatsApp y en el Sharing Debugger de Facebook; Lighthouse sobre el dominio.
9. Commit con `site.lanzado = true`, comprobar que no queda `noindex` y que `robots.txt`
   trae el sitemap, y dar de alta el dominio en Google Search Console.

**Antes de cargar la obra del primer cliente en el portal:** aviso de privacidad con los
datos del portal y decidir Supabase Pro (un proyecto gratuito pausado deja a los clientes
sin portal).

**Después del lanzamiento:**
- **LCP: se revisa después del lanzamiento con datos reales** (decisión del usuario,
   2026-10-24). En Lighthouse queda en 2.9 s (el párrafo del hero, en Source Sans 3); si
   los datos de campo (Vercel Speed Insights o Search Console) lo confirman, las vías son
   la fuente del texto y el JavaScript inicial.

## Notas técnicas abiertas
- Revisar en Fase 4 `cacheComponents`/`partialPrefetching` frente al Server Action y la
  lectura de UTM/referrer/IP (ver DECISIONES.md).
- `npm ls` marca 6 paquetes wasm opcionales como "extraneous"; están en el lockfile y
  `npm prune` no los toca. Aviso conocido, inofensivo.
- npm marca ESLint 9.39.5 como "no longer supported" (lo fija `eslint-config-next`).
- El registry de npm responde muy lento en esta red.
- Los videos embebidos (`VideoLazy` + `lib/video.ts`) no se han probado con URLs reales:
  todavía no hay videos publicados. Probar con el primer video de la obra.
- `next/image` guarda en caché las imágenes optimizadas por URL: al reemplazar un PNG de
  `public/` con el mismo nombre, en desarrollo se sigue viendo el viejo hasta borrar
  `.next/dev/cache/images`. No verificado si en Vercel se invalida solo al desplegar; si
  no, cambiar el nombre del archivo cuando cambie el plano.
- Las plantillas de correo de Supabase llevan el nombre de la marca escrito a mano (viven en
  el panel de Supabase, fuera del repo): si cambia la marca, cambiarlas también.
- Revisar en celular con `npm run dev`: la IP de la PC cambia con la red; usar la URL
  "Network" que imprime el servidor.

## Bloqueos y pendientes del usuario
- Retiros por confirmar con OPAMSS o la alcaldía (nota del plano).
- Supabase Pro: decidir antes de dar acceso al portal al primer cliente (un proyecto
  gratuito pausado deja a los clientes sin portal).
- Canal detrás del pretil: detalle de impermeabilización, pendiente y rebosadero.
- **Supabase Pro: se evalúa al activar el acceso premium.** Por ahora plan gratuito; los
  proyectos gratuitos se pausan tras ~1 semana sin actividad (fuentes de terceros).
- Lanzamiento (`site.lanzado = true`): solo con la lista de verificación del README
  cumplida.
- **Bloqueos para activar `site.accesoPremium` en producción** (los dos son obligatorios):
  - La ficha técnica completa y las cantidades de materiales tienen datos reales.
  - Cloudflare Turnstile (captcha) puesto en el paso 1 del desbloqueo.
- Revisión legal del aviso de privacidad (`docs/AVISO_PRIVACIDAD.md`) y datos del
  responsable: razón social, correo de contacto y plazo de conservación.
- Precio "desde" de construir en tu terreno → `site.precios`.
- URLs de redes sociales → `site.redes`.
- Especificaciones y marcas de materiales → `esparta.materiales`.
- Fecha de inicio y avance de "Terreno y trazo" → `bitacora.ts`.
- Respuestas de preguntas frecuentes → `src/content/landing.ts`.
- Casas a la venta (ubicación, lote, precio y qué incluye de cada una) → `casas_venta`, con
  `docs/GUIA_CARGA_CASAS.md`. Pasaron aquí los pendientes 1, 3, 4 y 5 del inventario.
- Video o foto principal para el hero.
- Confirmar con el ingeniero responsable la referencia RTS 91.01.02:21; nombre y registro
  del profesional que firma el plano → `calidad` en `src/content/landing.ts`.
- Confirmar con quien tramite el permiso de construcción que los muros de colindancia y el
  corredor hasta el lindero cumplen la normativa.
- Diseño estructural de la columna del corredor y ficha de la lámina (pendiente mínima).
- Pasar Vercel a plan Pro antes del lanzamiento (README, sección 3).
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
