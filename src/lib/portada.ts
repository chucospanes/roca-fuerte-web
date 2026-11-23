import { casasDisponibles, leerObraEnCurso, type CasaListada, type EtapaCasa } from "@/lib/casas";

/**
 * El "proyecto actual" de la portada (v2.0.0): la casa en obra de la bitácora si la hay y no
 * está vendida; si no, la primera casa disponible del catálogo (sin etapas). `null` si no hay
 * ninguna o Supabase no respondió: la sección no aparece y el hero vuelve al WhatsApp de comprar.
 * Sin consultas nuevas: sale de `leerObraEnCurso` y `listarCasas`, las mismas lecturas en caché.
 */
export type Proyecto = { casa: CasaListada; etapas: EtapaCasa[] };

export async function leerProyecto(): Promise<Proyecto | null> {
  const [obra, disponibles] = await Promise.all([leerObraEnCurso(), casasDisponibles()]);
  if (obra.ok && obra.datos && obra.datos.casa.estado !== "vendida") return obra.datos;
  const casa = disponibles?.[0];
  return casa ? { casa, etapas: [] } : null;
}

/** La etapa en curso del proyecto (para la tarjeta del hero); null si no hay una en proceso. */
export function etapaEnCurso(etapas: EtapaCasa[]): string | null {
  return etapas.find((e) => e.estado === "en_proceso")?.nombre ?? null;
}
