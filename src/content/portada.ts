/**
 * Textos de la portada v2.0.0, tal cual el brief aprobado (docs/REDISENO_PORTADA.md, 2026-11-23).
 * Solo afirmaciones comprobables hoy (sección 7 del brief). Lo que viene de la base (etapa, casa,
 * modalidades, precios, avances) NO se escribe aquí.
 */
import { site } from "@/config/site";

/** "Constructora Roca Fuerte, construyendo un mundo mejor." (la marca sale de site.ts) */
const constructora = `Constructora ${site.marca}, construyendo un mundo mejor.`;

export const portada = {
  menu: {
    proyectos: "Proyectos",
    calidad: "Calidad comprobable",
    proceso: "Cómo trabajamos",
    hermano: "Hermano cercano",
    portal: "Portal de clientes",
    whatsapp: "WhatsApp",
  },

  hero: {
    etiqueta: "Constructores y desarrolladores · El Salvador",
    titulo: { inicio: "Casas de calidad", destacado: "comprobable." },
    texto:
      "Diseñamos, desarrollamos y construimos. Cada etapa de tu casa queda a la vista: el hierro, los materiales con factura y el avance con fotos.",
    /** Botón principal: el mismo WhatsApp de "Proyecto actual" (`comprar`/`hero`). */
    whatsapp: "Escríbenos por WhatsApp",
    verProyecto: "Ver el proyecto actual",
    /** Sin casa disponible, el botón principal vuelve al WhatsApp de comprar (regla de siempre). */
    sinProyecto: "Quiero esta casa",
    tarjeta: { etiqueta: "Obra en curso", etapa: "Etapa" },
  },

  franja: {
    etiqueta: "Lo que comprobamos en cada obra",
    puntos: [
      "Hierro grado 40",
      "Bloque de norma",
      "Bastones de refuerzo",
      "Materiales con factura",
      "Avance con fotos",
      "Mano de obra local",
    ],
  },

  quienes: {
    titulo: ["Desarrollamos.", "Construimos.", "Lo comprobamos."],
    texto: `${constructora} Casa por casa, con mano de obra de la comunidad.`,
    tarjetas: [
      {
        numero: "01",
        titulo: "Desarrolladores",
        texto:
          "Proyectos propios, de principio a fin: elegimos el terreno, diseñamos el modelo y lo construimos para venderlo terminado o en preventa.",
        remate: "Hoy: Casa Modelo Esparta, San José Villanueva.",
      },
      {
        numero: "02",
        titulo: "Constructores",
        texto:
          "Construimos a pedido, en tu terreno o en uno nuestro. Materiales al costo, comprobables por factura, y acabados a tu elección.",
        remate: "No vendemos materiales: el precio lo pone el mercado.",
      },
    ],
  },

  calidad: {
    etiqueta: "Calidad comprobable",
    titulo: "Lo que no se ve, te lo mostramos.",
    texto:
      "Una casa se juzga por lo que queda adentro del concreto. Por eso lo documentamos antes de taparlo.",
    bloques: [
      {
        icono: "refuerzo",
        titulo: "Construcción reforzada",
        texto: "Hierro grado 40, bloque de norma y bastones de refuerzo vertical anclados a la fundación.",
      },
      {
        icono: "camara",
        titulo: "Estructura a la vista",
        texto: "Fotografiamos la fundación, el hierro y los bastones antes de que el concreto los tape.",
      },
      {
        icono: "factura",
        titulo: "Materiales con factura",
        texto: "Transparencia en los costos: cada material, con su factura. No ganamos con sobreprecio.",
      },
      {
        icono: "portal",
        titulo: "Avance en tu portal",
        texto:
          "Cada etapa de tu casa, con fotos y fecha, en tu portal de cliente. Desde aquí o desde el extranjero.",
      },
    ],
  },

  proyecto: {
    etiqueta: "Proyecto actual · Preventa",
    lema: "No es una casa más, es tu hogar.",
    pagos: "30% a la firma, pagos por etapas y saldo a la entrega.",
    verCasa: "Ver la casa",
    whatsapp: "Escríbenos por WhatsApp",
    sinPrecio: "A consultar",
    lote: "Lote",
    estacionamientos: "Estacionamientos",
    avance: "Avance de la obra",
    /** "Por iniciar", no "Pendiente": no se confunde con un dato pendiente (2026-10-23). */
    estados: { terminada: "Terminada", en_proceso: "En curso", por_iniciar: "Por iniciar" },
    imagen: {
      src: "/hero/ilustracion-hogar.jpg",
      alt: "Ilustración de una casa de una planta con fachada gris y naranja, jardín con flores, grama y un camino de piedra hasta la entrada",
      rotulo: "Ilustración de referencia",
    },
  },

  diario: {
    titulo: "Diario de obra",
    texto: "Fotos reales, sin retoque. Se actualiza con cada avance.",
  },

  proceso: {
    titulo: "Así trabajamos.",
    pasos: [
      {
        titulo: "Conversamos",
        texto: "Por WhatsApp o en la obra. Te mostramos el plano y lo que ya está construido.",
      },
      { titulo: "Firmamos", texto: "Con el 30%. Montos y plazos claros en el contrato." },
      {
        titulo: "Construimos a la vista",
        texto: "Pagas por etapas mientras ves cada avance con fotos en tu portal.",
      },
      { titulo: "Recibes tu hogar", texto: "Saldo a la entrega, con el expediente de tu casa." },
    ],
  },

  pie: {
    constructora,
    contacto: "Contacto",
    enlaces: {
      casas: "Casas en venta",
      inversionistas: "Para inversionistas",
      preguntas: "Preguntas frecuentes",
      privacidad: "Aviso de privacidad",
    },
    anio: "2026",
  },
};

/**
 * Mensaje de "Escríbenos por WhatsApp" (hero y "Proyecto actual"), con el modelo de la base:
 * "Hola, quiero información de la Casa Modelo Esparta."
 */
export function mensajeInformacion(modelo: string): string {
  return `Hola, quiero información de la Casa Modelo ${modelo}.`;
}
