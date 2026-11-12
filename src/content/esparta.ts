/**
 * Contenido de la Casa Modelo Esparta.
 *
 * Fuente: planta de la casa, planta en lote de 5 × 20 m y fachada con pretil
 * (`assets/plano-casa-esparta-v5.pdf`, `assets/plano-esparta-v2.pdf`, `assets/fachada-esparta.pdf`)
 * y `docs/CONTEXTO.md`.
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
  /** Lo que va en titulares y resúmenes en vez del área construida (ver DECISIONES.md, 2026-11-12). */
  destacados: {
    plantas: "Una planta",
    /** "Desde 100 m² de terreno": el lote del modelo (5 × 20 m), el más chico en venta. */
    terreno: "Desde 100 m² de terreno",
  },
  resumen: "Casa de una planta en forma de L, 2 dormitorios y 1 baño.",
  dormitorios: 2,
  banos: 1,

  /**
   * Construida: 9.50 × 5.00 m = 47.50 m² (cuerpo de 8.00 × 5.00 + extensión de sala de 1.50 × 2.40
   * + corredor techado de 2.60 × 1.50 = 3.90 m²). El estacionamiento no cuenta. Útil: interior,
   * sin el corredor. El área no es protagonista: solo va en "La casa", la ficha de cada casa, el
   * área premium y el plano (ver DECISIONES.md, 2026-11-12). En titulares, el lote y "una planta".
   */
  areas: {
    construidaM2: 47.5,
    utilM2: 38.07,
    corredorTechadoM2: 3.9,
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
   * Sale de segregar un terreno de 10 × 20 m en dos lotes de 5 × 20 m, en trámite (ver
   * docs/CONTEXTO.md). Su área (100 m²) es el "desde … m² de terreno" de los titulares.
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
    /** Sin porcentaje de pendiente en el sitio (decisión del 2026-11-04). */
    cubierta: "Techo de lámina a dos aguas",
    cumbrera: "Paralela a la fachada",
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
    "sala repellada y pintada en terracota",
    "corredor repellado y pintado en gris cálido",
    "marcos claros en las ventanas",
    "columna oscura con lámpara",
    "jardinera baja de bloque",
  ],

  /** Techado: cuenta en el área construida, no en la útil. La columna aún no tiene diseño estructural. */
  corredor: {
    /** 2.60 × 1.50 m = 3.90 m², dentro del área construida (plano v5). */
    frenteM: 2.6,
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

  /**
   * Planta de la casa sola (lámina A-01, v4): se lee en el celular. En la web va a resolución
   * media (1800 px de ancho, reducido del original de 3550 px sin recortar ni cambiar
   * colores) y protegida; la versión en alta resolución es solo el PDF de la ficha premium.
   */
  planoCasa: {
    src: "/plano-casa-esparta-v5-1800.png",
    alt: "Plano de la Casa Modelo Esparta, lámina A-01: planta de 9.50 × 5.00 m entre colindancias, con 2 dormitorios de 3.00 × 2.50 m, baño de 1.50 × 2.50 m, sala-comedor-cocina-lavado abierta de 9.20 × 2.10 m y corredor techado de acceso de 2.60 × 1.50 m en la fachada principal. Debajo, cuadro de áreas (38.07 m² útiles interiores, 47.50 m² construidos con el corredor), leyenda y notas generales de construcción.",
    ancho: 1800,
    alto: 1737,
    protegida: true,
    texto: "Planta de la casa — distribución y medidas",
  },

  /** Planta en el lote completo: muy ancha, se muestra a todo el ancho en escritorio. */
  plano: {
    src: "/plano-esparta-v2.png",
    alt: "Plano de la Casa Modelo Esparta en un lote de 5 × 20 m: estacionamiento de 5.00 m, jardín de 3.50 m, casa de 9.50 m entre colindancias y patio de 2.00 m. La casa tiene 2 dormitorios, baño, sala-comedor-cocina-lavado abierta y corredor techado de entrada.",
    ancho: 4640,
    alto: 2032,
    texto: "Planta en el lote — estacionamiento, jardín, casa y patio",
  },

  fachada: {
    src: "/fachada-esparta-v2.png",
    alt: "Fachada principal de la Casa Modelo Esparta: pretil de 0.60 m que oculta el techo, sala repellada en terracota con ventana y jardinera, y corredor repellado en gris cálido con la ventana del Dormitorio 1 y la columna oscura, entre muros de colindancia.",
    ancho: 3560,
    alto: 2240,
    texto: "Fachada principal — vista desde la calle",
  },

  /**
   * Qué incluye el precio de una casa a pedido, partida por partida. Solo en el área
   * premium. Lo que incluye cada casa a la venta vive en `casas_venta` (catálogo).
   */
  desglosePrecio: {
    construirAPedido: PENDIENTE as Desglose,
  },

  avisoPlanos:
    "Planos y fachada referenciales. Requieren firma de arquitecto o ingeniero antes de construir.",

  materiales: [
    {
      material: "Bloque de concreto",
      especificacion:
        "Bloque estructural bajo norma ASTM C90, de 15 cm en muros exteriores y 10 cm en interiores",
      porQue: PENDIENTE,
    },
    { material: "Cemento", especificacion: PENDIENTE, porQue: PENDIENTE },
    {
      material: "Concreto",
      seEspecifica: "Resistencia f'c y proporción de mezcla.",
      especificacion: PENDIENTE,
      porQue: PENDIENTE,
    },
    {
      material: "Agregados",
      seEspecifica: "Arena y grava.",
      especificacion: PENDIENTE,
      porQue: PENDIENTE,
    },
    {
      material: "Acero de refuerzo",
      especificacion: "Varilla corrugada grado 40, bajo norma ASTM A615",
      porQue: PENDIENTE,
    },
    {
      material: "Estructura de techo",
      seEspecifica: "Polines: calibre y separación.",
      especificacion: PENDIENTE,
      porQue: PENDIENTE,
    },
    {
      material: "Cubierta de techo",
      seEspecifica: "Lámina: tipo y calibre; pendiente mínima según el fabricante.",
      especificacion: PENDIENTE,
      porQue: PENDIENTE,
    },
    { material: "Piso", especificacion: PENDIENTE, porQue: PENDIENTE },
    { material: "Puertas y ventanas", especificacion: PENDIENTE, porQue: PENDIENTE },
    { material: "Instalación eléctrica", especificacion: PENDIENTE, porQue: PENDIENTE },
    { material: "Tubería y accesorios hidráulicos", especificacion: PENDIENTE, porQue: PENDIENTE },
    { material: "Pintura", especificacion: PENDIENTE, porQue: PENDIENTE },
  ] satisfies Material[],
};
