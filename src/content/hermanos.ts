/**
 * Sección "Hermano cercano" de la portada: salvadoreños en el exterior (ver DECISIONES.md,
 * 2026-11-05). Debe decir lo mismo que la pregunta frecuente "Vivo fuera de El Salvador".
 */
export const hermanos = {
  etiqueta: "Salvadoreños en el exterior",
  /** Título: "Hermano ~~lejano~~ cercano." El lector de pantalla lee solo "Hermano cercano." */
  titulo: { inicio: "Hermano", tachado: "lejano", destacado: "cercano" },
  subtitulo: "Tú mueves la economía. Y mereces saber exactamente en qué se convierte tu dinero.",
  puntos: [
    {
      titulo: "Compra sin viajar",
      texto: "Firmas mediante un poder, ante notario o en un consulado salvadoreño.",
    },
    {
      titulo: "Pagos por etapas",
      texto: "30 % al firmar y el resto por transferencia bancaria, conforme avanza la obra.",
    },
    {
      titulo: "Tu obra en tu celular",
      texto: "Fotos, etapas, documentos y facturas en tu portal privado, desde cualquier país.",
    },
    {
      titulo: "En nuestro terreno o en el de tu familia",
      texto: "Construimos a pedido donde lo necesites.",
    },
  ],
  boton: "Escribir por WhatsApp",
  mensaje: "Hola, vivo fuera de El Salvador y quiero información para tener mi casa.",
};
