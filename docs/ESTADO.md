# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-10-23
**Versión:** v0.2.0 — configuración y contenido

## Fase actual
**Fase 3 en revisión visual del usuario** (rama `feat/fase-3-landing`, sin merge ni tag).
Landing con 9 secciones (las 8 del plan + "Calidad y resistencia") + encabezado, pie y botón flotante de
WhatsApp. El formulario es un espacio reservado: se hace en la Fase 4.
Al aprobarse: merge a `main`, tag `v0.3.0`, `git push origin main --tags`.

## Hecho
- Repositorio en GitHub (`origin` = `chucospanes/roca-fuerte-web`); push al cerrar cada fase.
- Next.js 16.4.3 + TypeScript + Tailwind 4 (Fase 1, `v0.1.0`).
- `src/config/site.ts`: marca (único lugar), URL, WhatsApp placeholder, precios PENDIENTE,
  condiciones de construcción en terreno del cliente, redes PENDIENTE, `textoPrecio()`.
- `src/content/bonaire.ts`: áreas, ambientes, muros, plano y tabla de materiales
  (PENDIENTE salvo el bloque, cuyo espesor viene del plano). Las áreas cuadran: suma de
  ambientes = 38.07 m² útiles; 8×5 + 1.5×2.4 = 43.60 m² construidos.
- `src/content/bitacora.ts`: 7 etapas; Terreno y trazo en proceso, el resto pendientes.
- `.env.example` con `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Fase 3: componentes en `src/components/`, textos generales en `src/content/landing.ts`
  (FAQ con respuestas PENDIENTE), utilidades `src/lib/whatsapp.ts` y `src/lib/video.ts`.
  Revisado con capturas a 390 px (móvil) y 1280 px: sin desborde horizontal; plano
  ampliable verificado abriéndose.
- Plano y fachada corregidos para casa entre colindancias (techo a dos aguas, sin ventanas
  laterales): en `assets/` y `public/`, fachada visible y ampliable en "La casa". Los PNG
  se generaron desde los PDF (no venían los PNG corregidos en Descargas).
- `npm run typecheck` (= `next typegen && tsc --noEmit`).

## Siguiente
1. Aprobación visual de la Fase 3 (y ajustes que salgan de ahí).
2. Fase 4: formulario + Server Action + migración Supabase.

## Notas técnicas abiertas
- Revisar en Fase 4 `cacheComponents`/`partialPrefetching` frente al Server Action y la
  lectura de UTM/referrer/IP (ver DECISIONES.md).
- `npm ls` marca 6 paquetes wasm opcionales como "extraneous"; están en el lockfile y
  `npm prune` no los toca. Aviso conocido, inofensivo.
- npm marca ESLint 9.39.5 como "no longer supported" (lo fija `eslint-config-next`).
- El registry de npm responde muy lento en esta red.
- Los videos embebidos (`VideoLazy` + `lib/video.ts`) no se han probado con URLs reales:
  todavía no hay videos publicados. Probar con el primer video de la obra.
- Revisar en celular con `npm run dev`: la IP de la PC cambia con la red; usar la URL
  "Network" que imprime el servidor.

## Bloqueos y pendientes del usuario
- Precios "desde" → `site.precios`.
- Número de WhatsApp Business → `site.whatsapp`.
- URLs de redes sociales → `site.redes`.
- Especificaciones y marcas de materiales → `bonaire.materiales`.
- Fecha de inicio y avance de "Terreno y trazo" → `bitacora.ts`.
- Respuestas de preguntas frecuentes → `src/content/landing.ts`.
- Texto del aviso de privacidad (necesario antes del formulario de la Fase 4).
- Ubicación del terreno y detalle de lo incluido en "Comprar esta casa".
- Video o foto principal para el hero.
- Confirmar con el ingeniero responsable la referencia RTS 91.01.02:21; nombre y registro
  del profesional que firma el plano → `calidad` en `src/content/landing.ts`.
- Confirmar con quien tramite el permiso de construcción que los muros de colindancia y el
  corredor hasta el lindero cumplen la normativa.
- Diseño estructural de la columna del corredor y ficha de la lámina (pendiente mínima).
- Crear proyecto nuevo en Supabase (separado de los bots).
- Conectar el repo de GitHub a Vercel.
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
