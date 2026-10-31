import "server-only";

import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Avance, Documento, Etapa, Obra, ObraMaterial } from "@/lib/supabase/tipos";
import { esquemaIdPortal, esquemaVideoObra } from "@/lib/validacion";
import { videoObra, type VideoObra } from "@/lib/video";

/**
 * Lecturas del portal de clientes. TODO se lee con la sesión del usuario (clave publishable
 * + cookies), nunca con la clave secreta: la RLS de 004_portal_obras.sql decide qué filas y
 * qué archivos ve cada cliente. Llamar solo después de `sesionVerificada()`.
 *
 * Bucket privado `obras`. Las rutas empiezan con el id de la obra, sin prefijo:
 *   fotos:      {obra_id}/avances/{avance_id}/archivo
 *   documentos: {obra_id}/documentos/archivo  (la ruta exacta está en `documentos.ruta`)
 */

export const BUCKET_OBRAS = "obras";
/** Fotos: se firman al cargar la página y duran 10 minutos. */
const SEGUNDOS_FOTO = 600;
/** Documentos: se firman al tocarlos (`/portal/documentos/[id]`) y duran 60 segundos. */
const SEGUNDOS_DOCUMENTO = 60;
const EXTENSIONES_FOTO = /\.(jpe?g|png|webp)$/i;
const MAX_FOTOS_POR_AVANCE = 50;

/** Carpeta de las fotos de un avance (coincide con la política de Storage). */
export function carpetaFotos(obraId: string, avanceId: string): string {
  return `${obraId}/avances/${avanceId}`;
}

export type Foto = { url: string; nombre: string };
export type AvanceConMedios = Avance & { fotos: Foto[]; video: VideoObra | null };
export type DocumentoListado = Pick<Documento, "id" | "tipo" | "titulo" | "created_at">;

export type DetalleObra = {
  obra: Obra;
  etapas: Etapa[];
  avances: AvanceConMedios[];
  materiales: ObraMaterial[];
  documentos: DocumentoListado[];
};

/** Obras del usuario (la RLS filtra). `null` si la consulta falla. */
export async function listarObras(): Promise<Obra[] | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Obra[]>();
  if (error) {
    console.error("[portal] listar obras falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  return data;
}

/**
 * Obra con sus etapas, avances (con fotos firmadas y video validado), materiales y
 * documentos (sin URL: se firman al tocarlos). `null` si el id no es válido, la obra no
 * existe o el usuario no es miembro: la RLS no distingue entre esos casos, a propósito.
 */
export async function leerObra(id: string): Promise<DetalleObra | null> {
  if (!esquemaIdPortal.safeParse(id).success) return null;
  const supabase = await crearClienteServidor();

  const { data: obra, error } = await supabase
    .from("obras")
    .select("*")
    .eq("id", id)
    .maybeSingle<Obra>();
  if (error) {
    console.error("[portal] leer obra falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  if (!obra) return null;

  const [etapas, avances, materiales, documentos] = await Promise.all([
    supabase.from("etapas").select("*").eq("obra_id", id).order("orden").returns<Etapa[]>(),
    supabase
      .from("avances")
      .select("*")
      .eq("obra_id", id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<Avance[]>(),
    supabase
      .from("obra_materiales")
      .select("*")
      .eq("obra_id", id)
      .order("orden")
      .returns<ObraMaterial[]>(),
    supabase
      .from("documentos")
      .select("id, tipo, titulo, created_at")
      .eq("obra_id", id)
      .order("created_at", { ascending: false })
      .returns<DocumentoListado[]>(),
  ]);
  for (const r of [etapas, avances, materiales, documentos]) {
    if (r.error) {
      console.error("[portal] leer detalle falló", { codigo: r.error.code, mensaje: r.error.message });
      return null;
    }
  }

  const avancesConMedios = await Promise.all(
    (avances.data ?? []).map(async (a) => ({
      ...a,
      fotos: await fotosDeAvance(id, a.id),
      video:
        a.video_url && esquemaVideoObra.safeParse(a.video_url).success
          ? videoObra(a.video_url)
          : null,
    })),
  );

  return {
    obra,
    etapas: etapas.data ?? [],
    avances: avancesConMedios,
    materiales: materiales.data ?? [],
    documentos: documentos.data ?? [],
  };
}

/** Fotos de la carpeta del avance, con URL firmada de 10 minutos. Si falla, sin fotos. */
async function fotosDeAvance(obraId: string, avanceId: string): Promise<Foto[]> {
  const supabase = await crearClienteServidor();
  const carpeta = carpetaFotos(obraId, avanceId);
  const almacen = supabase.storage.from(BUCKET_OBRAS);

  const { data: archivos, error } = await almacen.list(carpeta, {
    limit: MAX_FOTOS_POR_AVANCE,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) {
    console.error("[portal] listar fotos falló", { mensaje: error.message });
    return [];
  }
  // Las subcarpetas vienen con id null; solo se muestran imágenes
  const nombres = (archivos ?? [])
    .filter((a) => a.id !== null && EXTENSIONES_FOTO.test(a.name))
    .map((a) => a.name);
  if (nombres.length === 0) return [];

  const { data: firmadas, error: errorFirma } = await almacen.createSignedUrls(
    nombres.map((n) => `${carpeta}/${n}`),
    SEGUNDOS_FOTO,
  );
  if (errorFirma) {
    console.error("[portal] firmar fotos falló", { mensaje: errorFirma.message });
    return [];
  }
  return (firmadas ?? []).flatMap((f, i) =>
    f.signedUrl && !f.error ? [{ url: f.signedUrl, nombre: nombres[i] }] : [],
  );
}

/**
 * URL firmada (60 s) de un documento, con la sesión del usuario: si no es miembro de la
 * obra, la RLS no devuelve la fila y la política de Storage no deja firmar. `null` si no
 * hay acceso o el id no es válido.
 */
export async function urlDocumento(id: string): Promise<string | null> {
  if (!esquemaIdPortal.safeParse(id).success) return null;
  const supabase = await crearClienteServidor();

  const { data: documento, error } = await supabase
    .from("documentos")
    .select("ruta")
    .eq("id", id)
    .maybeSingle<Pick<Documento, "ruta">>();
  if (error) {
    console.error("[portal] leer documento falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  if (!documento) return null;

  const { data, error: errorFirma } = await supabase.storage
    .from(BUCKET_OBRAS)
    .createSignedUrl(documento.ruta, SEGUNDOS_DOCUMENTO);
  if (errorFirma || !data?.signedUrl) {
    console.error("[portal] firmar documento falló", { mensaje: errorFirma?.message });
    return null;
  }
  return data.signedUrl;
}
