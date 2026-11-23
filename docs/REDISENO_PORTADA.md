# Rediseño de la portada — Roca Fuerte (v2.0.0)

Brief aprobado por Patricio el 23 de noviembre de 2026. Cambia la imagen y el mensaje de la portada (`/`). **No cambia ninguna funcionalidad.**

## 1. Objetivo

Que el sitio se lea primero como **constructora y desarrolladora** y no solo como "una casa en venta". Mensaje central: **casas de calidad comprobable**. Tono dinámico, industrial y seguro, pero con calidez de hogar en las secciones de la casa.

## 2. Alcance

- Solo la portada (`/`), el encabezado y el pie de página globales.
- `/casas`, la ficha de la casa, `/portal`, `/admin`, `/privacidad` y `/casa-no-disponible` **no se rediseñan en esta versión**. Solo heredan el encabezado, el pie, las fuentes y los colores nuevos. Deben verse bien con esos cambios, sin desbordes.
- Rama: `feat/rediseno-portada`. Versión al unir: **v2.0.0**.

## 3. Lo que NO se toca

- Rutas, consultas a Supabase, server actions, autenticación, RLS, el panel admin y el portal de clientes.
- El registro de clics (`clics_venta`): cada botón que hoy registra un clic debe seguir registrándolo con el **mismo valor de `ubicacion`** (hero, precios, contacto, flotante, pie, inversionistas, casa, catalogo, hermanos) y la misma `opcion`. Si un botón cambia de lugar, conserva su `ubicacion` original. Lista en el plan qué botón usa cada valor.
- `site.lanzado` sigue en `false`: el sitio sigue con `noindex, nofollow`.
- Los datos de la casa (precios, modalidades, etapas, avances, fotos) se siguen leyendo de la base. **Ningún precio ni etapa queda escrito a mano en el código.**

## 4. Identidad

### Logo: monograma RF

Archivos (copiarlos tal cual a `public/brand/`):
- `rf-logo-horizontal.svg`: monograma + "ROCA FUERTE" + "CONSTRUCTORA", para fondos claros.
- `rf-logo-horizontal-claro.svg`: para fondos oscuros.
- `rf-monograma.svg`: el cuadro RF solo. Úsalo también para generar el favicon y el icono de Apple si hoy usan otro logo.

El texto de los SVG ya está convertido a trazos. No los redibujes ni les cambies los colores.

### Colores (variables CSS en Tailwind 4)

| Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--surface` | #edece8 | #1c1e1f | Fondo de página |
| `--surface-raised` | #f7f6f3 | #26292b | Tarjetas |
| `--ink` | #2e3133 | #ecebe7 | Texto principal |
| `--ink-muted` | #4a4f54 | #b4b3ae | Texto secundario |
| `--line` | #c9c8c3 | #3a3e41 | Bordes y divisores |
| `--accent` | #b5462e | #e08a6e | Botón de acción principal, línea de cimiento, números |
| `--accent-ink` | #ffffff | #1c1e1f | Texto sobre `--accent` |

- La portada **alterna secciones oscuras y claras**. No es un modo oscuro del sistema: cada sección tiene su fondo fijo.
- `#9a9a95` (cemento) solo para líneas, nunca para texto.
- El acento marca una acción principal por pantalla. No todo es naranja.

### Tipografía

Con `next/font/google`, que viene con Next (no instalar nada):
- **Archivo** 700, 800 y 900: titulares, en mayúsculas, interlineado apretado (0.94–1.0), `letter-spacing` ligeramente negativo en los grandes.
- **Source Sans 3** 400, 600 y 700: todo el texto corrido.
- Etiquetas: 12–13 px, peso 700, mayúsculas, `letter-spacing: .16em–.18em`.
- Titular de la portada fluido: `clamp(44px, 6.4vw, 92px)`. Títulos de sección: `clamp(34px, 4.4vw, 60px)`.

### Formas

Esquinas casi rectas (2, 4 y 8 px). Líneas gruesas horizontales, como un cimiento. Sin degradados de color, sin sombras fuertes, sin emojis como iconos (iconos SVG de trazo de 3 px).

## 5. Estructura y textos de la portada (en este orden)

Los textos van **tal cual**. Lo que está entre corchetes viene de la base de datos o del sitio actual.

### 5.1 Encabezado (oscuro, `--surface` oscuro)
- Logo horizontal claro a la izquierda.
- Menú: Proyectos · Calidad comprobable · Cómo trabajamos · Hermano cercano · Portal de clientes (este último en `--ink-muted`).
- Botón "WhatsApp" con `--accent` (mismo enlace y registro de clic que el actual).
- En móvil, el menú se resuelve como hoy (mismo comportamiento, solo estilo nuevo).

