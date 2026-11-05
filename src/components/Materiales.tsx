import { esPendiente } from "@/config/site";
import { esparta } from "@/content/esparta";
import { Pendiente, Seccion } from "./ui";

/** Lo no confirmado sale como "Por confirmar": se llena conforme se compran los materiales. */
function Valor({ valor }: { valor: string }) {
  return esPendiente(valor) ? <Pendiente texto="Por confirmar" /> : <>{valor}</>;
}

// La columna "Por qué" está oculta hasta tener las razones (decisión del 2026-11-04); el dato
// sigue en `esparta.materiales` (`porQue`).

export function Materiales() {
  const materiales = esparta.materiales;
  return (
    <Seccion
      id="materiales"
      numerada
      etiqueta="Especificaciones"
      titulo="Materiales y especificaciones"
      fondo="blanco"
      intro="Qué material se usa y con qué especificación. Lo que aún no está confirmado aparece como «Por confirmar» y se llena conforme se compran los materiales."
    >
      {/* Móvil: tarjetas */}
      <ul className="divide-y divide-piedra-200 rounded-lg border border-piedra-200 bg-blanco md:hidden">
        {materiales.map((mat) => (
          <li key={mat.material} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">{mat.material}</p>
                {"seEspecifica" in mat && mat.seEspecifica && (
                  <p className="text-sm text-piedra-600">{mat.seEspecifica}</p>
                )}
              </div>
              {esPendiente(mat.especificacion) && (
                <span className="shrink-0 pt-1">
                  <Pendiente texto="Por confirmar" />
                </span>
              )}
            </div>
            {!esPendiente(mat.especificacion) && (
              <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-piedra-600">Especificación</dt>
                <dd>{mat.especificacion}</dd>
              </dl>
            )}
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-lg border border-piedra-200 bg-blanco md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-piedra-100 font-display text-xs tracking-wider text-piedra-700 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Material</th>
              <th scope="col" className="px-4 py-3">Especificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-piedra-200">
            {materiales.map((mat) => (
              <tr key={mat.material} className="align-top">
                <th scope="row" className="px-4 py-3 font-semibold">
                  {mat.material}
                  {"seEspecifica" in mat && mat.seEspecifica && (
                    <span className="block text-xs font-normal text-piedra-600">{mat.seEspecifica}</span>
                  )}
                </th>
                <td className="px-4 py-3">
                  <Valor valor={mat.especificacion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Seccion>
  );
}
