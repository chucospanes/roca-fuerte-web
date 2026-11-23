/**
 * Textos del catálogo de casas en venta (`/casas`). Los datos de cada casa viven SOLO en
 * Supabase (`casas_venta`); lo del modelo Esparta, en `esparta.ts`.
 */

import { precioUSD, site } from "@/config/site";
import type { CasaVenta } from "@/lib/supabase/tipos";

export const catalogo = {
  titulo: "Casas en venta",
  intro:
    "Casas concretas, con su ubicación, su lote y su precio. Cada una documentada igual que la Casa Modelo Esparta.",
  vacio: "Por ahora no hay casas a la venta. Escríbenos y te avisamos cuando haya una.",
  error: "No pudimos cargar las casas en este momento. Escríbenos por WhatsApp y te contamos cuáles hay.",
  verTodas: "Ver todas las casas",
  /** Etiqueta de las casas disponibles (en construcción o terminadas). */
  propiaEnVenta: `Casa ${site.marca} · En venta`,
  verAvance: "Ver el avance de esta casa",
  /**
   * Casas vendidas: tarjeta mínima, sin enlace ni datos de la casa (ver DECISIONES.md,
   * 2026-11-05). La foto es la ilustración de la fachada del modelo, nunca una foto real.
   */
  vendidas: {
    titulo: "Casas vendidas",
    tarjeta: (modelo: string, departamento: string) => `${modelo} · Vendida · ${departamento}`,
    altFachada: (modelo: string) => `Ilustración de la fachada del modelo ${modelo}`,
    /** Elevación del modelo sin cotas ni notas (SVG liviano, dibujado aparte de la lámina). */
    fachadaLimpia: "/fachada-esparta-limpia-v2.svg",
  },
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

/**
 * Precio de una casa a partir de `precioDesde` (lib/casas): "Desde $69,000" con varias
 * modalidades, "$69,000" con una sola, y "Consultar" (o el texto que se pase) sin precio.
 */
export function textoPrecioCasa(
  p: { precio: number; desde: boolean } | null,
  sinPrecio = "Consultar",
): string {
  return p === null ? sinPrecio : `${p.desde ? "Desde " : ""}${precioUSD(p.precio)}`;
}

/** Metros sin ceros de más: 5 → "5", 7.5 → "7.5", 10.25 → "10.25". */
const metros = (n: number) => String(Number(n.toFixed(2)));

/** Lote corto, para las tarjetas de las modalidades: "5 × 20 m" y "100 m²". */
export function loteCorto(m: { lote_frente_m: number; lote_fondo_m: number; lote_m2: number }) {
  return { medidas: `${metros(m.lote_frente_m)} × ${metros(m.lote_fondo_m)} m`, area: `${metros(m.lote_m2)} m²` };
}

/**
 * Resumen de una casa en tarjetas y titulares, sin el área construida (ver DECISIONES.md,
 * 2026-11-12): "Una planta" (solo con la planta Esparta) y el terreno, "Desde 100 m² de terreno"
 * si sus modalidades tienen lotes distintos o "200 m² de terreno" si es uno solo.
 */
export function resumenCasa(c: { planta_esparta: boolean; modalidades: { lote_m2: number }[] }): string[] {
  const lotes = [...new Set(c.modalidades.map((m) => m.lote_m2))];
  const terreno =
    lotes.length === 0
      ? null
      : `${lotes.length > 1 ? "Desde " : ""}${metros(Math.min(...lotes))} m² de terreno`;
  return [c.planta_esparta ? "Una planta" : null, terreno].filter((x): x is string => x !== null);
}

/** Lote de una modalidad: "5.00 × 20.00 m (100.00 m²)". */
export function textoLote(m: { lote_frente_m: number; lote_fondo_m: number; lote_m2: number }): string {
  return `${m.lote_frente_m.toFixed(2)} × ${m.lote_fondo_m.toFixed(2)} m (${m.lote_m2.toFixed(2)} m²)`;
}

/** Textos de las modalidades en la ficha (ver DECISIONES.md, 2026-11-12). */
export const modalidadesCasa = {
  titulo: (n: number) => (n > 1 ? "Formas de comprarla" : "Precio y lote"),
  intro: "El precio cambia según el lote. La casa es la misma.",
  lote: "Lote",
  estacionamientos: "Estacionamientos",
  boton: "Me interesa",
};

/** "Distrito, Municipio" (tarjeta) o con el departamento (detalle). Sin dirección exacta. */
export function ubicacionCasa(
  c: Pick<CasaVenta, "distrito" | "municipio" | "departamento">,
  conDepartamento = false,
): string {
  return [c.distrito, c.municipio, conDepartamento ? c.departamento : null]
    .filter(Boolean)
    .join(", ");
}
