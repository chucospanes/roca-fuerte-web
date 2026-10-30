import { esPendiente } from "@/config/site";
import { preguntas } from "@/content/landing";
import { Pendiente, Seccion } from "./ui";

export function Preguntas() {
  return (
    <Seccion id="preguntas" numero="09" etiqueta="Dudas" titulo="Preguntas frecuentes" fondo="blanco">
      <div className="divide-y divide-piedra-200 border-y border-piedra-200">
        {preguntas.map((p) => (
          <details key={p.pregunta} className="group py-1">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-3 font-semibold">
              {p.pregunta}
              <span
                aria-hidden
                className="font-display text-2xl leading-none text-terracota transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="pb-4 text-piedra-700">
              {esPendiente(p.respuesta) ? <Pendiente texto="Respuesta pendiente" /> : p.respuesta}
            </div>
          </details>
        ))}
      </div>
    </Seccion>
  );
}
