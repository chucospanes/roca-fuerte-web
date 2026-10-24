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
