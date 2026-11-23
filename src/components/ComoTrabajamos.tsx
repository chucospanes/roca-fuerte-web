import { portada } from "@/content/portada";
import { SeccionPortada, TituloSeccion } from "./portada/ui";

/** Así trabajamos (5.8): oscura sobre #2e3133, cuatro pasos en orden, cada uno con su línea de 4 px. */
export function ComoTrabajamos() {
  const { proceso } = portada;
  return (
    <SeccionPortada id="proceso" tono="grafito">
      <TituloSeccion>{proceso.titulo}</TituloSeccion>
      <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {proceso.pasos.map((paso, i) => (
          <li key={paso.titulo} className="aparecer border-t-4 border-cemento pt-6">
            <span aria-hidden className="block font-display text-6xl leading-none font-black text-accent">
              {i + 1}
            </span>
            <h3 className="mt-6 font-display text-xl leading-tight font-extrabold uppercase">{paso.titulo}</h3>
            <p className="mt-3 leading-relaxed text-ink-muted">{paso.texto}</p>
          </li>
        ))}
      </ol>
    </SeccionPortada>
  );
}
