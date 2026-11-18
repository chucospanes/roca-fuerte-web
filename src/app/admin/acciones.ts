"use server";

import { revalidateTag, updateTag } from "next/cache";
import { TAG_CASAS } from "@/lib/casas";
import { crearClienteServidor, sesionVerificada } from "@/lib/supabase/servidor";
import { z } from "zod";
import { medidasJpg } from "@/lib/jpg";
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

// ---------------------------------------------------------------------------------------
// Publicar un avance en la ficha de su casa (010). Lo público es una COPIA: los datos los
// copia la base (admin_publicar_avance) y las fotos se copian una por una del bucket privado
// `obras` al público `casas`, con la sesión del usuario (las políticas de 009 y 010 solo dejan
// leer y subir a un administrador). La publicación se ve recién al fijar las fotos.
// ---------------------------------------------------------------------------------------

const BUCKET_PRIVADO = "obras";
const BUCKET_PUBLICO = "casas";
/** Límite del bucket público `casas` (005). */
const MAX_BYTES_PUBLICO = 5 * 1024 * 1024;
const FOTO_JPG = /^[A-Za-z0-9._-]+\.jpe?g$/i;
const FOTO_CUALQUIERA = /\.(jpe?g|png|webp)$/i;

/**
 * ¿El JPG trae metadatos de cámara (bloque APP1: EXIF o XMP, donde va el GPS)? Recorre los
 * encabezados hasta que empieza la imagen. Ante algo que no entiende, responde que sí: en la
 * duda, no se publica. Las fotos del panel nunca los traen (se redibujan en el navegador).
 */
function jpgConMetadatos(bytes: Uint8Array): boolean {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return true;
  let i = 2;
  while (i + 3 < bytes.length) {
    if (bytes[i] !== 0xff) return true;
    const marca = bytes[i + 1];
    if (marca === 0xda) return false; // empieza la imagen: no hubo APP1
    if (marca === 0xe1) return true;
    i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
  }
  return true;
}

const esquemaIdAvance = z.uuid();

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

async function leerAvance(
  supabase: Cliente,
  avanceId: string,
): Promise<{ obraId: string; publicacionId: string | null } | null> {
  const { data } = await supabase
    .from("avances")
    .select("obra_id, publicacion_id")
    .eq("id", avanceId)
    .maybeSingle<{ obra_id: string; publicacion_id: string | null }>();
  return data ? { obraId: data.obra_id, publicacionId: data.publicacion_id } : null;
}

/**
 * Paso 1: crea la publicación (oculta) o retoma una que quedó a medias. Devuelve las fotos del
 * avance que hay que copiar, en orden. Antes de crear nada revisa que todas sean JPG.
 */
export async function prepararPublicacion(
  avanceId: unknown,
): Promise<ResultadoAdmin<{ publicacionId: string; origenes: string[] }>> {
  const id = esquemaIdAvance.safeParse(avanceId);
  if (!id.success) return { ok: false, mensaje: "Avance no válido." };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };
  const supabase = await crearClienteServidor();

  const avance = await leerAvance(supabase, id.data);
  if (!avance) return { ok: false, mensaje: "No se encontró el avance." };
  const { data: archivos, error: errorLista } = await supabase.storage
    .from(BUCKET_PRIVADO)
    .list(`${avance.obraId}/avances/${id.data}`, { limit: 100, sortBy: { column: "name", order: "asc" } });
  if (errorLista) return { ok: false, mensaje: "No se pudieron leer las fotos del avance." };
  const origenes = (archivos ?? []).filter((a) => a.id !== null && FOTO_CUALQUIERA.test(a.name)).map((a) => a.name);
  const noJpg = origenes.filter((n) => !FOTO_JPG.test(n));
  if (noJpg.length > 0) {
    return { ok: false, mensaje: `Solo se publican fotos JPG; súbelas desde el panel: ${noJpg.join(", ")}.` };
  }

  if (avance.publicacionId) {
    const { data: pub } = await supabase
      .from("casas_venta_avances")
      .select("visible")
      .eq("id", avance.publicacionId)
      .maybeSingle<{ visible: boolean }>();
    if (pub?.visible) return { ok: false, mensaje: "Este avance ya está publicado en la ficha." };
    return { ok: true, datos: { publicacionId: avance.publicacionId, origenes } };
  }

  const { data, error } = await supabase
    .rpc("admin_publicar_avance", { p_avance_id: id.data })
    .single<{ publicacion_id: string; casa_id: string; carpeta: string }>();
  if (error || !data) {
    if (error && !error.message?.startsWith("ALTO: ")) {
      console.error("[admin] publicar avance falló", { codigo: error.code, mensaje: error.message });
    }
    return { ok: false, mensaje: error ? mensajeDeError(error) : "No se pudo publicar." };
  }
  return { ok: true, datos: { publicacionId: data.publicacion_id, origenes } };
}

