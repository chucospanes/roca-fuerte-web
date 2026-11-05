/**
 * Tipos de la base de datos, escritos a mano a partir de `supabase/migrations/` (001–010).
 * Si cambia la migración, actualizar aquí (o regenerar con `supabase gen types`).
 */

import type {
  AGUAS_NEGRAS,
  ESTADOS_CASA,
  TIPOS_IMAGEN_CASA,
  ESTADOS_ETAPA,
  ESTADOS_LEAD,
  ESTADOS_OBRA,
  MODALIDADES_OBRA,
  TIPOS_DOCUMENTO,
  OPCIONES_VENTA,
  UBICACIONES_VENTA,
  FORMAS_PAGO,
  INICIOS,
  INTERESES,
  PAISES_RESIDENCIA,
  TERRENO_ESCRITURADO,
} from "@/lib/validacion";

type Uno<T extends readonly string[]> = T[number];

export type Lead = {
  id: string;
  user_id: string | null;
  correo: string;
  nombre: string;
  whatsapp: string;
  acepto_privacidad_at: string;
  correo_verificado_at: string;
  pais_residencia: Uno<typeof PAISES_RESIDENCIA> | null;
  interes: Uno<typeof INTERESES> | null;
  departamento: string | null;
  municipio: string | null;
  terreno_escriturado: Uno<typeof TERRENO_ESCRITURADO> | null;
  forma_pago: Uno<typeof FORMAS_PAGO> | null;
  inicio: Uno<typeof INICIOS> | null;
  comentario: string | null;
  calificado_at: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  estado: Uno<typeof ESTADOS_LEAD>;
  created_at: string;
  updated_at: string;
};

/** Columnas con valor por defecto o generadas: opcionales al insertar. */
type ConDefault = "id" | "estado" | "created_at" | "updated_at";
type Nullables = {
  [K in keyof Lead]: null extends Lead[K] ? K : never;
}[keyof Lead];

export type LeadInsert = Omit<Lead, ConDefault | Nullables> &
  Partial<Pick<Lead, ConDefault | Nullables>>;
export type LeadUpdate = Partial<Lead>;

/** Clic de venta (002, 003 y 006). Sin datos personales. */
export type ClicVenta = {
  id: number;
  created_at: string;
  opcion: Uno<typeof OPCIONES_VENTA>;
  ubicacion: Uno<typeof UBICACIONES_VENTA>;
  /** Casa del catálogo (006): solo con la opción `casa`. */
  casa_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer_dominio: string | null;
};

export type ClicVentaInsert = Omit<ClicVenta, "id" | "created_at">;

/*
 * Portal de clientes (004_portal_obras.sql). Solo lectura desde la web: los clientes no
 * tienen permisos de escritura (Insert/Update quedan en `never`).
 */
export type Obra = {
  id: string;
  nombre: string;
  modalidad: Uno<typeof MODALIDADES_OBRA>;
  modelo: string | null;
  ubicacion: string | null;
  estado: Uno<typeof ESTADOS_OBRA>;
  fecha_inicio: string | null;
  fecha_entrega_estimada: string | null;
  /** Casa del catálogo que es esta obra (009), o null. */
  casa_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ObraMiembro = { obra_id: string; user_id: string; created_at: string };

export type Etapa = {
  id: string;
  obra_id: string;
  orden: number;
  nombre: string;
  estado: Uno<typeof ESTADOS_ETAPA>;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
};

export type Avance = {
  id: string;
  obra_id: string;
  etapa_id: string | null;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  video_url: string | null;
  /** Publicación en la ficha de su casa (010), o null. */
  publicacion_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ObraMaterial = {
  id: string;
  obra_id: string;
  orden: number;
  material: string;
  especificacion: string | null;
  marca: string | null;
  cantidad: string | null;
  created_at: string;
  updated_at: string;
};

export type Documento = {
  id: string;
  obra_id: string;
  tipo: Uno<typeof TIPOS_DOCUMENTO>;
  titulo: string;
  ruta: string;
  created_at: string;
  updated_at: string;
};

/*
 * Catálogo de casas en venta (005_casas_venta.sql). Lectura pública solo de las publicadas;
 * nadie escribe desde la web.
 */
export type CasaVenta = {
  id: string;
  slug: string;
  publicada: boolean;
  orden: number;
  nombre: string;
  modelo: string;
  descripcion: string | null;
  distrito: string;
  municipio: string;
  departamento: string;
  estado: Uno<typeof ESTADOS_CASA>;
  etapa_actual: string | null;
  precio_usd: number | null;
  lote_frente_m: number;
  lote_fondo_m: number;
  lote_m2: number;
  /** true: m², dormitorios y baños son los del modelo Esparta (van en null aquí). */
  planta_esparta: boolean;
  construccion_m2: number | null;
  dormitorios: number | null;
  banos: number | null;
  parqueos: number | null;
  agua: boolean | null;
  electricidad: boolean | null;
  aguas_negras: Uno<typeof AGUAS_NEGRAS> | null;
  incluye: string[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CasaVentaImagen = {
  id: string;
  casa_id: string;
  tipo: Uno<typeof TIPOS_IMAGEN_CASA>;
  orden: number;
  /** Ruta dentro del bucket público `casas`: {casa_id}/archivo */
  ruta: string;
  ancho: number;
  alto: number;
  alt: string;
  created_at: string;
};

/** Avance público de una casa del catálogo (008). Separado de las etapas privadas del portal. */
export type CasaVentaEtapa = {
  id: string;
  casa_id: string;
  orden: number;
  nombre: string;
  estado: Uno<typeof ESTADOS_ETAPA>;
  fecha_inicio: string | null;
  descripcion: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

/** Avance publicado en la ficha de una casa (010): copia pública, sin referencias al portal. */
export type CasaVentaAvance = {
  id: string;
  casa_id: string;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  video_url: string | null;
  /** Nombres en {casa_id}/avances/{id}/ del bucket casas, en orden. */
  fotos: string[];
  visible: boolean;
  created_at: string;
  updated_at: string;
};

type SoloLectura<Fila> ={ Row: Fila; Insert: never; Update: never; Relationships: [] };

export type BaseDeDatos = {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
      clics_venta: {
        Row: ClicVenta;
        Insert: ClicVentaInsert;
        Update: Partial<ClicVentaInsert>;
        Relationships: [];
      };
      obras: SoloLectura<Obra>;
      obra_miembros: SoloLectura<ObraMiembro>;
      etapas: SoloLectura<Etapa>;
      avances: SoloLectura<Avance>;
      obra_materiales: SoloLectura<ObraMaterial>;
      documentos: SoloLectura<Documento>;
      casas_venta: SoloLectura<CasaVenta>;
      casas_venta_imagenes: SoloLectura<CasaVentaImagen>;
      casas_venta_etapas: SoloLectura<CasaVentaEtapa>;
      casas_venta_avances: SoloLectura<CasaVentaAvance>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
