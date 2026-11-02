import type { Metadata } from "next";
import { TarjetaCasa } from "@/components/casas/TarjetaCasa";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { Boton, Seccion } from "@/components/ui";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { site } from "@/config/site";
import { catalogo } from "@/content/casas";
import { listarCasas } from "@/lib/casas";
import { mensajesVenta, whatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: `${catalogo.titulo} · ${site.marca}`,
  description: `Casas construidas por ${site.marca} a la venta en ${site.pais}, con su ubicación, su lote y su precio.`,
  alternates: { canonical: "/casas" },
  // Sin `robots` propio: hereda el del layout (interruptor de lanzamiento)
};

/** Catálogo de casas en venta. Los datos se leen de Supabase con caché de minutos (lib/casas.ts). */
export default async function CasasPage() {
  const resultado = await listarCasas();
  const casas = resultado.ok ? resultado.datos : [];

  return (
    <>
      <Encabezado />
      <main>
        <Seccion id="casas" etiqueta="Catálogo" titulo={catalogo.titulo} intro={catalogo.intro}>
          {casas.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {casas.map((c) => (
                <TarjetaCasa key={c.id} casa={c} />
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-piedra-200 bg-blanco p-6">
              <p className="max-w-xl text-lg">{resultado.ok ? catalogo.vacio : catalogo.error}</p>
              <Boton href={whatsappHref(mensajesVenta.general)} externo className="mt-5">
                Escribir por WhatsApp
              </Boton>
            </div>
          )}
        </Seccion>
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
