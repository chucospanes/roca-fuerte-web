import { esPendiente } from "@/config/site";
import { bonaire } from "@/content/bonaire";
import { Pendiente, Seccion } from "./ui";

function Valor({ valor }: { valor: string }) {
  return esPendiente(valor) ? <Pendiente /> : <>{valor}</>;
}

const todoPendiente = (mat: { especificacion: string; marca: string; porQue: string }) =>
  esPendiente(mat.especificacion) && esPendiente(mat.marca) && esPendiente(mat.porQue);

export function Materiales() {
  const materiales = bonaire.materiales;
  return (
    <Seccion
      id="materiales"
      numero="04"
      etiqueta="Especificaciones"
      titulo="Materiales y especificaciones"
      fondo="blanco"
      intro="Qué material se usa, con qué especificación, de qué marca y por qué. Lo que aún no está confirmado aparece como pendiente."
    >
      {/* Móvil: tarjetas */}
      <ul className="divide-y divide-piedra-200 rounded-lg border border-piedra-200 bg-blanco md:hidden">
        {materiales.map((mat) => (
          <li key={mat.material} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">{mat.material}</p>
                {"seEspecifica" in mat && mat.seEspecifica && (
                  <p className="text-sm text-piedra-500">{mat.seEspecifica}</p>
                )}
              </div>
              {todoPendiente(mat) && (
                <span className="shrink-0 pt-1">
                  <Pendiente />
                </span>
              )}
            </div>
            {!todoPendiente(mat) && (
            <dl className="mt-3 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-piedra-500">Especificación</dt>
              <dd>
                <Valor valor={mat.especificacion} />
              </dd>
              <dt className="text-piedra-500">Marca</dt>
              <dd>
                <Valor valor={mat.marca} />
              </dd>
              <dt className="text-piedra-500">Por qué</dt>
              <dd>
                <Valor valor={mat.porQue} />
              </dd>
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
              <th scope="col" className="px-4 py-3">Marca</th>
              <th scope="col" className="px-4 py-3">Por qué</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-piedra-200">
            {materiales.map((mat) => (
              <tr key={mat.material} className="align-top">
                <th scope="row" className="px-4 py-3 font-semibold">
                  {mat.material}
                  {"seEspecifica" in mat && mat.seEspecifica && (
                    <span className="block text-xs font-normal text-piedra-500">{mat.seEspecifica}</span>
                  )}
                </th>
                <td className="px-4 py-3">
                  <Valor valor={mat.especificacion} />
                </td>
                <td className="px-4 py-3">
                  <Valor valor={mat.marca} />
                </td>
                <td className="px-4 py-3">
                  <Valor valor={mat.porQue} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Seccion>
  );
}
