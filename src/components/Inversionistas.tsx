import { SeccionConTitulo } from "./portada/ui";
import { inversionistas } from "@/content/inversionistas";
import { BotonWhatsApp } from "./BotonWhatsApp";

/** Servicio de construcción para inversionistas. No es una oferta de inversión (DECISIONES.md). */
export function Inversionistas() {
  return (
    <SeccionConTitulo
      tono="claro"
      id="inversionistas"
      etiqueta="Para inversionistas"
      titulo={inversionistas.titulo}
      intro={inversionistas.intro}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {inversionistas.queHacemos.map((b) => (
          <div key={b.titulo} className="rounded-sm border border-line bg-surface-raised p-6">
            <h3 className="font-display text-xl font-bold">{b.titulo}</h3>
            <p className="mt-2 text-ink-muted">{b.texto}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-display text-xl font-bold">Qué te damos</h3>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {inversionistas.propuesta.map((p, i) => (
          <li key={p.titulo} className="flex gap-4 py-4">
            <span className="font-display text-sm font-semibold text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-semibold">{p.titulo}</p>
              <p className="text-ink-muted">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 max-w-2xl rounded-sm border border-line bg-surface-raised p-4 text-sm text-ink-muted">
        {inversionistas.aclaracion}
      </p>

      <BotonWhatsApp opcion="inversionista" ubicacion="inversionistas" className="mt-6">
        {inversionistas.boton}
      </BotonWhatsApp>
    </SeccionConTitulo>
  );
}
