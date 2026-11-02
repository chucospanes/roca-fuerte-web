import { esPendiente, site, textoPrecio, type Precio } from "@/config/site";
import { casasDisponibles, destinoCompra } from "@/lib/casas";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { Boton, Seccion } from "./ui";

function Precio({ precio }: { precio: Precio }) {
  return (
    <p
      className={`font-display text-2xl font-extrabold ${esPendiente(precio) ? "text-piedra-600" : ""}`}
    >
      {textoPrecio(precio)}
    </p>
  );
}

/**
 * "Comprar una casa" no tiene datos propios: lleva al catálogo, o directo a la casa si hay una
 * sola disponible (las vendidas no cuentan). Precio, ubicación y qué incluye viven en cada casa.
 */
export async function Opciones() {
  const destino = destinoCompra((await casasDisponibles()) ?? []);

  return (
    <Seccion
      id="opciones"
      numero="06"
      etiqueta="Precios"
      fondo="blanco"
      titulo="Dos formas de tener tu casa"
      intro="Publicamos el precio desde el inicio, para que decidas con la información completa."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <article className="flex flex-col rounded-lg border-2 border-piedra-900 bg-blanco p-6">
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-terracota uppercase">
            Opción 1
          </p>
          <h3 className="mt-1 font-display text-2xl font-extrabold">Comprar una casa</h3>
          <p className="mt-2 text-piedra-600">
            Casas que construimos para vender, con su terreno. Cada una con su ubicación, su lote,
            su precio y lo que incluye.
          </p>
          <div className="mt-auto pt-6">
            <Boton href={destino.href} className="w-full">
              {destino.texto}
            </Boton>
          </div>
        </article>

        <article className="flex flex-col rounded-lg border-2 border-piedra-200 bg-blanco p-6">
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-terracota uppercase">
            Opción 2
          </p>
          <h3 className="mt-1 font-display text-2xl font-extrabold">Construir en tu terreno</h3>
          <p className="mt-2 text-piedra-600">
            Construimos el modelo Esparta en tu terreno, en {site.pais}, documentado etapa por etapa.
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
            <BotonWhatsApp opcion="construir" ubicacion="precios" variante="secundario" className="w-full">
              Construir Esparta en mi terreno
            </BotonWhatsApp>
          </div>
        </article>
      </div>
    </Seccion>
  );
}
