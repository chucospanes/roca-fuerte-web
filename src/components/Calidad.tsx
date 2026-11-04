import { calidad } from "@/content/landing";
import { PuntosNumerados, Seccion } from "./ui";

export function Calidad() {
  return (
    <Seccion
      id="calidad"
      numero="03"
      etiqueta="Estándares técnicos"
      titulo="Calidad y resistencia"
      intro="No te pedimos que confíes en adjetivos. Te mostramos cómo se controla cada etapa y con qué materiales se construye, para que lo compruebes tú."
    >
      <PuntosNumerados puntos={calidad} />
    </Seccion>
  );
}
