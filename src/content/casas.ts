/**
 * Textos del catálogo de casas en venta (`/casas`). Los datos de cada casa viven SOLO en
 * Supabase (`casas_venta`); lo del modelo Esparta, en `esparta.ts`.
 */

import type { CasaVenta } from "@/lib/supabase/tipos";

export const catalogo = {
  titulo: "Casas en venta",
  intro:
    "Casas concretas, con su ubicación, su lote y su precio. Cada una documentada igual que la Casa Modelo Esparta.",
  vacio: "Por ahora no hay casas a la venta. Escríbenos y te avisamos cuando haya una.",
  error: "No pudimos cargar las casas en este momento. Escríbenos por WhatsApp y te contamos cuáles hay.",
  verTodas: "Ver todas las casas",
};

export const nombresEstado: Record<CasaVenta["estado"], string> = {
  en_construccion: "En construcción",
  terminada: "Terminada",
  reservada: "Reservada",
  vendida: "Vendida",
};

export const nombresAguasNegras: Record<NonNullable<CasaVenta["aguas_negras"]>, string> = {
  alcantarillado: "Alcantarillado",
  fosa_septica: "Fosa séptica",
};

/** Precio visible: reservadas y vendidas no lo muestran; sin precio cargado, "Consultar". */
export function muestraPrecio(estado: CasaVenta["estado"]): boolean {
  return estado !== "reservada" && estado !== "vendida";
}

/** "Distrito, Municipio" (tarjeta) o con el departamento (detalle). Sin dirección exacta. */
export function ubicacionCasa(
  c: Pick<CasaVenta, "distrito" | "municipio" | "departamento">,
  conDepartamento = false,
): string {
  return [c.distrito, c.municipio, conDepartamento ? c.departamento : null]
    .filter(Boolean)
    .join(", ");
}
