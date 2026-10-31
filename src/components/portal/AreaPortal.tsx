import Link from "next/link";
import { connection } from "next/server";
import { Salir } from "@/components/premium/Salir";
import { estadosObra, fecha, modalidades } from "@/content/portal";
import { listarObras } from "@/lib/portal";
import { sesionVerificada } from "@/lib/supabase/servidor";
import { whatsappHref } from "@/lib/whatsapp";
import { AccesoPortal } from "./AccesoPortal";

/**
 * Inicio del portal. Lee la sesión en cada request (va dentro de <Suspense> en la página).
 * - Sin sesión: acceso con código.
 * - Con sesión: las obras donde el usuario es miembro (la RLS filtra).
 */
export async function AreaPortal() {
  // supabase-js compara el vencimiento de la sesión con la hora actual: con cacheComponents
  // esto debe esperar a una petición real (igual que el área premium)
  await connection();
  const sesion = await sesionVerificada();
  if (!sesion) return <AccesoPortal />;

  const obras = await listarObras();

  return (
    <div className="space-y-8">
      <p className="text-piedra-600">
        Entraste como <strong className="break-all text-piedra-800">{sesion.correo}</strong>.
      </p>

      {obras === null ? (
        <p role="alert" className="rounded-md border border-terracota/40 bg-terracota/5 p-4">
          No pudimos cargar tus obras. Vuelve a intentarlo en unos minutos.
        </p>
      ) : obras.length === 0 ? (
        <div className="rounded-lg border border-piedra-200 bg-blanco p-6">
          <p className="font-semibold">Este correo no tiene obras asignadas.</p>
          <p className="mt-2 text-piedra-600">
            Si eres cliente y no ves tu obra, escríbenos por WhatsApp y lo revisamos.
          </p>
          <a href={whatsappHref()} className="mt-3 inline-block font-semibold text-terracota underline-offset-4 hover:underline">
            Escribir por WhatsApp →
          </a>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {obras.map((o) => (
            <li key={o.id}>
              <Link
                href={`/portal/obras/${o.id}`}
                className="flex h-full flex-col rounded-lg border-2 border-piedra-900 bg-blanco p-5 hover:border-terracota"
              >
                <span className="text-sm font-semibold text-terracota">{modalidades[o.modalidad]}</span>
                <span className="mt-1 font-display text-xl font-bold">{o.nombre}</span>
                {o.ubicacion && <span className="text-piedra-600">{o.ubicacion}</span>}
                <span className="mt-3 text-sm text-piedra-700">
                  {estadosObra[o.estado]}
                  {fecha(o.fecha_inicio) && ` · desde el ${fecha(o.fecha_inicio)}`}
                </span>
                <span className="mt-3 font-semibold text-terracota">Ver el avance →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Salir />
    </div>
  );
}
