import { SeccionConTitulo } from "./portada/ui";
import { esPendiente } from "@/config/site";
import { preguntas } from "@/content/landing";
import { Pendiente } from "./ui";

export function Preguntas() {
  return (
    <SeccionConTitulo tono="elevado" id="preguntas" etiqueta="Dudas" titulo="Preguntas frecuentes">
      <div className="divide-y divide-line border-y border-line">
        {preguntas.map((p) => (
          <details key={p.pregunta} className="group py-1">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-3 font-semibold">
              {p.pregunta}
              <span
                aria-hidden
                className="font-display text-2xl leading-none text-accent transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="pb-4 text-ink-muted">
              {esPendiente(p.respuesta) ? <Pendiente texto="Respuesta pendiente" /> : p.respuesta}
            </div>
          </details>
        ))}
      </div>
    </SeccionConTitulo>
  );
}
