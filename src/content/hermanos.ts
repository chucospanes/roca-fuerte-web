/**
 * Sección "Hermano cercano" de la portada: salvadoreños en el exterior (ver DECISIONES.md,
 * 2026-11-05). Textos de la v2.0.0 (docs/REDISENO_PORTADA.md, 5.9). Debe decir lo mismo que la
 * pregunta frecuente "Vivo fuera de El Salvador".
 */
export const hermanos = {
  etiqueta: "Para salvadoreños en el exterior",
  /** Título: "Hermano ~~lejano~~ cercano." El lector de pantalla lee solo "Hermano cercano." */
  titulo: { inicio: "Hermano", tachado: "lejano", destacado: "cercano" },
  texto:
    "Tú mueves la economía. Compra o construye en El Salvador desde donde estés, y sigue cada etapa en línea como si estuvieras en la obra.",
  tabla: [
    { dato: "Proceso", valor: "100% a distancia" },
    { dato: "Avance de obra", valor: "Fotos en tu portal" },
    { dato: "Pagos", valor: "Por etapas" },
  ],
  boton: "Hablemos por WhatsApp",
  mensaje: "Hola, vivo fuera de El Salvador y quiero información para tener mi casa.",
};
