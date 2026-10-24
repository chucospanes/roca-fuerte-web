/**
 * Cliente de Supabase para componentes de cliente. Usa la clave publishable: solo sirve para
 * pedir y verificar el código de acceso (Auth). Con RLS sin políticas no puede leer ni
 * escribir `leads`. La sesión queda en cookies para que el servidor la lea.
 *
 * Se pide el código desde el navegador para que los límites por IP de Supabase apliquen a
 * cada visitante y no a la IP del servidor (ver DECISIONES.md).
 */

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./entorno";

export function crearClienteNavegador() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}
