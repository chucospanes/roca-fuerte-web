/**
 * Bitácora de obra: la casa de San José Villanueva (la del catálogo).
 *
 * Para registrar avance: cambia `estado`, pon la `fecha` de inicio cuando la etapa arranque,
 * agrega `materiales` y pega las URLs de los videos publicados. Fechas en formato AAAA-MM-DD.
 * Sin porcentajes de avance: solo el estado (decisión del 2026-11-04). Una etapa sin fecha no
 * muestra la línea de inicio.
 */

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
  /** Fecha de inicio (AAAA-MM-DD), solo cuando la etapa arrancó y la fecha es real. */
  fecha?: string;
  estado: EstadoEtapa;
  descripcion: string;
  materiales: string[];
  videos: Video[];
};

export const bitacora: Etapa[] = [
  {
    id: "terraceria",
    titulo: "Terracería",
    estado: "terminada",
    descripcion: "Limpieza y nivelación del terreno.",
    materiales: [],
    videos: [],
  },
  {
    id: "trazo-y-zanjeado",
    titulo: "Trazo y zanjeado",
    fecha: "2026-10-25",
    estado: "en proceso",
    descripcion: "Trazo de la casa según el plano y zanjas para las fundaciones.",
    materiales: [],
    videos: [],
  },
  {
    id: "fundaciones",
    titulo: "Fundaciones",
    estado: "pendiente",
    descripcion: "Fundaciones sobre las que se levantan los muros.",
    materiales: [],
    videos: [],
  },
  {
    id: "paredes",
    titulo: "Paredes",
    estado: "pendiente",
    descripcion: "Levantado de muros de bloque de concreto.",
    materiales: [],
    videos: [],
  },
  {
    id: "techo",
    titulo: "Techo",
    estado: "pendiente",
    descripcion: "Estructura y cubierta del techo.",
    materiales: [],
    videos: [],
  },
  {
    id: "instalaciones",
    titulo: "Instalaciones eléctricas e hidráulicas",
    estado: "pendiente",
    descripcion: "Instalación eléctrica, agua potable y aguas negras.",
    materiales: [],
    videos: [],
  },
  {
    id: "acabados",
    titulo: "Acabados",
    estado: "pendiente",
    descripcion: "Pisos, repellos, pintura, puertas y ventanas.",
    materiales: [],
    videos: [],
  },
  {
    id: "entrega",
    titulo: "Entrega",
    estado: "pendiente",
    descripcion: "Revisión final y entrega de la casa.",
    materiales: [],
    videos: [],
  },
];
