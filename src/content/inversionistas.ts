/**
 * Sección "Para inversionistas".
 *
 * Es un servicio de construcción por contrato, NO una oferta de inversión (ver
 * DECISIONES.md, 2026-10-30). Prohibido en estos textos: rendimientos, porcentajes de
 * ganancia, plusvalía, "retorno", "oportunidad de inversión" o invitar a invertir dinero en
 * la empresa. Las frases que nombran la marca la toman de `site.ts`.
 */

import { site } from "@/config/site";
import type { Punto } from "./landing";

export const inversionistas = {
  titulo: "Construimos tu proyecto de vivienda",
  intro:
    "Si tienes el terreno y el capital para construir casas que vas a vender o rentar, nosotros las construimos. El proyecto es tuyo; nosotros lo ejecutamos y te mostramos cada etapa.",

  queHacemos: [
    {
      titulo: "Qué construimos",
      texto: `En tu terreno: la ${site.modelo}, varias unidades del modelo o adaptaciones del modelo a tu proyecto.`,
    },
    {
      titulo: "Trámites",
      texto:
        "Tramitamos los permisos y la segregación del terreno ante OPAMSS y el CNR. Los servicios que requieren licencia los subcontratamos con quien la tiene.",
    },
  ],

  propuesta: [
    {
      titulo: "Presupuesto cerrado por etapas",
      texto: "Antes de firmar sabes cuánto cuesta cada etapa. Lo que no está incluido se cotiza aparte.",
    },
    {
      titulo: "Materiales con especificación visible",
      texto: `Cada material con su especificación y su marca, igual que en la ${site.modelo}.`,
    },
    {
      titulo: "Avance documentado en video y fotos",
      texto: "Cada etapa queda registrada con su fecha, sus fotos y sus videos.",
    },
    {
      titulo: "Portal privado para seguir tu obra",
      texto: "Entras con tu correo y ves solo tu obra: etapas, fotos, videos, materiales y documentos.",
    },
    {
      titulo: "Entrega lista para vender o rentar",
      texto: "Recibes las casas terminadas, listas para ponerlas a la venta o en renta.",
    },
  ] satisfies Punto[],

  aclaracion: `${site.marca} presta un servicio de construcción por contrato: no recibe inversiones ni ofrece rendimientos. El terreno, el proyecto y la decisión de vender o rentar son tuyos.`,

  boton: "Hablar de mi proyecto",
};
