import { portada } from "@/content/portada";

/** Una vuelta del texto: cada punto seguido de su cuadro. */
function Vuelta({ oculta = false }: { oculta?: boolean }) {
  return (
    <ul aria-hidden={oculta || undefined} className="flex shrink-0 items-center">
      {portada.franja.puntos.map((p) => (
        <li key={p} className="flex items-center whitespace-nowrap">
          <span className="px-6 sm:px-8">{p}</span>
          <span aria-hidden className="block size-2.5 bg-blanco" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Franja en movimiento (5.3): fondo en el acento y texto blanco, en bucle continuo y lento. La
 * segunda vuelta solo cierra el bucle (`aria-hidden`); con "reducir movimiento" se queda quieta.
 */
export function Franja() {
  return (
    <section
      aria-label={portada.franja.etiqueta}
      className="tono-claro overflow-hidden bg-accent py-5 font-display text-lg font-extrabold tracking-[0.04em] text-blanco uppercase sm:py-6 sm:text-2xl"
    >
      <div className="franja-pista flex w-max">
        <Vuelta />
        <Vuelta oculta />
      </div>
    </section>
  );
}
