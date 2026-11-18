# Estado actual del proyecto

> Documento vivo. Claude Code lo actualiza al terminar cada tarea o fase.
> Mantenerlo corto: solo el presente. La historia vive en git y en DECISIONES.md.

**Última actualización:** 2026-11-17
**Versión:** v1.9.0 — foto de la tarjeta elegida desde un avance en `/admin` (migración 015); v1.8.1: área construida 47.50 m² (con el corredor techado) fuera de los titulares; v1.8.0: precio por modalidad de venta ($69,000 y $85,000), ilustración en la pantalla 3 del hero, fachada sin bloque visto; antes: foto de los bastones en el hero, sección "Hermano cercano" (salvadoreños en el exterior), casas vendidas ocultas, Diario de obra y panel `/admin`; desplegado en el dominio, sin lanzar (noindex); portal de clientes encendido

## Fase actual
**Fases 6 y 7 cerradas en `v1.0.0` (2026-10-31): el sitio está desplegado en
https://constructorarocafuerte.com, sin lanzar.** `site.lanzado` apagado (todo con
`noindex`), acceso premium apagado y portal de clientes encendido (`site.portalClientes` es
la constante `true`; la variable `NEXT_PUBLIC_PORTAL_CLIENTES` ya no existe y se puede
quitar de `.env.local`). Lo que falta para lanzar está en "Siguiente".

