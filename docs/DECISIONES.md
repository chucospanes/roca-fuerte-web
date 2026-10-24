# Registro de decisiones

> Cada entrada: fecha, decisión y motivo. No se borran entradas; si una decisión cambia,
> se agrega una nueva que la reemplaza y se indica cuál.

## 2026-10-22 — Dominio principal: constructorarocafuerte.com
`rocafuerte.com` está a la venta en HugeDomains por $2,695; no se compra mientras la marca
no esté asegurada. Se descartó .com.sv como principal por la lentitud de SVNet (trámites
manuales de días).

## 2026-10-22 — Registrador: Namecheap
El usuario ya trabaja con Namecheap. La diferencia con Cloudflare Registrar es marginal.

## 2026-10-23 — Plano del modelo: Casa Bonaire v3
Distribución en L: dormitorios abajo, sala-comedor-cocina-lavado arriba, fachada y acceso
a la izquierda. Baño centrado y dormitorios iguales (3.00 × 2.50 m). Sala extendida 1.50 m
para correr el sofá. Pila dentro de la casa para no construir muros exteriores adicionales.
Área construida 43.60 m², útil 38.07 m².

## 2026-10-23 — Stack: Next.js en Vercel + Supabase
Next.js permite crecer a la fase 2 (portal privado de clientes con login de Google) sin
rehacer nada. Supabase solo para guardar leads en v1.

## 2026-10-23 — Sin login en v1
Ningún prospecto se registra para ver una casa. El login con Google se reserva para la
fase 2: portal donde cada cliente ve el avance de su obra.

## 2026-10-23 — Leads: Supabase + WhatsApp
El lead se guarda en Supabase y luego se abre WhatsApp con el mensaje prellenado. Si la
persona no envía el WhatsApp, el lead no se pierde.

## 2026-10-23 — Precio "desde" visible
Filtra a quien no puede pagar y es coherente con la transparencia de la marca. Mientras no
haya precio confirmado, se muestra "Precio próximamente".

## 2026-10-23 — Marca configurable en un solo lugar
"Roca Fuerte" está pendiente de búsqueda de marca en el CNR. El nombre vive solo en
`src/config/site.ts` para cambiarlo sin tocar componentes.

## 2026-10-23 — Versiones fijadas por create-next-app 16.4.3
Se aceptan las versiones que fija el generador en lugar de las "últimas" de npm:
React/React DOM 19.3.0 (no 19.3.1), TypeScript ^5 (no 7.x, la reescritura nativa),
`@types/node` ^20, ESLint ^9. Tailwind 4 se integra con `@tailwindcss/turbopack` en vez
de `@tailwindcss/postcss` (no hay `postcss.config`). Motivo: es la combinación probada
por Next para esta versión; desviarse no aporta nada en v1.

## 2026-10-23 — `cacheComponents` y `partialPrefetching` activos por defecto (revisar en Fase 4)
`next.config.ts` viene con `cacheComponents: true` y `partialPrefetching: true`. Se dejan
como están. **Pendiente en Fase 4:** verificar que no interfieran con el Server Action del
formulario ni con la lectura de UTM, referrer e IP (límite de envíos), que dependen de
cada request y no deben quedar cacheados.

## 2026-10-23 — AGENTS.md de Next.js importado en CLAUDE.md
`create-next-app` genera `AGENTS.md`, que pide leer la documentación incluida en
`node_modules/next/dist/docs/` antes de escribir código (Next 16 trae cambios que rompen
compatibilidad), y `next dev` lo regenera si se borra. Se commitea y se importa con
`@AGENTS.md` en CLAUDE.md para que se cargue en cada sesión.

## 2026-10-23 — PENDIENTE como constante tipada
`PENDIENTE` vive en `src/config/site.ts` como constante con su propio tipo. Precios, redes,
materiales, fechas y avance de obra aceptan `valor | PENDIENTE`, así TypeScript obliga a
los componentes a manejar el caso pendiente en vez de mostrar un dato inventado. Un precio
pendiente se muestra como "Precio próximamente".

## 2026-10-23 — Avance de "Terreno y trazo" como PENDIENTE
La etapa está en proceso, pero no hay porcentaje medido. Se deja PENDIENTE en vez de poner
un número; las etapas que no han empezado van en 0 %.

