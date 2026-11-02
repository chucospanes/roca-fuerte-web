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

## 2026-10-24 — Cambio de alcance: contar clics de venta con su UTM (Fase 5)
Se agrega a la Fase 5 contar los clics en los botones de venta de WhatsApp con el UTM de
primer contacto, sin datos personales. Motivo: los botones abren WhatsApp sin pedir datos
(decisión del 2026-10-23), así que hoy no se sabe qué red ni qué video generan las
conversaciones de venta. El diseño queda pendiente de aprobación del usuario.

## 2026-10-24 — Diseño del conteo de clics, referencia en WhatsApp y Open Graph (Fase 5)
- **Conteo aprobado** con hora exacta: tabla `clics_venta` (migración 002) con botón,
  ubicación, UTM de primer contacto y solo el dominio del referrer. Sin IP, navegador,
  identificador ni datos de contacto: se cuentan clics, no personas. Lo captura el script
  en línea (cuenta aunque React no haya cargado) y lo envía con `sendBeacon` a
  `POST /api/clic`, que valida con zod y el encabezado `Origin`. No se cuenta mientras el
  WhatsApp sea el número de prueba. Límite conocido: sin IP no hay tope por persona, los
  conteos se pueden inflar; son indicativos.
- **Referencia en el mensaje de WhatsApp:** si hay UTM de primer contacto, se agrega al
  final del mensaje prellenado, por ejemplo "(Ref: tiktok · video12)"; sin UTM, nada.
  Motivo: el dueño ve en la conversación de qué campaña viene la persona. La referencia
  viaja a WhatsApp (Meta): se menciona en el aviso de privacidad.
- **Open Graph:** imagen generada con la fachada, el texto "Casa Modelo Bonaire" y la
  marca (desde `site.ts`).
- **Rendimiento:** se mide con `npx lighthouse` sobre el build de producción
  (`npm run build` + `npm start` en otro puerto), no sobre el servidor de desarrollo.

## 2026-10-24 — Ajustes de accesibilidad de la Fase 5
- El gris `piedra-500` sobre blanco (4.2:1) no cumple el contraste mínimo para texto
  pequeño (4.5:1): en fondos claros se usa `piedra-600` (6.0:1) y en el pie oscuro
  `piedra-300`. El verde del botón flotante pasa de `#1f8a4c` (4.4:1) a `#1c8147` (4.9:1).
