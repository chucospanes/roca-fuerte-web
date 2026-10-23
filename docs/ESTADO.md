# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-10-23
**Versión:** v0.2.0 — configuración y contenido

## Fase actual
Fase 2 completada: configuración editable y contenido del modelo y la bitácora listos.
La página de inicio sigue siendo la plantilla de `create-next-app`.
**Siguiente: Fase 3 de `docs/PLAN_V1.md`** (secciones de la landing con datos de ejemplo).

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

## Siguiente
1. Fase 3: secciones de la landing (reemplaza la plantilla, su metadata y los SVG de
   ejemplo en `public/`).

## Notas técnicas abiertas
- Revisar en Fase 4 `cacheComponents`/`partialPrefetching` frente al Server Action y la
  lectura de UTM/referrer/IP (ver DECISIONES.md).
- `npx tsc --noEmit` suelto falla si existen a la vez `.next/types` (build) y
  `.next/dev/types` (dev) desactualizado: este último declara `LayoutRoutes = never`. No es
  error del código: `npm run build` verifica tipos bien. Para chequear con tsc, borrar
  `.next/dev` o volver a correr `npm run dev`.
- `npm ls` marca 6 paquetes wasm opcionales como "extraneous"; están en el lockfile y
  `npm prune` no los toca. Aviso conocido, inofensivo.
- npm marca ESLint 9.39.5 como "no longer supported" (lo fija `eslint-config-next`).
- El registry de npm responde muy lento en esta red.

## Bloqueos y pendientes del usuario
- Precios "desde" → `site.precios`.
- Número de WhatsApp Business → `site.whatsapp`.
- URLs de redes sociales → `site.redes`.
- Especificaciones y marcas de materiales → `bonaire.materiales`.
- Fecha de inicio y avance de "Terreno y trazo" → `bitacora.ts`.
- Crear proyecto nuevo en Supabase (separado de los bots).
- Conectar el repo de GitHub a Vercel.
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
