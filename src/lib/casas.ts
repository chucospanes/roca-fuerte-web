import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/entorno";
import type { CasaVenta, CasaVentaEtapa, CasaVentaImagen, BaseDeDatos } from "@/lib/supabase/tipos";
import { esquemaSlugCasa, esquemaVideoObra } from "@/lib/validacion";
import { videoObra, type VideoObra } from "@/lib/video";

/**
 * Lecturas del catálogo de casas en venta (005_casas_venta.sql) y de su avance público
 * (008_casas_venta_etapas.sql). Con la clave publishable y SIN sesión: la RLS devuelve solo
 * las casas publicadas, sus imágenes y sus etapas. Nunca con la clave
 * secreta. Los datos se cargan a mano en Supabase (docs/GUIA_CARGA_CASAS.md).
 *
 * Caché `minutes` (Next: se regenera cada minuto, el navegador lo reusa hasta 5 min): un
 * cambio en la fila (por ejemplo, el lote) se ve en unos minutos sin desplegar.
 * Si Supabase falla, se devuelve `{ ok: false }` y la página lo dice; nunca rompe la landing.
 */

export const BUCKET_CASAS = "casas";

export type Imagen = Omit<CasaVentaImagen, "casa_id" | "created_at" | "ruta"> & { url: string };
export type CasaListada = Omit<CasaVenta, "publicada" | "created_at" | "updated_at"> & {
  portada: Imagen | null;
};
/** Etapa del avance público de una casa (la bitácora). */
export type EtapaCasa = Pick<CasaVentaEtapa, "id" | "orden" | "nombre" | "estado" | "fecha_inicio" | "descripcion"> & {
  video: VideoObra | null;
};
export type DetalleCasa = CasaListada & {
  fotos: Imagen[];
  plano: Imagen | null;
  video: VideoObra | null;
  etapas: EtapaCasa[];
};
/** La obra de la bitácora de la portada: una casa del catálogo con su avance. */
export type ObraEnCurso = { casa: CasaListada; etapas: EtapaCasa[] };
export type Resultado<T> = { ok: true; datos: T } | { ok: false };

const COLUMNAS =
  "id, slug, orden, nombre, modelo, descripcion, distrito, municipio, departamento, estado, etapa_actual, precio_usd, lote_frente_m, lote_fondo_m, lote_m2, planta_esparta, construccion_m2, dormitorios, banos, parqueos, agua, electricidad, aguas_negras, incluye, video_url";
const COLUMNAS_IMAGEN = "id, casa_id, tipo, orden, ruta, ancho, alto, alt";
const COLUMNAS_ETAPA = "id, casa_id, orden, nombre, estado, fecha_inicio, descripcion, video_url";

type FilaCasa = Omit<CasaListada, "portada">;
type FilaImagen = Omit<CasaVentaImagen, "created_at">;
type FilaEtapa = Omit<CasaVentaEtapa, "created_at" | "updated_at">;