## 2026-10-23 — Remoto en GitHub y push al cerrar fase
Remoto `origin` = `chucospanes/roca-fuerte-web`. Al cerrar cada fase se hace
`git push origin main --tags` después del merge y el tag.

## 2026-10-23 — Diseño de la landing (Fase 3, en revisión)
Tipografía Archivo (títulos) + Source Sans 3 (texto) vía `next/font` (se sirven desde el
propio sitio). Paleta en `globals.css`: concreto, gris cálido ("piedra"), terracota y
blanco, solo modo claro. Fondo de cuadrícula tipo papel de plano en el hero. Secciones
numeradas (01–08) como hoja de obra.

## 2026-10-23 — Cómo se muestra lo PENDIENTE
Sello punteado amarillo "PENDIENTE" para todo dato no confirmado. En la bitácora, el
estado "pendiente" de una etapa se muestra como "Por iniciar" para no confundirlo con un
dato pendiente, y las etapas por iniciar no muestran barra de 0 %. Materiales con los tres
campos pendientes se muestran en una sola línea en móvil. El precio pendiente se muestra
solo como "Precio próximamente", sin sello extra.

## 2026-10-23 — WhatsApp mientras el número sea placeholder
El botón flotante y los enlaces de WhatsApp apuntan a `#contacto` mientras
`site.whatsapp` sea `50300000000`, para no mandar a nadie a un número inexistente. Al
poner el número real pasan a `wa.me` sin tocar componentes.

## 2026-10-23 — allowedDevOrigins con rangos de IP privada
Next 16 bloquea los recursos de desarrollo pedidos desde hosts distintos a `localhost`.
Para revisar `npm run dev` desde el celular se permiten los rangos privados (`10.*`,
`192.168.*`, `172.*`) en vez de una IP fija, porque la IP de la PC cambia con la red
(cambió durante esta misma sesión). Solo afecta desarrollo.

## 2026-10-23 — Sin superlativos ni promesas de resistencia
En todo el sitio, y en especial en "Calidad y resistencia": nada de "los mejores",
"máxima calidad", "resiste cualquier sismo" ni garantías que no se puedan comprobar. Cada
afirmación técnica debe ser verificable por el visitante (norma citada, profesional que
firma, control grabado en la bitácora, especificación en la tabla) y lo no confirmado va
como PENDIENTE. Motivo: el público teme ser engañado; una promesa no comprobable contradice
la transparencia que es el diferencial de la marca, y una promesa de resistencia que no se
cumpla es un riesgo legal. Principio: mostrar, no prometer.

## 2026-10-23 — Sección "Calidad y resistencia" y renombres (ajustes de Fase 3)
Nueva sección 03 entre "La casa" y "Materiales"; las siguientes se renumeran (04–09).
Cita el RTS 91.01.02:21 (vivienda de 1 y 2 plantas) como PENDIENTE de confirmar con el
ingeniero responsable, y nombre y registro del profesional que firma el plano como
PENDIENTE. Sección 02: etiqueta "La casa", título "Modelo Bonaire". Sección de precios:
"Dos formas de tener tu casa".

## 2026-10-23 — Casa entre colindancias: techo a dos aguas con cumbrera paralela a la fachada y sin ventanas laterales
El plano y la fachada se corrigen para construir sin retiro lateral. Los muros laterales
son de colindancia: sin ventanas ni aleros. El techo de lámina va a dos aguas con la
cumbrera paralela a la fachada (pendiente 15 %, alero a 2.60 m, cumbrera a 3.31 m), de
modo que el agua cae al frente (canal y bajante) y al fondo. Cocina en L con pila y
fregadero en el muro del fondo bajo una ventana de 1.20 m; estufa y refrigeradora en el
muro lateral. Ventilación e iluminación cenital: extractor y lámina traslúcida en el baño,
lámina traslúcida sobre el comedor. Corredor techado de 1.50 m frente al Dormitorio 1,
con columna en la esquina. Áreas sin cambio (43.60 m² construidos, 38.07 m² útiles).
Motivo: los terrenos vecinos son de terceros; no puede caer agua ni haber aleros hacia
ellos. Se agrega la fachada a la sección "La casa", ampliable igual que el plano.