const esquemaCopia = z.object({
  avanceId: z.uuid(),
  origen: z.string().regex(FOTO_JPG),
  indice: z.number().int().min(0).max(49),
});

/**
 * Paso 2, una foto por llamada (así ninguna llamada dura mucho): la descarga del bucket privado,
 * revisa que no traiga EXIF ni GPS y la sube al público como 01.jpg, 02.jpg… según su orden. Si
 * ya estaba subida (un reintento), cuenta como copiada.
 */
export async function copiarFotoPublica(entrada: unknown): Promise<ResultadoAdmin<{ nombre: string }>> {
  const datos = esquemaCopia.safeParse(entrada);
  if (!datos.success) return { ok: false, mensaje: "Foto no válida." };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };
  const { avanceId, origen, indice } = datos.data;
  const supabase = await crearClienteServidor();

  const avance = await leerAvance(supabase, avanceId);
  if (!avance?.publicacionId) return { ok: false, mensaje: "El avance no tiene una publicación en curso." };
  const { data: pub } = await supabase
    .from("casas_venta_avances")
    .select("casa_id")
    .eq("id", avance.publicacionId)
    .maybeSingle<{ casa_id: string }>();
  if (!pub) return { ok: false, mensaje: "No se encontró la publicación." };

  const { data: archivo, error: errorDescarga } = await supabase.storage
    .from(BUCKET_PRIVADO)
    .download(`${avance.obraId}/avances/${avanceId}/${origen}`);
  if (errorDescarga || !archivo) return { ok: false, mensaje: `No se pudo leer la foto ${origen}.` };
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  if (bytes.length > MAX_BYTES_PUBLICO) {
    return { ok: false, mensaje: `La foto ${origen} pesa más de 5 MB; súbela desde el panel.` };
  }
  if (jpgConMetadatos(bytes)) {
    return { ok: false, mensaje: `La foto ${origen} trae datos de la cámara (EXIF o GPS); súbela desde el panel.` };
  }

  const nombre = `${String(indice + 1).padStart(2, "0")}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_PUBLICO)
    .upload(`${pub.casa_id}/avances/${avance.publicacionId}/${nombre}`, bytes, {
      contentType: "image/jpeg",
      upsert: false,
    });
  const e = error as { message?: string; statusCode?: string } | null;
  if (e && !(e.statusCode === "409" || /exists|duplicate/i.test(e.message ?? ""))) {
    console.error("[admin] copiar foto falló", { mensaje: e.message });
    return { ok: false, mensaje: `No se pudo copiar la foto ${origen}.` };
  }
  return { ok: true, datos: { nombre } };
}

const esquemaFijar = z.object({
  avanceId: z.uuid(),
  nombres: z.array(z.string().regex(/^[0-9]{2,3}\.jpg$/)).max(50),
});

/** Paso 3: fija las fotos copiadas y la publicación aparece en la ficha. */
export async function fijarPublicacion(entrada: unknown): Promise<ResultadoAdmin<{ fotos: number }>> {
  const datos = esquemaFijar.safeParse(entrada);
  if (!datos.success) return { ok: false, mensaje: "Datos no válidos." };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };
  const supabase = await crearClienteServidor();

  const avance = await leerAvance(supabase, datos.data.avanceId);
  if (!avance?.publicacionId) return { ok: false, mensaje: "El avance no tiene una publicación en curso." };
  const { data, error } = await supabase
    .rpc("admin_fijar_fotos_publicacion", { p_publicacion_id: avance.publicacionId, p_fotos: datos.data.nombres })
    .single<{ publicacion_id: string; fotos: number }>();
  if (error || !data) {
    if (error && !error.message?.startsWith("ALTO: ")) {
      console.error("[admin] fijar fotos falló", { codigo: error.code, mensaje: error.message });
    }
    return { ok: false, mensaje: error ? mensajeDeError(error) : "No se pudo publicar." };
  }
  revalidateTag(TAG_CASAS, "max");
  return { ok: true, datos: { fotos: data.fotos } };
}

/**
 * Quita el avance de la ficha: la base borra la publicación (el avance del portal queda igual)
 * y aquí se borran sus copias del bucket público. Si alguna copia no se borra, se avisa.
 */
export async function quitarPublicacion(avanceId: unknown): Promise<ResultadoAdmin<{ pendientes: number }>> {
  const id = esquemaIdAvance.safeParse(avanceId);
  if (!id.success) return { ok: false, mensaje: "Avance no válido." };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase.rpc("admin_despublicar_avance", { p_avance_id: id.data });
  if (error) {
    if (!error.message?.startsWith("ALTO: ")) {
      console.error("[admin] despublicar falló", { codigo: error.code, mensaje: error.message });
    }
    return { ok: false, mensaje: mensajeDeError(error) };
  }
  revalidateTag(TAG_CASAS, "max");
  const archivos = ((data ?? []) as { archivo: string }[]).map((f) => f.archivo);
  if (archivos.length === 0) return { ok: true, datos: { pendientes: 0 } };
  const { data: borrados, error: errorBorrado } = await supabase.storage.from(BUCKET_PUBLICO).remove(archivos);
  if (errorBorrado) console.error("[admin] borrar copias falló", { mensaje: errorBorrado.message });
  return { ok: true, datos: { pendientes: archivos.length - (borrados?.length ?? 0) } };
}

// ---------------------------------------------------------------------------------------
// Foto de la tarjeta (portada) desde un avance publicado (015). La base registra la copia
// pública que ya existe; aquí solo se leen sus medidas reales del encabezado del JPG (no se
// confía en lo que mande el navegador).
// ---------------------------------------------------------------------------------------

const esquemaPortada = z.object({
  avanceId: z.uuid(),
  foto: z.string().regex(/^[0-9]{2,3}\.jpg$/),
});

/** Elige como foto de la tarjeta de la casa una foto publicada de este avance. */
export async function elegirPortada(
  entrada: unknown,
): Promise<ResultadoAdmin<{ ancho: number; alto: number }>> {
  const datos = esquemaPortada.safeParse(entrada);
  if (!datos.success) return { ok: false, mensaje: "Foto no válida." };
  if (!(await sesionVerificada())) return { ok: false, mensaje: "Tu sesión venció. Vuelve a entrar." };
  const supabase = await crearClienteServidor();

  const avance = await leerAvance(supabase, datos.data.avanceId);
  if (!avance?.publicacionId) return { ok: false, mensaje: "Este avance no está publicado en la ficha." };
  const { data: pub } = await supabase
    .from("casas_venta_avances")
    .select("casa_id")
    .eq("id", avance.publicacionId)
    .maybeSingle<{ casa_id: string }>();
  if (!pub) return { ok: false, mensaje: "No se encontró la publicación." };

  const { data: archivo, error: errorDescarga } = await supabase.storage
    .from(BUCKET_PUBLICO)
    .download(`${pub.casa_id}/avances/${avance.publicacionId}/${datos.data.foto}`);
  if (errorDescarga || !archivo) return { ok: false, mensaje: `No se pudo leer la foto ${datos.data.foto}.` };
  const medidas = medidasJpg(new Uint8Array(await archivo.arrayBuffer()));
  if (!medidas) return { ok: false, mensaje: `No se pudieron leer las medidas de la foto ${datos.data.foto}.` };

  const { error } = await supabase.rpc("admin_elegir_portada", {
    p_publicacion_id: avance.publicacionId,
    p_foto: datos.data.foto,
    p_ancho: medidas.ancho,
    p_alto: medidas.alto,
  });
  if (error) {
    if (!error.message?.startsWith("ALTO: ")) {
      console.error("[admin] elegir portada falló", { codigo: error.code, mensaje: error.message });
    }
    return { ok: false, mensaje: mensajeDeError(error) };
  }
  // Tarjeta del catálogo, bloque de la portada, ficha y vista previa: se refrescan sin desplegar,
  // ya en la primera visita (updateTag vence la caché al instante; revalidateTag serviría una vez
  // la versión anterior mientras se regenera)
  updateTag(TAG_CASAS);
  return { ok: true, datos: { ancho: medidas.ancho, alto: medidas.alto } };
}
