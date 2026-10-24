import { calidad } from "@/content/landing";
import { PuntosNumerados, Seccion } from "./ui";

export function Calidad() {
  return (
    <Seccion
      id="calidad"
      numero="03"
      etiqueta="Estándares técnicos"
      titulo="Calidad y resistencia"
      intro="No te pedimos que confíes en adjetivos. Te mostramos con qué norma se diseña, quién firma el plano y cómo se controla cada etapa, para que lo compruebes tú."
    >
      <PuntosNumerados puntos={calidad} />
    </Seccion>
  );
}
