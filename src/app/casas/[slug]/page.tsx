import type { Metadata } from "next";
import { Suspense } from "react";
import { DetalleCasa } from "@/components/casas/DetalleCasa";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { site } from "@/config/site";
import { catalogo } from "@/content/casas";

export const metadata: Metadata = {
  title: `${catalogo.titulo} · ${site.marca}`,
};

/** Detalle de una casa del catálogo. `params` se lee dentro de <Suspense> (cacheComponents). */
export default function CasaPage({ params }: PageProps<"/casas/[slug]">) {
  return (
    <>
      <Encabezado />
      <main className="bg-piedra-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
            <DetalleCasa params={params} />
          </Suspense>
        </div>
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
