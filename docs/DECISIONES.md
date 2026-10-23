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
