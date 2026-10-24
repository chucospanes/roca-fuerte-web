import "server-only";

import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { SesionVerificada } from "@/lib/supabase/servidor";
import type { Lead } from "@/lib/supabase/tipos";
import type { DatosCalificacion, DatosRegistroLead } from "@/lib/validacion";

/**
 * Capa de acceso a `leads`. Único lugar que escribe en la tabla, siempre con la clave
 * secreta y siempre identificando el registro por el correo de una sesión ya verificada.
 * Recibe datos ya validados por zod; no valida ni lee la sesión por su cuenta.
 */

export type ResultadoDatos = { ok: true } | { ok: false; motivo: "sin_registro" | "error_base" };

/** Lo que el formulario del paso 2 necesita para precargarse. Nada más sale de aquí. */
export type LeadVisible = Pick<
  Lead,
  | "nombre"
  | "whatsapp"
  | "correo"
  | "pais_residencia"
  | "interes"
  | "departamento"
  | "municipio"
  | "terreno_escriturado"
  | "forma_pago"
  | "inicio"
  | "comentario"
>;

/** Registra el error sin datos personales: solo la operación y el código de Postgres. */
function registrarError(operacion: string, error: { code?: string; message?: string }) {
  console.error(`[leads] ${operacion} falló`, { codigo: error.code, mensaje: error.message });
}

/**
 * Paso 1: crea o actualiza el registro del correo de la sesión (upsert por correo).
 * UTM y referrer solo cuentan en el primer registro: un trigger de la base impide
 * sobrescribirlos, igual que `created_at` y `estado`, que aquí no se envían.
 */
export async function guardarRegistro(
  sesion: SesionVerificada,
  datos: DatosRegistroLead,
): Promise<ResultadoDatos> {
  const ahora = new Date().toISOString();
  const { error } = await crearClienteAdmin()
    .from("leads")
    .upsert(
      {
        user_id: sesion.userId,
        correo: sesion.correo,
        nombre: datos.nombre,
        whatsapp: datos.whatsapp,
        acepto_privacidad_at: ahora,
        correo_verificado_at: ahora,
        utm_source: datos.origen?.utm_source ?? null,
        utm_medium: datos.origen?.utm_medium ?? null,
        utm_campaign: datos.origen?.utm_campaign ?? null,
        utm_content: datos.origen?.utm_content ?? null,
        referrer: datos.origen?.referrer ?? null,
      },
      { onConflict: "correo" },
    );

  if (error) {
    registrarError("guardarRegistro", error);
    return { ok: false, motivo: "error_base" };
  }
  return { ok: true };
}

/**
 * Paso 2: guarda la calificación en el registro existente del correo de la sesión.
 * Los campos que no aplican se guardan como `null` explícito, para borrar datos de terreno
 * si la persona cambia de "construir" a "comprar".
 */
export async function guardarCalificacion(
  sesion: SesionVerificada,
  datos: DatosCalificacion,
): Promise<ResultadoDatos> {
  const { data, error } = await crearClienteAdmin()
    .from("leads")
    .update({
      pais_residencia: datos.pais_residencia,
      interes: datos.interes,
      departamento: datos.departamento ?? null,
      municipio: datos.municipio ?? null,
      terreno_escriturado: datos.terreno_escriturado ?? null,
      forma_pago: datos.forma_pago,
      inicio: datos.inicio,
      comentario: datos.comentario ?? null,
      calificado_at: new Date().toISOString(),
    })
    .eq("correo", sesion.correo)
    .select("id");

  if (error) {
    registrarError("guardarCalificacion", error);
    return { ok: false, motivo: "error_base" };
  }
  if (!data || data.length === 0) return { ok: false, motivo: "sin_registro" };
  return { ok: true };
}

/** Datos del registro del correo de la sesión, para precargar el paso 2. */
export async function leerLeadDeSesion(sesion: SesionVerificada): Promise<LeadVisible | null> {
  const { data, error } = await crearClienteAdmin()
    .from("leads")
    .select(
      "nombre, whatsapp, correo, pais_residencia, interes, departamento, municipio, terreno_escriturado, forma_pago, inicio, comentario",
    )
    .eq("correo", sesion.correo)
    .maybeSingle();

  if (error) {
    registrarError("leerLeadDeSesion", error);
    return null;
  }
  return data;
}
