/**
 * Fotos del panel /admin, en el navegador: se reducen y se convierten a JPG ANTES de subir,
 * para que una foto de 3–6 MB del celular pese unos cientos de KB con datos móviles.
 *
 * Se dibuja la foto en un canvas desde un <img>: el navegador ya aplica la orientación del
 * EXIF (fotos verticales del celular) y el JPG nuevo sale SIN EXIF, sin GPS ni datos de la
 * cámara. Sin dependencias. Una foto que el navegador no puede abrir (por ejemplo HEIC en
 * algunos Android) se rechaza con un mensaje.
 */

/** Lado mayor de la foto subida (el portal la muestra en miniatura y la abre completa). */
export const LADO_MAX_FOTO = 2000;
const CALIDAD_JPG = 0.8;

export type FotoPreparada = { blob: Blob; ancho: number; alto: number };

export class FotoIlegible extends Error {}

export async function prepararFoto(archivo: File): Promise<FotoPreparada> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch {
      throw new FotoIlegible(archivo.name);
    }
    const escala = Math.min(1, LADO_MAX_FOTO / Math.max(img.naturalWidth, img.naturalHeight));
    const ancho = Math.max(1, Math.round(img.naturalWidth * escala));
    const alto = Math.max(1, Math.round(img.naturalHeight * escala));

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new FotoIlegible(archivo.name);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, ancho, alto);
    const blob = await new Promise<Blob | null>((listo) => canvas.toBlob(listo, "image/jpeg", CALIDAD_JPG));
    // Libera la memoria del canvas enseguida (en el celular importa con varias fotos)
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) throw new FotoIlegible(archivo.name);
    return { blob, ancho, alto };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Nombres en orden para las fotos nuevas de un avance: siguen después de la última foto
 * numerada que ya tiene la carpeta (01.jpg, 02.jpg…). El portal las ordena por nombre.
 */
export function nombresSiguientes(existentes: string[], cuantas: number): string[] {
  const ultimo = existentes.reduce((max, nombre) => {
    const m = /^(\d+)\.(jpe?g|png|webp)$/i.exec(nombre);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
  return Array.from({ length: cuantas }, (_, i) => `${String(ultimo + i + 1).padStart(2, "0")}.jpg`);
}

/** Tamaño legible: "1.4 MB", "350 KB". */
export function tamano(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
