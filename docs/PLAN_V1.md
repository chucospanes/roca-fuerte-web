# Plan v1 — Landing Casa Modelo Esparta

## Objetivo
Landing de una sola página, mobile-first, que vende la Casa Esparta en construcción y el
servicio de construir el modelo en el terreno del cliente. Los botones de venta llevan
directo a WhatsApp, sin pedir datos; los prospectos que piden el contenido premium quedan
registrados en Supabase. La landing es 100 % pública; solo el contenido premium
(PDF de plano y fachada, ficha técnica completa, cantidades de materiales, desglose del
precio) se desbloquea con correo validado por código.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS, versiones estables actuales.
- Supabase: Postgres (una sola tabla `leads`), Auth sin contraseñas (código de 6 dígitos
  por correo, OTP) y Storage privado para los PDF.
- Despliegue en Vercel. Dominio `constructorarocafuerte.com` (registrado en Namecheap).

## Inicialización
El repo ya contiene `CLAUDE.md`, `docs/`, `assets/` y `.gitignore`. Si `create-next-app`
rechaza el directorio por no estar vacío, genera el proyecto en una carpeta temporal y
mueve los archivos al repo sin sobrescribir `CLAUDE.md`, `docs/`, `assets/` ni `.gitignore`
(fusiona las reglas de `.gitignore`). Copia `assets/plano-esparta.png` a `public/plano-esparta.png`.

## Configuración editable — `src/config/site.ts`
- Nombre de marca (por ahora "Roca Fuerte"; único lugar donde aparece).
- Número de WhatsApp en formato internacional (placeholder `50300000000`).
- Precio "desde" de "Quiero esta casa" y "Construir en tu terreno" (placeholder `PENDIENTE`;
  si es PENDIENTE se muestra "Precio próximamente").
- Condiciones del precio de construcción en terreno del cliente: terreno plano, escriturado,
  con acceso vehicular y servicios cercanos; extras cotizados aparte.
- URLs de redes sociales (placeholders).

## Contenido del modelo — `src/content/esparta.ts`
- Datos de `docs/CONTEXTO.md` (ambientes, medidas, áreas 43.60 m² / 38.07 m², muros).
- Especificaciones de materiales como array editable: material, especificación, marca,
  por qué. Valores `PENDIENTE`.

## Bitácora de obra — `src/content/bitacora.ts`
Array de etapas con: id, título, fecha, estado (pendiente / en proceso / terminada),
descripción, materiales usados, porcentaje de avance y videos (URL de YouTube, TikTok o
Instagram). Etapas iniciales: Terreno y trazo (en proceso), Fundaciones, Paredes, Techo,
Instalaciones eléctricas e hidráulicas, Acabados, Entrega (pendientes).

## Secciones de la landing
1. **Hero:** titular sobre construcción honesta y transparente; subtítulo "Casa Modelo
   Esparta · 2 dormitorios · 43.60 m²"; botones "Quiero esta casa" y "Construir Esparta en
   mi terreno"; espacio para video o foto principal (placeholder).
2. **Por qué construimos así:** 3–4 puntos de transparencia (cada material mostrado en
   video, cada etapa documentada, sin sorpresas en el precio).
3. **La Casa Esparta:** plano ampliable al tocarlo, cuadro de áreas y lista de ambientes.
4. **Materiales y especificaciones:** tabla desde `esparta.ts`.
5. **Bitácora de obra:** línea de tiempo con estado, avance y videos embebidos que cargan
   solo al hacer clic.
6. **Dos formas de tener tu Esparta:** tarjetas "Comprar esta casa" vs "Construir en tu
   terreno" con precio "desde", qué incluye y condiciones.
7. **Cómo trabajamos:** contacto → evaluación del terreno → cotización cerrada → contrato →
   construcción documentada → entrega.
8. **Preguntas frecuentes:** financiamiento (contado, FSV, banco), clientes en el exterior,
   tiempos, garantía, permisos. Respuestas `PENDIENTE` para que el usuario las complete.
9. **Contacto:** botones "Quiero esta casa" y "Construir Esparta en mi terreno" que abren
   WhatsApp directo con un mensaje distinto para cada opción, y acceso a la ficha técnica
   (contenido premium) cuando `site.accesoPremium` esté activo.
10. **Footer:** contacto, redes y aviso de privacidad.

