/**
 * Textos de las secciones de la landing que no dependen del modelo ni de la obra.
 * Respuestas de preguntas frecuentes: PENDIENTE hasta que el constructor las confirme.
 */

import { PENDIENTE, type Pendiente } from "@/config/site";

/** Punto numerado de las secciones Por qué y Calidad. */
export type Punto = {
  titulo: string;
  texto: string;
  /** Datos por confirmar del punto; se muestran con el sello de pendiente. */
  pendientes?: string[];
  enlace?: { href: string; texto: string };
};

export const hero = {
  titulo: "Construcción honesta, a la vista de todos.",
  bajada:
    "Cada material y cada etapa de la obra, mostrados en video. Así sabes exactamente qué estás comprando.",
};

export const porQue: Punto[] = [
  {
    titulo: "Cada material, en video",
    texto: "Mostramos qué usamos, de qué marca y por qué, antes de que quede tapado por el repello.",
  },
  {
    titulo: "Cada etapa, documentada",
    texto: "La bitácora de obra registra fechas, avance y videos de cada etapa de la construcción.",
  },
  {
    titulo: "Sin sorpresas en el precio",
    texto: "Cotización cerrada antes del contrato. Lo que no está incluido se cotiza aparte.",
  },
  {
    titulo: "Desde donde estés",
    texto:
      "Si vives fuera de El Salvador, ves el avance desde tu celular, sin depender de que alguien te cuente.",
  },
];

/**
 * Calidad y resistencia: solo puntos verificables. Sin superlativos ni promesas de
 * resistencia (ver DECISIONES.md). Lo no confirmado va en `pendientes`.
 */
export const calidad: Punto[] = [
  {
    titulo: "Diseño sismorresistente según la norma",
    texto:
      "Referencia: reglamento técnico salvadoreño para vivienda de una y dos plantas, RTS 91.01.02:21.",
    pendientes: ["Confirmar con el ingeniero responsable"],
  },
  {
    titulo: "Plano revisado y firmado por un profesional",
    texto: "El plano de construcción lo revisa y firma un arquitecto o ingeniero antes de construir.",
    pendientes: ["Nombre del profesional pendiente", "Número de registro pendiente"],
  },
  {
    titulo: "Control de calidad en obra, en video",
    texto:
      "Dosificación y curado del concreto, amarres del acero, plomo y nivel de los muros: cada control queda grabado en la bitácora de obra.",
    enlace: { href: "#bitacora", texto: "Ver la bitácora" },
  },
  {
    titulo: "Cada material con su especificación",
    texto: "Qué material se usa, con qué especificación, de qué marca y por qué, a la vista en la tabla de materiales.",
    enlace: { href: "#materiales", texto: "Ver los materiales" },
  },
];

export const pasos = [
  { titulo: "Contacto", texto: "Nos cuentas qué buscas por el formulario o por WhatsApp." },
  { titulo: "Evaluación del terreno", texto: "Revisamos tu terreno para saber si cumple las condiciones." },
  { titulo: "Cotización cerrada", texto: "Recibes el precio completo de la obra antes de comprometerte." },
  { titulo: "Contrato", texto: "Firmamos el contrato con el alcance y el precio acordados." },
  { titulo: "Construcción documentada", texto: "Cada etapa se publica en video para que veas el avance." },
  { titulo: "Entrega", texto: "Recibes tu casa terminada." },
];

export type Pregunta = { pregunta: string; respuesta: string | Pendiente };

export const preguntas: Pregunta[] = [
  { pregunta: "¿Puedo pagar al contado?", respuesta: PENDIENTE },
  { pregunta: "¿Puedo comprar con crédito del Fondo Social para la Vivienda (FSV)?", respuesta: PENDIENTE },
  { pregunta: "¿Puedo comprar con crédito bancario?", respuesta: PENDIENTE },
  { pregunta: "Vivo fuera de El Salvador, ¿cómo funciona el proceso?", respuesta: PENDIENTE },
  { pregunta: "¿Cuánto tiempo tarda la construcción?", respuesta: PENDIENTE },
  { pregunta: "¿La casa tiene garantía?", respuesta: PENDIENTE },
  { pregunta: "¿Quién se encarga de los permisos de construcción?", respuesta: PENDIENTE },
];
