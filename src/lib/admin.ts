import "server-only";

import { urlImagenCasa } from "@/lib/casas";
import { BUCKET_OBRAS, carpetaFotos } from "@/lib/portal";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Avance, CasaVenta, CasaVentaAvance, Etapa, Obra } from "@/lib/supabase/tipos";
import { esquemaIdPortal } from "@/lib/validacion";

/**
 * Lecturas del panel de administración (/admin). Todo con la sesión del usuario (clave
 * publishable + cookies), nunca con la clave secreta: la base decide con `es_admin()`
 * (migración 009) qué ve un administrador. Un usuario que no lo es recibe lo mismo que en el
 * portal (solo sus obras), y las páginas de /admin le responden 404 antes.
 */

/** Máximo de fotos que muestra el portal por avance (lib/portal.ts). */
export const MAX_FOTOS_AVANCE = 50;
/** Avances que lista la página de una obra (los más recientes). */
const AVANCES_RECIENTES = 20;

/** ¿La sesión actual es de un administrador? `null` si la consulta falla. */
export async function esAdmin(): Promise<boolean | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("es_admin");
  if (error) {
    console.error("[admin] es_admin falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  return data === true;
}

export type CasaLigada = Pick<CasaVenta, "id" | "nombre" | "slug" | "estado">;
export type ObraAdmin = Obra & { casa: CasaLigada | null; etapaEnProceso: string | null };

/** Todas las obras (la RLS de administrador las deja ver todas). `null` si falla. */
export async function listarObrasAdmin(): Promise<ObraAdmin[] | null> {
  const supabase = await crearClienteServidor();
  const [obras, etapas, casas] = await Promise.all([
    supabase.from("obras").select("*").order("created_at", { ascending: false }).returns<Obra[]>(),
    supabase
      .from("etapas")
      .select("obra_id, nombre")
      .eq("estado", "en_proceso")
      .order("orden")
      .returns<Pick<Etapa, "obra_id" | "nombre">[]>(),
    supabase.from("casas_venta").select("id, nombre, slug, estado").returns<CasaLigada[]>(),
  ]);
  for (const r of [obras, etapas, casas]) {
    if (r.error) {
      console.error("[admin] listar obras falló", { codigo: r.error.code, mensaje: r.error.message });
      return null;
    }
  }
  const casaPorId = new Map((casas.data ?? []).map((c) => [c.id, c]));
  return (obras.data ?? []).map((o) => ({
    ...o,
    casa: o.casa_id ? (casaPorId.get(o.casa_id) ?? null) : null,
    etapaEnProceso: etapas.data?.find((e) => e.obra_id === o.id)?.nombre ?? null,
  }));
}

/** Una foto publicada en la ficha: nombre (01.jpg…), URL pública y si es la foto de la tarjeta. */
export type FotoPublicada = { nombre: string; url: string; esPortada: boolean };

/** Estado de la publicación de un avance en la ficha de su casa (010) y sus fotos públicas. */
export type PublicacionAdmin = { id: string; visible: boolean; fotos: number; publicadas: FotoPublicada[] };

export type AvanceAdmin = Pick<Avance, "id" | "fecha" | "titulo" | "etapa_id" | "video_url"> & {
  fotos: string[];
  publicacion: PublicacionAdmin | null;
};

type FilaAvanceAdmin = Pick<Avance, "id" | "fecha" | "titulo" | "etapa_id" | "video_url" | "publicacion_id">;
const COLUMNAS_AVANCE_ADMIN = "id, fecha, titulo, etapa_id, video_url, publicacion_id";

export type ObraAdminDetalle = {
  obra: Obra;
  casa: CasaLigada | null;
  etapas: Etapa[];
  avances: AvanceAdmin[];
};

/** Obra con su casa ligada, sus etapas y sus avances recientes (con los nombres de sus fotos). */
export async function leerObraAdmin(id: string): Promise<ObraAdminDetalle | null> {
  if (!esquemaIdPortal.safeParse(id).success) return null;
  const supabase = await crearClienteServidor();

  const { data: obra, error } = await supabase.from("obras").select("*").eq("id", id).maybeSingle<Obra>();
  if (error) {
    console.error("[admin] leer obra falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  if (!obra) return null;

  const [etapas, avances, casa] = await Promise.all([
    supabase.from("etapas").select("*").eq("obra_id", id).order("orden").returns<Etapa[]>(),
    supabase
      .from("avances")
      .select(COLUMNAS_AVANCE_ADMIN)
      .eq("obra_id", id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(AVANCES_RECIENTES)
      .returns<FilaAvanceAdmin[]>(),
    obra.casa_id
      ? supabase
          .from("casas_venta")
          .select("id, nombre, slug, estado")
          .eq("id", obra.casa_id)
          .maybeSingle<CasaLigada>()
      : Promise.resolve({ data: null, error: null }),
  ]);
  for (const r of [etapas, avances, casa]) {
    if (r.error) {
      console.error("[admin] leer detalle falló", { codigo: r.error.code, mensaje: r.error.message });
      return null;
    }
  }

  const publicaciones = await leerPublicaciones(
    (avances.data ?? []).flatMap((a) => a.publicacion_id ?? []),
    await rutaPortada(obra.casa_id),
  );
  return {
    obra,
    casa: casa.data,
    etapas: etapas.data ?? [],
    avances: await Promise.all(
      (avances.data ?? []).map(async ({ publicacion_id, ...a }) => ({
        ...a,
        fotos: (await fotosDeAvance(id, a.id)) ?? [],
        publicacion: publicacion_id ? (publicaciones.get(publicacion_id) ?? null) : null,
      })),
    ),
  };
}

/** Un avance de la obra, con los nombres de sus fotos. `null` si no existe o falla. */
export async function leerAvanceAdmin(obraId: string, avanceId: string): Promise<AvanceAdmin | null> {
  if (!esquemaIdPortal.safeParse(obraId).success || !esquemaIdPortal.safeParse(avanceId).success) return null;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("avances")
    .select(COLUMNAS_AVANCE_ADMIN)
    .eq("id", avanceId)
    .eq("obra_id", obraId)
    .maybeSingle<FilaAvanceAdmin>();
  if (error) {
    console.error("[admin] leer avance falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  if (!data) return null;
  const fotos = await fotosDeAvance(obraId, avanceId);
  if (fotos === null) return null;
  const { publicacion_id, ...avance } = data;
  const publicaciones = await leerPublicaciones(publicacion_id ? [publicacion_id] : [], null);
  return { ...avance, fotos, publicacion: publicacion_id ? (publicaciones.get(publicacion_id) ?? null) : null };
}

/**
 * Ruta (en el bucket `casas`) de la foto de la tarjeta de una casa: la foto de orden 1. Con 015,
 * el administrador la lee aunque la casa esté oculta. `null` sin casa, sin fotos o si falla.
 */
async function rutaPortada(casaId: string | null): Promise<string | null> {
  if (!casaId) return null;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("casas_venta_imagenes")
    .select("ruta")
    .eq("casa_id", casaId)
    .eq("tipo", "foto")
    .eq("orden", 1)
    .maybeSingle<{ ruta: string }>();
  if (error) {
    console.error("[admin] leer portada falló", { codigo: error.code, mensaje: error.message });
    return null;
  }
  return data?.ruta ?? null;
}

/** Publicaciones en la ficha (la RLS de administrador deja ver también las ocultas). */
async function leerPublicaciones(ids: string[], portada: string | null): Promise<Map<string, PublicacionAdmin>> {
  if (ids.length === 0) return new Map();
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("casas_venta_avances")
    .select("id, casa_id, visible, fotos")
    .in("id", ids)
    .returns<Pick<CasaVentaAvance, "id" | "casa_id" | "visible" | "fotos">[]>();
  if (error) {
    console.error("[admin] leer publicaciones falló", { codigo: error.code, mensaje: error.message });
    return new Map();
  }
  return new Map(
    data.map((p) => {
      const publicadas = p.fotos.map((nombre) => {
        const ruta = `${p.casa_id}/avances/${p.id}/${nombre}`;
        return { nombre, url: urlImagenCasa(ruta), esPortada: ruta === portada };
      });
      return [p.id, { id: p.id, visible: p.visible, fotos: p.fotos.length, publicadas }];
    }),
  );
}

/** Nombres de los archivos de la carpeta del avance, en orden. `null` si falla. */
async function fotosDeAvance(obraId: string, avanceId: string): Promise<string[] | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.storage
    .from(BUCKET_OBRAS)
    .list(carpetaFotos(obraId, avanceId), { limit: 100, sortBy: { column: "name", order: "asc" } });
  if (error) {
    console.error("[admin] listar fotos falló", { mensaje: error.message });
    return null;
  }
  return (data ?? []).filter((a) => a.id !== null).map((a) => a.name);
}

/** Hoy en El Salvador, `AAAA-MM-DD` (valor por defecto de las fechas del panel). */
export function hoyElSalvador(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/El_Salvador" }).format(new Date());
}
