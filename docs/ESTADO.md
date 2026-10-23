# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-10-23
**Versión:** v0.1.0 — proyecto Next.js inicializado

## Fase actual
Fase 1 completada: Next.js 16.4.3 + TypeScript + Tailwind 4 instalado y estructura de
carpetas creada. La página de inicio sigue siendo la plantilla de `create-next-app`.
**Siguiente: Fase 2 de `docs/PLAN_V1.md`** (archivos de configuración y contenido).

## Hecho
- Repositorio git con CLAUDE.md (importa AGENTS.md de Next) y documentación en `docs/`.
- Plano de la Casa Modelo Bonaire v3 en `assets/` y copia en `public/plano-bonaire.png`.
- Dominio `constructorarocafuerte.com` comprado en Namecheap.
- Proyecto Next.js: `npm run lint` y `npm run build` pasan; `npm run dev` sirve `/`
  (HTTP 200) y `/plano-bonaire.png` (HTTP 200) en local.
- Carpetas vacías listas: `src/config`, `src/content`, `src/components`, `src/lib`,
  `supabase/migrations`.

## Siguiente
1. Fase 2: `src/config/site.ts`, `src/content/bonaire.ts`, `src/content/bitacora.ts`,
   `.env.example`.
2. Fase 3: secciones de la landing (reemplaza la plantilla y los SVG de ejemplo en `public/`).

## Notas técnicas abiertas
- Revisar en Fase 4 `cacheComponents`/`partialPrefetching` frente al Server Action y la
  lectura de UTM/referrer/IP (ver DECISIONES.md).
- npm marca ESLint 9.39.5 como "no longer supported". Es la versión que fija
  `eslint-config-next` 16.4.3; no se actualiza por ahora.
- El registry de npm respondió muy lento en esta red (install de 11 min).

## Bloqueos y pendientes del usuario
- Precios "desde" (el sitio usa PENDIENTE mientras tanto).
- Número de WhatsApp Business.
- Crear proyecto nuevo en Supabase (separado de los bots).
- Crear repo privado en GitHub y conectar a Vercel.
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
