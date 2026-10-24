import { connection } from "next/server";
import { leerLeadDeSesion } from "@/lib/leads";
import { sesionVerificada } from "@/lib/supabase/servidor";
import { Calificacion } from "./Calificacion";
import { ContenidoPremium } from "./ContenidoPremium";
import { Desbloqueo } from "./Desbloqueo";
import { Salir } from "./Salir";

/**
 * Lee la sesión en cada request (por eso va dentro de <Suspense> en la página).
 * - Sin sesión: paso 1 (datos + código).
 * - Con sesión pero sin registro: paso 1 sin código (faltan nombre y WhatsApp).
 * - Con registro: contenido premium + paso 2 opcional precargado.
 */
export async function AreaPremium() {
  // La verificación de la sesión compara su vencimiento con la hora actual (`Date.now()`
  // dentro de supabase-js). Con cacheComponents eso no puede ocurrir al prerenderizar:
  // `connection()` hace que esta parte espere siempre a una petición real.
  await connection();
  const sesion = await sesionVerificada();
  if (!sesion) return <Desbloqueo />;

  const lead = await leerLeadDeSesion(sesion);
  if (!lead) return <Desbloqueo correoVerificado={sesion.correo} />;

  return (
    <div className="space-y-12">
      <ContenidoPremium />
      <section className="border-t border-piedra-200 pt-8">
        <h2 className="font-display text-2xl font-extrabold">¿Te interesa? Cuéntanos un poco más</h2>
        <p className="mt-2 max-w-2xl text-piedra-600">
          Opcional. Con esto te respondemos con información que sirva para tu caso.
        </p>
        <div className="mt-6">
          <Calificacion inicial={lead} />
        </div>
      </section>
      <Salir />
    </div>
  );
}
