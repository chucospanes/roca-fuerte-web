/**
 * Textos del catálogo de casas en venta (`/casas`). Los datos de cada casa viven SOLO en
 * Supabase (`casas_venta`); lo del modelo Esparta, en `esparta.ts`.
 */

import { site } from "@/config/site";
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

/**
 * Bitácora de la portada (ver DECISIONES.md, 2026-11-04 y 2026-11-05). El nombre y el enlace
 * salen de la casa del catálogo en obra. Las vendidas no se muestran; sin casa en obra, la
 * sección no aparece.
 */
export const bitacoraCasa = {
  titulo: (nombre: string) => `Obra en curso: ${nombre}`,
  /** Solo si Supabase no respondió (sin casa en obra, la sección no aparece). */
  tituloSinDatos: "Bitácora de obra",
  error: "No pudimos cargar el avance de la obra en este momento.",
  linea: {
    en_construccion: `Casa propia de ${site.marca}, a la venta.`,
    terminada: `Casa propia de ${site.marca}, a la venta.`,
    reservada: `Casa propia de ${site.marca}, reservada.`,
  } satisfies Record<Exclude<CasaVenta["estado"], "vendida">, string>,
  verCasa: "Ver la casa",
  nota: "Las obras de nuestros clientes se siguen en su portal privado.",
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
