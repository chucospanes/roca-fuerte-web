import { porQue } from "@/content/landing";
import { PuntosNumerados, Seccion } from "./ui";

export function PorQue() {
  return (
    <Seccion
      id="por-que"
      numero="01"
      etiqueta="Calidad y comunidad"
      titulo="Por qué construimos así"
      intro="Construir en El Salvador no debería ser un acto de fe. Por eso la obra se muestra completa, no solo el resultado."
    >
      <h3 className="font-display text-2xl font-extrabold">{porQue.calidad.titulo}</h3>
      <div className="mt-4">
        <PuntosNumerados puntos={porQue.calidad.puntos} columnas={3} encabezado="h4" />
      </div>

      <div className="mt-10 rounded-lg border border-piedra-200 bg-blanco p-6">
        <h3 className="font-display text-sm font-semibold tracking-[0.15em] text-terracota uppercase">
          {porQue.comunidad.titulo}
        </h3>
        <p className="mt-2 font-display text-xl font-bold">{porQue.comunidad.texto}</p>
      </div>
    </Seccion>
  );
}
