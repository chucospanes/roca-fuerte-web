import { calidad } from "@/content/landing";
import { hayBitacora } from "@/lib/casas";
import { PuntosNumerados, Seccion } from "./ui";

/** Sin casa en obra no hay bitácora: el enlace "Ver la bitácora" no se muestra. */
export async function Calidad() {
  const conBitacora = await hayBitacora();
  const puntos = conBitacora
    ? calidad
    : calidad.map(({ enlace, ...p }) => (enlace?.href === "#bitacora" ? p : { ...p, enlace }));
  return (
    <Seccion
      id="calidad"
      numerada
      etiqueta="Estándares técnicos"
      titulo="Calidad y resistencia"
      intro="No te pedimos que confíes en adjetivos. Te mostramos cómo se controla cada etapa y con qué materiales se construye, para que lo compruebes tú."
    >
      <PuntosNumerados puntos={puntos} />
    </Seccion>
  );
}
