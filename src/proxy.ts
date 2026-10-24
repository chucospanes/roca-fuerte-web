import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/entorno";

/**
 * Renueva la sesión de Supabase (Next 16: `proxy.ts` reemplaza a `middleware.ts`).
 *
 * Solo corre en las rutas que usan la sesión (ver `config.matcher`): la landing no pasa
 * por aquí y sigue siendo estática. Esto NO es la autorización: cada página, Server Action
 * y ruta de descargas vuelve a verificar la sesión con `getClaims()`.
 */
export async function proxy(request: NextRequest) {
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
  matcher: ["/bonaire/ficha/:path*", "/descargas/:path*"],
};