- Enlaces y botones con al menos 44 px de alto en móvil (encabezado y enlaces "Ver la
  bitácora" / "Ver los materiales").
- La imagen Open Graph usa la fuente por defecto de ImageResponse (sin negrita); usar
  Archivo requeriría agregar su archivo TTF al repo.

## 2026-10-24 — Fuente de títulos con `display: "optional"` y Archivo en la imagen Open Graph
- **Archivo (títulos) con `display: "optional"`:** en 1 de cada ~4 cargas se medía un salto
  de diseño (CLS 0.30) porque Archivo llegaba tarde, el titular del hero cambiaba de alto y
  empujaba el recuadro del video, justo debajo de los botones de venta. Con `optional`, si
  la fuente no llega en los primeros ~100 ms esa visita usa la fuente de respaldo y no hay
  salto (la fuente queda en caché para la siguiente página o visita). Contrapartida
  aceptada: en la primera visita con conexión lenta, los títulos se ven con la fuente del
  sistema. Source Sans 3 (texto) sigue igual.
- **Archivo en la imagen Open Graph:** se agregan al repo los TTF estáticos de Archivo
  (`assets/fonts/`) con su licencia SIL Open Font License 1.1 (`assets/fonts/OFL.txt`),
  que permite incluirlos y redistribuirlos con el proyecto. Reemplaza lo anotado en
  "Ajustes de accesibilidad de la Fase 5" sobre la fuente por defecto.

## 2026-10-25 — Hosting: Vercel Pro
Las Fair Use Guidelines de Vercel limitan el plan Hobby a uso personal no comercial y ponen
como ejemplo de uso comercial "Advertising the sale of a product or service": este sitio
anuncia una casa y un servicio. Se usa Vercel Pro (un solo miembro). Se descartan otras
plataformas porque el proyecto usa funciones de Next 16 (`cacheComponents`,
`partialPrefetching`, `proxy.ts`) que Vercel soporta sin adaptadores. Las variables de
entorno van solo en Production: la única base es la de producción y una preview no debe
escribir leads ni clics reales.

## 2026-10-25 — Interruptor de lanzamiento (`site.lanzado`), sin Disallow
Cambio de alcance de la Fase 6. El sitio puede estar publicado en el dominio sin aparecer
en buscadores hasta que el usuario lo active. `site.lanzado` es una constante en
`src/config/site.ts`, sin variable de entorno: encenderlo exige un commit, igual que
`accesoPremium`.
- **Apagado:** `noindex, nofollow` en la metadata de todas las páginas y en el encabezado
  `X-Robots-Tag` de todas las rutas (cubre PDF, imagen Open Graph y API); `robots.txt`
  permite el acceso (solo mantiene fuera ficha, descargas y API, como antes) y sin
  sitemap; `sitemap.xml` vacío.
- **Encendido:** sin `noindex`; `robots.txt` con el sitemap; sitemap con la landing.
- **Se descartó `Disallow: /` mientras esté apagado.** Con Disallow, Google no entra a la
  página y nunca lee el `noindex`; si alguien enlaza la URL, puede listarla sin contenido.
  Además, el robot que arma la vista previa de WhatsApp y Facebook podría respetarlo y no
  mostrar la imagen Open Graph. Con solo `noindex`, Google lo lee y no indexa, y la vista
  previa funciona desde ya.

## 2026-10-25 — Página `/privacidad` con el borrador del aviso (Fase 6)
Cambio de alcance de la Fase 6. La landing pública ya guarda el origen en `localStorage`,
cuenta clics y agrega la referencia de campaña al mensaje de WhatsApp, así que el aviso se
publica aunque el acceso premium siga apagado. La página lee `docs/AVISO_PRIVACIDAD.md` al
compilar (una sola fuente: el abogado revisa el mismo texto que se publica), reemplaza
`{marca}` por el nombre de `site.ts`, muestra cada `[PENDIENTE: …]` con el sello de
pendiente, no publica las notas para el abogado y lleva un aviso visible de borrador
pendiente de revisión legal. Enlazada desde el pie y desde el paso 1 del desbloqueo.

## 2026-10-25 — `v1.0.0` al quedar desplegado; el lanzamiento va aparte
El tag `v1.0.0` se pone cuando el sitio está desplegado y verificado en el dominio con el
interruptor apagado. Encender `site.lanzado` es un commit aparte, porque depende del
contenido del negocio (WhatsApp real, precios, aviso revisado), no del código.

## 2026-10-25 — Supabase Pro: no por ahora
Se sigue en el plan gratuito. Riesgo conocido: los proyectos gratuitos se pausan tras
~1 semana sin actividad (según fuentes de terceros, no la página oficial). Se evalúa al
activar el acceso premium.

## 2026-10-29 — El modelo se llama "Esparta" (antes "Bonaire"); plano en lote y fachada con pretil
Decisión del usuario: la Casa Modelo Bonaire pasa a llamarse **Casa Modelo Esparta** en todo
el sitio y la documentación. Las entradas anteriores de este registro conservan el nombre
viejo. La ruta premium pasa de `/bonaire/ficha` a `/esparta/ficha` sin redirección (el
sitio no está lanzado) y el contenido del modelo vive en `src/content/esparta.ts`.
Imágenes y PDF con nombres nuevos (`plano-esparta`, `fachada-esparta`) en vez de
reemplazar los viejos, porque `next/image` guarda en caché por URL. El plano nuevo muestra
el lote completo de 5 × 20 m (estacionamiento 5.00 m, jardín 3.50 m, casa 9.50 m, patio
2.00 m) y la fachada lleva pretil de 0.60 m (muro del frente a 3.20 m), bloque de la sala en
terracota y bloque visto sellado en el corredor. Con el pretil, el agua del frente cae a un
canal detrás del pretil y desagua al jardín, en vez del canal y bajante a la vista. Las
áreas no cambian (43.60 m² construidos, 38.07 m² útiles). Se borra `assets/plano_bonaire.py`
(generaba una versión ya descartada; queda en el historial de git).

## 2026-10-30 — Cambio de alcance: inversionistas y portal privado de clientes (v1.1.0)
Nueva fase en la rama `feat/inversionistas-portal`, que sale como `v1.1.0`. El despliegue
de `main` como `v1.0.0` sigue por su lado y no espera esta rama. Incluye una sección pública
"Para inversionistas" y un portal privado `/portal` donde compradores, clientes de
"construir en tu terreno" e inversionistas siguen sus obras.

## 2026-10-30 — Inversionistas: servicio de construcción, no oferta de inversión
Roca Fuerte es la constructora que el inversionista contrata para ejecutar SU proyecto de
vivienda (para venta o renta): el inversionista aporta terreno y capital; Roca Fuerte
construye en ese terreno el modelo Esparta, varias unidades Esparta o adaptaciones del
modelo, tramita los permisos y la segregación ante OPAMSS y CNR, y subcontrata los
servicios que requieren licencia. **Prohibido en el texto:** prometer rendimientos,
porcentajes de ganancia o plusvalía, hablar de "retorno" u "oportunidad de inversión", e
invitar a invertir dinero en Roca Fuerte. Motivo: es un servicio de construcción por
contrato; presentarlo como oferta de inversión podría caer en la regulación de ofertas
públicas de valores y contradice la marca ("mostrar, no prometer"). El caso propio del
terreno de 10 × 20 m no se usa como ejemplo. Botón de WhatsApp con mensaje propio y conteo
de clics con opción `inversionista` y ubicación `inversionistas` (migración 003).

## 2026-10-30 — Portal de clientes con el código por correo, sin autoregistro (reemplaza "login con Google")
Reemplaza la reserva del login con Google para el portal de clientes (entradas del
2026-10-23). El portal usa el mismo código por correo de Supabase, pero con
`shouldCreateUser: false`: las cuentas las crea el usuario en el panel de Supabase y nadie
se registra solo. La pantalla responde igual exista o no el correo, para no revelar quién es
cliente. Sin panel de administración: obras, avances, fotos y documentos se cargan desde el
panel de Supabase (`docs/GUIA_CARGA_OBRAS.md`). Interruptor `site.portalClientes`, apagado
en producción (solo se enciende con un commit, como `accesoPremium`); apagado, `/portal`
responde 404 y los enlaces "Acceso clientes" no se muestran.

## 2026-10-30 — Datos del portal: 6 tablas, RLS de solo lectura por membresía, Storage por carpeta
- Tablas: `obras`, `obra_miembros`, `etapas`, `avances`, `obra_materiales` y
  `documentos` (migración 004). Etapas separadas de avances para no mezclar el estado de
  la etapa con las entradas del diario de obra.
- RLS: primera vez que usuarios autenticados leen datos. Solo `select` para
  `authenticated`, solo filas de obras donde el usuario es miembro; sin permisos ni
  políticas de escritura. El portal lee con la sesión del usuario (clave publishable),
  nunca con la clave secreta: la barrera es la base de datos, no el código.
- Storage: bucket privado `obras`; las rutas empiezan con `{obra_id}/` (sin prefijo):
  fotos en `{obra_id}/avances/{avance_id}/archivo` y documentos en
  `{obra_id}/documentos/archivo`. La política de lectura compara
  `(storage.foldername(name))[1]` con las obras del usuario. Las fotos no tienen tabla: el
  portal lista la carpeta del avance.
- Fotos con URL firmada de 10 min, mostradas con `<img>` (no `next/image`: el
  optimizador guardaría copias de fotos privadas en caché). Documentos por la ruta
  `/portal/documentos/[id]`, que verifica la sesión, firma una URL de 60 s con el cliente
  del usuario y redirige; la URL no se genera al cargar la página.
- Videos: solo enlaces de YouTube (`youtube.com`, `youtu.be`) y Vimeo (`vimeo.com`),
  con CHECK en la base y validación zod. Se incrustan con el formato oficial
  (`youtube-nocookie.com/embed/`, `player.vimeo.com/video/`) armado a partir del
  identificador; nunca se incrusta la URL tal como se escribió.
- Prueba de aislamiento: SQL en una transacción con `rollback` (cliente A no ve la obra
  de B y nadie escribe) y prueba de punta a punta con dos cuentas de prueba, con
  aprobación previa del usuario.

## 2026-10-30 — `/portal` con noindex y X-Robots-Tag, sin Disallow
Igual que la decisión del interruptor de lanzamiento: con Disallow, Google no lee el
`noindex`. `/portal` lleva `noindex` en la metadata y `X-Robots-Tag: noindex, nofollow`
siempre, aunque el sitio esté lanzado.

## 2026-10-30 — Menú en el celular con `<details>`
El menú de secciones estaba oculto en móvil (`hidden md:block`), donde llega casi todo el
tráfico: los enlaces nuevos ("Para inversionistas", "Acceso clientes") no se verían. Se
agrega un menú desplegable con `<details>`/`<summary>`, que funciona sin JavaScript.

## 2026-10-31 — La Fase 7 entra en `v1.0.0`, apagada (reemplaza "sale como v1.1.0")
Reemplaza la versión de la entrada "Cambio de alcance: inversionistas y portal privado de
clientes (v1.1.0)" del 2026-10-30. La rama `feat/inversionistas-portal` se integra a `main`
antes del despliegue, sin tag, y `v1.0.0` se pone al desplegar e incluye esta fase: la
sección "Para inversionistas" pública y el portal con `site.portalClientes` apagado (en
producción `/portal` responde 404 y "Acceso clientes" no aparece). En Vercel no se
configura `NEXT_PUBLIC_PORTAL_CLIENTES`. Motivo: la fase está probada de punta a punta y
el portal apagado no expone nada; desplegar una sola versión evita mantener dos líneas.

## 2026-10-31 — Portal de clientes encendido en producción (reemplaza "portal apagado" de la entrada anterior)
Decisión del usuario, tras la prueba de punta a punta. `site.portalClientes` pasa a ser la
constante `true`, sin variable de entorno: `NEXT_PUBLIC_PORTAL_CLIENTES` deja de leerse
(antes solo funcionaba fuera de producción). Apagarlo es poner `false` en un commit.
`site.lanzado` y `site.accesoPremium` no cambian. Con el portal encendido, "Acceso clientes"
aparece en el menú y el pie, y `/portal` acepta el código por correo solo para cuentas que
ya existen en Supabase Auth. Lo que queda pendiente (aviso de privacidad con los datos del
portal, Supabase Pro, primera carga con la plantilla SQL) pasa a ser requisito antes de
cargar la obra del primer cliente, no antes de encender el código: sin obras cargadas, el
portal no muestra datos de nadie.

## 2026-10-31 — Los commits de este repo van con la cuenta de GitHub chucospanes
Vercel (cuenta chucospanes-9163) bloqueó el despliegue del commit `2148a9b` porque su autor
era un correo de otra cuenta de GitHub. El usuario configuró en este repo, solo en local
(`git config` sin `--global`), `user.name` = "chucospanes" y el correo de esa cuenta, e
hizo un commit vacío (`28f4d44`) con el que el despliegue pasó. **Regla:** el autor de
los commits debe ser la cuenta chucospanes; Claude nunca cambia `user.email` ni
`user.name` ni usa `--author`. Pendiente: confirmar si Vercel también bloquea commits con
la línea `Co-Authored-By` de Claude; si los bloquea, esa línea se deja de poner en este
repo.

## 2026-10-31 — Vercel Hobby mientras el sitio no esté lanzado; Pro antes de lanzar
Matiza "Hosting: Vercel Pro" (2026-10-25). Decisión del usuario: el proyecto sigue en el
plan Hobby (cuenta chucospanes-9163) mientras `site.lanzado` sea `false`, y pasa a Pro
antes del commit que lo encienda. Pasar a Pro queda en la lista de verificación previa al
lanzamiento del README. Riesgo aceptado: mientras tanto el sitio es público en
`roca-fuerte-web.vercel.app` (con `noindex`) y el portal está encendido; las reglas de
Hobby excluyen el uso comercial.

## 2026-10-31 — Confirmado: `Co-Authored-By` no bloquea el despliegue en Vercel
Cierra el pendiente de "Los commits de este repo van con la cuenta de GitHub chucospanes".
Vercel desplegó `8aa05e0` (autor chucospanes, con la línea `Co-Authored-By` de Claude) sin
bloqueo (Ready). La línea se sigue usando; lo que Vercel revisa es el autor del commit.

## 2026-10-31 — WhatsApp real: +503 7821-6321 (reemplaza "WhatsApp mientras el número sea placeholder")
`site.whatsapp` = `50378216321` (solo dígitos, como lo pide wa.me) es el único lugar del
número; en pantalla se muestra `+503 7821-6321` con `whatsappVisible()`, derivado del mismo
valor. Se quita el modo "número de prueba" (`whatsappEsPlaceholder`): los botones ya no
caen en `#contacto`, el aviso "Número de WhatsApp pendiente" de Contacto desaparece,
schema.org lleva el teléfono y `/api/clic` empieza a guardar clics en producción.

## 2026-11-01 — Plano de la casa en la web: resolución media y protección ligera
Decisión del usuario. Solo para la imagen del plano de la casa (no fotos de obra ni el
resto del sitio):
- **Resolución media:** la web sirve una copia de 1800 × 1737 px, reducida del PNG v4 de
  3550 × 3425 (lanczos3, PNG sin paleta: sin recortar ni cambiar colores). Las notas generales
  se leen al ampliar en el celular. Como el optimizador de imágenes no agranda, nadie puede
  pedir más de 1800 px. La alta resolución queda solo en el PDF de la ficha premium. El PNG
  original no está en `public/`.
- **Protección ligera:** sin menú del clic derecho, `draggable=false`,
  `-webkit-touch-callout: none` y `user-select: none`, sin JavaScript adicional ni
  dependencias. Disuade la copia casual; no la impide (captura de pantalla, herramientas del
  navegador). El `alt` descriptivo se conserva.

## 2026-11-02 — Hero: "Casas que duran. Y te lo demostramos." (matiza "Sin superlativos ni promesas de resistencia")
Decisión del usuario. La promesa central del sitio pasa a ser calidad durable y comprobable:
título "Casas que duran. Y te lo demostramos." y subtítulo "Cada material, cada etapa y cada
refuerzo, documentados en video. Tú lo compruebas antes de comprar." Matiza la regla del
2026-10-23: "duran" es una promesa de durabilidad, aceptada porque va atada a la prueba
("te lo demostramos") y no a un superlativo. La regla sigue para todo lo demás: nada de
"antisísmica", "resiste terremotos" ni garantías; la norma RTS solo se menciona en Calidad.
Consecuencia: publicar los primeros videos de materiales y refuerzo pasa a la lista previa
al lanzamiento (sin ellos, la promesa sale vacía). La metadata no cambia: no usaba el
título anterior.
