# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-10-30
**Versión:** v0.5.0 — SEO, rendimiento y conteo de clics de venta

## Fase actual
**Fase 7 (`v1.1.0`) en curso** (rama `feat/inversionistas-portal`): sección "Para
inversionistas" y portal privado de clientes. Plan aprobado el 2026-10-30 con ajustes
(ver DECISIONES.md). Las migraciones 003 y 004 las aplica el usuario; Claude verifica con
lecturas.

- **Hecho (sin aplicar en Supabase):**
  - Sección "Para inversionistas" (07), menú en el celular con `<details>`, enlaces en el
    pie, botón de WhatsApp `inversionista`/`inversionistas`. Revisada a 390 px.
  - `003_clics_inversionistas.sql`: falta que el usuario confirme el nombre de los CHECK
    (consulta en el encabezado del archivo) antes de aplicarla. Hasta entonces, un clic de
    inversionista que llegue a `/api/clic` falla al insertar (se registra en el log, el
    visitante no lo nota); hoy no pasa porque el WhatsApp es el número de prueba.
  - Portal `/portal` (`site.portalClientes`, apagado): acceso con código sin crear
    cuentas, lista de obras, `/portal/obras/[id]` (etapas, avances con fotos firmadas de
    10 min y videos de YouTube/Vimeo armados desde el id, materiales, documentos) y
    `/portal/documentos/[id]` (URL firmada de 60 s y redirección 303).
  - `004_portal_obras.sql` (6 tablas, RLS, bucket `obras`), prueba
    `supabase/pruebas/004_aislamiento_portal.sql` y `docs/GUIA_CARGA_OBRAS.md`.
  - Verificado: lint, typecheck y build; 21 casos del analizador de videos (8 válidos, 13
    rechazados, incluidos dominios falsos e inyección); con el portal apagado, `/portal`,
    `/portal/obras/[id]` y `/portal/documentos/[id]` responden 404 y "Acceso clientes" no
    aparece; `X-Robots-Tag: noindex` en `/portal` también con el sitio lanzado (build
    temporal, sin commit) y sin Disallow en robots.
  - Verificado en `npm run dev` con `NEXT_PUBLIC_PORTAL_CLIENTES=1` en `.env.local`, a 390 px
    (2026-10-30): el menú móvil abre con un toque, muestra los 8 enlaces (con "Acceso
    clientes") y se cierra al tocar uno; `/portal` sin sesión muestra el acceso con código y
    lleva `noindex`; `/portal/obras/[id]` sin sesión vuelve a `/portal`; sin desborde
    horizontal. **Sin verificar:** todo lo que lee Supabase (requiere la 004).
  - Pregunta frecuente de permisos respondida; el mismo texto (`textoPermisos`) va en la
    sección de inversionistas.
- **Siguiente en la Fase 7:**
  1. Consulta de solo lectura del usuario (2026-10-30): PostgreSQL 17.11, CHECK
     `clics_venta_opcion_check` y `clics_venta_ubicacion_check` (coinciden con la 003 y con
     `OPCIONES_VENTA`/`UBICACIONES_VENTA`), sin triggers en `auth.users`. Falta aplicar 003
     y 004 → Claude verifica con lecturas.
  2. Usuario: revisar y aplicar 004 → Claude verifica con lecturas (publishable sin
     sesión: 401 o vacío en las 6 tablas; bucket privado).
  3. Usuario: correr la prueba de aislamiento en el SQL Editor (debe terminar con
     "PRUEBA SUPERADA"; no guarda nada).
  4. Con aprobación: prueba de punta a punta con dos cuentas de prueba (alias +a y +b),
     una obra y una foto en cada una; se borra todo al terminar.
  5. Agregar al aviso de privacidad los datos del portal (contratos y documentos).
  6. Merge, tag `v1.1.0` y push.

**Fase 6 en curso** (`feat/fase-6-despliegue` ya está en `main` y en `origin`, sin tag): despliegue en Vercel Pro, interruptor
de lanzamiento, página `/privacidad` y README de despliegue. `v1.0.0` se pone cuando el
sitio esté desplegado y verificado en el dominio con el interruptor apagado; el lanzamiento
va en un commit aparte. Fase 5 cerrada en `v0.5.0`; acceso premium apagado en producción.

## Hecho
- **Cambio de nombre a Casa Modelo Esparta (rama `feat/modelo-esparta`, sin merge: el
  usuario la revisa en el navegador).** Nombre nuevo en textos, metadata, imagen
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
  "La casa" muestra el plano de la casa sola (`plano-casa-esparta`), el del lote y la
  fachada, los tres ampliables; en escritorio, casa y fachada arriba y el lote a todo el
  ancho abajo. El PDF de la casa está en la lista cerrada de `/descargas` y en la ficha
  premium.
- **Fase 6 (en curso):**
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
1. Fase 6: el usuario crea el proyecto en Vercel Pro, carga las variables, configura Auth →
   URL Configuration y el DNS en Namecheap (README, secciones 2–4). Claude verifica con
   lecturas (`nslookup`, `curl`) y, si todo está bien, merge, tag `v1.0.0` y push.
2. Cuando haya número de WhatsApp real: prueba real del conteo (un clic del usuario,
   verificación con lecturas en `clics_venta`).
3. En Vercel, `NEXT_PUBLIC_SITE_URL` debe ser el dominio: canonical, Open Graph, sitemap y
   schema.org toman la URL de ahí (en local salen con `localhost:3000`).
4. **LCP: se revisa después del lanzamiento con datos reales** (decisión del usuario,
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
- Revisar `feat/modelo-esparta` en el navegador y aprobar el merge.
- Retiros por confirmar con OPAMSS o la alcaldía (nota del plano).
- Supabase Pro: decidir antes de dar acceso al portal al primer cliente (un proyecto
  gratuito pausado deja a los clientes sin portal).
- **Reemplazar el plano de la casa** por la versión cuya nota del techo menciona el pretil
  (`Casa_Modelo_Esparta_plano_v2`; no llegó a Descargas el 2026-10-29). Guardarla con
  nombre nuevo (`plano-casa-esparta-v2.png/.pdf`), actualizar referencias y la lista cerrada
  de `/descargas`, y borrar los `plano-casa-esparta` actuales. La nota actual dice "agua al
  frente y al fondo" sin mencionar el pretil.
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
- Precios "desde" → `site.precios`.
- Número de WhatsApp Business → `site.whatsapp`.
- URLs de redes sociales → `site.redes`.
- Especificaciones y marcas de materiales → `esparta.materiales`.
- Fecha de inicio y avance de "Terreno y trazo" → `bitacora.ts`.
- Respuestas de preguntas frecuentes → `src/content/landing.ts`.
- Ubicación del terreno y detalle de lo incluido en "Comprar esta casa".
- Video o foto principal para el hero.
- Confirmar con el ingeniero responsable la referencia RTS 91.01.02:21; nombre y registro
  del profesional que firma el plano → `calidad` en `src/content/landing.ts`.
- Confirmar con quien tramite el permiso de construcción que los muros de colindancia y el
  corredor hasta el lindero cumplen la normativa.
- Diseño estructural de la columna del corredor y ficha de la lámina (pendiente mínima).
- Conectar el repo de GitHub a Vercel Pro (README, sección 3).
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
