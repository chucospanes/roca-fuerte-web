import type { Video } from "@/content/bitacora";

export type VideoEmbed = {
  src: string;
  /** Formato vertical (TikTok, Reels, Shorts) u horizontal. */
  vertical: boolean;
};

/**
 * Convierte la URL pública de un video en la URL de su reproductor embebido.
 * Devuelve null si no reconoce el formato; en ese caso se muestra solo el enlace.
 */
export function videoEmbed(video: Video): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(video.url);
  } catch {
    return null;
  }
  const partes = url.pathname.split("/").filter(Boolean);

  if (video.plataforma === "youtube") {
    let id: string | null = null;
    let vertical = false;
    if (url.hostname === "youtu.be") id = partes[0] ?? null;
    else if (partes[0] === "shorts") {
      id = partes[1] ?? null;
      vertical = true;
    } else if (partes[0] === "embed") id = partes[1] ?? null;
    else id = url.searchParams.get("v");
    if (!id) return null;
    return { src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, vertical };
  }

  if (video.plataforma === "tiktok") {
    const i = partes.indexOf("video");
    const id = i >= 0 ? partes[i + 1] : undefined;
    if (!id) return null;
    return { src: `https://www.tiktok.com/embed/v2/${id}`, vertical: true };
  }

  if (video.plataforma === "instagram") {
    const tipo = partes[0];
    const codigo = partes[1];
    if (!codigo || !["reel", "p", "tv"].includes(tipo)) return null;
    return { src: `https://www.instagram.com/${tipo}/${codigo}/embed`, vertical: true };
  }

  return null;
}
