import { esPendiente } from "@/config/site";
import { esparta } from "@/content/esparta";

// La columna "Por qué" está oculta hasta tener las razones (decisión del 2026-11-04); el dato
// sigue en `esparta.materiales` (`porQue`).

/**
 * Materiales del modelo Esparta, en la ficha de cada casa con esa planta, debajo de "Modelo
 * Esparta" (decisión del usuario, 2026-11-23). Solo las filas con especificación confirmada: las
 * "Por confirmar" no se muestran al público. Sin ninguna confirmada, la sección no aparece.
 */
export function Materiales() {
  const materiales = esparta.materiales.filter((mat) => !esPendiente(mat.especificacion));
  if (materiales.length === 0) return null;
  return (
    <section id="materiales" className="mt-12 scroll-mt-20">
      <h2 className="font-display text-2xl font-extrabold">Materiales y especificaciones</h2>
      <p className="mt-2 max-w-2xl text-lg text-ink-muted">Qué material se usa y con qué especificación.</p>

      <ul className="mt-6 divide-y divide-line rounded-sm border border-line bg-surface-raised">
        {materiales.map((mat) => (
          <li key={mat.material} className="grid gap-1 p-4 md:grid-cols-[16rem_1fr] md:gap-6">
            <div>
              <p className="font-display text-lg font-bold">{mat.material}</p>
              {"seEspecifica" in mat && mat.seEspecifica && (
                <p className="text-sm text-ink-muted">{mat.seEspecifica}</p>
              )}
            </div>
            <p>{mat.especificacion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
