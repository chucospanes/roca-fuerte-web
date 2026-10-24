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
  modelo: "Casa Modelo Bonaire",
  pais: "El Salvador",

  /** URL pública. En local y en preview se toma de NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://constructorarocafuerte.com",

  /**
   * WhatsApp Business en formato internacional, solo dígitos, sin "+".
   * El Salvador: 503 + 8 dígitos. Placeholder hasta tener el número real.
   */
  whatsapp: "50300000000",

  precios: {
    /** "Quiero esta casa": la Bonaire en construcción, con terreno. */
    comprarCasa: PENDIENTE as Precio,
    /** "Construir Bonaire en mi terreno": precio desde, sujeto a condiciones. */
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
   * Acceso con correo al contenido premium (`/bonaire/ficha`). Apagado: la landing no lo
   * enlaza y la página responde 404. NO activar en producción hasta que la ficha técnica y
   * los materiales tengan datos reales y esté puesto Cloudflare Turnstile (ver ESTADO.md).
   * Para probarlo en `npm run dev`: NEXT_PUBLIC_ACCESO_PREMIUM=1 en .env.local. En un build
   * de producción esa variable no tiene efecto: activarlo exige cambiar este código.
   */
  accesoPremium:
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ACCESO_PREMIUM === "1",
};

/** WhatsApp aún sin configurar (placeholder). */
export function whatsappEsPlaceholder(): boolean {
  return site.whatsapp === "50300000000";
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
