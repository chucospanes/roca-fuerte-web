import { notFound } from "next/navigation";
import { connection } from "next/server";
import { esAdmin } from "@/lib/admin";
import { sesionVerificada, type SesionVerificada } from "@/lib/supabase/servidor";

/**
 * Revisión de cada página de /admin (además del 404 del proxy): sesión verificada y
 * `es_admin()` en la base. Sin sesión devuelve `null` (la página muestra el acceso o manda a
 * /admin); con sesión de alguien que no es administrador, 404 (`notFound()`, sin atraparlo).
 * Si la base no responde, `"error"`: la página muestra "no se pudo cargar" y no enseña nada.
 */
export async function sesionAdmin(): Promise<SesionVerificada | null | "error"> {
  // supabase-js compara el vencimiento de la sesión con la hora: espera a una petición real
  await connection();
  const sesion = await sesionVerificada();
  if (!sesion) return null;
  const admin = await esAdmin();
  if (admin === null) return "error";
  if (!admin) notFound();
  return sesion;
}

export function ErrorCarga() {
  return (
    <p role="alert" className="rounded-md border border-terracota/40 bg-terracota/5 p-4">
      No se pudo cargar. Revisa la conexión y vuelve a intentarlo.
    </p>
  );
}
