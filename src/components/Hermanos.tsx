import type { CSSProperties } from "react";
import { hermanos } from "@/content/hermanos";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { MapaHermanos, POSICION_EL_SALVADOR } from "./MapaHermanos";
import { Seccion } from "./ui";

/**
 * "Hermano cercano": salvadoreños en el exterior (ver DECISIONES.md, 2026-11-05). El mapa
 * (decorativo) nunca queda detrás del texto, para no restarle contraste: en escritorio ocupa la
 * columna derecha; en el celular es una franja entre el subtítulo y los puntos, más ancha que la
 * pantalla y corrida para que El Salvador quede al centro (se recortan los extremos, no las
 * líneas que llegan).
 */
export function Hermanos() {
  const { titulo } = hermanos;
  // Celular: mapa al 250 % del ancho de la franja, corrido para centrar El Salvador
  const posicionMovil = { "--mapa-izq": `${(50 - 250 * POSICION_EL_SALVADOR).toFixed(1)}%` } as CSSProperties;

  return (
    <Seccion
      id="hermanos"
      numerada
      fondo="blanco"
      etiqueta={hermanos.etiqueta}
      titulo={
        <>
          {titulo.inicio}{" "}
          {/* El lector de pantalla lee solo "Hermano cercano." */}
          <span aria-hidden="true">
            <s className="font-bold text-piedra-500 decoration-terracota decoration-[3px]">{titulo.tachado}</s>{" "}
          </span>
          <span className="text-terracota">{titulo.destacado}</span>.
        </>
      }
      intro={<p>{hermanos.subtitulo}</p>}
    >
      <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center md:gap-10">
        <div
          aria-hidden="true"
          style={posicionMovil}
          className="pointer-events-none relative -mx-4 -mt-4 mb-8 h-56 overflow-hidden md:order-last md:m-0 md:h-auto md:overflow-visible"
        >
          <MapaHermanos className="absolute top-1/2 left-[var(--mapa-izq)] w-[250%] max-w-none -translate-y-1/2 md:static md:w-full md:translate-y-0" />
        </div>
        <div>
          <ol className="space-y-7">
            {hermanos.puntos.map((p, i) => (
              <li key={p.titulo}>
                <span className="font-display text-sm font-semibold text-terracota">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-1 font-display text-xl font-bold">{p.titulo}</h3>
                <p className="mt-1 text-piedra-700">{p.texto}</p>
              </li>
            ))}
          </ol>
          <BotonWhatsApp opcion="general" ubicacion="hermanos" mensaje={hermanos.mensaje} className="mt-10">
            {hermanos.boton}
          </BotonWhatsApp>
        </div>
      </div>
    </Seccion>
  );
}
