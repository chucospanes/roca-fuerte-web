import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoSimple } from "@/components/EncabezadoSimple";
import { DetalleObra } from "@/components/portal/DetalleObra";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Tu obra · ${site.marca}`,
  robots: { index: false, follow: false },
};

/** Detalle de una obra del portal. `params` se lee dentro de <Suspense> (cacheComponents). */
export default function ObraPage({ params }: PageProps<"/portal/obras/[id]">) {
  if (!site.portalClientes) notFound();

  return (
    <>
      <EncabezadoSimple />
      <main className="bg-piedra-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
            <DetalleObra params={params} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
