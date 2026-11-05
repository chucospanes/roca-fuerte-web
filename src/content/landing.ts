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

/** Punto numerado de las secciones Calidad y Para inversionistas. */
export type Punto = {
  titulo: string;
  texto: string;
  /** Datos por confirmar del punto; se muestran con el sello de pendiente. */
  pendientes?: string[];
  enlace?: { href: string; texto: string };
};

/**
 * Hero en 3 pantallas, avance solo manual (ver DECISIONES.md, 2026-11-03). La primera lleva
 * el botón dinámico (casa, catálogo o WhatsApp); su título es el h1 de la página.
 * Fondos: foto real de la obra en la primera (la de la casa de San José Villanueva del
 * catálogo); las otras, color de la marca hasta tener fotos horizontales.
 */
export const heroPantallas = {
  reforzada: {
    titulo: "Casas que duran.",
    subtitulo: "Construcción reforzada.",
    foto: {
      src: "/hero/obra-sjv-trazo.jpg",
      alt: "Trazo de una casa en obra: hilos, cal y niveletas de madera marcan las paredes mientras tres trabajadores abren las zanjas",
    },
  },
  documentada: {
    titulo: "Construcción documentada.",
    subtitulo: "Etapa por etapa.",
    boton: { href: "#bitacora", texto: "Ver la bitácora" },
  },
  hogar: {
    titulo: "No es una casa más, es tu hogar.",
    subtitulo: "Tu lugar seguro.",
    boton: "Construir a pedido",
  },
};

/**
 * Lo que nos diferencia (reemplaza "Por qué construimos así", ver DECISIONES.md, 2026-11-03).
 * Sin marcas de materiales en estos textos.
 */
export const diferencias = {
  todas: {
    titulo: "En todas nuestras casas",
    puntos: [
      "Construcción documentada, etapa por etapa.",
      "Nuestras casas se construyen aplicando estándares de seguridad internacionales. Todo documentado.",
      "Materiales que cumplen la norma y sus especificaciones.",
      "Portal privado de seguimiento.",
      "Mano de obra de la zona.",
    ],
  },
  aPedido: {
    titulo: "En casas a pedido",
    puntos: [
      "Transparencia en los costos de materiales. No vendemos materiales: el costo lo pone el mercado.",
      "Acabados a elección: grifería, puertas, cerámica, color. Lo que sale del estándar se cotiza aparte; el costo de instalación puede variar ligeramente.",
    ],
  },
};

/**
 * Calidad y resistencia: solo puntos verificables. Sin superlativos ni promesas de
 * resistencia (ver DECISIONES.md). Lo no confirmado va en `pendientes`.
 */
export const calidad: Punto[] = [
  {
    titulo: "Control de calidad en obra, documentado",
    texto:
      "Dosificación y curado del concreto, amarres del acero, plomo y nivel de los muros: cada control queda documentado etapa por etapa.",
    enlace: { href: "#bitacora", texto: "Ver la bitácora" },
  },
  {
    titulo: "Cada material con su especificación",
    texto: "Qué material se usa, con qué especificación y por qué, a la vista en la tabla de materiales.",
    enlace: { href: "#materiales", texto: "Ver los materiales" },
  },
];

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

export const pasos = [
  { titulo: "Contacto", texto: "Nos cuentas qué buscas por WhatsApp." },
  { titulo: "Evaluación del terreno", texto: "Si la casa va en tu terreno, lo revisamos para saber si cumple las condiciones." },
  { titulo: "Cotización cerrada", texto: "Recibes el precio completo de la obra antes de comprometerte." },
  { titulo: "Contrato", texto: "Firmamos el contrato con el alcance y el precio acordados." },
  { titulo: "Construcción documentada", texto: "Documentamos la obra etapa por etapa para que veas el avance." },
  { titulo: "Entrega", texto: "Recibes tu casa terminada." },
];

export type Pregunta = { pregunta: string; respuesta: string | Pendiente };

export const preguntas: Pregunta[] = [
  {
    pregunta: "¿Puedo pagar al contado?",
    respuesta:
      "Sí. Se paga el 30 % al firmar el contrato y el resto por etapas, conforme avanza la obra, con el saldo al entregar la casa. Los montos y plazos quedan fijados en el contrato.",
  },
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
