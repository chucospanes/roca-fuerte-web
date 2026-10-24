/**
 * Tipos de la base de datos, escritos a mano a partir de `supabase/migrations/001_leads.sql`.
 * Si cambia la migración, actualizar aquí (o regenerar con `supabase gen types`).
 */

import type {
  ESTADOS_LEAD,
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

export type BaseDeDatos = {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
