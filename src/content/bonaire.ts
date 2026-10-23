/**
 * Contenido de la Casa Modelo Bonaire.
 *
 * Fuente: plano v3 (`assets/plano-bonaire.png`) y `docs/CONTEXTO.md`.
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
};

export const bonaire = {
  nombre: "Casa Modelo Bonaire",
  version: "Plano v3",
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
      notas: ["Con ducha, sin tina."],
    },
    {
      nombre: "Sala, comedor, cocina y lavado",
      medidas: "9.20 × 2.10 m",
      areaM2: 19.32,
      notas: ["Espacio abierto.", "Cocina en L.", "Pila dentro de la casa."],
    },
  ] satisfies Ambiente[],

  /** Lo que el modelo económico no incluye. */
  noIncluye: ["Tina", "Jacuzzi", "Lavadora", "Secadora"],

  plano: {
    src: "/plano-bonaire.png",
    alt: "Plano de la Casa Modelo Bonaire v3: planta en L con 2 dormitorios, baño y sala-comedor-cocina-lavado abierta.",
    aviso:
      "Plano referencial. Requiere firma de arquitecto o ingeniero antes de construir.",
  },

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
    { material: "Cubierta de techo", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Piso", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Puertas y ventanas", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Instalación eléctrica", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Tubería y accesorios hidráulicos", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
    { material: "Pintura", especificacion: PENDIENTE, marca: PENDIENTE, porQue: PENDIENTE },
  ] satisfies Material[],
};
