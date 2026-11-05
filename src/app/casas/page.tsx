import type { Metadata } from "next";
import { TarjetaCasa, TarjetaVendida } from "@/components/casas/TarjetaCasa";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { Seccion } from "@/components/ui";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { site } from "@/config/site";
import { catalogo } from "@/content/casas";
import { listarCasas, listarVendidas } from "@/lib/casas";

export const metadata: Metadata = {
  title: `${catalogo.titulo} · ${site.marca}`,
  description: `Casas construidas por ${site.marca} a la venta en ${site.pais}, con su ubicación, su lote y su precio.`,
  alternates: { canonical: "/casas" },
  // Sin `robots` propio: hereda el del layout (interruptor de lanzamiento)
};

/**
 * Catálogo de casas en venta. Los datos se leen de Supabase con caché de minutos (lib/casas.ts).
 * Las vendidas no se ven (011): al final, solo su tarjeta mínima (modelo y departamento).
 */
export default async function CasasPage() {
  const [resultado, vendidas] = await Promise.all([listarCasas(), listarVendidas()]);
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
              {/* Si no cargó, que esta versión de la página no se indexe (React sube el <meta>) */}
              {!resultado.ok && <meta name="robots" content="noindex, nofollow" />}
              <p className="max-w-xl text-lg">{resultado.ok ? catalogo.vacio : catalogo.error}</p>
              <BotonWhatsApp opcion="general" ubicacion="catalogo" className="mt-5">
                Escribir por WhatsApp
              </BotonWhatsApp>
            </div>
          )}
          {vendidas.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-2xl font-extrabold">{catalogo.vendidas.titulo}</h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vendidas.map((c, i) => (
                  <TarjetaVendida key={`${c.modelo}-${c.departamento}-${i}`} casa={c} />
                ))}
              </ul>
            </div>
          )}
        </Seccion>
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
