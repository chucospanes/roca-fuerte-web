import { site, whatsappEsPlaceholder } from "@/config/site";

/**
 * Enlace a WhatsApp con mensaje prellenado.
 * Mientras el número sea placeholder devuelve el ancla del formulario de contacto,
 * para no mandar a nadie a un número que no existe.
 */
export function whatsappHref(mensaje?: string): string {
  if (whatsappEsPlaceholder()) return "#contacto";
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${site.whatsapp}${texto}`;
}
