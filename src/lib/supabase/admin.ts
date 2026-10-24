import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requerida, supabaseUrl } from "./entorno";
import type { BaseDeDatos } from "./tipos";

/**
 * Cliente con la clave secreta (`sb_secret_...`): salta RLS. SOLO SERVIDOR.
 * `import "server-only"` hace fallar el build si algún componente de cliente lo importa.
 * Usarlo solo después de verificar la sesión, y nunca con datos de identidad que vengan
 * del formulario (el correo sale siempre de `sesionVerificada()`).
 */
export function crearClienteAdmin() {
  const clave = requerida("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);

  return createClient<BaseDeDatos>(supabaseUrl(), clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
