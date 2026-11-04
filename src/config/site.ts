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

/** Precio "a consultar": se publica así, sin monto (no es un dato pendiente). */
export const A_CONSULTAR = "A_CONSULTAR" as const;

/** Precio en dólares (USD, moneda de curso legal en El Salvador), a consultar o PENDIENTE. */
export type Precio = number | typeof A_CONSULTAR | Pendiente;

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

  /**
   * Responsable de los datos en el aviso de privacidad (`/privacidad`). `titular`: cambiar a
   * "Roca Fuerte, S.A.S." cuando quede inscrita en el CNR (pendiente en ESTADO.md).
   */
  privacidad: {
    titular: "Patricio Posada",
    domicilio: "La Libertad Este, La Libertad, El Salvador",
    correo: "privacidad@constructorarocafuerte.com",
  },

  /**
   * Precio "desde" de construir a pedido: toda casa que se vende antes de construirse, en
   * terreno nuestro o del cliente. El precio de cada casa a la venta vive en `casas_venta`
   * (catálogo `/casas`), no aquí.
   */
  precios: {
    /** "Construir a pedido": precio desde, sujeto a condiciones. */
    construirAPedido: A_CONSULTAR as Precio,
  },

  /** Condiciones del precio "desde" cuando la casa a pedido va en el terreno del cliente. */
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

/** Precio exacto en USD (casas del catálogo), por ejemplo "US$45,000". */
export function precioUSD(monto: number): string {
  return formatoUSD.format(monto);
}

/** Texto del precio "desde" para mostrar en la web. */
export function textoPrecio(precio: Precio): string {
  if (esPendiente(precio)) return "Precio próximamente";
  if (precio === A_CONSULTAR) return "A consultar";
  return `Desde ${formatoUSD.format(precio)}`;
}
