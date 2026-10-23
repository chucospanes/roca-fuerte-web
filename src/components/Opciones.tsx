import { esPendiente, site, textoPrecio, type Precio } from "@/config/site";
import { Boton, Pendiente, Seccion } from "./ui";

function Precio({ precio }: { precio: Precio }) {
  return (
    <p
      className={`font-display text-2xl font-extrabold ${esPendiente(precio) ? "text-piedra-500" : ""}`}
    >
      {textoPrecio(precio)}
    </p>
  );
}

export function Opciones() {
  return (
    <Seccion
      id="opciones"
      numero="05"
      etiqueta="Precios"
      titulo="Dos formas de tener tu Bonaire"
      intro="Publicamos el precio desde el inicio, para que decidas con la información completa."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <article className="flex flex-col rounded-lg border-2 border-piedra-900 bg-blanco p-6">
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-terracota uppercase">
            Opción 1
          </p>
          <h3 className="mt-1 font-display text-2xl font-extrabold">Comprar esta casa</h3>
          <p className="mt-2 text-piedra-600">
            La Casa Bonaire que estamos construyendo, con su terreno.
          </p>
          <div className="mt-5">
            <Precio precio={site.precios.comprarCasa} />
          </div>
          <h4 className="mt-6 font-semibold">Qué incluye</h4>
          <ul className="mt-2 space-y-1 text-piedra-700">
            <li>— La casa terminada.</li>
            <li>— El terreno donde está construida.</li>
            <li>
              — Ubicación del terreno: <Pendiente />
            </li>
            <li>
              — Detalle de lo incluido: <Pendiente />
            </li>
          </ul>
          <div className="mt-auto pt-6">
            <Boton href="#contacto" className="w-full">
              Quiero esta casa
            </Boton>
          </div>
        </article>

        <article className="flex flex-col rounded-lg border-2 border-piedra-200 bg-blanco p-6">
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-terracota uppercase">
            Opción 2
          </p>
          <h3 className="mt-1 font-display text-2xl font-extrabold">Construir en tu terreno</h3>
          <p className="mt-2 text-piedra-600">
            Construimos el modelo Bonaire en tu terreno, en {site.pais}, documentado etapa por etapa.
          </p>
          <div className="mt-5">
            <Precio precio={site.precios.construirEnTerreno} />
          </div>
          <h4 className="mt-6 font-semibold">Condiciones del precio</h4>
          <ul className="mt-2 space-y-1 text-piedra-700">
            {site.condicionesConstruccion.map((c) => (
              <li key={c}>— {c}</li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <Boton href="#contacto" variante="secundario" className="w-full">
              Construir Bonaire en mi terreno
            </Boton>
          </div>
        </article>
      </div>
    </Seccion>
  );
}