## Botones de venta: WhatsApp directo
"Quiero esta casa" y "Construir Esparta en mi terreno" (hero, tarjetas de precios y
contacto) **no piden correo ni código**: abren `wa.me` con un mensaje prellenado distinto
según la opción. El correo con código es solo para el contenido premium (ver
DECISIONES.md). Mientras `site.whatsapp` sea el número de prueba, los botones no envían a
nadie a un número inexistente.

## Acceso con correo a contenido premium
La landing sigue 100 % pública, incluidos el plano y la fachada ampliables (PNG en
`public/`). Con correo validado se desbloquea, en la página `/esparta/ficha`:
- PDF imprimibles de plano y fachada, servidos por `/descargas/[archivo]` desde una
  carpeta privada del repo (no `public/`); la ruta verifica la sesión antes de entregarlos.
- Ficha técnica.
- Cantidades de materiales; la marca sigue pública en la landing (requiere `cantidad` en `Material` en
  `esparta.ts`).
- Desglose de qué incluye el precio. Las tarjetas públicas de "Dos formas de tener tu casa"
  conservan el resumen.

Mientras un dato siga en `PENDIENTE`, dentro del área desbloqueada se muestra como
"Próximamente". El interruptor `site.accesoPremium` (apagado por defecto) controla si la
landing enlaza la página; apagado, `/esparta/ficha` responde 404. **No se activa en
producción** hasta que la ficha técnica y la lista de materiales tengan datos reales y
esté puesto el captcha (ver ESTADO.md).

### Paso 1, desbloqueo
1. Formulario: nombre*, WhatsApp con código de país*, correo*, aceptación del aviso de
   privacidad* y campo trampa (honeypot). Validación con zod en cliente y servidor.
2. El navegador pide el código con `signInWithOtp` (clave publishable). Se pide desde el
   navegador para que los límites por IP de Supabase sean por visitante y no por el
   servidor. La plantilla de correo "Magic Link" de Supabase debe incluir `{{ .Token }}`.
3. La persona escribe el código de 6 dígitos en la misma pestaña; `verifyOtp` con
   `type: 'email'` deja la sesión en una cookie (`@supabase/ssr`). Sin enlace mágico.
4. La Server Action `registrarLead` verifica la sesión con `getClaims()`, toma el correo
   **de la sesión** y hace upsert en `leads` por correo con la clave secreta, junto con
   nombre, WhatsApp, UTM y referrer (estos dos solo en el primer registro).
5. Si Supabase falla, se registra el error en el servidor y se ofrece igual WhatsApp.

### Paso 2, calificación (opcional)
Solo con sesión verificada. Nombre, WhatsApp y correo llegan precargados desde la sesión;
actualiza el mismo registro, nunca crea otro. Campos: país de residencia (El Salvador /
Estados Unidos / Otro), interés (comprar la casa / construir en mi terreno). Solo si elige
construir: departamento y "Municipio o distrito" (texto libre) del terreno, ¿terreno escriturado a su nombre? (sí /
no / en trámite). Forma de pago (contado / FSV / crédito bancario / otro), ¿cuándo quiere
iniciar? (inmediato / 3 meses / 6 meses / más de 6 meses), comentario opcional. Al final:
confirmación y botón a `wa.me` con mensaje prellenado (nombre, interés, ubicación, forma
de pago).

### Seguridad y abuso
- El upsert y la precarga solo usan el correo de la sesión verificada, nunca uno escrito
  en un formulario. Cada Server Action y la ruta de descargas vuelven a verificar la sesión.
- Sin límite por IP propio: escribir en `leads` exige un correo verificado, y Supabase ya
  limita los envíos de código por IP y por correo. No se guarda la IP.
- Cloudflare Turnstile en el paso 1 es **obligatorio antes de activar el acceso premium en
  producción** (evita que un bot pida códigos para correos ajenos).

### Base de datos
`supabase/migrations/001_leads.sql`: una sola tabla `leads`, correo único (siempre en
minúsculas), datos del paso 1, calificación opcional del paso 2, UTM y referrer de primer
contacto (un trigger impide sobrescribirlos), `estado` (`nuevo`, `contactado`,
`calificado`, `descartado`, `cliente`), `created_at`, `updated_at`. RLS activado sin
políticas; solo el servidor escribe con la clave secreta.

### Correo
El correo integrado de Supabase solo envía a miembros del equipo del proyecto, 2 por hora,
y no es para producción. Producción: SMTP de Resend con el dominio
`constructorarocafuerte.com` (registros DNS en Namecheap).

