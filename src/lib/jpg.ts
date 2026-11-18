/**
 * Medidas de un JPG leyendo solo sus encabezados, sin dependencias.
 *
 * - Acepta todos los marcadores de inicio de imagen (SOF): base (SOF0, C0), extendido (C1),
 *   progresivo (SOF2, C2), sin pérdida (C3) y sus variantes jerárquicas y aritméticas (C5–C7,
 *   C9–CB, CD–CF). C4 (tablas Huffman), C8 (reservado) y CC (tablas aritméticas) no son SOF.
 * - Si la foto trae la etiqueta de orientación EXIF (APP1) con valor 5, 6, 7 u 8, se intercambian
 *   ancho y alto: así se ve en pantalla. Las fotos del panel salen sin EXIF (se redibujan en el
 *   navegador con la orientación ya aplicada) y la copia pública rechaza las que lo traen; esto
 *   cubre una foto que llegue por otra vía.
 * - Ante algo que no entiende, devuelve null (en la duda, no se registra).
 */
export type MedidasJpg = { ancho: number; alto: number; orientacion: number };

const ES_SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/** Orientación del bloque EXIF (1 si no la trae o no se entiende). `inicio` apunta a "Exif\0\0". */
function orientacionExif(b: Uint8Array, inicio: number, fin: number): number {
  if (fin - inicio < 14) return 1;
  // "Exif\0\0"
  if (b[inicio] !== 0x45 || b[inicio + 1] !== 0x78 || b[inicio + 2] !== 0x69 || b[inicio + 3] !== 0x66) return 1;
  const tiff = inicio + 6;
  const intel = b[tiff] === 0x49 && b[tiff + 1] === 0x49;
  const motorola = b[tiff] === 0x4d && b[tiff + 1] === 0x4d;
  if (!intel && !motorola) return 1;
  const u16 = (i: number) => (intel ? b[i] | (b[i + 1] << 8) : (b[i] << 8) | b[i + 1]);
  const u32 = (i: number) =>
    intel
      ? (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0
      : ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
  const ifd0 = tiff + u32(tiff + 4);
  if (ifd0 + 2 > fin) return 1;
  const entradas = u16(ifd0);
  for (let k = 0; k < entradas; k++) {
    const e = ifd0 + 2 + k * 12;
    if (e + 12 > fin) return 1;
    if (u16(e) === 0x0112) {
      const valor = u16(e + 8);
      return valor >= 1 && valor <= 8 ? valor : 1;
    }
  }
  return 1;
}

export function medidasJpg(bytes: Uint8Array): MedidasJpg | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let orientacion = 1;
  let i = 2;
  while (i + 3 < bytes.length) {
    if (bytes[i] !== 0xff) return null;
    // Bytes de relleno 0xFF antes de la marca
    while (bytes[i + 1] === 0xff && i + 2 < bytes.length) i++;
    const marca = bytes[i + 1];
    // Marcas sin longitud
    if (marca === 0x01 || (marca >= 0xd0 && marca <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marca === 0xd9 || marca === 0xda) return null; // terminó o empezó la imagen sin SOF
    if (i + 3 >= bytes.length) return null;
    const largo = (bytes[i + 2] << 8) | bytes[i + 3];
    if (largo < 2) return null;
    const fin = i + 2 + largo;
    if (marca === 0xe1 && orientacion === 1) orientacion = orientacionExif(bytes, i + 4, Math.min(fin, bytes.length));
    if (ES_SOF.has(marca)) {
      if (i + 8 >= bytes.length) return null;
      const alto = (bytes[i + 5] << 8) | bytes[i + 6];
      const ancho = (bytes[i + 7] << 8) | bytes[i + 8];
      if (ancho === 0 || alto === 0) return null;
      return orientacion >= 5 ? { ancho: alto, alto: ancho, orientacion } : { ancho, alto, orientacion };
    }
    i = fin;
  }
  return null;
}
