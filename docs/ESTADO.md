# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-10-24
**Versión:** v0.3.0 — secciones de la landing

## Fase actual
**Fase 3 cerrada** (aprobada visualmente, merge a `main`, tag `v0.3.0`, push a `origin`).
Landing con 9 secciones (las 8 del plan + "Calidad y resistencia"), plano y fachada
corregidos para casa entre colindancias, encabezado, pie y botón flotante de WhatsApp.
El formulario es un espacio reservado: se hace en la Fase 4.

## Hecho
- Repositorio en GitHub (`origin` = `chucospanes/roca-fuerte-web`); push al cerrar cada fase.
- Proyecto de Supabase `roca-fuerte-web` (East US) creado; claves en `.env.local`.
- Migración `001_leads.sql` aplicada por el usuario desde el SQL Editor de Supabase
  (2026-10-23) y verificada: RLS activo y los dos triggers creados.
- Fase 4 en curso (rama `feat/fase-4-leads`): dependencias instaladas
  (`@supabase/supabase-js` 2.117.3, `@supabase/ssr` 0.12.7, `zod` 4.6.7).
  - `src/lib/supabase/`: `navegador.ts` (publishable, pide y verifica el código),
    `servidor.ts` (sesión en cookies + `sesionVerificada()` con `getClaims()`), `admin.ts`
    (clave secreta, `server-only`), `tipos.ts` (tipos de `leads`), `entorno.ts`.
  - `src/proxy.ts`: renueva la sesión solo en `/bonaire/ficha` y `/descargas`; la landing
    sigue estática.
  - `src/lib/validacion.ts`: esquemas zod de desbloqueo, código, registro (sin correo: sale
    de la sesión) y calificación. Probados con 23 casos.
  - Verificado contra Supabase: la clave secreta lee `leads`; la publishable no puede leer
    (401) ni insertar (42501).
  - Botones de venta ("Quiero esta casa", "Construir Bonaire en mi terreno") en hero,
    precios y contacto: WhatsApp directo con mensaje por opción (`BotonWhatsApp`,
    `mensajesVenta`). La sección Contacto ya no tiene formulario.
  - Server Actions `registrarLead` y `calificarLead` (`src/app/acciones.ts`) sobre la capa
    `src/lib/leads.ts`. Lógica de base probada contra Supabase con un registro de prueba
    (borrado): upsert sin duplicados, UTM de primer contacto intacto, "comprar" borra datos
    del terreno, checks rechazan valores fuera de lista.
  - `site.accesoPremium`: apagado; en desarrollo se prueba con `NEXT_PUBLIC_ACCESO_PREMIUM=1`,
    en producción solo se activa cambiando el código.
  - Página `/bonaire/ficha` (`src/components/premium/`): sin sesión, paso 1 con código;
    con sesión y registro, contenido premium (PDF, ficha técnica, materiales con marca y
    cantidad, qué incluye el precio; lo pendiente como "Próximamente") + paso 2 precargado
    + cerrar sesión. Lee la sesión dentro de `<Suspense>`; `noindex`.
  - Ruta `/descargas/[archivo]`: lista cerrada de 2 PDF leídos de `assets/`, exige sesión
    verificada y registro; `Cache-Control: private, no-store`. Solo esos 2 PDF entran en
    el despliegue de la ruta (verificado en la traza del build).
  - Captura de UTM y referrer externo de la primera visita en `localStorage`
    (`src/lib/origen.ts`, `CapturaOrigen` en el layout); se envía con `registrarLead`.
- Next.js 16.4.3 + TypeScript + Tailwind 4 (Fase 1, `v0.1.0`).
- `src/config/site.ts`: marca (único lugar), URL, WhatsApp placeholder, precios PENDIENTE,
  condiciones de construcción en terreno del cliente, redes PENDIENTE, `textoPrecio()`.
- `src/content/bonaire.ts`: áreas, ambientes, muros, plano y tabla de materiales
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
1. **Bloqueo actual: SMTP propio.** Sin él no se pueden editar las plantillas de correo (plan
   gratuito, proyecto creado después de junio de 2026) y el correo no lleva el código.
   El usuario configura Resend: dominio `constructorarocafuerte.com` verificado (DNS en
   Namecheap) → SMTP en Supabase → plantillas "Magic link" y "Confirm signup" con
   `{{ .Token }}` (texto en `docs/PLANTILLA_CORREO_CODIGO.md`).
2. Prueba de punta a punta: la hace el usuario en el navegador con su correo (dueño del
   proyecto en Supabase). Después, Claude verifica **solo con lecturas** el usuario en
   Supabase Auth y el registro en `leads`. No se borra nada: lo borra el usuario.
3. Cerrar la Fase 4 (`v0.4.0`) con el acceso premium apagado en producción.

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
- **Bloqueos para activar `site.accesoPremium` en producción** (los dos son obligatorios):
  - La ficha técnica completa y las cantidades de materiales tienen datos reales.
  - Cloudflare Turnstile (captcha) puesto en el paso 1 del desbloqueo.
- Revisión legal del aviso de privacidad (`docs/AVISO_PRIVACIDAD.md`) y datos del
  responsable: razón social, correo de contacto y plazo de conservación.
- Precios "desde" → `site.precios`.
- Número de WhatsApp Business → `site.whatsapp`.
- URLs de redes sociales → `site.redes`.
- Especificaciones y marcas de materiales → `bonaire.materiales`.
- Fecha de inicio y avance de "Terreno y trazo" → `bitacora.ts`.
- Respuestas de preguntas frecuentes → `src/content/landing.ts`.
- Ubicación del terreno y detalle de lo incluido en "Comprar esta casa".
- Video o foto principal para el hero.
- Confirmar con el ingeniero responsable la referencia RTS 91.01.02:21; nombre y registro
  del profesional que firma el plano → `calidad` en `src/content/landing.ts`.
- Confirmar con quien tramite el permiso de construcción que los muros de colindancia y el
  corredor hasta el lindero cumplen la normativa.
- Diseño estructural de la columna del corredor y ficha de la lámina (pendiente mínima).
- Conectar el repo de GitHub a Vercel.
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