### Dependencias (versiones exactas)
`@supabase/supabase-js` 2.117.3, `@supabase/ssr` 0.12.7, `zod` 4.6.7. La sesión se
renueva en `src/proxy.ts` (en Next 16, `middleware.ts` se llama `proxy.ts`). La página
premium lee la sesión dentro de `<Suspense>` por `cacheComponents`.

## Diseño
- Sobrio, sólido y confiable: tonos concreto, gris cálido, acento terracota y blanco.
  Tipografía clara. Nada que parezca plantilla genérica.
- Mobile-first, botones grandes, botón flotante de WhatsApp siempre visible en móvil.
- Imágenes con `next/image`; carga rápida en datos móviles.

## SEO
Metadata en español, Open Graph con imagen del plano, `sitemap.xml`, `robots.txt` y datos
estructurados schema.org `HomeAndConstructionBusiness`.

## Conteo de clics en los botones de venta (agregado en la Fase 5)
Contar los clics en los botones de WhatsApp ("Quiero esta casa", "Construir Esparta en mi
terreno" y el botón flotante) junto con el UTM de primer contacto, **sin datos
personales**. Sirve para saber qué red y qué video generan conversaciones de venta, que
hoy no quedan registradas (los botones no piden datos). El diseño se aprueba antes de
implementarlo.

## Variables de entorno
`.env.example` con `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` (solo servidor; claves nuevas
de Supabase, las `anon`/`service_role` se retiran a fines de 2026).

## Fases (commit al cerrar cada una, tag de versión y actualización de ESTADO.md)
1. Inicializar Next.js y estructura de carpetas → `v0.1.0`
2. Archivos de configuración y contenido → `v0.2.0`
3. Secciones de la landing con datos de ejemplo → `v0.3.0`
4. Formulario de leads + acceso con correo a contenido premium (Supabase Auth, Storage
   privado para los PDF) + Server Actions + migraciones Supabase → `v0.4.0`
5. SEO, rendimiento, revisión en móvil y conteo anónimo de clics en los botones de venta
   → `v0.5.0`
6. README de despliegue (local, migración Supabase, Vercel, DNS desde Namecheap) → `v1.0.0`
7. Inversionistas y portal privado de clientes → entra en `v1.0.0` con el portal apagado
   (decisión del 2026-10-31; ver la sección siguiente)

## Fase 7 — Inversionistas y portal privado de clientes (en `v1.0.0`, portal apagado)
Rama `feat/inversionistas-portal`. Decisiones en DECISIONES.md (2026-10-30).

### Sección "Para inversionistas" (landing)
- Entre "Precios" y "Cómo trabajamos"; secciones renumeradas 01–10, `id="inversionistas"`.
- Posicionamiento: constructora que el inversionista contrata para SU proyecto (venta o
  renta); él aporta terreno y capital. Esparta, varias unidades o adaptaciones; permisos y
  segregación ante OPAMSS y CNR; servicios con licencia subcontratados.
- Propuesta: presupuesto cerrado por etapas, materiales con especificación visible, avance
  en video y fotos, portal privado, entrega lista para vender o rentar.
- Prohibido: rendimientos, porcentajes, plusvalía, "oportunidad de inversión", invitar a
  invertir en la empresa. Aclaración visible: servicio de construcción por contrato.
- Botón de WhatsApp `opcion="inversionista"`, `ubicacion="inversionistas"`, con referencia
  UTM. Migración `003_clics_inversionistas.sql`.
- Enlaces en el menú (con menú móvil `<details>`) y en el pie.

### Portal `/portal` (interruptor `site.portalClientes`)
- Código por correo con `shouldCreateUser: false`; mensaje neutro.
- `/portal`: inicio de sesión o lista de obras. `/portal/obras/[id]`: etapas, avances
  con fotos (URL firmada 10 min) y videos (YouTube/Vimeo incrustados con el formato oficial),
  materiales y documentos. `/portal/documentos/[id]`: URL firmada de 60 s y redirección.
- Todo se lee con la sesión del usuario; RLS de solo lectura por membresía.
- `noindex` + `X-Robots-Tag`, sin Disallow. `proxy.ts` renueva la sesión en `/portal`.
- Migración `004_portal_obras.sql`: 6 tablas, RLS, bucket privado `obras` y su política.
- Guía de carga: `docs/GUIA_CARGA_OBRAS.md`.

## Fuera de alcance en v1
Panel de administración de leads (y de obras: se cargan en el panel de Supabase), pagos en
línea, blog. El portal de clientes entra en la Fase 7 (en `v1.0.0`, apagado).
