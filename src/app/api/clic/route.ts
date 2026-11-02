import { crearClienteAdmin } from "@/lib/supabase/admin";
import { esquemaClic } from "@/lib/validacion";

/**
 * Conteo anónimo de clics en los botones de venta (lo envía el script en línea del layout
 * con `sendBeacon`). Sin datos personales: no se lee ni se guarda la IP ni el navegador.
 *
 * Defensas básicas (los conteos son indicativos, ver DECISIONES.md): solo peticiones del
 * propio sitio (`Origin` y `Sec-Fetch-Site`), cuerpo pequeño y validado con zod. Un clic de
 * una casa (`casa_id`) solo se guarda si la casa existe y está publicada; si no, se descarta
 * como cualquier clic inválido (400), nunca con un 500.
 */
const MAX_BYTES = 2_000;
const sinContenido = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  const origen = request.headers.get("origin");
  if (!origen || origen !== new URL(request.url).origin) {
    return new Response(null, { status: 403 });
  }
  const sitio = request.headers.get("sec-fetch-site");
  if (sitio && sitio !== "same-origin") return new Response(null, { status: 403 });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return new Response(null, { status: 413 });
  }
  const texto = await request.text();
  if (texto.length > MAX_BYTES) return new Response(null, { status: 413 });

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return new Response(null, { status: 400 });
  }
  const datos = esquemaClic.safeParse(cuerpo);
  if (!datos.success) return new Response(null, { status: 400 });

  const supabase = crearClienteAdmin();
  if (datos.data.casa_id) {
    const { data: casa, error: errorCasa } = await supabase
      .from("casas_venta")
      .select("id")
      .eq("id", datos.data.casa_id)
      .eq("publicada", true)
      .maybeSingle();
    if (errorCasa) {
      console.error("[clics] revisar casa falló", { codigo: errorCasa.code, mensaje: errorCasa.message });
      return sinContenido();
    }
    if (!casa) return new Response(null, { status: 400 });
  }

  const { error } = await supabase
    .from("clics_venta")
    .insert({
      opcion: datos.data.opcion,
      ubicacion: datos.data.ubicacion,
      casa_id: datos.data.casa_id ?? null,
      utm_source: datos.data.utm_source ?? null,
      utm_medium: datos.data.utm_medium ?? null,
      utm_campaign: datos.data.utm_campaign ?? null,
      utm_content: datos.data.utm_content ?? null,
      referrer_dominio: datos.data.referrer_dominio ?? null,
    });
  if (error) {
    console.error("[clics] insertar falló", { codigo: error.code, mensaje: error.message });
  }
  // Al navegador le da igual el resultado: el clic ya abrió WhatsApp
  return sinContenido();
}
