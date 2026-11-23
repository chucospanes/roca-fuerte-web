/**
 * Textos de las secciones de la landing que no dependen del modelo ni de la obra.
 * Respuestas de preguntas frecuentes confirmadas por el constructor (2026-11-04).
 */

import { site, type Pendiente } from "@/config/site";

/**
 * Quién tramita los permisos. El mismo texto va en la pregunta frecuente y en la sección
 * "Para inversionistas", para que no se contradigan.
 */
export const textoPermisos = `${site.marca} tramita los permisos de construcción y la segregación ante OPAMSS y CNR, y subcontrata los servicios que requieren licencia profesional.`;

/** Punto numerado (`PuntosNumerados`): hoy solo los de `calidadConIngeniero`, sin mostrarse. */
export type Punto = {
  titulo: string;
  texto: string;
  /** Datos por confirmar del punto; se muestran con el sello de pendiente. */
  pendientes?: string[];
  enlace?: { href: string; texto: string };
};

/**
 * Ocultos hasta que haya ingeniero responsable (decisión del 2026-11-04, pendiente en
 * ESTADO.md): la norma de diseño y el profesional que firma. Para mostrarlos, pasarlos a
 * `calidad` con los datos confirmados (sin `pendientes`).
 */
export const calidadConIngeniero: Punto[] = [
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
];

export type Pregunta = { pregunta: string; respuesta: string | Pendiente };

/**
 * Solo las preguntas cuyo contenido no está en otra sección de la portada (decisión del usuario,
 * 2026-11-23): sale la de pagos (la dicen "Proyecto actual" y "Así trabajamos").
 */
export const preguntas: Pregunta[] = [
  {
    pregunta: "¿Puedo comprar con crédito del Fondo Social para la Vivienda (FSV)?",
    respuesta:
      "Sí. Consúltanos tu caso por WhatsApp y te acompañamos en el trámite. La aprobación del crédito depende del FSV.",
  },
  {
    pregunta: "¿Puedo comprar con crédito bancario?",
    respuesta:
      "Sí. Consúltanos tu caso por WhatsApp y te acompañamos en el trámite. La aprobación del crédito depende del banco.",
  },
  {
    pregunta: "Vivo fuera de El Salvador, ¿cómo funciona el proceso?",
    respuesta:
      "Puedes comprar sin viajar. Firmas el contrato mediante un poder a una persona de tu confianza, otorgado ante notario o en un consulado salvadoreño. Los pagos se hacen por transferencia bancaria y sigues el avance de tu casa desde el portal privado, estés donde estés.",
  },
  {
    pregunta: "¿Cuánto tiempo tarda la construcción?",
    respuesta:
      "Entre 60 y 90 días de obra, una vez aprobados los permisos. El plazo puede variar por el clima, el terreno o los acabados elegidos, y el plazo exacto queda fijado en el contrato.",
  },
  { pregunta: "¿Quién se encarga de los permisos de construcción?", respuesta: textoPermisos },
];
