import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CasaSinCargar } from "@/components/casas/CasaSinCargar";
import { DatosCasa } from "@/components/casas/DatosCasa";
import { DetalleCasa } from "@/components/casas/DetalleCasa";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { site } from "@/config/site";
import { catalogo, muestraPrecio, textoPrecioCasa, ubicacionCasa } from "@/content/casas";
import { leerCasa, precioDesde } from "@/lib/casas";

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
          {resultado.ok && resultado.datos ? (
            <>
              <DatosCasa casa={resultado.datos} />
              <DetalleCasa casa={resultado.datos} />
            </>
          ) : (
            <CasaSinCargar />
          )}
        </div>
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}

/**
 * Metadata de cada casa (lee la misma `leerCasa`, en caché). Sin casa o con error: noindex
 * siempre, también con el sitio lanzado. Con casa: hereda el `robots` del layout (interruptor
 * de lanzamiento) y comparte la foto de portada.
 */
export async function generateMetadata({ params }: PageProps<"/casas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const resultado = await leerCasa(slug);
  if (!resultado.ok || !resultado.datos) {
    return { title: `${catalogo.titulo} · ${site.marca}`, robots: { index: false, follow: false } };
  }
  const casa = resultado.datos;
  const titulo = `${casa.nombre} · ${casa.municipio} · ${site.marca}`;
  const desde = muestraPrecio(casa.estado) ? precioDesde(casa.modalidades) : null;
  const precio = desde ? ` Precio: ${textoPrecioCasa(desde).replace(/^Desde/, "desde")}.` : "";
  // Lote: el menor de sus modalidades ("desde" si hay varias); sin modalidades, no se menciona
  const lotes = casa.modalidades.map((m) => m.lote_m2);
  const lote =
    lotes.length === 0
      ? ""
      : `, en un lote ${lotes.length > 1 ? "desde " : "de "}${Math.min(...lotes).toFixed(2)} m²`;
  const descripcion = casa.descripcion ?? `Casa en venta en ${ubicacionCasa(casa, true)}${lote}.${precio}`;
  const ruta = `/casas/${casa.slug}`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      locale: "es_SV",
      siteName: site.marca,
      url: ruta,
      title: titulo,
      description: descripcion,
      // Sin foto de portada, la imagen general del sitio (`app/opengraph-image.tsx`): definir
      // `openGraph` aquí reemplaza la del layout
      images: casa.portada
        ? [
            {
              url: casa.portada.url,
              width: casa.portada.ancho,
              height: casa.portada.alto,
              alt: casa.portada.alt,
            },
          ]
        : ["/opengraph-image"],
    },
  };
}
