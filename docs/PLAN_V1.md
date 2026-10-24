# Plan v1 — Landing Casa Modelo Bonaire

## Objetivo
Landing de una sola página, mobile-first, que vende la Casa Bonaire en construcción y el
servicio de construir el modelo en el terreno del cliente. Captura leads calificados en
Supabase y los lleva a WhatsApp. La landing es 100 % pública; solo el contenido premium
(PDF de plano y fachada, ficha técnica, materiales con marcas y cantidades, desglose del
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

## Formulario de calificación (paso 2, opcional)
Solo para quien ya validó su correo (paso 1 del acceso premium, ver abajo). Nombre, WhatsApp
y correo llegan precargados desde la sesión validada; actualiza el mismo registro de
`leads` (upsert por correo), nunca crea otro.

Campos: nombre*, WhatsApp con código de país*, país de residencia (El Salvador / Estados
Unidos / Otro), interés (comprar la casa / construir en mi terreno). Solo si elige construir:
departamento y municipio del terreno, ¿terreno escriturado a su nombre? (sí / no / en
trámite). Forma de pago (contado / FSV / crédito bancario / otro), ¿cuándo quiere iniciar?
(inmediato / 3 meses / 6 meses / más de 6 meses), comentario opcional, aceptación del aviso
de privacidad*.

Flujo:
1. Validación en cliente y servidor (zod o equivalente).
2. Server Action actualiza el lead del correo de la sesión en Supabase, con la service
   role key solo en servidor. El correo sale de la sesión verificada, nunca del formulario.
3. Guarda UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) y referrer para
   saber qué red y qué video trajo cada lead.
4. Anti-spam: campo honeypot y límite básico de envíos por IP.
5. Confirmación en pantalla + botón a `wa.me` con mensaje prellenado (nombre, interés,
   ubicación, forma de pago).
6. Si Supabase falla, igual permite continuar a WhatsApp y registra el error en servidor.

Migración `supabase/migrations/001_leads.sql`: una sola tabla `leads` con el correo como
identificador (único, sin distinguir mayúsculas), id uuid, created_at, updated_at, datos
del paso 1, campos de calificación del paso 2 (opcionales), UTM, referrer y `estado` con
valor por defecto `'nuevo'`. RLS activado sin políticas públicas. El diseño final se
muestra al usuario antes de crearla.

## Acceso con correo a contenido premium
La landing sigue 100 % pública, incluidos el plano y la fachada ampliables (PNG en
`public/`). Con correo validado se desbloquea:
- PDF imprimibles de plano y fachada (`assets/plano-bonaire.pdf`,
  `assets/fachada-bonaire.pdf`).
- Ficha técnica.
- Lista de materiales con marcas y cantidades (requiere agregar `cantidad` a `Material` en
  `bonaire.ts`).
- Desglose de qué incluye el precio. Las tarjetas públicas de "Dos formas de tener tu casa"
  conservan el resumen.

Mientras un dato siga en `PENDIENTE`, dentro del área desbloqueada se muestra como
"Próximamente". **No se activa el acceso premium en producción hasta que la ficha técnica
y la lista de materiales tengan datos reales** (ver ESTADO.md).

Flujo:
1. **Paso 1, desbloqueo:** nombre*, WhatsApp con código de país*, correo* y aceptación del
   aviso de privacidad*.
2. Supabase Auth envía un **código de 6 dígitos** (OTP) al correo; la persona lo escribe en
   la misma pestaña. No se usa enlace mágico (ver DECISIONES.md). Verificar en la
   documentación de Supabase cómo se configura la plantilla de correo para enviar el código.
3. Al verificar el código se hace upsert en `leads` por correo con nombre, WhatsApp, UTM y
   referrer, y el contenido premium queda accesible en ese navegador (sesión de Supabase
   Auth en cookie). Sin duplicados: un correo, un registro.
4. **Paso 2, calificación (opcional):** formulario de calificación con los datos del paso 1
   precargados (ver sección anterior).
5. Los PDF **no** van en `public/`: se sirven desde un bucket privado de Supabase Storage
   con URLs firmadas de corta duración, o desde una ruta del servidor que verifique la
   sesión antes de entregarlos.
6. Verificar en la documentación de Supabase los límites del envío de correos integrado y
   proponer un proveedor SMTP para producción.

Seguridad: el upsert y la precarga solo usan el correo de la sesión verificada. Nunca se
precargan datos a partir de un correo escrito en un formulario sin validar, para que nadie
pueda ver o sobrescribir los datos de otra persona.

A mostrar al usuario antes de instalar nada (inicio de la Fase 4):
- Diseño final de la tabla `leads`, flujo completo y dependencias (`@supabase/supabase-js`,
  `@supabase/ssr` u otras).
- Variables de entorno nuevas (URL y clave pública de Supabase para Auth en el cliente; la
  service role key sigue solo en servidor), verificadas contra la documentación de Next 16
  incluida en `node_modules/next/dist/docs/`.

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
4. Formulario de leads + acceso con correo a contenido premium (Supabase Auth, Storage
   privado para los PDF) + Server Actions + migraciones Supabase → `v0.4.0`
5. SEO, rendimiento y revisión en móvil → `v0.5.0`
6. README de despliegue (local, migración Supabase, Vercel, DNS desde Namecheap) → `v1.0.0`

## Fuera de alcance en v1
Panel de administración de leads, portal de clientes, pagos en línea, blog.