### 5.2 Portada (oscura, con cuadrícula de plano de fondo: líneas de 1 px al 5% de opacidad cada 48 px)
- Etiqueta: **CONSTRUCTORES Y DESARROLLADORES · EL SALVADOR**
- Titular: **CASAS DE CALIDAD COMPROBABLE.** ("COMPROBABLE." en `--accent`)
- Barra de 120 × 6 px en `--accent` (la línea de cimiento).
- Texto: "Diseñamos, desarrollamos y construimos. Cada etapa de tu casa queda a la vista: el hierro, los materiales con factura y el avance con fotos."
- Botones: "Ver el proyecto actual" (`--accent`, lleva a la sección del proyecto) y "Cómo lo comprobamos" (borde claro, lleva a la sección de calidad).
- A la derecha, la **foto real de obra** que hoy usa la portada (bastones y fundación), vertical 4:5, con `priority` porque es el LCP.
- Sobre la foto, una tarjeta clara: "OBRA EN CURSO" · "San José Villanueva" · "Etapa: [etapa actual de la casa, desde la base]".

### 5.3 Franja en movimiento (fondo `--accent`, texto blanco)
Texto en Archivo 800, mayúsculas, que se desplaza de forma continua y lenta:
**HIERRO GRADO 40 ■ BLOQUE DE NORMA ■ BASTONES DE REFUERZO ■ MATERIALES CON FACTURA ■ AVANCE CON FOTOS ■ MANO DE OBRA LOCAL ■**
Con `prefers-reduced-motion` se queda quieta. Lleva `aria-label` y el texto duplicado para el bucle es `aria-hidden`.

### 5.4 Quiénes somos (clara)
- Titular: **DESARROLLAMOS. CONSTRUIMOS. LO COMPROBAMOS.** (en tres líneas)
- Al lado: "Constructora Roca Fuerte, construyendo un mundo mejor. Casa por casa, con mano de obra de la comunidad."
- Dos tarjetas:
  - **01 · DESARROLLADORES** (tarjeta oscura): "Proyectos propios, de principio a fin: elegimos el terreno, diseñamos el modelo y lo construimos para venderlo terminado o en preventa." Remate en negrita: "Hoy: Casa Modelo Esparta, San José Villanueva."
  - **02 · CONSTRUCTORES** (tarjeta clara): "Construimos a pedido, en tu terreno o en uno nuestro. Materiales al costo, comprobables por factura, y acabados a tu elección." Remate: "No vendemos materiales: el precio lo pone el mercado."

### 5.5 Calidad comprobable (oscura, con cuadrícula)
- Etiqueta: CALIDAD COMPROBABLE
- Titular: **LO QUE NO SE VE, TE LO MOSTRAMOS.**
- Texto: "Una casa se juzga por lo que queda adentro del concreto. Por eso lo documentamos antes de taparlo."
- Cuatro bloques en cuadrícula, separados por líneas de 1 px, cada uno con icono de trazo en `--accent`:
  1. **CONSTRUCCIÓN REFORZADA**: "Hierro grado 40, bloque de norma y bastones de refuerzo vertical anclados a la fundación."
  2. **ESTRUCTURA A LA VISTA**: "Fotografiamos la fundación, el hierro y los bastones antes de que el concreto los tape."
  3. **MATERIALES CON FACTURA**: "Transparencia en los costos: cada material, con su factura. No ganamos con sobreprecio."
  4. **AVANCE EN TU PORTAL**: "Cada etapa de tu casa, con fotos y fecha, en tu portal de cliente. Desde aquí o desde el extranjero."

### 5.6 Proyecto actual (clara, `id="proyectos"`)
- Etiqueta: PROYECTO ACTUAL · PREVENTA. Titular: **[nombre del modelo, en mayúsculas]**. A la derecha: "No es una casa más, es tu hogar."
- Imagen grande de la casa (la que hoy usa la tarjeta o la ilustración), 16:10. Si es ilustración, conserva el pie **"Ilustración de referencia"**.
- Al lado: resumen (una planta, dormitorios, baño…) y **una tarjeta por modalidad** desde `casas_venta_modalidades`: la primera clara y la segunda oscura, con su lote, estacionamientos y precio grande en Archivo 900. "A consultar" donde la base lo diga.
- "30% a la firma, pagos por etapas y saldo a la entrega."
- Botones: "Ver la casa" (`--accent`, a la ficha) y "Agendar visita a la obra" (borde, a WhatsApp con su registro de clic).
- **Línea de avance de la obra**: las etapas de `casas_venta_etapas` en orden, cada una con una barra de 8 px: terminada = `--ink`, en curso = `--accent` y nombre en `--accent`, pendiente = `--line`. Debajo de cada una: "Terminada", "En curso" o "Pendiente".

