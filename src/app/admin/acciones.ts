"use server";

import { revalidateTag } from "next/cache";
import { TAG_CASAS } from "@/lib/casas";
import { crearClienteServidor, sesionVerificada } from "@/lib/supabase/servidor";
import { esquemaAvanceNuevo, esquemaCambioEtapa } from "@/lib/validacion";

/**
 * Server Actions del panel /admin. Cualquiera puede invocarlas con un POST: cada una valida
 * con zod, exige sesión y llama a una función de la base (009) CON LA SESIÓN DEL USUARIO. La
 * base decide: si no es administrador, responde 42501 y no cambia nada. Aquí no se usa la
 * clave secreta.
 */

export type ResultadoAdmin<T> = { ok: true; datos: T } | { ok: false; mensaje: string };

type ErrorBase = { code?: string; message?: string } | null;

/** Mensaje para la pantalla a partir del error de la base. */
function mensajeDeError(error: NonNullable<ErrorBase>): string {
  if (error.code === "42501") return "Tu cuenta no tiene permiso para hacer esto.";
  if (error.message?.startsWith("ALTO: ")) return error.message.slice("ALTO: ".length);
  if (error.code === "23514") return "La base rechazó un dato (revisa el video y los textos).";
  return "No se pudo guardar. Revisa la conexión y vuelve a intentarlo.";
}

function primerError(issues: { message: string }[]): string {
  return issues[0]?.message ?? "Revisa los datos.";
}

/** Cambia una etapa del portal y, si la obra tiene casa ligada (no vendida), la pública. */
export async function cambiarEtapa(
  entrada: unknown,
): Promise<ResultadoAdmin<{ portal: string; publica: string }>> {
  const datos = esquemaCambioEtapa.safeParse(entrada);
  if (!datos.success) return { ok: false, mensaje: primerError(datos.error.issues) };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .rpc("admin_cambiar_etapa", {
      p_etapa_id: datos.data.etapaId,
      p_estado: datos.data.estado,
      p_fecha: datos.data.fecha,
    })
    .single<{ etapa_portal: string; etapa_publica: string }>();
  if (error || !data) {
    if (error && !error.message?.startsWith("ALTO: ")) {
      console.error("[admin] cambiar etapa falló", { codigo: error.code, mensaje: error.message });
    }
    return { ok: false, mensaje: error ? mensajeDeError(error) : "No se pudo guardar." };
  }

  // La bitácora y la ficha públicas se guardan en caché: que se refresquen ya
  revalidateTag(TAG_CASAS, "max");
  return { ok: true, datos: { portal: data.etapa_portal, publica: data.etapa_publica } };
}

/**
 * Crea un avance. Devuelve la carpeta de sus fotos: el navegador las sube directo a Storage
 * con la sesión del usuario (la política de 009 solo deja subir ahí a un administrador).
 */
export async function crearAvance(
  entrada: unknown,
): Promise<ResultadoAdmin<{ avanceId: string; carpeta: string }>> {
  const datos = esquemaAvanceNuevo.safeParse(entrada);
  if (!datos.success) return { ok: false, mensaje: primerError(datos.error.issues) };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };

  const d = datos.data;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .rpc("admin_crear_avance", {
      p_obra_id: d.obraId,
      p_etapa_orden: d.etapaOrden,
      p_fecha: d.fecha,
      p_titulo: d.titulo,
      p_descripcion: d.descripcion,
      p_video_url: d.video,
    })
    .single<{ avance_id: string; carpeta_fotos: string }>();
  if (error || !data) {
    if (error && !error.message?.startsWith("ALTO: ")) {
      console.error("[admin] crear avance falló", { codigo: error.code, mensaje: error.message });
    }
    return { ok: false, mensaje: error ? mensajeDeError(error) : "No se pudo guardar." };
  }
  return { ok: true, datos: { avanceId: data.avance_id, carpeta: data.carpeta_fotos } };
}
