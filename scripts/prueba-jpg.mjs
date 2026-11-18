// Pruebas del lector de medidas de JPG (src/lib/jpg.ts). Uso: node scripts/prueba-jpg.mjs
// Genera JPG reales con sharp (ya instalado con Next; no es una dependencia del proyecto) y
// arma a mano los casos que sharp no produce (EXIF big-endian, relleno, archivos rotos).
import { createRequire } from "node:module";
import { medidasJpg } from "../src/lib/jpg.ts";

const sharp = createRequire(import.meta.url)("sharp");

const lienzo = (ancho, alto) =>
  sharp({ create: { width: ancho, height: alto, channels: 3, background: { r: 120, g: 110, b: 100 } } });

/** Bloque APP1 con EXIF mínimo: solo la etiqueta de orientación. */
function app1Orientacion(valor, intel) {
  const w16 = (n) => (intel ? [n & 0xff, n >> 8] : [n >> 8, n & 0xff]);
  const w32 = (n) => (intel ? [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, n >>> 24] : [n >>> 24, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
  const tiff = [...(intel ? [0x49, 0x49] : [0x4d, 0x4d]), ...w16(42), ...w32(8), ...w16(1), ...w16(0x0112), ...w16(3), ...w32(1), ...w16(valor), 0, 0, ...w32(0)];
  const datos = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const largo = datos.length + 2;
  return Buffer.from([0xff, 0xe1, largo >> 8, largo & 0xff, ...datos]);
}
/** Inserta un bloque justo después de SOI. */
const conBloque = (jpg, bloque) => Buffer.concat([jpg.subarray(0, 2), bloque, jpg.subarray(2)]);

const base = await lienzo(1200, 800).jpeg({ quality: 80 }).toBuffer();
const progresivo = await lienzo(1200, 800).jpeg({ quality: 80, progressive: true }).toBuffer();
const vertical = await lienzo(900, 1600).jpeg({ quality: 80 }).toBuffer();
const sharpOrient6 = await lienzo(1200, 800).jpeg().withMetadata({ orientation: 6 }).toBuffer();
const progOrient8 = await lienzo(1200, 800).jpeg({ progressive: true }).withMetadata({ orientation: 8 }).toBuffer();
const png = await lienzo(400, 300).png().toBuffer();

const marcaSof = (b) => {
  for (let i = 2; i < b.length - 1; i++) if (b[i] === 0xff && (b[i + 1] === 0xc0 || b[i + 1] === 0xc2)) return b[i + 1].toString(16);
  return "?";
};

const casos = [
  ["SOF0 base, horizontal", base, { ancho: 1200, alto: 800 }],
  ["SOF2 progresivo, horizontal", progresivo, { ancho: 1200, alto: 800 }],
  ["SOF0 vertical sin EXIF (como sale del panel)", vertical, { ancho: 900, alto: 1600 }],
  ["SOF0 + EXIF orientación 6 (sharp)", sharpOrient6, { ancho: 800, alto: 1200 }],
  ["SOF2 + EXIF orientación 8 (sharp)", progOrient8, { ancho: 800, alto: 1200 }],
  ["SOF0 + EXIF orientación 5, little-endian", conBloque(base, app1Orientacion(5, true)), { ancho: 800, alto: 1200 }],
  ["SOF2 + EXIF orientación 7, big-endian", conBloque(progresivo, app1Orientacion(7, false)), { ancho: 800, alto: 1200 }],
  ["SOF0 + EXIF orientación 3 (no intercambia)", conBloque(base, app1Orientacion(3, false)), { ancho: 1200, alto: 800 }],
  ["SOF0 + EXIF orientación 1", conBloque(base, app1Orientacion(1, true)), { ancho: 1200, alto: 800 }],
  ["Relleno 0xFF antes de una marca", Buffer.concat([base.subarray(0, 2), Buffer.from([0xff]), base.subarray(2)]), { ancho: 1200, alto: 800 }],
  ["PNG", png, null],
  ["JPG cortado antes del SOF", base.subarray(0, 20), null],
  ["Vacío", Buffer.alloc(0), null],
];

let fallas = 0;
console.log(`(marcas: base ${marcaSof(base)}, progresivo ${marcaSof(progresivo)})`);
for (const [nombre, bytes, esperado] of casos) {
  const r = medidasJpg(new Uint8Array(bytes));
  const ok = esperado === null ? r === null : r !== null && r.ancho === esperado.ancho && r.alto === esperado.alto;
  if (!ok) fallas++;
  console.log(`${ok ? "ok   " : "FALLA"} ${nombre}: ${r ? `${r.ancho}×${r.alto} (orientación ${r.orientacion})` : "null"}`);
}
console.log(fallas === 0 ? `\n${casos.length} de ${casos.length} casos bien.` : `\n${fallas} FALLAS.`);
process.exit(fallas === 0 ? 0 : 1);
