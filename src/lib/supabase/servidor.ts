import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "./entorno";

/**
 * Cliente de Supabase con la sesión del visitante (cookies), para Server Components,
 * Server Actions y Route Handlers. Usa la clave publishable, no la secreta.
 * Crear uno nuevo en cada request: no reutilizar entre requests.
 */
export async function crearClienteServidor() {
  const almacen = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(aEscribir) {
        try {
          for (const { name, value, options } of aEscribir) {
            almacen.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies. No pasa nada: `src/proxy.ts`
          // renueva la sesión antes de que la página se renderice.
        }
      },
    },
  });
}

/** Sesión verificada del visitante (firma del token comprobada), o `null`. */
export type SesionVerificada = { userId: string; correo: string };

/**
 * Lee y verifica la sesión con `getClaims()`. Nunca usar `getSession()` en el servidor para
 * decidir permisos: la cookie se puede falsificar. El correo que devuelve es el único que
 * se usa para escribir en `leads`.
 */
export async function sesionVerificada(): Promise<SesionVerificada | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const { sub, email } = data.claims;
  if (typeof sub !== "string" || typeof email !== "string" || !email) return null;
  return { userId: sub, correo: email.toLowerCase() };
}
