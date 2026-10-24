"use server";

import { site } from "@/config/site";
import { guardarCalificacion, guardarRegistro, leerLeadDeSesion } from "@/lib/leads";
import { sesionVerificada } from "@/lib/supabase/servidor";
import {
  erroresPorCampo,
  esBot,
  esquemaCalificacion,
  esquemaRegistroLead,
} from "@/lib/validacion";
import { mensajeCalificacion, whatsappHref } from "@/lib/whatsapp";

/**
 * Server Actions del acceso premium. Cualquiera puede invocarlas con un POST, así que cada
 * una revisa por su cuenta: interruptor `accesoPremium`, validación zod y sesión verificada.
 * El correo nunca llega como argumento: sale de la sesión.
 */

export type ResultadoAccion =
  | { ok: true; whatsapp?: string }
  | {
      ok: false;
      /**
       * - `no_disponible`: el acceso premium está apagado.
       * - `datos_invalidos`: ver `errores` por campo.
       * - `sin_sesion`: el código no se verificó o la sesión venció.
       * - `sin_registro`: calificación sin haber hecho el paso 1.
       * - `error_guardado`: falló Supabase; la UI ofrece seguir por WhatsApp.
       */
      error: "no_disponible" | "datos_invalidos" | "sin_sesion" | "sin_registro" | "error_guardado";
      errores?: Record<string, string>;
      whatsapp?: string;
    };

/** Paso 1: se llama después de que el navegador verificó el código. */
export async function registrarLead(entrada: unknown): Promise<ResultadoAccion> {
  if (!site.accesoPremium) return { ok: false, error: "no_disponible" };

  const datos = esquemaRegistroLead.safeParse(entrada);
  if (!datos.success) {
    return { ok: false, error: "datos_invalidos", errores: erroresPorCampo(datos.error) };
  }
  // Campo trampa con texto: se responde como si todo fuera bien y no se guarda nada
  if (esBot(datos.data)) return { ok: true };

  const sesion = await sesionVerificada();
  if (!sesion) return { ok: false, error: "sin_sesion" };

  const resultado = await guardarRegistro(sesion, datos.data);
  if (!resultado.ok) {
    // Si Supabase falla, la persona igual puede seguir por WhatsApp
    return { ok: false, error: "error_guardado", whatsapp: whatsappHref() };
  }
  return { ok: true };
}

/** Paso 2 (opcional): calificación, sobre el registro del correo de la sesión. */
export async function calificarLead(entrada: unknown): Promise<ResultadoAccion> {
  if (!site.accesoPremium) return { ok: false, error: "no_disponible" };

  const datos = esquemaCalificacion.safeParse(entrada);
  if (!datos.success) {
    return { ok: false, error: "datos_invalidos", errores: erroresPorCampo(datos.error) };
  }

  const sesion = await sesionVerificada();
  if (!sesion) return { ok: false, error: "sin_sesion" };

  const resultado = await guardarCalificacion(sesion, datos.data);
  if (!resultado.ok && resultado.motivo === "sin_registro") {
    return { ok: false, error: "sin_registro" };
  }
  if (!resultado.ok) {
    return { ok: false, error: "error_guardado", whatsapp: whatsappHref() };
  }

  // El nombre para el mensaje sale de lo guardado en el paso 1, vía la sesión
  const lead = await leerLeadDeSesion(sesion);
  return {
    ok: true,
    whatsapp: whatsappHref(mensajeCalificacion(lead?.nombre ?? "", datos.data)),
  };
}
