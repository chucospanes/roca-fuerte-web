import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/entorno";
import type { CasaVenta, CasaVentaImagen, BaseDeDatos } from "@/lib/supabase/tipos";
import { esquemaSlugCasa, esquemaVideoObra } from "@/lib/validacion";
import { videoObra, type VideoObra } from "@/lib/video";

/**
 * Lecturas del catálogo de casas en venta (005_casas_venta.sql). Con la clave publishable y
 * SIN sesión: la RLS devuelve solo las casas publicadas y sus imágenes. Nunca con la clave
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
export type DetalleCasa = CasaListada & {
  fotos: Imagen[];
  plano: Imagen | null;
  video: VideoObra | null;
};
export type Resultado<T> = { ok: true; datos: T } | { ok: false };

const COLUMNAS =
  "id, slug, orden, nombre, modelo, descripcion, distrito, municipio, departamento, estado, etapa_actual, precio_usd, lote_frente_m, lote_fondo_m, lote_m2, planta_esparta, construccion_m2, dormitorios, banos, parqueos, agua, electricidad, aguas_negras, incluye, video_url";
const COLUMNAS_IMAGEN = "id, casa_id, tipo, orden, ruta, ancho, alto, alt";

type FilaCasa = Omit<CasaListada, "portada">;
type FilaImagen = Omit<CasaVentaImagen, "created_at">;

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

/**
 * Vendidas al final; dentro de cada grupo, por `orden`. El orden es estable: a igual `orden`
 * queda el de la consulta (la más nueva primero).
 */
function ordenCatalogo(a: FilaCasa, b: FilaCasa): number {
  const va = a.estado === "vendida" ? 1 : 0;
  const vb = b.estado === "vendida" ? 1 : 0;
  return va - vb || a.orden - b.orden;
}

/** Casas publicadas con su foto de portada (foto de orden 1), vendidas al final. */
export async function listarCasas(): Promise<Resultado<CasaListada[]>> {
  "use cache";
  cacheLife("minutes");

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

    const fotos = imagenes.filter((i) => i.tipo === "foto").map(imagen);
    const plano = imagenes.find((i) => i.tipo === "plano");
    return {
      ok: true,
      datos: {
        ...casa,
        portada: fotos.find((f) => f.orden === 1) ?? null,
        fotos,
        plano: plano ? imagen(plano) : null,
        video:
          casa.video_url && esquemaVideoObra.safeParse(casa.video_url).success
            ? videoObra(casa.video_url)
            : null,
      },
    };
  } catch (e) {
    console.error("[casas] leer falló", { mensaje: e instanceof Error ? e.message : String(e) });
    return { ok: false };
  }
}
