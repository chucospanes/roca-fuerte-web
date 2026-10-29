import { esparta } from "@/content/esparta";
import { ImagenAmpliable } from "./ImagenAmpliable";
import { Seccion } from "./ui";

const m2 = (n: number) => `${n.toFixed(2)} m²`;
const m = (n: number) => `${n.toFixed(2)} m`;

export function LaCasa() {
  return (
    <Seccion
      id="la-casa"
      numero="02"
      etiqueta="La casa"
      titulo="Modelo Esparta"
      intro={`${esparta.resumen} Pensada para aprovechar cada metro sin gastar en lo que no hace falta. El plano la muestra en un lote de ${m(esparta.lote.frenteM)} × ${m(esparta.lote.fondoM)}, con estacionamiento, jardín y patio.`}
      fondo="blanco"
    >
      <div className="grid gap-6 md:grid-cols-2 md:items-end">
        {[
          { ...esparta.plano, texto: "Planta en el lote — distribución y medidas" },
          esparta.fachada,
        ].map((img) => (
          <figure key={img.src}>
            <ImagenAmpliable
              src={img.src}
              alt={img.alt}
              ancho={img.ancho}
              alto={img.alto}
              sizes="(max-width: 768px) 100vw, 480px"
            />
            <figcaption className="mt-2 font-semibold text-piedra-800">{img.texto}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-3 text-sm text-piedra-600">{esparta.avisoPlanos}</p>

      {/* Lote, del frente al fondo */}
      <div className="mt-8">
        <h3 className="font-display text-xl font-bold">
          Lote de {m(esparta.lote.frenteM)} × {m(esparta.lote.fondoM)}, de la calle al fondo
        </h3>
        <ol className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-piedra-200 bg-piedra-200 sm:grid-cols-4">
          {esparta.lote.franjas.map((f) => (
            <li key={f.nombre} className="bg-blanco p-4">
              <p className="text-sm text-piedra-600">{f.nombre}</p>
              <p className="font-display text-2xl font-bold">{m(f.fondoM)}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.4fr]">
        {/* Cuadro de áreas */}
        <div className="rounded-lg bg-piedra-900 p-6 text-piedra-50">
          <h3 className="font-display text-sm font-semibold tracking-[0.15em] text-terracota-claro uppercase">
            Cuadro de áreas
          </h3>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-piedra-300">Área construida</dt>
              <dd className="font-display text-4xl font-extrabold">{m2(esparta.areas.construidaM2)}</dd>
            </div>
            <div>
              <dt className="text-piedra-300">Área útil</dt>
              <dd className="font-display text-4xl font-extrabold">{m2(esparta.areas.utilM2)}</dd>
            </div>
          </dl>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-piedra-700 pt-4 text-sm">
            <dt className="text-piedra-300">Cuerpo principal</dt>
            <dd>{esparta.volumetria.cuerpoPrincipal}</dd>
            <dt className="text-piedra-300">Extensión de sala</dt>
            <dd>{esparta.volumetria.extensionSala}</dd>
            <dt className="text-piedra-300">Muros</dt>
            <dd>{esparta.muros.sistema}</dd>
            <dt className="text-piedra-300">Exteriores</dt>
            <dd>{m(esparta.muros.exterioresM)}</dd>
            <dt className="text-piedra-300">Interiores</dt>
            <dd>{m(esparta.muros.interioresM)}</dd>
            <dt className="text-piedra-300">Techo</dt>
            <dd>
              {esparta.techo.cubierta}, {`${esparta.techo.pendientePct} %`}
            </dd>
            <dt className="text-piedra-300">Alero / cumbrera</dt>
            <dd>
              {m(esparta.techo.aleroM)} / {m(esparta.techo.cumbreraM)}
            </dd>
            <dt className="text-piedra-300">Pretil de fachada</dt>
            <dd>
              {m(esparta.pretil.altoM)} (hasta {m(esparta.pretil.hastaM)})
            </dd>
            <dt className="text-piedra-300">Corredor techado</dt>
            <dd>{m(esparta.corredor.fondoM)}</dd>
          </dl>
          <p className="mt-4 border-t border-piedra-700 pt-4 text-sm text-piedra-300">
            {esparta.implantacion} {esparta.techo.desague}
          </p>
          <p className="mt-4 border-t border-piedra-700 pt-4 text-sm text-piedra-300">
            <span className="font-semibold text-piedra-50">Fachada:</span> el pretil oculta el techo
            desde la calle. Acabados: {esparta.acabadosFachada.join(", ")}.
          </p>
        </div>

        {/* Ambientes */}
        <div>
          <h3 className="font-display text-xl font-bold">Ambientes</h3>
          <ul className="mt-4 divide-y divide-piedra-200 border-y border-piedra-200">
            {esparta.ambientes.map((a) => (
              <li key={a.nombre} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">{a.nombre}</p>
                  <p className="text-sm text-piedra-600">{a.notas.join(" ")}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display font-bold">{m2(a.areaM2)}</p>
                  <p className="text-sm text-piedra-600">{a.medidas}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-piedra-600">
            <span className="font-semibold text-piedra-800">Modelo económico, no incluye:</span>{" "}
            {esparta.noIncluye.join(", ").toLowerCase()}.
          </p>
        </div>
      </div>
    </Seccion>
  );
}
