/**
 * Textos de las secciones de la landing que no dependen del modelo ni de la obra.
 * Respuestas de preguntas frecuentes: PENDIENTE hasta que el constructor las confirme.
 */

import { PENDIENTE, type Pendiente } from "@/config/site";

export const hero = {
  titulo: "Construcción honesta, a la vista de todos.",
  bajada:
    "Cada material y cada etapa de la obra, mostrados en video. Así sabes exactamente qué estás comprando.",
};

export const porQue = [
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
