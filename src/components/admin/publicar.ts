import { copiarFotoPublica, fijarPublicacion, prepararPublicacion } from "@/app/admin/acciones";

/**
 * Publica un avance en la ficha de su casa: 1) crea (o retoma) la publicación oculta; 2) copia
 * las fotos una por una, con un reintento si se cae la conexión; 3) fija las fotos y la
 * publicación aparece. Si algo falla, la publicación queda oculta ("a medias") y se puede
 * terminar o quitar desde la obra.
 */
export async function publicarEnFicha(
  avanceId: string,
  alAvanzar?: (copiadas: number, total: number) => void,
): Promise<{ ok: true; fotos: number } | { ok: false; mensaje: string }> {
  const sinConexion = "No se pudo publicar. Revisa la conexión y vuelve a intentarlo desde la obra.";
  const preparada = await prepararPublicacion(avanceId).catch(() => null);
  if (!preparada) return { ok: false, mensaje: sinConexion };
  if (!preparada.ok) return preparada;

  const { origenes } = preparada.datos;
  const nombres: string[] = [];
  alAvanzar?.(0, origenes.length);
  for (const [indice, origen] of origenes.entries()) {
    let copia = await copiarFotoPublica({ avanceId, origen, indice }).catch(() => null);
    if (!copia) copia = await copiarFotoPublica({ avanceId, origen, indice }).catch(() => null);
    if (!copia) return { ok: false, mensaje: sinConexion };
    if (!copia.ok) return copia;
    nombres.push(copia.datos.nombre);
    alAvanzar?.(indice + 1, origenes.length);
  }

  const fijada = await fijarPublicacion({ avanceId, nombres }).catch(() => null);
  if (!fijada) return { ok: false, mensaje: sinConexion };
  if (!fijada.ok) return fijada;
  return { ok: true, fotos: fijada.datos.fotos };
}
