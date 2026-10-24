/**
 * Contenido de la Casa Modelo Bonaire.
 *
 * Fuente: plano y fachada v3, corregidos para casa entre colindancias
 * (`assets/plano-bonaire.pdf`, `assets/fachada-bonaire.pdf`) y `docs/CONTEXTO.md`.
 * Las especificaciones de materiales son PENDIENTE hasta que el constructor las confirme.
 */

import { PENDIENTE, type Pendiente } from "@/config/site";

export type Ambiente = {
  nombre: string;
  /** Medidas interiores en metros, ancho × largo. */
  medidas: string;
  areaM2: number;
  notas: string[];
};

export type Material = {
  material: string;
  /** Qué datos debe incluir la especificación cuando se confirme. */
  seEspecifica?: string;
  especificacion: string | Pendiente;
  marca: string | Pendiente;
  porQue: string | Pendiente;
  /**
   * Cantidad para la casa completa, con unidad (por ejemplo "1,200 unidades", "35 bolsas").
   * Solo se muestra en el área premium. Sin definir = PENDIENTE.
   */
  cantidad?: string | Pendiente;
};

/** Desglose de qué incluye un precio: líneas de texto, o PENDIENTE. Solo en el área premium. */
export type Desglose = string[] | Pendiente;

export const bonaire = {
  nombre: "Casa Modelo Bonaire",
  version: "Plano v3, corregido para casa entre colindancias",
  resumen: "Casa de una planta en forma de L, 2 dormitorios y 1 baño.",
  dormitorios: 2,
  banos: 1,

  areas: {
    construidaM2: 43.6,
    utilM2: 38.07,
  },

  volumetria: {
    cuerpoPrincipal: "8.00 × 5.00 m",
    extensionSala: "1.50 × 2.40 m",
  },

  muros: {
    sistema: "Bloque de concreto",
    exterioresM: 0.15,
    interioresM: 0.1,
  },

  /** Sin retiro lateral: los terrenos vecinos son de terceros (ver DECISIONES.md). */
  implantacion: "Entre colindancias: los muros laterales no tienen ventanas ni aleros.",

  techo: {
    cubierta: "Lámina a dos aguas",
    cumbrera: "Paralela a la fachada",
    /** Verificar el mínimo con la ficha técnica de la lámina que se elija. */
    pendientePct: 15,
    desague: "El agua cae al frente (canal y bajante) y al fondo, no hacia los vecinos.",
    /** Alturas sobre el nivel de piso terminado. */
    aleroM: 2.6,
    cumbreraM: 3.31,
  },

  /** Fuera del área construida. La columna aún no tiene diseño estructural. */
  corredor: {
    fondoM: 1.5,
    descripcion: "Corredor techado frente al Dormitorio 1, con columna en la esquina.",
  },

  ambientes: [
    {
      nombre: "Dormitorio 1",
      medidas: "3.00 × 2.50 m",
      areaM2: 7.5,
      notas: ["Espacio para ropero."],
    },
    {
      nombre: "Dormitorio 2",
      medidas: "3.00 × 2.50 m",
      areaM2: 7.5,
      notas: ["Espacio para ropero."],
    },
    {
      nombre: "Baño",
      medidas: "1.50 × 2.50 m",
      areaM2: 3.75,
      notas: ["Con ducha, sin tina.", "Extractor y lámina traslúcida en el techo."],
    },
    {
      nombre: "Sala, comedor, cocina y lavado",
      medidas: "9.20 × 2.10 m",
      areaM2: 19.32,
      notas: [
        "Espacio abierto, con lámina traslúcida sobre el comedor.",
        "Cocina en L: pila y fregadero en el muro del fondo, bajo una ventana de 1.20 m; estufa y refrigeradora en el muro lateral.",
      ],
    },
  ] satisfies Ambiente[],

  /** Lo que el modelo económico no incluye. */
  noIncluye: ["Tina", "Jacuzzi", "Lavadora", "Secadora"],

  plano: {
    src: "/plano-bonaire.png",
    alt: "Plano de la Casa Modelo Bonaire: planta en L entre colindancias, con 2 dormitorios, baño, sala-comedor-cocina-lavado abierta y corredor techado en la fachada.",
    ancho: 3550,
    alto: 2775,
  },

  fachada: {
    src: "/fachada-bonaire.png",
    alt: "Fachada principal de la Casa Modelo Bonaire: techo de lámina a dos aguas, ventana de la sala y corredor techado frente al Dormitorio 1, entre muros de colindancia.",
    ancho: 3150,
    alto: 2250,
    texto: "Fachada principal — vista desde la calle",
  },

  /** Qué incluye cada precio, partida por partida. Solo en el área premium. */
  desglosePrecio: {
    comprarCasa: PENDIENTE as Desglose,
    construirEnTerreno: PENDIENTE as Desglose,
  },

  avisoPlanos:
    "Plano y fachada referenciales. Requieren firma de arquitecto o ingeniero antes de construir.",

  materiales: [
    {
      material: "Bloque de concreto",
      especificacion: "Muros exteriores de 0.15 m e interiores de 0.10 m (según plano v3).",
      marca: PENDIENTE,
      porQue: PENDIENTE,
    },
    { material: "Cemento", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    {
      material: "Concreto",
      seEspecifica: "Resistencia f'c y proporción de mezcla.",
      especificacion: PENDIENTE,
      marca: PENDIENTE,
      porQue: PENDIENTE,
    },
    {
      material: "Agregados",
      seEspecifica: "Arena y grava.",
      especificacion: PENDIENTE,
      marca: PENDIENTE,
      porQue: PENDIENTE,
    },
    { material: "Acero de refuerzo", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    {
      material: "Estructura de techo",
      seEspecifica: "Polines: calibre y separación.",
      especificacion: PENDIENTE,
      marca: PENDIENTE,
      porQue: PENDIENTE,
    },
    {
      material: "Cubierta de techo",
      seEspecifica: "Lámina: tipo y calibre; pendiente mínima según el fabricante (diseño: 15 %).",
      especificacion: PENDIENTE,
      marca: PENDIENTE,
      porQue: PENDIENTE,
    },
    { material: "Piso", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Puertas y ventanas", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Instalación eléctrica", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Tubería y accesorios hidráulicos", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Pintura", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
  ] satisfies Material[],
};
