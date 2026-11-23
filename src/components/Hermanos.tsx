import type { CSSProperties } from "react";
import { hermanos } from "@/content/hermanos";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { MapaHermanos, POSICION_EL_SALVADOR } from "./MapaHermanos";
import { Etiqueta, SeccionPortada } from "./portada/ui";

/**
 * "Hermano cercano" (5.9): salvadoreños en el exterior. Oscura con la cuadrícula; conserva el mapa
 * con las líneas punteadas y el clic `general`/`hermanos` con su mensaje. El mapa (decorativo)
 * nunca queda detrás del texto: en escritorio va a la derecha, sobre la tabla; en el celular es
 * una franja corrida para que El Salvador quede al centro.
 */
export function Hermanos() {
  const { titulo } = hermanos;
  // Celular: mapa al 250 % del ancho de la franja, corrido para centrar El Salvador
  const posicionMovil = { "--mapa-izq": `${(50 - 250 * POSICION_EL_SALVADOR).toFixed(1)}%` } as CSSProperties;

  return (
    <SeccionPortada id="hermano" tono="oscuro" cuadricula>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        <div>
          <Etiqueta>{hermanos.etiqueta}</Etiqueta>
          <h2 className="titular titular-seccion aparecer mt-4">
            {titulo.inicio}{" "}
            {/* El lector de pantalla lee solo "Hermano cercano." */}
            <span aria-hidden="true">
              <s className="text-ink-muted decoration-accent decoration-[0.09em]">{titulo.tachado}</s>{" "}
            </span>
            {titulo.destacado}.
          </h2>
          <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-ink-muted sm:text-xl">{hermanos.texto}</p>
        </div>

        <div>
          <div
            aria-hidden="true"
            style={posicionMovil}
            className="pointer-events-none relative -mx-4 h-48 overflow-hidden sm:-mx-6 lg:mx-0 lg:h-auto lg:overflow-visible"
          >
            <MapaHermanos className="absolute top-1/2 left-[var(--mapa-izq)] w-[250%] max-w-none -translate-y-1/2 lg:static lg:w-full lg:translate-y-0" />
          </div>
          <dl className="mt-6 border-t border-line">
            {hermanos.tabla.map((f) => (
              <div key={f.dato} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 border-b border-line py-4">
                <dt className="text-ink-muted">{f.dato}</dt>
                <dd className="font-display text-lg font-bold uppercase">{f.valor}</dd>
              </div>
            ))}
          </dl>
          <BotonWhatsApp
            opcion="general"
            ubicacion="hermanos"
            mensaje={hermanos.mensaje}
            className="mt-8 w-full sm:w-auto"
          >
            {hermanos.boton}
          </BotonWhatsApp>
        </div>
      </div>
    </SeccionPortada>
  );
}
