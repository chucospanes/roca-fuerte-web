# Plan v1 — Landing Casa Modelo Bonaire

## Objetivo
Landing de una sola página, mobile-first, que vende la Casa Bonaire en construcción y el
servicio de construir el modelo en el terreno del cliente. Captura leads calificados en
Supabase y los lleva a WhatsApp. Sin login.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS, versiones estables actuales.
- Supabase (Postgres) solo para la tabla `leads`.
- Despliegue en Vercel. Dominio `constructorarocafuerte.com` (registrado en Namecheap).

## Inicialización
El repo ya contiene `CLAUDE.md`, `docs/`, `assets/` y `.gitignore`. Si `create-next-app`
rechaza el directorio por no estar vacío, genera el proyecto en una carpeta temporal y
mueve los archivos al repo sin sobrescribir `CLAUDE.md`, `docs/`, `assets/` ni `.gitignore`
(fusiona las reglas de `.gitignore`). Copia `assets/plano-bonaire.png` a `public/plano-bonaire.png`.

## Configuración editable — `src/config/site.ts`
- Nombre de marca (por ahora "Roca Fuerte"; único lugar donde aparece).
- Número de WhatsApp en formato internacional (placeholder `50300000000`).
- Precio "desde" de "Quiero esta casa" y "Construir en tu terreno" (placeholder `PENDIENTE`;
  si es PENDIENTE se muestra "Precio próximamente").
- Condiciones del precio de construcción en terreno del cliente: terreno plano, escriturado,
  con acceso vehicular y servicios cercanos; extras cotizados aparte.
- URLs de redes sociales (placeholders).

## Contenido del modelo — `src/content/bonaire.ts`
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
   Bonaire · 2 dormitorios · 43.60 m²"; botones "Quiero esta casa" y "Construir Bonaire en
   mi terreno"; espacio para video o foto principal (placeholder).
2. **Por qué construimos así:** 3–4 puntos de transparencia (cada material mostrado en
   video, cada etapa documentada, sin sorpresas en el precio).
3. **La Casa Bonaire:** plano ampliable al tocarlo, cuadro de áreas y lista de ambientes.
4. **Materiales y especificaciones:** tabla desde `bonaire.ts`.
5. **Bitácora de obra:** línea de tiempo con estado, avance y videos embebidos que cargan
   solo al hacer clic.
6. **Dos formas de tener tu Bonaire:** tarjetas "Comprar esta casa" vs "Construir en tu
   terreno" con precio "desde", qué incluye y condiciones.
7. **Cómo trabajamos:** contacto → evaluación del terreno → cotización cerrada → contrato →
   construcción documentada → entrega.
8. **Preguntas frecuentes:** financiamiento (contado, FSV, banco), clientes en el exterior,
   tiempos, garantía, permisos. Respuestas `PENDIENTE` para que el usuario las complete.
9. **Formulario de calificación.**
10. **Footer:** contacto, redes y aviso de privacidad.

## Formulario de calificación
Campos: nombre*, WhatsApp con código de país*, país de residencia (El Salvador / Estados
Unidos / Otro), interés (comprar la casa / construir en mi terreno). Solo si elige construir:
departamento y municipio del terreno, ¿terreno escriturado a su nombre? (sí / no / en
trámite). Forma de pago (contado / FSV / crédito bancario / otro), ¿cuándo quiere iniciar?
(inmediato / 3 meses / 6 meses / más de 6 meses), comentario opcional, aceptación del aviso
de privacidad*.

Flujo:
1. Validación en cliente y servidor (zod o equivalente).
2. Server Action inserta el lead en Supabase con la service role key solo en servidor.
3. Guarda UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) y referrer para
   saber qué red y qué video trajo cada lead.
4. Anti-spam: campo honeypot y límite básico de envíos por IP.
5. Confirmación en pantalla + botón a `wa.me` con mensaje prellenado (nombre, interés,
   ubicación, forma de pago).
6. Si Supabase falla, igual permite continuar a WhatsApp y registra el error en servidor.

Migración `supabase/migrations/001_leads.sql`: tabla `leads` (id uuid, created_at, campos del
formulario, UTM, referrer, `estado` con valor por defecto `'nuevo'`), RLS activado sin
políticas públicas.

## Diseño
- Sobrio, sólido y confiable: tonos concreto, gris cálido, acento terracota y blanco.
  Tipografía clara. Nada que parezca plantilla genérica.
- Mobile-first, botones grandes, botón flotante de WhatsApp siempre visible en móvil.
- Imágenes con `next/image`; carga rápida en datos móviles.

## SEO
Metadata en español, Open Graph con imagen del plano, `sitemap.xml`, `robots.txt` y datos
estructurados schema.org `HomeAndConstructionBusiness`.

## Variables de entorno
`.env.example` con `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Fases (commit al cerrar cada una, tag de versión y actualización de ESTADO.md)
1. Inicializar Next.js y estructura de carpetas → `v0.1.0`
2. Archivos de configuración y contenido → `v0.2.0`
3. Secciones de la landing con datos de ejemplo → `v0.3.0`
4. Formulario + Server Action + migración Supabase → `v0.4.0`
5. SEO, rendimiento y revisión en móvil → `v0.5.0`
6. README de despliegue (local, migración Supabase, Vercel, DNS desde Namecheap) → `v1.0.0`

## Fuera de alcance en v1
Login, panel de administración de leads, portal de clientes, pagos en línea, blog.