## 2026-10-23 — Acceso con correo solo al contenido premium (reemplaza "Sin login en v1")
La landing sigue 100 % pública. El contenido premium (plano y fachada en PDF, ficha técnica
completa y materiales detallados) se desbloquea con correo validado por enlace (Supabase
Auth, sin contraseñas), pidiendo nombre, WhatsApp y correo, con aceptación del aviso de
privacidad. Los PDF salen de `public/` y se sirven de forma privada (Storage con URLs
firmadas de corta duración o ruta del servidor que verifica la sesión). Se integra a la
Fase 4 junto al formulario de leads. Motivo: captar prospectos serios sin cerrar la página
a quien llega desde redes. El login con Google para el portal de clientes sigue reservado
para la fase 2.

## 2026-10-23 — Validación por código de 6 dígitos, no por enlace mágico
El correo se valida con un código OTP de Supabase que la persona escribe en la misma
pestaña. Reemplaza "validación por enlace" de la entrada anterior. Motivo: el tráfico llega
desde los navegadores internos de TikTok, Instagram y Facebook; un enlace mágico se abre
desde la app de correo en otro navegador y la sesión no queda donde la persona estaba
viendo la página.

## 2026-10-23 — Plano y fachada públicos; qué es contenido premium
El plano y la fachada siguen públicos y ampliables en la landing. Lo premium es: PDF
imprimibles de plano y fachada, ficha técnica, lista de materiales con marcas y
cantidades, y desglose de qué incluye el precio. Motivo: el plano visible es parte de la
transparencia de la marca y lo que atrae desde redes; el detalle útil para cotizar o
construir es lo que justifica dejar el correo.

## 2026-10-23 — Una sola tabla de leads, correo como identificador
Desbloqueo = paso 1 (nombre, WhatsApp, correo + código). Calificación = paso 2 opcional,
con los datos precargados para quien ya está registrado. Upsert por correo: sin
duplicados. El correo que se usa para el upsert y la precarga sale siempre de la sesión
verificada, nunca de lo escrito en un formulario.

## 2026-10-23 — Acceso premium bloqueado hasta tener datos reales
No se activa el acceso premium hasta que la ficha técnica y la lista de materiales tengan
datos reales. Motivo: pedir correo a cambio de una ficha llena de "Próximamente" quema la
confianza del prospecto justo cuando entrega sus datos.

## 2026-10-23 — Botones de venta a WhatsApp directo, sin correo ni código
"Quiero esta casa" y "Construir Bonaire en mi terreno" abren WhatsApp con un mensaje
prellenado distinto según la opción, sin pedir correo ni código. El correo con código es
solo para el contenido premium. Motivo: quien ya quiere comprar no debe encontrar ninguna
barrera; la verificación se reserva para quien pide el detalle técnico. Consecuencia: esos
contactos no quedan en Supabase ni con su UTM; se registran solo los que piden el premium.

## 2026-10-23 — Claves nuevas de Supabase y nombres de variables
Se usan las claves nuevas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
(`sb_publishable_`, pública) y `SUPABASE_SECRET_KEY` (`sb_secret_`, solo servidor, con
`createClient` de `@supabase/supabase-js`). Reemplazan a `SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY`. Motivo: Supabase retira las claves `anon` y `service_role` a
fines de 2026 y recomienda estos nombres.

## 2026-10-23 — Detalles técnicos de la Fase 4
- **Validación con zod** (no a mano): es entrada externa que llega al servidor. Versión
  4.6.7: la 4.6.5 tiene una vulnerabilidad alta (GHSA-mrhx-c7xc-m3w5) corregida en 4.6.6.
- **PDF** por la ruta del servidor `/descargas/[archivo]`, desde una carpeta privada del
  repo, verificando la sesión. Sin Storage: el PDF se actualiza con un commit.
- **Sin límite por IP propio**: escribir en `leads` exige correo verificado y Supabase ya
  limita los códigos por IP y por correo. No se guarda la IP. Cloudflare Turnstile es
  obligatorio antes de activar el acceso premium en producción.
- **Código pedido desde el navegador**, para que los límites por IP de Supabase apliquen a
  cada visitante y no al servidor.
- **UTM y referrer de primer contacto**: un trigger impide sobrescribirlos.
- **SMTP: Resend** con el dominio `constructorarocafuerte.com` (comprado en Namecheap). El
  correo integrado de Supabase solo envía al equipo del proyecto y 2 por hora.
