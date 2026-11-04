"use client";

import { Children, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const sinSuscripcion = () => () => {};

/**
 * Carrusel del hero, avance solo manual: deslizar (scroll-snap nativo del navegador), flechas,
 * puntos y las flechas del teclado. Sin avance automático.
 *
 * Sin JavaScript se sigue pudiendo deslizar y todas las pantallas son usables. Ya hidratado,
 * las pantallas que no se ven quedan `inert` (no se enfocan ni las lee el lector de pantalla)
 * y la pista avisa el cambio de pantalla (`aria-live="polite"`).
 */
export function CarruselHero({ etiquetas, children }: { etiquetas: string[]; children: ReactNode }) {
  const pista = useRef<HTMLUListElement>(null);
  const [actual, setActual] = useState(0);
  const hidratado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const pantallas = Children.toArray(children);
  const total = pantallas.length;

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let cuadro = 0;
    const alDesplazar = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => setActual(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      el.removeEventListener("scroll", alDesplazar);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  /** El desplazamiento suave lo pone el CSS (`motion-safe`), así respeta "reducir movimiento". */
  function ir(i: number) {
    const el = pista.current;
    if (!el) return;
    const destino = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: destino * el.clientWidth });
    setActual(destino);
  }

  const flecha =
    "flex size-11 items-center justify-center rounded-full border-2 border-blanco/80 bg-piedra-900/40 text-blanco transition-colors hover:bg-piedra-900/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blanco disabled:opacity-40";

  return (
    <div
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") ir(actual - 1);
        else if (e.key === "ArrowRight") ir(actual + 1);
      }}
    >
      <ul
        ref={pista}
        aria-live="polite"
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden"
      >
        {pantallas.map((pantalla, i) => (
          <li
            key={i}
            role="group"
            aria-roledescription="pantalla"
            aria-label={`${i + 1} de ${total}: ${etiquetas[i]}`}
            inert={hidratado && i !== actual}
            className="w-full shrink-0 snap-start snap-always"
          >
            {pantalla}
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-4">
        <button
          type="button"
          className={flecha}
          onClick={() => ir(actual - 1)}
          disabled={hidratado && actual === 0}
          aria-label="Pantalla anterior"
        >
          <span aria-hidden className="text-xl leading-none">‹</span>
        </button>
        <div className="flex items-center">
          {pantallas.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ir a la pantalla ${i + 1}: ${etiquetas[i]}`}
              aria-current={i === actual ? "true" : undefined}
              className="flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-blanco"
            >
              <span
                aria-hidden
                className={`block h-2.5 rounded-full transition-all ${i === actual ? "w-7 bg-blanco" : "w-2.5 bg-blanco/50"}`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          className={flecha}
          onClick={() => ir(actual + 1)}
          disabled={hidratado && actual === total - 1}
          aria-label="Pantalla siguiente"
        >
          <span aria-hidden className="text-xl leading-none">›</span>
        </button>
      </div>
    </div>
  );
}
