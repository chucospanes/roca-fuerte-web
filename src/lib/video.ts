/**
 * Video de un avance del portal o de una etapa/casa del catálogo: solo YouTube y Vimeo (CHECK en
 * 004_portal_obras.sql, 005_casas_venta.sql y 008_casas_venta_etapas.sql).
 */
export type VideoObra = { plataforma: "youtube" | "vimeo"; src: string; vertical: boolean };

const HOSTS_YOUTUBE = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const HOSTS_VIMEO = new Set(["vimeo.com", "www.vimeo.com"]);
const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
const ID_VIMEO = /^[0-9]{1,12}$/;
/** Videos no listados de Vimeo: vimeo.com/{id}/{hash} → player.vimeo.com/video/{id}?h={hash} */
const HASH_VIMEO = /^[0-9a-f]{6,32}$/;

/**
 * Reproductor embebido de un video de avance. Solo acepta las formas conocidas de URL de
 * YouTube (watch?v=, youtu.be/, shorts/, embed/, live/) y Vimeo (vimeo.com/{id}, con hash
 * opcional). La URL del reproductor se ARMA con el id validado, en los dominios oficiales
 * (youtube-nocookie.com, player.vimeo.com): nunca se incrusta lo que se escribió en la
 * base. Devuelve null si no reconoce la URL.
 */
export function videoObra(texto: string): VideoObra | null {
  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  const partes = url.pathname.split("/").filter(Boolean);

  if (url.hostname === "youtu.be" || HOSTS_YOUTUBE.has(url.hostname)) {
    let id: string | null = null;
    let vertical = false;
    if (url.hostname === "youtu.be") {
      if (partes.length === 1) id = partes[0];
    } else if (partes.length === 1 && partes[0] === "watch") {
      id = url.searchParams.get("v");
    } else if (partes.length === 2 && ["shorts", "embed", "live"].includes(partes[0])) {
      id = partes[1];
      vertical = partes[0] === "shorts";
    }
    if (!id || !ID_YOUTUBE.test(id)) return null;
    return {
      plataforma: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      vertical,
    };
  }

  if (HOSTS_VIMEO.has(url.hostname)) {
    const [id, hash, ...resto] = partes;
    if (!id || !ID_VIMEO.test(id) || resto.length > 0) return null;
    if (hash !== undefined && !HASH_VIMEO.test(hash)) return null;
    return {
      plataforma: "vimeo",
      src: `https://player.vimeo.com/video/${id}?autoplay=1${hash ? `&h=${hash}` : ""}`,
      vertical: false,
    };
  }

  return null;
}
