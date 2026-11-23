import { esPendiente, site, textoPrecio } from "@/config/site";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { SeccionConTitulo } from "./portada/ui";

const estiloTarjeta = "flex flex-col rounded-sm border border-line bg-surface-raised p-6 sm:p-8";

/** "Comprar una casa": solo sin proyecto en la portada, con el WhatsApp de comprar (`comprar`/`precios`). */
function TarjetaComprar() {
  return (
    <article className={`aparecer ${estiloTarjeta}`}>
      <h3 className="font-display text-2xl font-extrabold uppercase">Comprar una casa</h3>
      <p className="mt-3 text-ink-muted">
        Casas nuestras con el modelo estándar, construidas para vender con su terreno. Cada una con
        su ubicación, su lote, su precio y lo que incluye.
      </p>
      <div className="mt-auto pt-8">
        <BotonWhatsApp opcion="comprar" ubicacion="precios" className="w-full">
          Quiero esta casa
        </BotonWhatsApp>
      </div>
    </article>
  );
}

/** "Construir a pedido", con su clic `construir`/`precios`. `titulo`: false si la sección ya lo dice. */
function TarjetaConstruir({ titulo }: { titulo: boolean }) {
  const precio = site.precios.construirAPedido;
  // Sin el título de la tarjeta, las condiciones van justo después del h2 de la sección
  const Subtitulo = titulo ? "h4" : "h3";
  return (
    <article className={`aparecer ${estiloTarjeta}`}>
      {titulo && <h3 className="font-display text-2xl font-extrabold uppercase">Construir a pedido</h3>}
      <p className={`${titulo ? "mt-3" : ""} text-ink-muted`}>
        Una casa Esparta que se vende antes de construirse, en un terreno nuestro o en el tuyo, en{" "}
        {site.pais}, documentada etapa por etapa.
      </p>
      <p
        className={`mt-6 font-display text-[clamp(2rem,3.4vw,2.5rem)] leading-none font-black ${esPendiente(precio) ? "text-ink-muted" : ""}`}
      >
        {textoPrecio(precio)}
      </p>
      <Subtitulo className="mt-8 font-semibold">Condiciones del precio, si va en tu terreno</Subtitulo>
      <ul className="mt-2 space-y-1 text-ink-muted">
        {site.condicionesConstruccion.map((c) => (
          <li key={c}>— {c}</li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <BotonWhatsApp opcion="construir" ubicacion="precios" variante="secundario" className="w-full sm:w-auto">
          Construir a pedido
        </BotonWhatsApp>
      </div>
    </article>
  );
}

/**
 * Precios. Con proyecto en la portada, el precio de la casa vive solo en "Proyecto actual": aquí
 * queda únicamente "Construir a pedido". Sin proyecto (no hay casa disponible o Supabase no
 * respondió), vuelve la tarjeta de comprar como antes (decisión del usuario, 2026-11-23).
 */
export function Opciones({ conProyecto }: { conProyecto: boolean }) {
  return (
    <SeccionConTitulo
      tono="oscuro"
      id="opciones"
      etiqueta="Precios"
      titulo={conProyecto ? "Construir a pedido" : "Dos formas de tener tu casa"}
      intro="Cotización clara y cerrada antes de empezar."
    >
      {conProyecto ? (
        <div className="max-w-3xl">
          <TarjetaConstruir titulo={false} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <TarjetaComprar />
          <TarjetaConstruir titulo />
        </div>
      )}
    </SeccionConTitulo>
  );
}
