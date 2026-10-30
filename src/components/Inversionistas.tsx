import { inversionistas } from "@/content/inversionistas";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { Seccion } from "./ui";

/** Servicio de construcción para inversionistas. No es una oferta de inversión (DECISIONES.md). */
export function Inversionistas() {
  return (
    <Seccion
      id="inversionistas"
      numero="07"
      etiqueta="Para inversionistas"
      titulo={inversionistas.titulo}
      intro={inversionistas.intro}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {inversionistas.queHacemos.map((b) => (
          <div key={b.titulo} className="rounded-lg border-2 border-piedra-900 bg-blanco p-6">
            <h3 className="font-display text-xl font-bold">{b.titulo}</h3>
            <p className="mt-2 text-piedra-600">{b.texto}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-display text-xl font-bold">Qué te damos</h3>
      <ol className="mt-4 divide-y divide-piedra-200 border-y border-piedra-200">
        {inversionistas.propuesta.map((p, i) => (
          <li key={p.titulo} className="flex gap-4 py-4">
            <span className="font-display text-sm font-semibold text-terracota">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-semibold">{p.titulo}</p>
              <p className="text-piedra-600">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 max-w-2xl rounded-md border border-piedra-300 bg-blanco p-4 text-sm text-piedra-700">
        {inversionistas.aclaracion}
      </p>

      <BotonWhatsApp opcion="inversionista" ubicacion="inversionistas" className="mt-6">
        {inversionistas.boton}
      </BotonWhatsApp>
    </Seccion>
  );
}
