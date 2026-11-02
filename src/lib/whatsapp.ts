import { site } from "@/config/site";
import { formasPago, inicios } from "@/content/formularios";
import type { DatosCalificacion, OPCIONES_VENTA, UBICACIONES_VENTA } from "@/lib/validacion";

/** Enlace a WhatsApp con mensaje prellenado. */
export function whatsappHref(mensaje?: string): string {
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : "";
  return `https://wa.me/${site.whatsapp}${texto}`;
}

/** Opciones de venta: cada botón abre WhatsApp con su propio mensaje, sin pedir datos. */
export type OpcionVenta = (typeof OPCIONES_VENTA)[number];
/** Las opciones con mensaje fijo; la de una casa del catálogo lo arma `mensajeCasa`. */
export type OpcionMensajeFijo = Exclude<OpcionVenta, "casa">;
export type UbicacionVenta = (typeof UBICACIONES_VENTA)[number];

export const mensajesVenta: Record<OpcionMensajeFijo, string> = {
  comprar: `Hola, me interesa comprar la ${site.modelo} que están construyendo. ¿Me pueden dar más información?`,
  construir:
    "Hola, quiero construir el modelo Esparta en mi terreno. Mi terreno está en (municipio y departamento): ",
  general: `Hola, me interesa la ${site.modelo}.`,
  inversionista: `Soy inversionista y quiero construir un proyecto con ${site.marca}.`,
};

/** Mensaje del botón de una casa del catálogo: la nombra para saber de cuál se habla. */
export function mensajeCasa(nombre: string, municipio: string): string {
  return `Hola, me interesa la "${nombre}" en ${municipio}. ¿Me pueden dar más información?`;
}

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
