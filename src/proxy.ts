import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { casaPublicadaExiste } from "@/lib/casa-existe";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/entorno";

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };

/** Si no se puede traer la página de "no disponible", al menos un 404 legible. */
const HTML_404 = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Casa no disponible</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>Esta casa no está disponible</h1><p>Puede que ya no esté a la venta o que la dirección esté mal escrita.</p><p><a href="/casas">Ver todas las casas</a></p></body></html>`;

/**
 * 404 real con la página estática `/casa-no-disponible` (fuera de `/casas/[slug]`, así el
 * proxy no la vuelve a revisar). Un `rewrite` no sirve: Next ignora el `status` y sale 200.
 * Sin caché: si la casa se publica después, el 404 no debe quedar guardado.
 */
async function respuesta404(request: NextRequest) {
  const encabezados = { ...NOINDEX, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" };
  try {
    const pagina = await fetch(new URL("/casa-no-disponible", request.url), {
      signal: AbortSignal.timeout(1_500),
    });
    if (pagina.ok) return new NextResponse(pagina.body, { status: 404, headers: encabezados });
  } catch {
    // sigue con el HTML mínimo
  }
  return new NextResponse(HTML_404, { status: 404, headers: encabezados });
}

/**
 * Detalle de una casa del catálogo (`/casas/[slug]`): si la casa no existe o no está
 * publicada, 404 REAL antes de que la página empiece a enviarse (dentro de la página, el
 * aviso de "no encontrada" saldría con 200: un 404 blando). Siempre con
 * `X-Robots-Tag: noindex`, también con el sitio lanzado. Si Supabase no responde, la visita
 * sigue (la página decide) pero marcada noindex.
 */
async function revisarCasa(request: NextRequest, slug: string) {
  const existe = await casaPublicadaExiste(slug);
  if (existe) return NextResponse.next();
  if (existe === null) return NextResponse.next({ headers: NOINDEX });
  return respuesta404(request);
}

/**
 * Renueva la sesión de Supabase (Next 16: `proxy.ts` reemplaza a `middleware.ts`), y revisa
 * que exista la casa del catálogo pedida.
 *
 * Solo corre en las rutas de `config.matcher`: la landing no pasa por aquí y sigue siendo
 * estática. Esto NO es la autorización: cada página, Server Action y ruta de descargas
 * vuelve a verificar la sesión con `getClaims()`.
 */
export async function proxy(request: NextRequest) {
  const casa = request.nextUrl.pathname.match(/^\/casas\/([^/]+)\/?$/);
  if (casa) return revisarCasa(request, decodeURIComponent(casa[1]));

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(aEscribir, encabezados) {
        // 1) Para los Server Components de este mismo request
        for (const { name, value } of aEscribir) request.cookies.set(name, value);
        // 2) Para el navegador, en una respuesta nueva que lleve el request actualizado
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of aEscribir) {
          respuesta.cookies.set(name, value, options);
        }
        // Una respuesta que escribe la sesión no debe quedar en ninguna caché compartida
        for (const [clave, valor] of Object.entries(encabezados)) {
          respuesta.headers.set(clave, valor);
        }
      },
    },
  });

  // Renueva el token si venció. No poner código entre crear el cliente y esta llamada.
  await supabase.auth.getClaims();

  // Devolver la respuesta que armó `setAll`: si se devuelve otra, se pierden las cookies
  return respuesta;
}

export const config = {
  matcher: ["/esparta/ficha/:path*", "/descargas/:path*", "/portal/:path*", "/casas/:slug"],
};