function clientePublico() {
  return createClient<BaseDeDatos>(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** URL pública de un archivo del bucket `casas` (cada parte de la ruta, codificada). */
export function urlImagenCasa(ruta: string): string {
  const partes = ruta.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET_CASAS}/${partes}`;
}

function imagen({ id, tipo, orden, ancho, alto, alt, ruta }: FilaImagen): Imagen {
  return { id, tipo, orden, ancho, alto, alt, url: urlImagenCasa(ruta) };
}

/** Video solo si es una URL válida de YouTube o Vimeo (la base ya lo exige; se revisa igual). */
function videoValido(url: string | null): VideoObra | null {
  return url && esquemaVideoObra.safeParse(url).success ? videoObra(url) : null;
}

function etapa({ id, orden, nombre, estado, fecha_inicio, descripcion, video_url }: FilaEtapa): EtapaCasa {
  return { id, orden, nombre, estado, fecha_inicio, descripcion, video: videoValido(video_url) };
}

/**
 * Vendidas al final; dentro de cada grupo, por `orden`. El orden es estable: a igual `orden`
 * queda el de la consulta (la más nueva primero).
 */
function ordenCatalogo(a: FilaCasa, b: FilaCasa): number {
  const va = a.estado === "vendida" ? 1 : 0;
  const vb = b.estado === "vendida" ? 1 : 0;
  return va - vb || a.orden - b.orden;
}

/** Etiqueta de la caché del catálogo y la bitácora: el panel /admin la refresca al cambiar una etapa. */
export const TAG_CASAS = "casas";

/** Casas publicadas con su foto de portada (foto de orden 1), vendidas al final. */
export async function listarCasas(): Promise<Resultado<CasaListada[]>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_CASAS);

  try {
    const supabase = clientePublico();
    const { data: casas, error } = await supabase
      .from("casas_venta")
      .select(COLUMNAS)
      .eq("publicada", true)
      .order("orden")
      .order("created_at", { ascending: false })
      .returns<FilaCasa[]>();
    if (error) {
      console.error("[casas] listar falló", { codigo: error.code, mensaje: error.message });
      return { ok: false };
    }
    if (casas.length === 0) return { ok: true, datos: [] };

    const { data: portadas, error: errorPortadas } = await supabase
      .from("casas_venta_imagenes")
      .select(COLUMNAS_IMAGEN)
      .in(
        "casa_id",
        casas.map((c) => c.id),
      )
      .eq("tipo", "foto")
      .eq("orden", 1)
      .returns<FilaImagen[]>();
    if (errorPortadas) {
      console.error("[casas] portadas fallaron", {
        codigo: errorPortadas.code,
        mensaje: errorPortadas.message,
      });
      return { ok: false };
    }

    const porCasa = new Map(portadas.map((p) => [p.casa_id, imagen(p)]));
    return {
      ok: true,
      datos: [...casas].sort(ordenCatalogo).map((c) => ({ ...c, portada: porCasa.get(c.id) ?? null })),
    };
  } catch (e) {
    console.error("[casas] listar falló", { mensaje: e instanceof Error ? e.message : String(e) });
    return { ok: false };
  }
}

/**
 * Una casa publicada con sus fotos, su plano y su video validado. `datos: null` si el slug no
 * es válido o la casa no existe o no está publicada (la RLS no distingue, a propósito).
 */
export async function leerCasa(slug: string): Promise<Resultado<DetalleCasa | null>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_CASAS);

  if (!esquemaSlugCasa.safeParse(slug).success) return { ok: true, datos: null };
  try {
    const supabase = clientePublico();
    const { data: casa, error } = await supabase
      .from("casas_venta")
      .select(COLUMNAS)
      .eq("slug", slug)
      .eq("publicada", true)
      .maybeSingle<FilaCasa>();
    if (error) {
      console.error("[casas] leer falló", { codigo: error.code, mensaje: error.message });
      return { ok: false };
    }
    if (!casa) return { ok: true, datos: null };

    const { data: imagenes, error: errorImagenes } = await supabase
      .from("casas_venta_imagenes")
      .select(COLUMNAS_IMAGEN)
      .eq("casa_id", casa.id)
      .order("tipo")
      .order("orden")
      .returns<FilaImagen[]>();
    if (errorImagenes) {
      console.error("[casas] imágenes fallaron", {
        codigo: errorImagenes.code,
        mensaje: errorImagenes.message,
      });
      return { ok: false };
    }

    const { data: etapas, error: errorEtapas } = await supabase
      .from("casas_venta_etapas")
      .select(COLUMNAS_ETAPA)
      .eq("casa_id", casa.id)
      .order("orden")
      .returns<FilaEtapa[]>();
    // Sin avance la ficha se muestra igual: un fallo de las etapas no tumba la casa
    if (errorEtapas) {
      console.error("[casas] etapas fallaron", { codigo: errorEtapas.code, mensaje: errorEtapas.message });
    }

    const fotos = imagenes.filter((i) => i.tipo === "foto").map(imagen);
    const plano = imagenes.find((i) => i.tipo === "plano");
    return {
      ok: true,
      datos: {
        ...casa,
        portada: fotos.find((f) => f.orden === 1) ?? null,
        fotos,
        plano: plano ? imagen(plano) : null,
        video: videoValido(casa.video_url),
        etapas: errorEtapas ? [] : etapas.map(etapa),
      },
    };
  } catch (e) {
    console.error("[casas] leer falló", { mensaje: e instanceof Error ? e.message : String(e) });
    return { ok: false };
  }
}

/**
 * La obra de la bitácora de la portada: la primera casa del catálogo (vendidas al final) que
 * tenga etapas cargadas, con su avance. `datos: null` si ninguna tiene. Las casas salen de
 * `listarCasas` (misma lectura en caché); las etapas, de una consulta más.
 */
export async function leerObraEnCurso(): Promise<Resultado<ObraEnCurso | null>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_CASAS);

  const casas = await listarCasas();
  if (!casas.ok) return { ok: false };
  if (casas.datos.length === 0) return { ok: true, datos: null };
  try {
    const { data: etapas, error } = await clientePublico()
      .from("casas_venta_etapas")
      .select(COLUMNAS_ETAPA)
      .in(
        "casa_id",
        casas.datos.map((c) => c.id),
      )
      .order("orden")
      .returns<FilaEtapa[]>();
    if (error) {
      console.error("[casas] bitácora falló", { codigo: error.code, mensaje: error.message });
      return { ok: false };
    }
    const casa = casas.datos.find((c) => etapas.some((e) => e.casa_id === c.id));
    if (!casa) return { ok: true, datos: null };
    return { ok: true, datos: { casa, etapas: etapas.filter((e) => e.casa_id === casa.id).map(etapa) } };
  } catch (e) {
    console.error("[casas] bitácora falló", { mensaje: e instanceof Error ? e.message : String(e) });
    return { ok: false };
  }
}

/**
 * Casas disponibles (no vendidas), en el orden del catálogo. Sale de `listarCasas` (la misma
 * lectura en caché, no una consulta nueva): la usan el hero, el bloque "Casas disponibles" y
 * Precios. `null` si Supabase no respondió.
 */
export async function casasDisponibles(): Promise<CasaListada[] | null> {
  const resultado = await listarCasas();
  return resultado.ok ? resultado.datos.filter((c) => c.estado !== "vendida") : null;
}

/** Disponible = se puede comprar: en construcción o terminada (no reservada ni vendida). */
export function casaDisponible(estado: CasaListada["estado"]): boolean {
  return estado === "en_construccion" || estado === "terminada";
}

/** A dónde llevan los botones de comprar: a la casa si hay una sola, al catálogo si hay varias. */
export function destinoCompra(disponibles: CasaListada[]): { href: string; texto: string } {
  return disponibles.length === 1
    ? { href: `/casas/${disponibles[0].slug}`, texto: "Ver la casa" }
    : { href: "/casas", texto: "Ver casas en venta" };
}
