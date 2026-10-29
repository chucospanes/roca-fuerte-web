import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { site } from "@/config/site";
import { leerLeadDeSesion } from "@/lib/leads";
import { sesionVerificada } from "@/lib/supabase/servidor";

/**
 * Descarga de los PDF premium. Los archivos viven en `assets/` (no en `public/`), así que
 * solo salen por aquí, después de verificar la sesión y que el correo tenga su registro.
 * Lista cerrada: el nombre de la URL nunca se usa para armar una ruta de archivo.
 * `assets/` se incluye en el despliegue con `outputFileTracingIncludes` (next.config.ts).
 */
const ARCHIVOS = {
  "plano-esparta.pdf": { origen: "plano-esparta.pdf", nombre: "Casa-Modelo-Esparta-plano.pdf" },
  "fachada-esparta.pdf": { origen: "fachada-esparta.pdf", nombre: "Casa-Modelo-Esparta-fachada.pdf" },
} as const;

type Archivo = keyof typeof ARCHIVOS;

function esArchivo(nombre: string): nombre is Archivo {
  return Object.hasOwn(ARCHIVOS, nombre);
}

const sinCache = { "Cache-Control": "private, no-store" };

export async function GET(_request: NextRequest, ctx: RouteContext<"/descargas/[archivo]">) {
  const { archivo } = await ctx.params;
  if (!site.accesoPremium || !esArchivo(archivo)) {
    return new Response("No encontrado", { status: 404, headers: sinCache });
  }

  const sesion = await sesionVerificada();
  if (!sesion) {
    return new Response("Necesitas verificar tu correo para descargar este archivo.", {
      status: 401,
      headers: sinCache,
    });
  }
  const lead = await leerLeadDeSesion(sesion);
  if (!lead) {
    return new Response("Completa tu registro para descargar este archivo.", {
      status: 403,
      headers: sinCache,
    });
  }

  const { origen, nombre } = ARCHIVOS[archivo];
  // Ruta acotada a assets/ (Turbopack solo traza esa carpeta)
  const contenido = await readFile(path.join(process.cwd(), "assets", origen));
  return new Response(new Uint8Array(contenido), {
    headers: {
      ...sinCache,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Content-Length": String(contenido.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
