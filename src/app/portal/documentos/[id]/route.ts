import type { NextRequest } from "next/server";
import { site } from "@/config/site";
import { urlDocumento } from "@/lib/portal";
import { sesionVerificada } from "@/lib/supabase/servidor";

const sinCache = { "Cache-Control": "private, no-store" };

/**
 * Abre un documento del portal: verifica la sesión, firma una URL de 60 s con el cliente
 * del usuario (la RLS y la política de Storage deciden si puede) y redirige. La URL no se
 * genera al cargar la página: solo cuando se toca el documento.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/portal/documentos/[id]">) {
  const { id } = await ctx.params;
  if (!site.portalClientes) return new Response("No encontrado", { status: 404, headers: sinCache });

  const sesion = await sesionVerificada();
  if (!sesion) {
    return new Response(null, {
      status: 303,
      headers: { ...sinCache, Location: new URL("/portal", request.url).toString() },
    });
  }

  // `null` si el id no es válido, no existe o no es de sus obras: misma respuesta
  const url = await urlDocumento(id);
  if (!url) return new Response("No encontrado", { status: 404, headers: sinCache });

  return new Response(null, {
    status: 303,
    headers: { ...sinCache, Location: url, "Referrer-Policy": "no-referrer" },
  });
}
