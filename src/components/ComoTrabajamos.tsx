import { pasos } from "@/content/landing";
import { Seccion } from "./ui";

export function ComoTrabajamos() {
  return (
    <Seccion
      id="proceso"
      numerada
      etiqueta="Proceso"
      titulo="Cómo trabajamos"
      fondo="oscuro"
    >
      <ol className="grid gap-px overflow-hidden rounded-lg bg-piedra-700 sm:grid-cols-2 lg:grid-cols-3">
        {pasos.map((paso, i) => (
          <li key={paso.titulo} className="flex gap-4 bg-piedra-900 p-5 sm:block sm:p-6">
            <span className="w-8 shrink-0 font-display text-3xl leading-none font-extrabold text-terracota sm:text-4xl">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold sm:mt-2">{paso.titulo}</h3>
              <p className="mt-1 text-piedra-300">{paso.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </Seccion>
  );
}
