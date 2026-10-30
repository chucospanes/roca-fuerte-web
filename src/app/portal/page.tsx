import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoSimple } from "@/components/EncabezadoSimple";
import { AreaPortal } from "@/components/portal/AreaPortal";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Acceso clientes · ${site.marca}`,
  description: `Portal privado de los clientes de ${site.marca}: el avance de su obra.`,
  // Privado: noindex aquí y X-Robots-Tag en next.config.ts, sin Disallow (DECISIONES.md)
  robots: { index: false, follow: false },
};

/** Portal de clientes. Apagado (`site.portalClientes`), responde 404. */
export default function PortalPage() {
  if (!site.portalClientes) notFound();

  return (
    <>
      <EncabezadoSimple />
      <main className="bg-piedra-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-terracota uppercase">
            Acceso clientes
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            El avance de tu obra
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-piedra-600">
            Etapas, fotos, videos, materiales y documentos de tu obra. Solo tú ves la tuya.
          </p>
          <div className="mt-10">
            <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
              <AreaPortal />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
