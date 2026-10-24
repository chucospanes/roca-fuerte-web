import { porQue } from "@/content/landing";
import { PuntosNumerados, Seccion } from "./ui";

export function PorQue() {
  return (
    <Seccion
      id="por-que"
      numero="01"
      etiqueta="Transparencia"
      titulo="Por qué construimos así"
      intro="Construir en El Salvador no debería ser un acto de fe. Por eso la obra se muestra completa, no solo el resultado."
    >
      <PuntosNumerados puntos={porQue} />
    </Seccion>
  );
}
