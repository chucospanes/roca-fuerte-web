/**
 * Etiquetas del portal de clientes. Los valores internos están en `src/lib/validacion.ts` y
 * coinciden con los CHECK de 004_portal_obras.sql.
 */

import type {
  ESTADOS_ETAPA,
  ESTADOS_OBRA,
  MODALIDADES_OBRA,
  TIPOS_DOCUMENTO,
} from "@/lib/validacion";

type Etiquetas<T extends readonly string[]> = Record<T[number], string>;

export const modalidades: Etiquetas<typeof MODALIDADES_OBRA> = {
  compra: "Compra de casa",
  construccion_terreno: "Construcción en tu terreno",
  inversionista: "Proyecto de inversionista",
};

export const estadosObra: Etiquetas<typeof ESTADOS_OBRA> = {
  por_iniciar: "Por iniciar",
  en_obra: "En obra",
  pausada: "Pausada",
  entregada: "Entregada",
};

export const estadosEtapa: Etiquetas<typeof ESTADOS_ETAPA> = {
  por_iniciar: "Por iniciar",
  en_proceso: "En proceso",
  terminada: "Terminada",
};

export const tiposDocumento: Etiquetas<typeof TIPOS_DOCUMENTO> = {
  contrato: "Contrato",
  plano: "Plano",
  permiso: "Permiso",
  otro: "Documento",
};

const formatoFecha = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Fecha `AAAA-MM-DD` de la base (columna `date`) en texto, sin correrse por zona horaria. */
export function fecha(valor: string | null): string | null {
  if (!valor) return null;
  const d = new Date(`${valor.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : formatoFecha.format(d);
}
