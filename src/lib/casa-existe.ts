import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/entorno";

/**
 * ¿Hay una casa PUBLICADA con este slug? Para `proxy.ts`: responde antes de que la página
 * empiece a enviarse, así una casa inexistente da un 404 real (dentro de la página, el aviso
 * de "no encontrada" saldría con 200: un 404 blando).
 *
 * Consulta mínima (solo el id) con la clave publishable: la RLS ya filtra las publicadas.
 * Caché en memoria de 60 s por instancia, acotada, para no consultar en cada visita.
 * `null` = no se pudo saber (Supabase lento o caído): el proxy deja pasar la visita.
 */

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VIGENCIA_MS = 60_000;
const MAX_ENTRADAS = 500;
const ESPERA_MAX_MS = 1_500;

const cache = new Map<string, { existe: boolean; hasta: number }>();

export function slugValido(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 80 && SLUG.test(slug);
}

export async function casaPublicadaExiste(slug: string): Promise<boolean | null> {
  if (!slugValido(slug)) return false;

  const ahora = Date.now();
  const guardada = cache.get(slug);
  if (guardada && guardada.hasta > ahora) return guardada.existe;

  try {
    const url = `${supabaseUrl()}/rest/v1/casas_venta?select=id&publicada=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`;
    const clave = supabasePublishableKey();
    const respuesta = await fetch(url, {
      headers: { apikey: clave, Authorization: `Bearer ${clave}` },
      signal: AbortSignal.timeout(ESPERA_MAX_MS),
      cache: "no-store",
    });
    if (!respuesta.ok) return null;
    const filas: unknown = await respuesta.json();
    const existe = Array.isArray(filas) && filas.length > 0;

    if (cache.size >= MAX_ENTRADAS) cache.clear();
    cache.set(slug, { existe, hasta: ahora + VIGENCIA_MS });
    return existe;
  } catch {
    return null;
  }
}
