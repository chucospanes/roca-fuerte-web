/**
 * Bitácora de obra de la Casa Modelo Esparta.
 *
 * Para registrar avance: cambia `estado`, `fecha`, `avance`, agrega `materiales`
 * y pega las URLs de los videos publicados. Fechas en formato AAAA-MM-DD.
 * Lo que no esté confirmado va como PENDIENTE.
 */

import { PENDIENTE, type Pendiente } from "@/config/site";

export type EstadoEtapa = "pendiente" | "en proceso" | "terminada";

export type PlataformaVideo = "youtube" | "tiktok" | "instagram";

export type Video = {
  plataforma: PlataformaVideo;
  url: string;
  titulo?: string;
};

export type Etapa = {
  id: string;
  titulo: string;
  /** Fecha de inicio (AAAA-MM-DD) o PENDIENTE. */
  fecha: string | Pendiente;
  estado: EstadoEtapa;
  descripcion: string;
  materiales: string[];
  /** Porcentaje de avance de la etapa, 0–100, o PENDIENTE si no está medido. */
  avance: number | Pendiente;
  videos: Video[];
};

export const bitacora: Etapa[] = [
  {
    id: "terreno-y-trazo",
    titulo: "Terreno y trazo",
    fecha: PENDIENTE,
    estado: "en proceso",
    descripcion: "Preparación del terreno y trazo de la casa según el plano.",
    materiales: [],
    avance: PENDIENTE,
    videos: [],
  },
  {
    id: "fundaciones",
    titulo: "Fundaciones",
    fecha: PENDIENTE,
    estado: "pendiente",
    descripcion: "Fundaciones sobre las que se levantan los muros.",
    materiales: [],
    avance: 0,
    videos: [],
  },
  {
    id: "paredes",
    titulo: "Paredes",
    fecha: PENDIENTE,
    estado: "pendiente",
    descripcion: "Levantado de muros de bloque de concreto.",
    materiales: [],
    avance: 0,
    videos: [],
  },
  {
    id: "techo",
    titulo: "Techo",
    fecha: PENDIENTE,
    estado: "pendiente",
    descripcion: "Estructura y cubierta del techo.",
    materiales: [],
    avance: 0,
    videos: [],
  },
  {
    id: "instalaciones",
    titulo: "Instalaciones eléctricas e hidráulicas",
    fecha: PENDIENTE,
    estado: "pendiente",
    descripcion: "Instalación eléctrica, agua potable y aguas negras.",
    materiales: [],
    avance: 0,
    videos: [],
  },
  {
    id: "acabados",
    titulo: "Acabados",
    fecha: PENDIENTE,
    estado: "pendiente",
    descripcion: "Pisos, repellos, pintura, puertas y ventanas.",
    materiales: [],
    avance: 0,
    videos: [],
  },
  {
    id: "entrega",
    titulo: "Entrega",
    fecha: PENDIENTE,
    estado: "pendiente",
    descripcion: "Revisión final y entrega de la casa.",
    materiales: [],
    avance: 0,
    videos: [],
  },
];
