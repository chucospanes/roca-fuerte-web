import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CasaSinCargar } from "@/components/casas/CasaSinCargar";
import { DetalleCasa } from "@/components/casas/DetalleCasa";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { site } from "@/config/site";
import { catalogo } from "@/content/casas";
import { leerCasa } from "@/lib/casas";

/**
 * Detalle de una casa del catálogo. El 404 real de una casa que no existe lo da `proxy.ts`
 * ANTES de llegar aquí (dentro de la página saldría con 200, porque la respuesta ya empezó a
 * enviarse); el `notFound()` de abajo queda de respaldo (por ejemplo, una casa ocultada hace
 * segundos), con el `noindex` que agrega Next.
 * La casa se lee fuera de <Suspense> para que la metadata y el contenido salgan juntos; con
 * Partial Prefetching eso exige declarar que la página puede bloquear la navegación
 * (`instant = false`). El costo es poco: `leerCasa` está en caché de minutos.
 * Si Supabase falla, se muestra el aviso de que no se pudo cargar (con noindex).
 */
export const instant = false;

export default async function CasaPage({ params }: PageProps<"/casas/[slug]">) {
  const { slug } = await params;
  const resultado = await leerCasa(slug);
  if (resultado.ok && !resultado.datos) notFound();

  return (
    <>
      <Encabezado />
      <main className="bg-piedra-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          {resultado.ok && resultado.datos ? <DetalleCasa casa={resultado.datos} /> : <CasaSinCargar />}
        </div>
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}

export const metadata: Metadata = {
  title: `${catalogo.titulo} · ${site.marca}`,
};
