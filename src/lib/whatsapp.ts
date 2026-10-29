import { site, whatsappEsPlaceholder } from "@/config/site";
import { formasPago, inicios } from "@/content/formularios";
import type { DatosCalificacion, OPCIONES_VENTA, UBICACIONES_VENTA } from "@/lib/validacion";

/**
 * Enlace a WhatsApp con mensaje prellenado.
 * Mientras el número sea placeholder devuelve el ancla de la sección de contacto (que avisa
 * que el número está pendiente), para no mandar a nadie a un número que no existe.
 */
export function whatsappHref(mensaje?: string): string {
  if (whatsappEsPlaceholder()) return "/#contacto";
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${site.whatsapp}${texto}`;
}

/** `true` si el enlace sale del sitio (abrir en otra pestaña). */
export function whatsappEsExterno(): boolean {
  return !whatsappEsPlaceholder();
}

/** Opciones de venta: cada botón abre WhatsApp con su propio mensaje, sin pedir datos. */
export type OpcionVenta = (typeof OPCIONES_VENTA)[number];
export type UbicacionVenta = (typeof UBICACIONES_VENTA)[number];

export const mensajesVenta: Record<OpcionVenta, string> = {
  comprar: `Hola, me interesa comprar la ${site.modelo} que están construyendo. ¿Me pueden dar más información?`,
  construir:
    "Hola, quiero construir el modelo Esparta en mi terreno. Mi terreno está en (municipio y departamento): ",
  general: `Hola, me interesa la ${site.modelo}.`,
};

/** Mensaje al terminar la calificación (paso 2), con lo que la persona ya contó. */
export function mensajeCalificacion(nombre: string, datos: DatosCalificacion): string {
  const partes = [nombre ? `Hola, soy ${nombre}.` : "Hola."];
  if (datos.interes === "comprar") {
    partes.push(`Me interesa comprar la ${site.modelo}.`);
  } else {
    const lugar = [datos.municipio, datos.departamento].filter(Boolean).join(", ");
    partes.push(`Quiero construir el modelo Esparta en mi terreno${lugar ? `, en ${lugar}` : ""}.`);
  }
  partes.push(`Forma de pago: ${formasPago[datos.forma_pago]}.`);
  partes.push(`Cuándo quiero iniciar: ${inicios[datos.inicio]}.`);
  return partes.join(" ");
}
