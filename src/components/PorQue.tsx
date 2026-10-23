import { porQue } from "@/content/landing";
import { Seccion } from "./ui";

export function PorQue() {
  return (
    <Seccion
      id="por-que"
      numero="01"
      etiqueta="Transparencia"
      titulo="Por qué construimos así"
      intro="Construir en El Salvador no debería ser un acto de fe. Por eso la obra se muestra completa, no solo el resultado."
    >
      <ul className="grid gap-px overflow-hidden rounded-lg border border-piedra-200 bg-piedra-200 sm:grid-cols-2">
        {porQue.map((p, i) => (
          <li key={p.titulo} className="bg-blanco p-6">
            <span className="font-display text-sm font-semibold text-terracota">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-1 font-display text-xl font-bold">{p.titulo}</h3>
            <p className="mt-2 text-piedra-600">{p.texto}</p>
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
