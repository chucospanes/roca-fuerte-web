/**
 * Configuración editable del sitio.
 *
 * Único lugar donde vive el nombre de la marca: "Roca Fuerte" está pendiente de
 * búsqueda de marca en el CNR. Para cambiarlo, edita solo `marca` aquí.
 *
 * Todo dato no confirmado va como PENDIENTE y se muestra como tal en la web.
 */

export const PENDIENTE = "PENDIENTE" as const;
export type Pendiente = typeof PENDIENTE;

export function esPendiente(valor: unknown): valor is Pendiente {
  return valor === PENDIENTE;
}

/** Precio en dólares (USD, moneda de curso legal en El Salvador) o PENDIENTE. */
export type Precio = number | Pendiente;

export type RedSocial = "tiktok" | "instagram" | "facebook" | "youtube";

export const site = {
  marca: "Roca Fuerte",
  modelo: "Casa Modelo Esparta",
  /** Lema de la marca: va en el pie de las páginas públicas (no en el hero). */
  lema: "El mejor uso de los recursos es ayudar a tu comunidad",
  pais: "El Salvador",

  /** URL pública. En local y en preview se toma de NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://constructorarocafuerte.com",

  /**
   * WhatsApp Business en formato internacional, solo dígitos, sin "+" (así lo pide wa.me).
   * Único lugar del número: en pantalla se muestra con `whatsappVisible()`.
   */
  whatsapp: "50378216321",

  precios: {
    /** "Quiero esta casa": la Esparta en construcción, con terreno. */
    comprarCasa: PENDIENTE as Precio,
    /** "Construir Esparta en mi terreno": precio desde, sujeto a condiciones. */
    construirEnTerreno: PENDIENTE as Precio,
  },

  /** Condiciones del precio "desde" de construir en el terreno del cliente. */
  condicionesConstruccion: [
    "Terreno plano.",
    "Terreno escriturado.",
    "Con acceso vehicular.",
    "Con servicios cercanos.",
    "Los extras se cotizan aparte.",
  ],

  /** URLs de redes sociales. PENDIENTE = se muestra el nombre marcado como pendiente, sin enlace. */
  redes: {
    tiktok: PENDIENTE,
    instagram: PENDIENTE,
    facebook: PENDIENTE,
    youtube: PENDIENTE,
  } as Record<RedSocial, string>,

  /**
   * Acceso con correo al contenido premium (`/esparta/ficha`). Apagado: la landing no lo
   * enlaza y la página responde 404. NO activar en producción hasta que la ficha técnica y
   * los materiales tengan datos reales y esté puesto Cloudflare Turnstile (ver ESTADO.md).
   * Para probarlo en `npm run dev`: NEXT_PUBLIC_ACCESO_PREMIUM=1 en .env.local. En un build
   * de producción esa variable no tiene efecto: activarlo exige cambiar este código.
   */
  accesoPremium:
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ACCESO_PREMIUM === "1",

  /**
   * Portal privado de clientes (`/portal`). Encendido (2026-10-31, tras la prueba de punta
   * a punta): `/portal` acepta el código por correo y el menú y el pie muestran "Acceso
   * clientes". Para apagarlo, poner `false`: `/portal` responde 404 y los enlaces no se
   * muestran. Constante sin variable de entorno: cambiarlo exige un commit.
   */
  portalClientes: true,

  /**
   * Interruptor de lanzamiento. Apagado: el sitio puede estar publicado en el dominio pero
   * todas las páginas y archivos llevan `noindex, nofollow` (metadata en `app/layout.tsx` y
   * encabezado `X-Robots-Tag` en `next.config.ts`) y el sitemap va vacío. `robots.txt` NO
   * bloquea con Disallow: así Google lee el noindex y la vista previa de WhatsApp/Facebook
   * funciona (ver DECISIONES.md). Sin variable de entorno a propósito: encenderlo exige un
   * commit revisado, con la lista de verificación del README cumplida.
   */
  lanzado: false,
};

/** El WhatsApp para mostrar en pantalla: "+503 7821-6321" (El Salvador: 503 + 8 dígitos). */
export function whatsappVisible(): string {
  const n = site.whatsapp;
  return `+${n.slice(0, 3)} ${n.slice(3, 7)}-${n.slice(7)}`;
}

const formatoUSD = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Texto del precio "desde" para mostrar en la web. */
export function textoPrecio(precio: Precio): string {
  return esPendiente(precio) ? "Precio próximamente" : `Desde ${formatoUSD.format(precio)}`;
}
