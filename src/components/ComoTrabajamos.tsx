import { portada } from "@/content/portada";
import { SeccionPortada, TituloSeccion } from "./portada/ui";

/** Así trabajamos (5.8): oscura sobre #2e3133, cuatro pasos en orden, cada uno con su línea de 4 px. */
export function ComoTrabajamos() {
  const { proceso } = portada;
  return (
    <SeccionPortada id="proceso" tono="grafito">
      <TituloSeccion>{proceso.titulo}</TituloSeccion>
      {/* Celular: 2 × 2, más compacto. Desde 1024 px, los 4 en fila. */}
      <ol className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-14 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
        {proceso.pasos.map((paso, i) => (
          <li key={paso.titulo} className="aparecer border-t-4 border-cemento pt-4 sm:pt-6">
            <span aria-hidden className="block font-display text-4xl leading-none font-black text-accent sm:text-6xl">
              {i + 1}
            </span>
            <h3 className="mt-3 font-display text-base leading-tight font-extrabold uppercase sm:mt-6 sm:text-xl">
              {paso.titulo}
            </h3>
            <p className="mt-2 text-[15px] leading-snug text-ink-muted sm:mt-3 sm:text-base sm:leading-relaxed">{paso.texto}</p>
          </li>
        ))}
      </ol>
    </SeccionPortada>
  );
}
