# Roca Fuerte — Portal web Casa Modelo Bonaire

Portal de ventas de una constructora salvadoreña que lanza su primer modelo de casa
(Casa Modelo Bonaire) documentando la obra con transparencia total en redes sociales.
Responde siempre en español.

## Contexto que se carga en cada sesión
@docs/CONTEXTO.md
@docs/ESTADO.md
@docs/DECISIONES.md

La especificación completa de la versión 1 está en `docs/PLAN_V1.md`. Léela antes de
trabajar en cualquier fase del portal.

## Protocolo de sesión (obligatorio)
1. **Al iniciar:** lee `docs/ESTADO.md`, resume en 3 líneas dónde estamos y confirma
   conmigo la siguiente tarea antes de tocar código.
2. **Al terminar una tarea o fase:**
   - Actualiza `docs/ESTADO.md` (qué se hizo, qué sigue, bloqueos, fecha).
   - Si se tomó una decisión de producto, diseño o técnica, agrégala a
     `docs/DECISIONES.md` con fecha, decisión y motivo.
   - Haz commit de código y documentación juntos.
3. Si el usuario cambia el alcance, regístralo en `DECISIONES.md` antes de implementarlo.

## Reglas críticas
- **Checkpoint git antes de dependencias.** Antes de cualquier comando que modifique
  `node_modules` o `package.json` (npm install, npx create-*, etc.): revisa `git status`;
  si hay cambios sin commit, haz `git add -A && git commit -m "chore: checkpoint antes de dependencias"`.
  Nunca instales sin ese checkpoint.
- **Si una instalación rompe algo:** NO lo arregles con más instalaciones. Revierte con
  git primero y explica qué pasó.
- **Antes de instalar, muestra la lista de dependencias y espera aprobación.**
- **Secretos:** la `SUPABASE_SERVICE_ROLE_KEY` solo se usa en servidor. Nunca en código
  cliente ni en variables `NEXT_PUBLIC_*`. `.env.local` nunca se commitea.
- **Contenido:** no inventes testimonios, cifras, garantías, certificaciones ni precios.
  Todo dato no confirmado va como `PENDIENTE`, visible.
- **Marca:** el nombre "Roca Fuerte" está pendiente de registro de marca. Debe vivir en un
  solo lugar (`src/config/site.ts`) para poder cambiarlo sin tocar componentes.
- **Diagnostica antes de cambiar:** ante un error, investiga la causa antes de proponer
  arreglos. No repitas una solución que ya falló si no cambió ninguna variable.

## Convenciones git
- Rama principal: `main`. Trabajo en ramas `feat/...`, `fix/...`, `docs/...`; merge a
  `main` cuando la fase funciona en local.
- Commits en español con prefijo: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`.
- Un commit por unidad lógica de trabajo; nunca commits gigantes de "varios cambios".
- Etiqueta versiones al cerrar cada fase del plan: `v0.1.0`, `v0.2.0`, ...

## Comandos
(Se completan cuando exista el proyecto Next.js.)
- `npm run dev` — servidor local
- `npm run build` — build de producción
- `npm run lint` — lint

## Estructura
- `docs/` — contexto, estado vivo, decisiones y plan. Fuente de verdad del proyecto.
- `assets/` — material fuente (plano PNG/PDF y su script generador). No se sirve en web;
  copia a `public/` lo que la web necesite.