- **Aviso de privacidad**: borrador en `docs/AVISO_PRIVACIDAD.md`, pendiente de revisión
  legal antes de publicarse.

## 2026-10-23 — "Municipio o distrito" como texto libre
En la calificación, el campo se llama "Municipio o distrito" y es texto libre. Motivo:
desde la reforma de 2024 hay 44 municipios y los anteriores son distritos; la gente sigue
usando los nombres viejos. El departamento sí es una lista cerrada (los 14).

## 2026-10-23 — El interruptor del acceso premium solo se enciende en producción con código
`site.accesoPremium` lee `NEXT_PUBLIC_ACCESO_PREMIUM=1` solo fuera de producción. En un
build de producción la variable no tiene efecto: encenderlo exige un cambio de código
revisado. Las Server Actions también lo revisan, porque se pueden invocar con un POST
aunque la página no exista. Motivo: los bloqueos (datos reales y Turnstile) no deben
poder saltarse cambiando una variable en Vercel.

## 2026-10-23 — Sin escrituras en Supabase (producción) sin aprobación previa
Regla en CLAUDE.md: nunca escribir, modificar ni borrar datos en Supabase sin aprobación
explícita previa del usuario, aunque sean registros de prueba que se borren después. Las
lecturas de verificación sí están permitidas. Motivo: en la prueba de las Server Actions se
insertó y borró un registro de prueba sin pedir permiso; el proyecto es el de producción.

## 2026-10-23 — PDF premium servidos desde `assets/`, origen en `localStorage`
- La "carpeta privada en el repo" para los PDF es `assets/` (ya era la fuente y no se
  sirve): sin copias que se desincronicen. La ruta usa una lista cerrada de 2 archivos y
  la configuración de despliegue incluye solo esos PDF.
- UTM y referrer de la primera visita con datos se guardan en el `localStorage` del
  navegador y viajan con el registro; una visita directa sin datos no ocupa ese lugar. El
  aviso de privacidad lo menciona.
- `Material.cantidad` y `bonaire.desglosePrecio` se agregan como PENDIENTE; en el área
  premium lo pendiente se muestra como "Próximamente".

## 2026-10-24 — La marca de cada material es pública; premium son las cantidades
La columna "Marca" se queda en la tabla pública de materiales de la landing: mostrar qué
marca se usa es parte de la transparencia. Lo premium es: cantidades de materiales, ficha
técnica completa, desglose de qué incluye el precio y los PDF imprimibles. Reemplaza la
mención de "materiales con marcas y cantidades" como premium en las entradas anteriores.

## 2026-10-24 — SMTP propio (Resend) es requisito para probar el código, no solo para producción
Los proyectos gratuitos de Supabase creados después de junio de 2026 no permiten editar
las plantillas de correo sin SMTP propio (lo comprobó el usuario en el panel). Sin la
plantilla con `{{ .Token }}`, el correo no lleva el código de 6 dígitos y el flujo no se
puede probar. Por eso el SMTP de Resend con `constructorarocafuerte.com` (DNS en
Namecheap) pasa de pendiente de producción a requisito para la prueba de punta a punta.
La clave de Resend vive solo en la configuración SMTP de Supabase, no en el repo ni en
`.env.local`. Corrige lo anotado antes: las plantillas no quedaron cambiadas.

## 2026-10-24 — El código acepta de 6 a 8 dígitos; Supabase configurado en 6
La primera prueba falló porque Supabase enviaba códigos de 8 dígitos (Email OTP Length)
y el formulario esperaba 6. Se configuró Supabase en 6 y la validación acepta de 6 a 8,
para que un cambio de configuración no vuelva a romper el acceso. La configuración externa
(SMTP, plantillas, longitud y duración del código) queda en `docs/CONFIGURACION_EXTERNA.md`.

## 2026-10-24 — El UTM se captura con un script en línea, sin esperar a React
La captura dependía de un componente de React y solo corría al terminar de cargar la
página. En la prueba real se perdió el UTM porque se tocó el enlace a la ficha antes. Con
tráfico desde el navegador interno de TikTok y datos móviles lentos, ese caso es común y
pierde justo el dato de qué video trajo a la persona. Ahora un script mínimo en línea en
el layout guarda el origen al leer el HTML.
