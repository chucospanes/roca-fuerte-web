import { portada } from "@/content/portada";
import { SeccionPortada } from "./ui";

/** Quiénes somos (5.4): desarrolladores y constructores. Clara, con una tarjeta oscura y una clara. */
export function QuienesSomos() {
  const { quienes } = portada;
  return (
    <SeccionPortada id="nosotros" tono="claro">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <h2 className="titular titular-seccion aparecer">
          {quienes.titulo.map((linea) => (
            <span key={linea} className="block">
              {linea}
            </span>
          ))}
        </h2>
        <p className="max-w-[30rem] text-xl leading-relaxed text-ink-muted lg:pb-2">{quienes.texto}</p>
      </div>

      <ul className="mt-14 grid gap-4 md:grid-cols-2 md:gap-6">
        {quienes.tarjetas.map((t, i) => (
          <li
            key={t.numero}
            className={`aparecer flex flex-col rounded-sm p-7 sm:p-10 ${
              i === 0 ? "tono-oscuro bg-surface text-ink" : "border border-line bg-surface-raised"
            }`}
          >
            <h3 className="flex items-baseline gap-3 font-display text-[13px] font-bold tracking-[0.16em] uppercase">
              <span className="text-accent">{t.numero}</span>
              <span aria-hidden className="text-ink-muted">·</span>
              <span>{t.titulo}</span>
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">{t.texto}</p>
            <p className="mt-8 border-t border-line pt-5 text-lg font-bold">{t.remate}</p>
          </li>
        ))}
      </ul>
    </SeccionPortada>
  );
}
