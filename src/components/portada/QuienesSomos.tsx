import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { site } from "@/config/site";
import { portada } from "@/content/portada";
import { SeccionPortada } from "./ui";

const tarjeta = "aparecer flex flex-col rounded-sm p-7 sm:p-10";

/** Encabezado de una tarjeta: "01 · Desarrolladores". */
function TituloTarjeta({ numero, titulo }: { numero?: string; titulo: string }) {
  return (
    <h3 className="flex items-baseline gap-3 font-display text-[13px] font-bold tracking-[0.16em] uppercase">
      {numero && (
        <>
          <span className="text-accent">{numero}</span>
          <span aria-hidden className="text-ink-muted">
            ·
          </span>
        </>
      )}
      <span>{titulo}</span>
    </h3>
  );
}

/**
 * Quiénes somos (5.4): desarrolladores y constructores. La tarjeta 02 lleva las condiciones del
 * terreno y "Construir a pedido" (`construir`/`precios`), que antes estaban en Precios. Sin casa
 * disponible, se suma la tarjeta de comprar (`comprar`/`precios`), la regla de antes (decisión
 * del usuario, 2026-11-23).
 */
export function QuienesSomos({ conProyecto }: { conProyecto: boolean }) {
  const { quienes } = portada;
  const [desarrolladores, constructores] = quienes.tarjetas;
  return (
    <SeccionPortada id="nosotros" tono="claro">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <h2 className="titular titular-seccion aparecer">
          {quienes.titulo.map((linea) => (
            <span key={linea} className="block">
              {linea}
            </span>
          ))}
        </h2>
        <p className="max-w-[30rem] text-xl leading-relaxed text-ink-muted lg:pb-2">{quienes.texto}</p>
      </div>

      <ul className={`mt-14 grid gap-4 md:gap-6 ${conProyecto ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        <li className={`${tarjeta} tono-oscuro bg-surface text-ink`}>
          <TituloTarjeta numero={desarrolladores.numero} titulo={desarrolladores.titulo} />
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">{desarrolladores.texto}</p>
          <p className="mt-8 border-t border-line pt-5 text-lg font-bold">{desarrolladores.remate}</p>
        </li>

        <li className={`${tarjeta} border border-line bg-surface-raised`}>
          <TituloTarjeta numero={constructores.numero} titulo={constructores.titulo} />
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">{constructores.texto}</p>
          <h4 className="mt-6 font-semibold">Condiciones del precio, si va en tu terreno</h4>
          <ul className="mt-2 space-y-1 text-ink-muted">
            {site.condicionesConstruccion.map((c) => (
              <li key={c}>— {c}</li>
            ))}
          </ul>
          <p className="mt-8 border-t border-line pt-5 text-lg font-bold">{constructores.remate}</p>
          <div className="mt-auto pt-6">
            <BotonWhatsApp opcion="construir" ubicacion="precios" variante="secundario" className="w-full sm:w-auto">
              Construir a pedido
            </BotonWhatsApp>
          </div>
        </li>

        {!conProyecto && (
          <li className={`${tarjeta} border border-line bg-surface-raised md:col-span-2 xl:col-span-1`}>
            <TituloTarjeta titulo="Comprar una casa" />
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              Casas nuestras con el modelo estándar, construidas para vender con su terreno. Cada
              una con su ubicación, su lote, su precio y lo que incluye.
            </p>
            <div className="mt-auto pt-6">
              <BotonWhatsApp opcion="comprar" ubicacion="precios" className="w-full sm:w-auto">
                Quiero esta casa
              </BotonWhatsApp>
            </div>
          </li>
        )}
      </ul>
    </SeccionPortada>
  );
}
