import Link from "next/link";
import { CambiarEtapa } from "@/components/admin/CambiarEtapa";
import { PublicacionAvance } from "@/components/admin/PublicacionAvance";
import { estadosObra, fecha, modalidades } from "@/content/portal";
import type { CasaLigada, ObraAdmin, ObraAdminDetalle } from "@/lib/admin";

/**
 * Vistas del panel /admin. Reciben los datos ya leídos (lib/admin.ts) y no consultan nada:
 * las páginas leen con la sesión y las dibujan.
 */

const tarjeta = "rounded-lg border-2 border-piedra-900 bg-blanco p-5";
const accionGrande =
  "flex min-h-14 w-full items-center justify-center rounded-md bg-terracota px-5 font-display text-lg font-semibold text-blanco hover:bg-terracota-oscuro";

/** Qué más cambia al cambiar una etapa de esta obra. */
export function alcanceCasa(casa: CasaLigada | null): string {
  if (!casa) return "Cambia solo el portal: esta obra no está ligada a una casa del catálogo.";
  if (casa.estado === "vendida") return "Casa vendida: cambia solo el portal (la casa ya no se ve en lo público).";
  return `También cambia en la bitácora pública de «${casa.nombre}».`;
}

export function ListaObrasAdmin({ obras }: { obras: ObraAdmin[] }) {
  if (obras.length === 0) return <p className="text-piedra-700">Todavía no hay obras cargadas.</p>;
  return (
    <ul className="space-y-4">
      {obras.map((o) => (
        <li key={o.id}>
          <Link href={`/admin/obras/${o.id}`} className={`block ${tarjeta} hover:border-terracota`}>
            <span className="text-sm font-semibold text-terracota">{modalidades[o.modalidad]}</span>
            <span className="mt-1 block font-display text-xl leading-snug font-bold">{o.nombre}</span>
            <span className="mt-2 block text-sm text-piedra-700">
              {estadosObra[o.estado]}
              {o.etapaEnProceso && ` · En proceso: ${o.etapaEnProceso}`}
            </span>
            {o.casa && (
              <span className="mt-1 block text-sm text-piedra-600">Casa del catálogo: {o.casa.nombre}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function VistaObraAdmin({ detalle, hoy }: { detalle: ObraAdminDetalle; hoy: string }) {
  const { obra, casa, etapas, avances } = detalle;
  const nombreEtapa = new Map(etapas.map((e) => [e.id, e.nombre]));
  const alcance = alcanceCasa(casa);
  // Botón grande solo en la etapa en proceso y en la siguiente por iniciar: menos ruido y
  // menos riesgo de iniciar la etapa equivocada con un toque. Las demás, con "Corregir".
  const siguiente = etapas.find((e) => e.estado === "por_iniciar");

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm font-semibold text-terracota">
          ← Obras
        </Link>
        <p className="mt-2 text-sm font-semibold text-terracota">{modalidades[obra.modalidad]}</p>
        <h1 className="mt-1 font-display text-2xl leading-tight font-extrabold">{obra.nombre}</h1>
        <p className="mt-2 text-sm text-piedra-700">
          {casa
            ? casa.estado === "vendida"
              ? `Casa del catálogo: ${casa.nombre} (vendida: no se ve en lo público).`
              : `Ligada a la casa del catálogo «${casa.nombre}» ✓`
            : "Sin casa del catálogo ligada."}
        </p>
        <Link href={`/admin/obras/${obra.id}/avance`} className={`${accionGrande} mt-5`}>
          + Nuevo avance
        </Link>
      </div>

      <section>
        <h2 className="font-display text-xl font-extrabold">Etapas</h2>
        <p className="mt-1 text-sm text-piedra-600">{alcance}</p>
        {etapas.length === 0 ? (
          <p className="mt-3 text-piedra-700">Esta obra no tiene etapas cargadas.</p>
        ) : (
          <ol className="mt-2 divide-y divide-piedra-200 border-y border-piedra-200">
            {etapas.map((e) => (
              <CambiarEtapa
                key={e.id}
                etapa={e}
                hoy={hoy}
                alcance={alcance}
                conAccion={e.estado === "en_proceso" || e.id === siguiente?.id}
              />
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold">Avances recientes</h2>
        {avances.length === 0 ? (
          <p className="mt-3 text-piedra-700">Todavía no hay avances.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {avances.map((a) => (
              <li key={a.id} className="rounded-md border border-piedra-200 bg-blanco p-4">
                <p className="text-sm text-piedra-600">
                  {fecha(a.fecha)}
                  {a.etapa_id && nombreEtapa.get(a.etapa_id) && ` · ${nombreEtapa.get(a.etapa_id)}`}
                </p>
                <p className="font-semibold">{a.titulo}</p>
                <p className="text-sm text-piedra-700">
                  {a.fotos.length === 0 ? "Sin fotos" : `${a.fotos.length} ${a.fotos.length === 1 ? "foto" : "fotos"}`}
                  {a.video_url && " · con video"}
                </p>
                <Link
                  href={`/admin/obras/${obra.id}/avances/${a.id}`}
                  className="mt-2 inline-flex min-h-11 items-center font-semibold text-terracota"
                >
                  Agregar fotos →
                </Link>
                {casa && (
                  <PublicacionAvance
                    avanceId={a.id}
                    fotos={a.fotos.length}
                    publicacion={a.publicacion}
                    casa={{ nombre: casa.nombre, vendida: casa.estado === "vendida" }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