### Foto de la tarjeta desde un avance (`v1.9.0`, rama `feat/portada-desde-avance`, 2026-11-17)
- Panel: "Usar como foto de la tarjeta" en cada foto de "Avance nuevo" (una sola; desactivada sin
  "Publicar también en la ficha") y en cada foto de un avance ya publicado (la actual: "Foto de la
  tarjeta ✓"). Aviso en fotos verticales; se pueden elegir igual. Un avance con la portada no se
  puede quitar de la ficha. Ver DECISIONES.md (2026-11-17) y la guía de obras (paso 6 bis).
- **Migración `015_portada_desde_avance.sql` escrita, sin aplicar** (la aplica el usuario), con su
  prueba `supabase/pruebas/015_portada_desde_avance.sql` (cliente no administrador y anon
  rechazados, tres cambios seguidos con orden exacto 1, 2, 3, 4, casa sin fotos, 9 candados).
  **Hasta aplicarla, el botón responde con un error** (la función no existe); el resto del panel
  sigue igual.
- Lector de medidas del JPG (`src/lib/jpg.ts`): 13 casos en `node scripts/prueba-jpg.mjs` (SOF0,
  SOF2, EXIF 1/3/5/6/7/8 en los dos órdenes de bytes, relleno, PNG y cortados). Con lecturas: da las
  mismas medidas que las 3 fotos registradas de la casa y lee bien las 14 fotos del Diario.

### Área construida 47.50 m² y el área fuera de los titulares (`v1.8.1`, en `main`, 2026-11-12)
- Área construida 47.50 m² (con el corredor techado de 3.90 m²), útil interior 38.07 m². Plano v5:
  `assets/plano-casa-esparta-v5.pdf` (copia exacta) y `public/plano-casa-esparta-v5-1800.png`
  (generado del PDF, 1800 × 1737, misma protección); salen los v4. Descarga premium y ficha
  premium apuntan al v5.
- El área sale del hero ("Casa Modelo Esparta · Una planta · 2 dormitorios · Desde 100 m² de
  terreno"), de la metadata, Open Graph y schema.org (descripciones con "una planta" y el
  terreno). Tarjetas del catálogo y bloque de la portada: "Una planta · Desde 100 m² de terreno".
  Queda solo en "La casa" (cuadro de áreas sin cifras grandes, con la nota del corredor), la ficha
  de cada casa, el área premium, `floorSize` de schema.org y el plano.
- Supabase no guarda el área (planta del modelo): sin SQL. Verificado con lecturas.
- Probado: lint, typecheck y build; capturas a 390 px sin desborde; en el build ninguna página
  tiene "43.60"; el plano v4 da 404.
- Plano del lote v2 ("47.50 m² de construcción (incluye corredor techado)"):
  `assets/plano-esparta-v2.pdf` y `public/plano-esparta-v2.png` (4640 × 2032), copias exactas de
  Descargas; salen los anteriores. Descarga premium y ficha premium apuntan al v2. Hero en tres
  líneas a 390 px, aprobado. Corredor en el avalúo: lo confirma el usuario con el ingeniero (la
  nota "incluye el corredor techado" se queda).

### Precio por modalidad, hero 3, portada y fachada corregida (`v1.8.0`, en `main`, 2026-11-12)
- **Avance "Fundación terminada y bastones listos" verificado con lecturas (2026-11-12):** 4 fotos
  en `obras` y en la copia pública de `casas`, idénticas byte por byte, sin EXIF, GPS ni XMP
  (1600 px: así venían); la ficha del dominio lo muestra en el Diario de obra.
- **Migración 013 aplicada por el usuario** (modalidades; verificado con lecturas: tabla con la
  modalidad inicial de la casa, `clics_venta.modalidad_id`, vista con la columna, publishable lee
  y no escribe). **Su prueba falló** al borrar una casa con clics por modalidad (diagnóstico en la
  014 y DECISIONES.md). **Migración 014 aplicada por el usuario (2026-11-12):** su prueba y la de
  la 013, corrida otra vez, dieron "PRUEBA SUPERADA".
- Código (con la 013 aplicada): "Desde $X" en la tarjeta, la portada y Precios; ficha con las
  modalidades lado a lado (también a 390 px), nota bajo el lote y botón "Me interesa" por
  modalidad (mensaje con la opción y el lote, clic con `modalidad_id`); schema.org con una oferta
  por modalidad; `/api/clic` exige que la modalidad sea de la casa y esté disponible. Las
  columnas viejas de `casas_venta` ya no se leen. Construir a pedido sigue "A consultar".
- Pantalla 3 del hero con la ilustración (`public/hero/ilustracion-hogar.jpg`, copia sin
  metadatos) rotulada "Ilustración de referencia"; contraste AA medido: título 7.0:1 y
  subtítulo 6.4:1 en el peor caso (390 y 1280 px), sin cambiar el velo.
- Fachada: corredor repellado en gris cálido, sin bloque visto. `public/fachada-esparta-v2.png`
  generado del PDF vigente (`assets/fachada-esparta.pdf`, sin cambios), `assets/og-fachada-v2.png`
  con el mismo encuadre que el anterior y `fachada-esparta-limpia-v2.svg`; salen los viejos.
  Acabados, alt y CONTEXTO.md corregidos.
- Probado: lint, typecheck y build; capturas a 390 px (y 1280 de la ficha) con una simulación
  local de las dos modalidades (parche temporal, no commiteado), sin desborde; build final contra
  Supabase real: con la modalidad inicial (sin precio), la ficha dice "Precio y lote" y
  "Consultar". Validación del clic: 6 casos. Guía de casas con la plantilla 6 (modalidades), sin
  prueba con rollback todavía.
- **Para el usuario, fuera del repo (`C:\Proyectos\roca-fuerte-sql\`):** `14-portada-fundacion.sql`
  (subir antes `fundacion-bastones.jpeg` a `casas/{casa_id}/`) y `15-modalidades-sjv.sql`
  ($69,000 con la nota de segregación y $85,000), los dos con candados ALTO.
- **Hecho (2026-11-12):** capturas aprobadas; el usuario subió la foto y corrió los SQL 14 y 15
  sin ALTO. Verificado con lecturas: 2 modalidades ($69,000 con la nota y $85,000), visibles con
  la publishable; portada `fundacion-bastones.jpeg` en orden 1 (idéntica a la local, sin EXIF ni
  GPS) y las anteriores en 2 y 3; 0 usuarios de prueba; `clics_venta` en 401. **Pendiente:** migración que borre las
  columnas viejas de `casas_venta` (precio, lote y parqueos) y ajuste la plantilla 1.

### Foto del hero: bastones de varilla (`v1.7.1`, en `main`, 2026-11-10)
- Pantalla 1 con `public/hero/obra-sjv-bastones.jpg` (copia exacta, sin EXIF ni GPS; 1109 × 900),
  alt nuevo y encuadre `65% 50%`; AVIF de 33 KB (640 px) y 86 KB (1080 px), carga inmediata y
  prioridad alta. Contraste AA medido sobre el fondo real: título 7.9:1, subtítulo 6.9:1 en el
  peor caso; el velo no cambia. Sale `obra-sjv-trazo.jpg`. Lint, typecheck y build pasan;
  capturas a 390 y 1280 px, aprobadas por el usuario. **Pendiente:** el usuario pasará la foto en
  alta resolución (la actual mide 1109 px y en pantallas anchas se estira). Ver DECISIONES.md
  (2026-11-10).

### Sección "Hermano cercano" (`v1.7.0`, en `main`, 2026-11-05)
- Sección 02 de la portada (`id="hermanos"`, después de "Lo que nos diferencia"): título "Hermano
  ~~lejano~~ cercano." (el lector de pantalla lee "Hermano cercano."), subtítulo, 4 puntos y botón
  de WhatsApp (opción `general`, ubicación `hermanos`, mensaje propio). Mapa SVG en línea,
  decorativo, con líneas punteadas desde Los Ángeles, Houston, Washington, Nueva York, Toronto,
  Madrid, Roma y Melbourne hasta El Salvador; animación sutil apagada con
  `prefers-reduced-motion`. El mapa no va detrás del texto (no le resta contraste): columna
  derecha en escritorio; franja centrada en El Salvador en el celular. "Hermano cercano" en el
  menú; con 10 enlaces, el menú en línea pasa a 1280 px (antes 1024) y debajo se usa el
  desplegable.
- Migración `012_clics_hermanos.sql` escrita (ubicación `hermanos` en el CHECK de
  `clics_venta`, sin "if exists"). **Aplicada por el usuario (2026-11-05) y confirmada** con
  `pg_get_constraintdef`: `clics_venta_ubicacion_check` incluye `hermanos` (al final de la
  lista, después de `catalogo`). Con la publishable, `clics_venta` sigue en 401.
- Probado: lint, typecheck y build; capturas a 390 y 1280 px (sin desborde).
- Capturas aprobadas. "Pagos por etapas" (decisión del usuario): "30 % al firmar y el resto por
  transferencia bancaria, conforme avanza la obra.", igual que la pregunta frecuente de pagos.

### Casas vendidas ocultas en lo público (`v1.6.0`, en `main`, 2026-11-05)
- **Migración 011 aplicada por el usuario (2026-11-05)** y su prueba con rollback superada. La
  política pública de `casas_venta` excluye las vendidas y, en cascada, sus fotos, etapas y
  diario (nada se borra); `casas_vendidas()` da solo modelo y departamento; candado
  `obras_casa_solo_compra`; con la casa vendida, el administrador puede quitar de la ficha (y
  borrar las copias), no publicar. Ver DECISIONES.md (2026-11-05).
- Código: `/casas` con la sección "Casas vendidas" (tarjeta mínima "{modelo} · Vendida ·
  {departamento}" con la ilustración de la fachada, sin enlace); la ficha de una vendida da 404
  con noindex (el proxy ya lo hacía al no encontrarla); bitácora con la casa en construcción con
  etapas (si no hay, terminada o reservada); sin ninguna, la sección no aparece y se ocultan sus
  enlaces (menú, pantalla 2 del hero sin botón y Calidad). Numeración de secciones con un
  contador CSS: sin bitácora, Precios pasa a 05 sin hueco. Panel: "Publicado, pero no se ve: casa
  vendida" y solo "Quitar de la ficha". Guía de casas y plantilla 5 actualizadas (su prueba,
  regenerada: solo cambió el texto del ALTO de casa vendida).
- Probado: lint, typecheck y build; build contra una simulación local de la 011 en 4 casos (obra
  y vendida, solo vendida, ninguna, solo reservada con etapas); capturas a 390 px; build contra
  Supabase real: bitácora de la casa de San José Villanueva, sin vendidas, Diario de obra con el
  zanjeado.
- Capturas aprobadas por el usuario (con los dos ajustes de abajo).
- Ajustes del usuario sobre las capturas: la tarjeta de vendida usa una elevación limpia
  dibujada aparte (`public/fachada-esparta-limpia.svg`, sin cotas, notas ni textos) y el punto 1
  de Calidad dice "queda documentado etapa por etapa".

### Diario de obra en la ficha de la casa (`v1.5.0`, en `main`, 2026-11-05)
- **Migración 010 aplicada por el usuario (2026-11-05)** y su prueba con rollback superada.
  Verificado con lecturas: `casas_venta_avances` en 0, ningún avance con publicación, sin
  usuarios de prueba, `registro_admin` con 1 fila (el avance real), bucket `casas` solo con las 2
  fotos de la casa; con la publishable, las funciones nuevas responden 401.
- Ficha: bloque "Diario de obra" dentro de "Avance de la obra" (orden cronológico, fotos del
  bucket `casas` con `next/image`, video vertical para Shorts); sin publicaciones no aparece.
- Panel: "Publicar en la ficha" / "Quitar de la ficha" / "Terminar publicación" (a medias) en cada
  avance de una obra con casa ligada, con confirmación; casa vendida: sin botones (congelado).
  En "Avance nuevo", casilla "Publicar también en la ficha de la casa" **marcada por defecto**
  (solo con casa ligada no vendida); se publica solo si subieron todas las fotos. Las fotos se
  copian una por una del bucket `obras` a `casas` con la sesión del usuario; el servidor rechaza
  las que traen EXIF/GPS o no son JPG (probado: acepta la foto real del panel, rechaza EXIF, GPS
  y PNG).
- Probado: lint, typecheck y build; capturas a 390 px con páginas temporales de simulación (sin
  desborde; casilla marcada por defecto); build contra Supabase real: la ficha responde 200 sin
  el bloque (no hay publicaciones).
- Capturas aprobadas. **Prueba de peticiones manipuladas de la 010 superada (2026-11-05)** con la
  sesión real de la cuenta de cliente de prueba: 3 funciones, insert/update/delete en
  `casas_venta_avances`, cambiar `avances.publicacion_id` y 3 subidas al bucket `casas`
  rechazadas; no lista copias ni ve publicaciones; borrar en `casas` no borra nada. Verificado
  con lecturas que no quedó nada escrito. Cuenta de prueba quitada y borrada (verificado). **Zanjeado publicado
  desde el celular (2026-11-05):** visible, con su copia `01.jpg` en `casas` (674 KB, sin EXIF) y
  el original en `obras`; verificado con lecturas y en la ficha.
- Prueba real de `/admin` (2026-11-05): avance "Zanjeado para las fundaciones" con 1 foto
  (01.jpg, 674 KB, 1506 × 2000, sin EXIF, XMP ni GPS, orientación correcta) y su fila en
  `registro_admin`. Cuenta de prueba del cliente quitada de la obra y borrada (verificado).

### Panel de administración `/admin` v1 (`v1.4.0`, en `main`, 2026-11-05)
- **Migración 009 aplicada por el usuario (2026-11-05)** y su prueba con rollback superada
  (cliente sin escritura en 16 intentos, admin solo escribe con funciones, Storage solo fotos en
  la carpeta de un avance, registro). Alta del usuario como administrador, obra ligada a la casa
  (`obras.casa_id`) y etapas 3–8 del portal creadas con SQL fuera del repo. Verificado con
  lecturas: 1 administrador (el usuario), obra ligada, 8 etapas en el portal y 8 públicas, sin
  restos de la prueba; con la publishable, `administradores`, `registro_admin`, `es_admin` y
  `admin_cambiar_etapa` responden 401.
- Código: acceso con el mismo código por correo; 404 real desde el proxy si la sesión no es de
  administrador (`es_admin()` en la base) y otra revisión en cada página; `noindex` y
  `X-Robots-Tag`. Lista de obras, cambiar etapa (botón grande solo en la etapa en proceso y la
  siguiente; "Corregir" en todas; confirmación que dice qué más cambia; refresca la caché
  pública con `revalidateTag`), avance nuevo con fotos y agregar fotos a un avance. Fotos
  comprimidas en el navegador (JPG de 2000 px, calidad 0.8, orientación del EXIF aplicada),
  subidas una por una directo a Storage con nombres fijos (01.jpg…) y reintento sin duplicar.
  YouTube Shorts ya se aceptaba (base y código) y se ve vertical.
- Probado: lint, typecheck y build; capturas a 390 px con páginas temporales de simulación (sin
  sesión ni Supabase); compresión con fotos simuladas de celular (3.7 MB y PNG de 11 MB → JPG de
  ~730 KB; orientación 6 → vertical; archivo ilegible rechazado); TikTok rechazado y Short
  aceptado. Con el build contra Supabase real: `/admin` sin sesión muestra el acceso con
  noindex; una obra sin sesión no filtra datos y redirige a `/admin`.
- Capturas aprobadas por el usuario. **Prueba de peticiones manipuladas superada (2026-11-05):**
  con la sesión real de una cuenta de cliente de prueba (miembro de la obra; sesión obtenida con
  un enlace generado por la clave secreta, sin correo), 30 intentos rechazados: las 2 funciones
  (42501), inserts en 9 tablas, updates en 7, deletes en 6, lectura de `administradores` y
  `registro_admin`, y 4 subidas a Storage (carpeta de un avance real, documentos, otra obra y
  sobrescribir). La cuenta veía solo su obra y `es_admin` = false. Verificado con lecturas que no
  quedó nada escrito. Membresía quitada y cuenta borrada por el usuario (verificado). Prueba real desde el celular:
  ver el Diario de obra arriba.

### Portal: fotos, documentos y materiales de la obra propia (en `main`, 2026-11-05)
- Plantillas en `docs/GUIA_CARGA_OBRAS.md`, con candados ALTO: **avance nuevo** (reescrita: etapa
  por número, no duplica fecha y título, devuelve la carpeta de fotos), **documento nuevo**
  (comprueba que el archivo esté subido en `{obra_id}/documentos/`; PDF, JPG, PNG o WebP) y
  **materiales** (varias filas, marca opcional, sin repetidos). Prueba con rollback
  `supabase/pruebas/004_plantillas_avance_documento_materiales.sql` (24 casos, armada desde la
  guía): **superada (2026-11-05, la corrió el usuario)**; confirmado con lecturas que no dejó
  nada (solo la obra real, con sus 2 etapas y 1 avance; 0 documentos y 0 materiales; bucket
  `obras` vacío). Copias llenas para la obra de San José Villanueva
  en `C:\Proyectos\roca-fuerte-sql\` (7, 8 y 9), fuera del repo.
- Documentos en foto: el portal ya los abría (la ruta firma la URL y el navegador muestra la
  imagen); sin cambios en la base. Nuevo: la tarjeta dice "PDF" o "Imagen" (por la extensión
  de la ruta, que no sale del servidor). Lint, typecheck y build pasan; capturas a 390 y
  1280 px con una página temporal de simulación (sin sesión ni Supabase, no commiteada). Falta
  verlo con el primer documento real.
- La obra (`693bc356…`) no tiene todavía fotos, documentos ni materiales; sus carpetas en
  Storage → `obras` no existen (verificado con lecturas el 2026-11-05).

 (`v1.3.0`, 2026-11-05)
- Bitácora y avance de la ficha desde `casas_venta_etapas` (migración 008, una sola fuente);
  sale `src/content/bitacora.ts`. "Obra en curso: {nombre}" con la línea según el estado de la
  casa, "Ver la casa" y la nota del portal; etiqueta "Casa Roca Fuerte · En venta" en las
  disponibles; "Ver el avance de esta casa" en la ficha (baja a su sección "Avance de la
  obra"). Etapa actual de la ficha desde la etapa en proceso. Ver DECISIONES.md (2026-11-04).
- **Migración 008 aplicada por el usuario (2026-11-05)** y su prueba con rollback superada
  ("PRUEBA SUPERADA: 5 candados…"). Carga inicial corrida por el usuario: `etapas_creadas = 8`.
  Verificado con lecturas: 8 etapas de la casa `esparta-san-jose-villanueva` (Terracería
  terminada desde el 2026-10-25, "Trazo y zanjeado" en proceso desde el 2026-11-03, las otras 6
  por iniciar sin fecha, sin videos), descripciones idénticas al SQL aprobado; la publishable
  lee las 8 (casa publicada) y sigue con 401 en `obras`, `etapas`, `obra_miembros` y
  `avances`.
- Probado con el build de producción contra la simulación local (casa en construcción con
  video, reservada, vendida con el avance congelado, sin etapas y Supabase caído) y con el
  build final contra Supabase real (lint, typecheck y build pasan; capturas a 390 y 1280 px).
- **Portal (2026-11-05):** obra "Casa Modelo Esparta en San José Villanueva" (modalidad compra,
  en obra desde el 2026-10-25), con el usuario como único miembro, etapas 1 "Terracería"
  (terminada) y 2 "Trazo y zanjeado" (en proceso desde el 2026-11-03) y un avance; sin
  material ni documento. Verificado con lecturas (clave secreta, solo lectura).
- **Cada cambio de etapa vive en dos lugares** (`casas_venta_etapas`, público, y `etapas` del
  portal): la **plantilla 5 "cambiar etapa"** de `docs/GUIA_CARGA_CASAS.md` los cambia a la vez
  (slug, obra, correo, orden, estado y fecha; candados ALTO si no encuentra exactamente una
  etapa de cada lado, si los nombres no coinciden o si la casa está vendida). Su prueba con
  rollback, `supabase/pruebas/008_plantilla_cambiar_etapa.sql` (16 casos), **superada
  (2026-11-05, la corrió el usuario)**; confirmado con lecturas que no dejó filas (8 etapas
  públicas, 2 del portal, sin casas, obras ni usuarios de prueba). Candados aprobados. Al venderse la casa, el público se deja de actualizar y se agrega al
  comprador como miembro de la obra.

### Pendientes del sitio llenados (2026-11-04, en `main`)
- **Desplegado y verificado con lecturas en el dominio (2026-11-04):** "A consultar", la
  bitácora (sin porcentajes), el paso 1, las 5 respuestas, ASTM C90 y A615, "Techo de lámina a dos aguas" y
  el aviso con responsable, domicilio, correo, WhatsApp, plazos, conservación y la sección del
  portal. Sin garantía, redes, RTS, profesional, "15 %" ni párrafo de píxeles publicado.
- Ajustes finales (2026-11-04): Precios con "Cotización clara y cerrada antes de empezar.";
  columna "Por qué" de materiales oculta hasta tener las razones; Terracería del 25 de octubre
  (terminada) y "Trazo y zanjeado" del 3 de noviembre de 2026 (en proceso).
- Precio a pedido "A consultar"; bitácora sin porcentajes (Terracería terminada, "Trazo y
  zanjeado" en proceso, el resto "Por iniciar" sin fecha); pie
  sin redes; Cómo trabajamos paso 1 solo por WhatsApp; 5 preguntas frecuentes respondidas y
  sin la de garantía; bloque y acero con especificación, los otros 9 materiales "Por
  confirmar"; techo sin porcentaje; Calidad sin RTS ni profesional; aviso de privacidad con
  responsable, domicilio, correo, WhatsApp, plazos y conservación, y sección del portal. Ver
  DECISIONES.md (2026-11-04).
- Casa del catálogo con `etapa_actual = 'Trazo y zanjeado'`: `update` corrido por el usuario
  (2026-11-04); verificado con lecturas en Supabase y en la ficha del dominio.
- **Pendientes anotados:**
  - Ingeniero responsable: al tenerlo, volver a mostrar en Calidad la norma (RTS 91.01.02:21) y
    el profesional que firma, con nombre y registro (`calidadConIngeniero` en
    `src/content/landing.ts`).
  - Aviso de privacidad: cambiar el titular a "Roca Fuerte, S.A.S." cuando quede inscrita en
    el CNR (`site.privacidad.titular`); el abogado precisa el plazo legal de los datos de
    clientes.
  - **Técnico:** borrado automático de los leads a los 6 meses del último contacto (el aviso
    ya lo promete; hoy no existe: hasta implementarlo, borrar a mano). Antes del lanzamiento.
  - **Técnico:** preparar la instalación del píxel de Meta y TikTok cuando el abogado apruebe
    el aviso (el párrafo está en las notas del aviso, sin publicar).
  - Razones ("Por qué") de cada material: al tenerlas, volver a mostrar la columna en
    `src/components/Materiales.tsx`.

### Diferenciadores (`v1.2.0`, 2026-11-04)
- **En `main` y desplegado; verificado con lecturas en https://constructorarocafuerte.com
  (2026-11-04):** `/` 200 con `noindex`; h1 "Casas que duran." y los textos de las 3
  pantallas, "Lo que nos diferencia" y "Construir a pedido"; sin "Y te lo demostramos", "en
  video", "Por qué construimos", "Construir Esparta en mi terreno", "Videos:" ni marcas de
  materiales; WhatsApp de `construir` (hero, Precios, Contacto) con "Hola, quiero una casa
  Esparta a pedido."; foto del hero con prioridad alta, servida en AVIF (37 KB a 750 px); la
  foto de la terracería ya no se usa. `/casas`, la casa de San José Villanueva y `/portal`
  200; `/esparta/ficha` 404.
- Hero en 3 pantallas con avance solo manual (deslizar con scroll-snap nativo, flechas, puntos
  y flechas del teclado; pantallas ocultas `inert`; sin avance automático; sin dependencias).
  Pantalla 1: foto del trazo de San José Villanueva (`public/hero/`, los trabajadores dieron
  permiso), en AVIF calidad 60, carga inmediata y prioridad alta. Pantallas 2 y 3: color de
  la marca (la 2, hasta tener una foto horizontal). "Lo que nos diferencia" reemplaza "Por qué
  construimos así". "Construir a pedido" reemplaza "Construir en tu terreno" (WhatsApp: "Hola,
  quiero una casa Esparta a pedido."; `construir` sin cambio en la base). Sin promesa de video.
  Sin marcas de materiales en lo público (en el portal se quedan). Ver DECISIONES.md
  (2026-11-03 y 2026-11-04).
- Probado con el build de producción (simulación local con una casa y sin casas, y build final
  con la configuración real): lint, typecheck y build pasan; flechas, puntos y teclado cambian
  de pantalla, la visible es la única sin `inert` y su punto lleva `aria-current`; sin
  desborde a 390 ni 1280 px; mensajes de WhatsApp revisados en el HTML.
- **Lighthouse 13.5.0, celular, build de producción en el puerto 3100** (3 corridas válidas; la
  primera tras arrancar sale siempre baja): Performance 78/80/85, Accesibilidad 100, Buenas
  prácticas 100, SEO 69 (solo por el `noindex` de sitio sin lanzar). LCP 3.4–3.5 s (la foto
  del hero; antes 2.9 s con el párrafo), FCP 1.2–1.7 s, CLS 0, TBT 200–330 ms, peso 406 KB. La
  foto baja en 37 KB (AVIF a 750 px) en unos 100 ms; casi todo el LCP es retraso de pintado
  bajo la CPU simulada, no la descarga. Corregido en la medición: el carrusel usaba `li` con
  `role="group"` (lista inválida, Accesibilidad 96); ahora usa `div`.
- Portal: tipo de documento `factura` con su apartado "Facturas" (solo aparece si hay
  facturas). Migración 007 **aplicada por el usuario (2026-11-04)**: el CHECK era
  `documentos_tipo_check`, "Success". No verificable con lecturas por la API (no expone el
  catálogo de Postgres) y no probado en pantalla (requiere sesión y una obra con factura).


### Catálogo de casas en venta (`v1.1.0`, en `main` y desplegado el 2026-11-02)
- **Verificado con lecturas en https://constructorarocafuerte.com (2026-11-02):** `/` y `/casas`
  200 con `noindex`; `/casas/no-existe` y `/casas/Casa%20Uno` 404 con `X-Robots-Tag` y meta
  noindex; `/casa-no-disponible` 200 con noindex; `/portal` 200, `/esparta/ficha` 404; sitemap
  vacío; `www` → 308 al dominio. Sin casas cargadas: el hero muestra el WhatsApp de comprar,
  el bloque "Casas disponibles" no aparece y `/casas` muestra el aviso con WhatsApp
  (`catalogo`). Lema, pilares, "Comprar una casa" y "Quiero más información" visibles.
- **Primera casa real publicada (2026-11-02, `v1.1.1`):** `esparta-san-jose-villanueva`
  (cargada por el usuario con las plantillas: lote 10 × 20, en construcción, "Terracería y
  trazo", precio "Consultar", agua por confirmar; 2 fotos, sin plano propio). Verificado con
  lecturas en el dominio: página 200 con noindex (sitio sin lanzar), título y datos correctos,
  m² del modelo y "Plano del modelo Esparta" con la protección (`draggable=false`,
  `select-none`, `-webkit-touch-callout: none`); fotos del bucket 200 `image/jpeg`, mismos
  bytes que las de WhatsApp, sin EXIF, XMP, IPTC ni GPS, y servidas por `/_next/image`;
  `og:image` = portada; el bucket no se lista con la publishable. Botón con
  `data-casa` = su id y mensaje con el nombre de la casa. Hero y Precios: "Ver la casa"; bloque
  "Casas disponibles" en la portada y la casa en `/casas`.
- Tarjeta "Comprar una casa" de Precios con la regla del hero (en `main`, `v1.1.1`).
- **Prueba real del conteo con `casa_id`: hecha (2026-11-02).** Los dos clics del usuario
  desde su celular en el botón de la casa (11:31 y 11:34, hora de El Salvador) quedaron en
  `clics_venta` con `opcion = casa`, `ubicacion = casa` y su `casa_id` (filas 6 y 7). Mensaje de la casa
  sin "casa" repetido: `Hola, me interesa la "{nombre}" en {municipio}. ¿Me pueden dar más
  información?`
- Migración 005 aplicada por el usuario (2026-11-02) y su prueba con rollback superada
  ("PRUEBA SUPERADA: 9 candados…"). Verificado con lecturas: `casas_venta` y
  `casas_venta_imagenes` en 0 filas; con la clave publishable, lectura 200 vacía, inserción
  401/42501 en las dos y las 6 tablas del portal en 401; bucket `casas` público (5 MB,
  JPEG/PNG/WebP) y vacío para la publishable; `obras` sigue privado.
- Guía `docs/GUIA_CARGA_CASAS.md` con 3 plantillas (casa nueva sin publicar, fotos y plano,
  publicar u ocultar) y su prueba `supabase/pruebas/005_plantillas_casas.sql` (17 casos,
  armada desde la guía). **Falta que el usuario corra esa prueba.**
- `/casas` (tarjetas: vendidas al final, sin precio en reservadas y vendidas, "Consultar" sin
  precio; vacío o con error: aviso y WhatsApp) y `/casas/[slug]` (fotos, datos del lote y la
  planta, servicios, qué incluye, video y plano protegido; planta Esparta toma m² y plano de la
  portada). Datos con la clave publishable, caché `minutes`. "Casas" en el menú (escritorio
  desde 1024 px: con 9 enlaces desbordaba a 768) y en el pie. Probado con el build de
  producción: contra Supabase real (catálogo vacío) y contra una simulación local de la API
  con 4 casas (sin tocar Supabase), capturas de 360 a 1280 px sin desborde.
- Casa inexistente: 404 real desde `proxy.ts`, con `X-Robots-Tag: noindex` y meta noindex,
  también con el sitio lanzado (ver DECISIONES.md). Probado: slug inexistente o inválido →
  404; casa publicada → 200 con su contenido; Supabase caído → 200 "No pudimos cargar esta
  casa" con noindex en encabezado y meta.
- Botón "Quiero esta casa" por casa (no en vendidas) con conteo `casa` + `casa_id`, y
  `catalogo` en los WhatsApp de `/casas` vacío o con error. Probado contra la simulación
  local: esquema (22 casos), ruta (casa publicada 204 e insertada; oculta, inexistente,
  inválida, sin id o id en otra opción 400 sin insertar; base caída 204 sin insertar) y clic
  real en el navegador (mensaje con la casa y "(Ref: …)", clic con `casa_id` y UTM).
- SEO: metadata y JSON-LD (`RealEstateListing`) por casa, sitemap con `/casas` y cada casa
  (solo lanzado). Probado con un build temporal con `site.lanzado = true` contra la
  simulación (no se commiteó): casas indexables con su título, canonical y foto; 404, casa
  sin cargar y catálogo sin cargar con noindex; sitemap con las 4 casas publicadas (sin la
  oculta).
- Portada: bloque "Casas disponibles" (3 primeras no vendidas; sin casas o si Supabase falla,
  no se muestra) debajo del hero. Precios: "Comprar una casa" sin datos propios, lleva a
  `/casas` (o a la casa, si hay una sola disponible). Hero: "Ver casas en venta". Contacto:
  "Quiero más información" con el mensaje general. Sale `site.precios.comprarCasa` y el
  desglose de compra de la ficha premium. Probado con 4 casas simuladas, una sola, Supabase
  caído y Supabase real (vacío). Precios con la regla del hero (rama `feat/precios-sin-casas`,
  sin unir a `main`): sin casas o con Supabase caído, "Quiero esta casa" al WhatsApp de
  comprar (`precios`); probado con la simulación en los 4 casos. Ojo: `next build` reusa en `.next` lo guardado con
  `use cache` de un build anterior; en producción se corrige al revalidar (1 min).
- Migración `006_clics_casas.sql` escrita (solo archivo): opción y ubicación `casa`,
  ubicación `catalogo`, columna `casa_id` y vista de resumen con la casa; comprueba al final
  que anon y authenticated no tienen permisos sobre la tabla ni la vista. **Esperando la
  revisión del usuario antes de aplicarla.** Aplicada por el usuario (2026-11-02); verificado con
  lecturas: `clics_venta` y `clics_venta_resumen` en 401 con la publishable; `casa_id` y la
  columna `casa` de la vista existen. Prueba de plantillas de casas superada (17 casos). - Hero: con casas disponibles, "Ver casas en venta" o "Ver la casa"; sin casas o con
  Supabase caído, el WhatsApp de comprar. Probado con la simulación (varias, una, ninguna,
  caída: una sola lectura del catálogo por build) y con Supabase real (vacío: WhatsApp).
- Siguen: guía y plantilla de carga, `/casas` y `/casas/[slug]`, bloque en la portada y
  Precios, migración 006 (clics por casa), botón por casa y SEO. La rama se une a `main` solo
  con la 005 y la 006 aplicadas. Diseño en DECISIONES.md (2026-11-02).

### Hero, lema y pilares (2026-11-02)
- "Casas que duran. Y te lo demostramos." + "Cada material, cada etapa y cada refuerzo,
  documentados en video. Tú lo compruebas antes de comprar." Metadata sin cambios (no usaba
  el título anterior). Ver DECISIONES.md.
- Lema en el pie (páginas públicas) y sección 01 en dos pilares: Calidad comprobable y
  Comunidad. Capturas a 390 y 1280 px revisadas, sin desborde. Ver DECISIONES.md.

### Plano de la casa: resolución media y protección ligera (2026-11-01)
- La web sirve `public/plano-casa-esparta-v4-1800.png` (1800 × 1737, reducido del original
  sin recortar ni cambiar colores); el PNG de 3550 px salió de `public/` (sigue en el
  historial de git). Sin menú contextual, arrastre, menú de mantener presionado ni selección
  en esa imagen; `alt` sin cambios. Ver DECISIONES.md.

### Plano de la casa v4 (2026-11-01, pendiente 27 del inventario: hecho)
- Lámina A-01 v4 (nota del techo con el pretil, cuadro de "Notas generales" y marcas de
  autoría): `public/plano-casa-esparta-v4.png` (3550 × 3425) y
  `assets/plano-casa-esparta-v4.pdf`, copiados de Descargas byte a byte (mismo SHA-256, sin
  recortar ni reprocesar; `next/image` sirve las versiones reducidas, igual que antes). La
  descarga premium pasa a `/descargas/plano-casa-esparta-v4.pdf`. Borrados los
  `plano-casa-esparta` anteriores. Capturas revisadas a 390 px (sin desborde) y 1280 px, y
  ampliado en el celular (sirve la imagen a resolución completa): las notas y el pie de
  autoría se leen; la microlínea de autoría se conserva, diminuta como en el original.

### Despliegue (verificado con lecturas el 2026-10-31)
- **Vercel** (cuenta chucospanes-9163, plan Hobby hasta el lanzamiento) despliega cada push a
  `main`; autor de los commits: la cuenta chucospanes (ver DECISIONES.md).
- **Dominio:** `constructorarocafuerte.com` con registro A a Vercel y `www` por CNAME (DNS en
  Namecheap; los registros de Resend no se tocaron). HTTPS activo en los dos. `https://www`
  → 308 al dominio sin www conservando ruta y parámetros; `http://` → 308 a `https://`.
  Al principio Vercel tenía `www` como principal; el usuario lo corrigió.
- **Supabase Auth → URL Configuration:** Site URL `https://constructorarocafuerte.com`;
  Redirect URLs del dominio, `www`, `roca-fuerte-web.vercel.app` y `localhost`.
- **En el dominio:** `/`, `/portal`, `/privacidad`, `/robots.txt`, `/sitemap.xml` y
  `/opengraph-image` responden 200; `/esparta/ficha` y `/descargas/…` 404; todas con
  `X-Robots-Tag: noindex, nofollow`, y `/` y `/portal` también con la meta `noindex`.
  Canonical, `og:url` y `og:image` con `https://constructorarocafuerte.com`. `robots.txt`
  con `Allow: /`, sin sitemap (solo excluye ficha, descargas y API); sitemap vacío. "Acceso
  clientes" y "Para inversionistas" visibles; `/portal` muestra el formulario del código.

### Fase 7 — inversionistas y portal privado de clientes (en `main`, portal encendido)
- **Landing:** sección "Para inversionistas" (07) con botón de WhatsApp
  `inversionista`/`inversionistas`, menú en el celular con `<details>` y enlaces en el pie.
  Pregunta frecuente de permisos respondida con el mismo texto que la sección.
- **Portal `/portal`** (`site.portalClientes`): código por correo sin crear cuentas, lista
  de obras, `/portal/obras/[id]` y `/portal/documentos/[id]` (URL firmada de 60 s). Todo se
  lee con la sesión del usuario; `noindex` + `X-Robots-Tag`, sin Disallow.
- **Supabase:** 003 y 004 aplicadas por el usuario el 2026-10-30 (PostgreSQL 17.11) y
  verificadas con lecturas (sin sesión, 401 en las 6 tablas; bucket `obras` privado).
- **Prueba de aislamiento (SQL, revertida):** superada.
- **Prueba de punta a punta (2026-10-30, cuentas `<tu-correo>+portal-a@…`, `+portal-b`,
  `+portal-c` y `+portal-x`):** en el navegador, A 1–7 y B 1–7 correctas (cada uno ve
  solo su obra, foto, video, material y documento; la URL del documento vence a los 60 s;
  la obra y el documento del otro dan "no encontrado"/404; sin sesión vuelve a `/portal`);
  correo inexistente (8): mensaje genérico, sin correo y sin usuario creado; cuenta sin
  obras (9): "Este correo no tiene obras asignadas". Storage por SQL de solo lectura: "A ve
  2 propios y 0 de B. B ve 2 propios y 0 de A."
- **Limpieza:** el usuario borró carpetas, obras y usuarios de prueba; su consulta dio las 8
  filas en 0. Confirmado con lecturas el 2026-10-31: 6 tablas del portal, objetos del
  bucket y usuarios `+portal-*` en 0; `leads` (3) y `clics_venta` (0) sin cambios.
- **Incidente en desarrollo (no es del código):** con la PC sin memoria (644 MB libres de
  8 GB) y el servidor encendido desde la mañana, se cayó el proceso auxiliar de Next que
  prepara `/portal/obras/[id]` ("Jest worker encountered 2 child process exceptions"):
  fallaban igual la obra de A, la de B y un id inexistente, antes de leer datos. Se
  resolvió reiniciando `npm run dev`.
- **Portal encendido (2026-10-31), verificado con lecturas en `roca-fuerte-web.vercel.app`:**
  `/` 200 con `noindex, nofollow` (metadata y `X-Robots-Tag`), "Acceso clientes" y "Para
  inversionistas" visibles; `/portal` 200 con `noindex, nofollow` y el formulario del
  código; `/esparta/ficha` 404. Canonical: `https://constructorarocafuerte.com`.
- **Autor de los commits: la cuenta chucospanes** (`git config` local del repo, ver
  DECISIONES.md). Vercel bloqueó `2148a9b` por el autor; se destrabó con el commit vacío
  `28f4d44`. `Co-Authored-By` no bloquea: `8aa05e0` se desplegó (Ready).
- **Vercel en plan Hobby mientras `site.lanzado` sea `false`;** se pasa a Pro antes de
  encender el lanzamiento (decisión del 2026-10-31, en la lista de verificación del README).
- **Plantilla SQL de obra nueva reescrita** (bloque `datos` único, candados de `<`, correo
  y obra repetida, material y documento opcionales). **Probada** (2026-10-31): el usuario corrió
  `supabase/pruebas/004_plantilla_obra_nueva.sql` en el SQL Editor y dio "PRUEBA SUPERADA"
  en los 5 casos (datos completos, `<` olvidado, correo inexistente, obra repetida y
  opcionales en `null`), todo revertido. Confirmado con lecturas: las 6 tablas del portal en
  0, ningún usuario `prueba-plantilla` ni `@ejemplo.invalid` en Auth; `leads` (3) y
  `clics_venta` (0) sin cambios. Falta usarla con la primera obra real (y la plantilla de
  avance nuevo sigue con el formato anterior).
- **Antes de cargar la obra del primer cliente:** aviso de privacidad con los datos del
  portal (contratos y documentos) y decidir Supabase Pro.
- Las cuentas de quienes pidieron la ficha premium también están en Supabase Auth: pueden
  pedir el código en `/portal` y ven "Este correo no tiene obras asignadas" (no ven datos).

## Hecho
- **Cambio de nombre a Casa Modelo Esparta** (en `main`). Nombre nuevo en textos, metadata, imagen
  Open Graph, schema.org, mensajes de WhatsApp y docs (DECISIONES.md conserva las entradas
  viejas y el nombre anterior). Ruta `/esparta/ficha` sin redirección; `proxy.ts`, `robots.txt` y la lista
  cerrada de `/descargas` actualizados. `src/content/esparta.ts`. Plano en lote de
  5 × 20 m y fachada con pretil con nombres de archivo nuevos; archivos del nombre anterior y
  su script generador viejo borrados. `assets/og-fachada.png` recortado de la
  fachada nueva. "La casa" y la ficha premium muestran el lote, el pretil, el desagüe
  tras el pretil y los acabados. Lint, typecheck y build pasan; en el build de producción
  la landing, las imágenes nuevas y la imagen Open Graph responden 200 y las rutas viejas
  404; capturas a 390 px de "La casa" revisadas. El usuario confirmó que el lote de
  5 × 20 m es el real (segregado de un terreno de 10 × 20 m en dos lotes).
  "La casa" muestra el plano de la casa sola (`plano-casa-esparta-v4`), el del lote y la
  fachada, los tres ampliables; en escritorio, casa y fachada arriba y el lote a todo el
  ancho abajo. El PDF de la casa está en la lista cerrada de `/descargas` y en la ficha
  premium.
- **Fase 6 (cerrada en `v1.0.0`):**
  - Interruptor de lanzamiento `site.lanzado` (apagado; solo se enciende con un commit).
    Verificado en el build de producción en los dos estados (el encendido con un build
    temporal, sin commit): apagado, las 9 rutas probadas (páginas, `robots.txt`,
    `sitemap.xml`, imagen Open Graph, descargas, 404 y `POST /api/clic`) responden con
    `X-Robots-Tag: noindex, nofollow`, la landing y `/privacidad` llevan
    `<meta name="robots" content="noindex, nofollow">`, `robots.txt` permite el acceso
    sin sitemap y el sitemap va vacío; encendido, nada de eso y `robots.txt` con el
    sitemap (landing y `/privacidad`).
  - Página `/privacidad`: lee `docs/AVISO_PRIVACIDAD.md` al compilar, con aviso visible de
    borrador pendiente de revisión legal y los `[PENDIENTE: …]` con sello. Enlazada desde
    el pie y desde el paso 1 del desbloqueo. Revisada con capturas a 360 y 390 px, sin
    desborde horizontal.
  - README con desarrollo local, Supabase (migraciones y Auth → URL Configuration), Vercel
    Pro, DNS en Namecheap, interruptor y lista de verificación previa al lanzamiento.
- **Fase 5 (cerrada, `v0.5.0`):** migración `002_clics_venta.sql` aplicada por el usuario desde el
  SQL Editor (2026-10-24); él verificó RLS activo y la vista con `security_invoker`.
  Verificado con lecturas: con la clave secreta, `clics_venta` (9 columnas) y
  `clics_venta_resumen` existen y están vacías; con la publishable, la tabla y la vista
  responden 401 (`permission denied` en la vista). Bloqueo de escritura comprobado por el
  usuario en el SQL Editor con rol `anon` dentro de una transacción con `rollback`:
  `ERROR 42501 permission denied for table clics_venta`.
- Fase 5, implementado y verificado:
  - **SEO:** metadata con descripción, canonical, Open Graph y Twitter; imagen
    `opengraph-image.tsx` (fachada + modelo + marca, 1200×630); `robots.txt` (excluye
    `/esparta/ficha`, `/descargas/`, `/api/`); `sitemap.xml` (solo la landing); schema.org
    `HomeAndConstructionBusiness` solo con datos confirmados (teléfono y redes se agregan
    solos cuando sean reales). Verificado en el build de producción.
  - **Conteo de clics de venta:** `data-venta`/`data-ubicacion` en los 8 botones de
    WhatsApp; el script en línea cuenta el clic (aunque React no haya cargado) y agrega
    "(Ref: fuente · campaña)" al mensaje si hay UTM; `POST /api/clic` valida Origin,
    Sec-Fetch-Site, tamaño y zod. Probado con número ficticio temporal (sin commit) y todo
    el tráfico interceptado: 9 comprobaciones en navegador + 7 rechazos de peticiones
    inválidas; `clics_venta` siguió en 0 filas. **Falta la prueba real** con el número de
    WhatsApp definitivo.
  - **Lighthouse 13.5.0** (móvil, build de producción en el puerto 3100): Performance
    79–85 (mediana 82), Accesibilidad 100, Buenas prácticas 100, SEO 100. LCP 2.9–3.2 s
    (párrafo del hero), CLS 0, peso 288 KB. La primera corrida tras arrancar el servidor
    sale siempre baja (arranque en frío) y la máquina mete ruido: se toman varias.
  - Contraste corregido (gris `piedra-500` → `piedra-600` en fondos claros, `piedra-300`
    en el pie, verde del botón flotante `#1c8147`) y objetivos táctiles de al menos 44 px.
    Sin desborde horizontal a 360, 390 y 412 px.
  - **Salto de diseño por fuentes corregido:** Archivo (títulos) con `display: "optional"`.
    Medido con red lenta (400 ms, ~400 kbps) y caché vacía, 6 cargas por variante: con
    `swap` las 6 dieron CLS 0.292 (el titular del hero cambia de alto al llegar Archivo);
    con `optional`, CLS 0 en las 6. Contrapartida: en la primera visita lenta los títulos
    salen con la fuente del sistema.
  - **Imagen Open Graph con Archivo** (Bold y ExtraBold, TTF estáticos del repositorio
    oficial Omnibus-Type/Archivo en `assets/fonts/`, con `OFL.txt`: SIL OFL 1.1). Excluidos
    de la traza de `/descargas`.
  - **Lighthouse tras los cambios** (3 corridas): Performance 83/83/93, el resto 100.
    LCP 2.9 s en las tres (sin cambio: el LCP es el párrafo del hero, en Source Sans 3, no
    en Archivo), CLS 0, peso 288 KB. El Speed Index varió de 2.4 a 18.8 s por la carga de
    la máquina (las corridas 1 y 2 tardaron 9–13 s en cargar en localhost).
- Repositorio en GitHub (`origin` = `chucospanes/roca-fuerte-web`); push al cerrar cada fase.
- Proyecto de Supabase `roca-fuerte-web` (East US) creado; claves en `.env.local`.
- Migración `001_leads.sql` aplicada por el usuario desde el SQL Editor de Supabase
  (2026-10-23) y verificada: RLS activo y los dos triggers creados.
- Fase 4 en curso (rama `feat/fase-4-leads`): dependencias instaladas
  (`@supabase/supabase-js` 2.117.3, `@supabase/ssr` 0.12.7, `zod` 4.6.7).
  - `src/lib/supabase/`: `navegador.ts` (publishable, pide y verifica el código),
    `servidor.ts` (sesión en cookies + `sesionVerificada()` con `getClaims()`), `admin.ts`
    (clave secreta, `server-only`), `tipos.ts` (tipos de `leads`), `entorno.ts`.
  - `src/proxy.ts`: renueva la sesión solo en `/esparta/ficha` y `/descargas`; la landing
    sigue estática.
  - `src/lib/validacion.ts`: esquemas zod de desbloqueo, código, registro (sin correo: sale
    de la sesión) y calificación. Probados con 23 casos.
  - Verificado contra Supabase: la clave secreta lee `leads`; la publishable no puede leer
    (401) ni insertar (42501).
  - Botones de venta ("Quiero esta casa", "Construir Esparta en mi terreno") en hero,
    precios y contacto: WhatsApp directo con mensaje por opción (`BotonWhatsApp`,
    `mensajesVenta`). La sección Contacto ya no tiene formulario.
  - Server Actions `registrarLead` y `calificarLead` (`src/app/acciones.ts`) sobre la capa
    `src/lib/leads.ts`. Lógica de base probada contra Supabase con un registro de prueba
    (borrado): upsert sin duplicados, UTM de primer contacto intacto, "comprar" borra datos
    del terreno, checks rechazan valores fuera de lista.
  - `site.accesoPremium`: apagado; en desarrollo se prueba con `NEXT_PUBLIC_ACCESO_PREMIUM=1`,
    en producción solo se activa cambiando el código.
  - Página `/esparta/ficha` (`src/components/premium/`): sin sesión, paso 1 con código;
    con sesión y registro, contenido premium (PDF, ficha técnica, materiales con marca y
    cantidad, qué incluye el precio; lo pendiente como "Próximamente") + paso 2 precargado
    + cerrar sesión. Lee la sesión dentro de `<Suspense>`; `noindex`.
  - Ruta `/descargas/[archivo]`: lista cerrada de 2 PDF leídos de `assets/`, exige sesión
    verificada y registro; `Cache-Control: private, no-store`. Solo esos 2 PDF entran en
    el despliegue de la ruta (verificado en la traza del build).
  - Captura de UTM y referrer externo de la primera visita en `localStorage` con un
    script en línea en el layout (`SCRIPT_CAPTURA_ORIGEN` en `src/lib/origen.ts`), que
    corre al leer el HTML, sin esperar a React; se envía con `registrarLead`.
  - SMTP de Resend configurado por el usuario (dominio verificado), plantillas con el
    código y Email OTP Length = 6 / Expiration = 600. Todo lo que vive fuera del repo
    está en `docs/CONFIGURACION_EXTERNA.md`.
  - **Prueba de punta a punta exitosa (2026-10-24, la hizo el usuario):** el código
    desbloqueó la ficha. Verificado con lecturas: usuario en Supabase Auth con correo
    confirmado; una fila en `leads` con `user_id` y correo que coinciden, correo en
    minúsculas, WhatsApp en E.164, fechas de aviso y verificación, `estado = 'nuevo'`.
    Sin UTM (no se entró con parámetros) y sin calificación (paso 2 no enviado).
  - El código acepta 6 a 8 dígitos (la causa del primer fallo fue Email OTP Length = 8).
  - Sin doble envío (`useEnvioUnico`): los botones de enviar del paso 1, del código y del
    paso 2 se desactivan y muestran "Enviando…" desde el primer toque; si el envío sale
    bien no se reactivan mientras carga lo siguiente. "Pedir otro código" también se
    bloquea. Si la red falla en una Server Action, se avisa y se ofrece WhatsApp. Probado
    en el navegador con todo el tráfico a Supabase interceptado (paso 1 y código; el
    paso 2 usa el mismo mecanismo pero requiere sesión real).
  - Corregido: con sesión, `/esparta/ficha` daba en desarrollo el error "Next.js
    encountered the unstable value `Date.now()` while prerendering" (supabase-js compara
    el vencimiento de la sesión con la hora). `AreaPremium` llama a `connection()` antes
    de leer la sesión. Reproducido con una cookie de sesión ficticia: sin la corrección
    aparece, con ella no.
  - Verificado con lecturas (2026-10-24): la fila de la prueba tiene la calificación
    (construir, La Libertad, "Municipio o distrito" lleno) en un solo registro.
  - Prueba de UTM del usuario (alias `+prueba1`, 08:17 UTC): la fila se creó bien pero
    **sin UTM**. Diagnóstico: el formulario y el servidor procesan bien el UTM (verificado
    con el tráfico interceptado), pero se capturaba solo después de hidratar (~6 s en
    desarrollo); al tocar "Ver la ficha técnica" antes, se perdía. Corregido con el
    script en línea: ahora queda guardado al ~1 s, antes de hidratar. Prueba real repetida
    con `+prueba2` tocando el enlace de inmediato: la fila tiene `utm_source = prueba` y
    `utm_campaign = e2e` (verificado con lecturas).
  - El usuario confirmó que los dos PDF se descargan y abren bien.
- Next.js 16.4.3 + TypeScript + Tailwind 4 (Fase 1, `v0.1.0`).
- `src/config/site.ts`: marca (único lugar), URL, WhatsApp placeholder, precios PENDIENTE,
  condiciones de construcción en terreno del cliente, redes PENDIENTE, `textoPrecio()`.
- `src/content/esparta.ts`: áreas, ambientes, muros, plano y tabla de materiales
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
**Pendientes antes del lanzamiento** (`site.lanzado = true`; lista completa en el README,
sección 6):
1. ~~Prueba real del conteo de clics~~ **hecha (2026-11-02):** clics del usuario desde su
   celular con el número real (`+503 7821-6321`), verificados con lecturas en `clics_venta`
   (botón de la casa, con su `casa_id`).
2. ~~Precio de construir a pedido~~ "A consultar" (2026-11-04); el precio de cada casa a la
   venta va en su fila de `casas_venta`.
3. Aviso de privacidad revisado por un abogado (razón social, domicilio, correo y plazo de
   conservación), incluidos los datos del portal (contratos y documentos); al aprobarlo,
   quitar el aviso de "borrador" de `/privacidad`.
4. Decidir qué PENDIENTE se aceptan visibles el día del lanzamiento (redes, preguntas
   frecuentes, materiales, profesional que firma).
5. Documentar las primeras etapas en la bitácora (fecha, avance y fotos; video cuando lo
   haya): el hero promete construcción documentada etapa por etapa. Y respaldo de
   "estándares de seguridad internacionales" con el ingeniero responsable.
6. Borrar los datos de prueba (`leads` y luego sus usuarios de Auth; lo hace el usuario) y
   verificar con lecturas.
7. Vercel en plan Pro.
8. DMARC y límites de envío anotados en `CONFIGURACION_EXTERNA.md`; vista previa del enlace
   en WhatsApp y en el Sharing Debugger de Facebook; Lighthouse sobre el dominio.
9. Commit con `site.lanzado = true`, comprobar que no queda `noindex` y que `robots.txt`
   trae el sitemap, y dar de alta el dominio en Google Search Console.

**Antes de cargar la obra del primer cliente en el portal:** aviso de privacidad con los
datos del portal y decidir Supabase Pro (un proyecto gratuito pausado deja a los clientes
sin portal).

**Después del lanzamiento:**
- **LCP: se revisa después del lanzamiento con datos reales** (decisión del usuario,
   2026-10-24). En Lighthouse queda en 2.9 s (el párrafo del hero, en Source Sans 3); si
   los datos de campo (Vercel Speed Insights o Search Console) lo confirman, las vías son
   la fuente del texto y el JavaScript inicial.

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
- Retiros por confirmar con OPAMSS o la alcaldía (nota del plano).
- Supabase Pro: decidir antes de dar acceso al portal al primer cliente (un proyecto
  gratuito pausado deja a los clientes sin portal).
- Canal detrás del pretil: detalle de impermeabilización, pendiente y rebosadero.
- **Supabase Pro: se evalúa al activar el acceso premium.** Por ahora plan gratuito; los
  proyectos gratuitos se pausan tras ~1 semana sin actividad (fuentes de terceros).
- Lanzamiento (`site.lanzado = true`): solo con la lista de verificación del README
  cumplida.
- **Bloqueos para activar `site.accesoPremium` en producción** (los dos son obligatorios):
  - La ficha técnica completa y las cantidades de materiales tienen datos reales.
  - Cloudflare Turnstile (captcha) puesto en el paso 1 del desbloqueo.
- Revisión legal del aviso de privacidad (`docs/AVISO_PRIVACIDAD.md`): fecha de
  publicación, mención de la IP, plazo legal de los datos de clientes y sección del portal.
  Titular "Roca Fuerte, S.A.S." al quedar inscrita en el CNR.
- URLs de redes sociales → `site.redes` (el pie las muestra solo cuando existen).
- Especificaciones de los 9 materiales "Por confirmar" → `esparta.materiales` (sin marcas
  en lo público), conforme se compran.
- Fecha de inicio de cada etapa cuando arranque → `casas_venta_etapas` (y `etapas` del portal).
- Casas a la venta (ubicación, lote, precio y qué incluye de cada una) → `casas_venta`, con
  `docs/GUIA_CARGA_CASAS.md`. Pasaron aquí los pendientes 1, 3, 4 y 5 del inventario.
- Ingeniero responsable: confirmar la referencia RTS 91.01.02:21 y el nombre y registro del
  profesional que firma el plano; hoy ocultos en Calidad → `calidadConIngeniero` en
  `src/content/landing.ts`.
- Confirmar con quien tramite el permiso de construcción que los muros de colindancia y el
  corredor hasta el lindero cumplen la normativa.
- Diseño estructural de la columna del corredor y ficha de la lámina (pendiente mínima).
- Pasar Vercel a plan Pro antes del lanzamiento (README, sección 3).
- Búsqueda de marca en el CNR antes de invertir en identidad visual definitiva.
