/**
 * Contenido de la Casa Modelo Esparta.
 *
 * Fuente: planta en lote de 5 × 20 m y fachada con pretil
 * (`assets/plano-esparta.pdf`, `assets/fachada-esparta.pdf`) y `docs/CONTEXTO.md`.
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

export const esparta = {
  nombre: "Casa Modelo Esparta",
  version: "Planta en lote de 5 × 20 m y fachada con pretil",
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

  /**
   * Lote real de la casa, del frente (calle) al fondo. Las franjas suman 20.00 m.
   * Sale de segregar un terreno de 10 × 20 m en dos lotes de 5 × 20 m (ver docs/CONTEXTO.md).
   */
  lote: {
    frenteM: 5,
    fondoM: 20,
    franjas: [
      { nombre: "Estacionamiento", fondoM: 5 },
      { nombre: "Jardín", fondoM: 3.5 },
      { nombre: "Casa", fondoM: 9.5 },
      { nombre: "Patio", fondoM: 2 },
    ],
  },

  /** Sin retiro lateral: los terrenos vecinos son de terceros (ver DECISIONES.md). */
  implantacion: "Entre colindancias: los muros laterales no tienen ventanas ni aleros.",

  techo: {
    cubierta: "Lámina a dos aguas",
    cumbrera: "Paralela a la fachada",
    /** Verificar el mínimo con la ficha técnica de la lámina que se elija. */
    pendientePct: 15,
    desague:
      "El agua cae al frente, a un canal detrás del pretil que desagua hacia el jardín, y al patio del fondo; nunca hacia los vecinos.",
    /** Alturas sobre el nivel de piso terminado. */
    aleroM: 2.6,
    cumbreraM: 3.31,
  },

  /** Pretil de la fachada: sube el muro del frente y oculta el techo desde la calle. */
  pretil: {
    altoM: 0.6,
    /** Altura total del muro de fachada con el pretil, sobre el nivel de piso terminado. */
    hastaM: 3.2,
  },

  /** Acabados de la fachada, según la elevación, en minúscula para ir dentro de una frase. */
  acabadosFachada: [
    "bloque de la sala pintado en terracota",
    "bloque visto sellado en el corredor",
    "marcos claros en las ventanas",
    "columna oscura con lámpara",
    "jardinera baja de bloque",
  ],

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
    src: "/plano-esparta.png",
    alt: "Plano de la Casa Modelo Esparta en un lote de 5 × 20 m: estacionamiento de 5.00 m, jardín de 3.50 m, casa de 9.50 m entre colindancias y patio de 2.00 m. La casa tiene 2 dormitorios, baño, sala-comedor-cocina-lavado abierta y corredor techado de entrada.",
    ancho: 4640,
    alto: 2032,
  },

  fachada: {
    src: "/fachada-esparta.png",
    alt: "Fachada principal de la Casa Modelo Esparta: pretil de 0.60 m que oculta el techo, bloque de la sala en terracota con ventana y jardinera, y corredor de bloque visto con la ventana del Dormitorio 1, entre muros de colindancia.",
    ancho: 3560,
    alto: 2240,
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
      especificacion: "Muros exteriores de 0.15 m e interiores de 0.10 m (según el plano).",
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