### 5.7 Diario de obra (clara elevada)
- Titular: **DIARIO DE OBRA**. Al lado: "Fotos reales, sin retoque. Se actualiza con cada avance."
- Los **3 avances publicados más recientes** (los mismos que ya alimentan el Diario de obra de la ficha), foto 4:3, con mes y año en etiqueta `--accent` y el título del avance. Si hay menos de 3, se muestran los que haya. Si no hay ninguno, la sección no aparece.

### 5.8 Así trabajamos (oscura, `#2e3133`, `id="proceso"`)
Titular: **ASÍ TRABAJAMOS.** Cuatro pasos con número grande en `--accent` y una línea superior de 4 px:
1. **CONVERSAMOS**: "Por WhatsApp o en la obra. Te mostramos el plano y lo que ya está construido."
2. **FIRMAMOS**: "Con el 30%. Montos y plazos claros en el contrato."
3. **CONSTRUIMOS A LA VISTA**: "Pagas por etapas mientras ves cada avance con fotos en tu portal."
4. **RECIBES TU HOGAR**: "Saldo a la entrega, con el expediente de tu casa."

### 5.9 Hermano cercano (oscura con cuadrícula, `id="hermano"`)
Esta sección reemplaza en estilo a la actual "Hermano, tú mueves la economía". **Conserva su funcionalidad**: el mapa o las líneas punteadas desde varios países, si existen, y su registro de clic `hermanos`.
- Etiqueta: PARA SALVADOREÑOS EN EL EXTERIOR
- Titular: **HERMANO ~~LEJANO~~ CERCANO.** ("LEJANO" tachado con una línea en `--accent` y en gris)
- Texto: "Tú mueves la economía. Compra o construye en El Salvador desde donde estés, y sigue cada etapa en línea como si estuvieras en la obra."
- Botón: "Hablemos por WhatsApp".
- Tabla al lado: Proceso → 100% a distancia · Avance de obra → Fotos en tu portal · Pagos → Por etapas.

### 5.10 Pie de página (oscuro, borde superior de 6 px en `--accent`)
- Logo horizontal claro. Debajo, en Archivo 800: "Constructora Roca Fuerte, construyendo un mundo mejor." Debajo: "El mejor uso de los recursos es ayudar a tu comunidad."
- Contacto: WhatsApp +503 7821-6321 · constructorarocafuerte.com · Portal de clientes.
- Línea final: © 2026 Roca Fuerte · Aviso de privacidad (con el enlace actual).
- Si hoy existe la sección de inversionistas u otra que no está en este brief, **no la borres**: restílala con este sistema y dime dónde quedó.

## 6. Movimiento (solo CSS, sin librerías)

- La franja de 5.3 en bucle continuo.
- Aparición al hacer scroll (subir 24 px y pasar de transparente a visible) en titulares y tarjetas, con `animation-timeline: view()` dentro de `@supports`. Sin soporte, todo se ve normal y sin animación.
- Botones: cambio de brillo al pasar el cursor. Fotos: zoom de 1.03 al pasar el cursor, dentro de su marco.
- Todo desactivado con `prefers-reduced-motion: reduce`.
- **Prohibido instalar framer-motion, GSAP o cualquier otra dependencia.**

## 7. Qué se puede afirmar (no inventar)

Solo estas afirmaciones son ciertas hoy: hierro grado 40, bloque de norma, bastones de refuerzo, fotos de cada etapa, facturas de materiales, portal de cliente, pagos por etapas, mano de obra local.

**No escribas** "diseño firmado por ingeniero", "garantía estructural", "pruebas de laboratorio", "certificado", "la mejor constructora", testimonios ni cifras de clientes. No uses fotos de casas que no construimos.

## 8. Calidad y entrega

1. Antes de programar, muéstrame el plan: qué componentes cambian o se crean, qué archivos se tocan y la tabla de botones con su `ubicacion` de clic.
2. Usa la skill `frontend-design` para las decisiones finas de composición, ritmo y detalle, **dentro** de este brief: no cambies los textos, los colores ni el orden de las secciones.
3. Contraste mínimo 4.5:1 en todo el texto (3:1 en titulares de 24 px o más). Objetivos táctiles de 44 px como mínimo.
4. Lint, typecheck y build. Lighthouse en móvil: Performance ≥ 85 y Accessibility ≥ 95; si no se alcanza, dime por qué.
5. Capturas de la portada completa a 390 px y a 1440 px, más /casas, la ficha, /portal y /admin a 390 px para comprobar que heredan bien el encabezado y el pie.
6. Commit con el autor configurado en el repo. Actualiza DECISIONES.md y ESTADO.md. Tag v2.0.0 solo cuando yo apruebe las capturas.
