import { esparta } from "@/content/esparta";
import { ImagenAmpliable } from "./ImagenAmpliable";

const m2 = (n: number) => `${n.toFixed(2)} m²`;
const m = (n: number) => `${n.toFixed(2)} m`;

/**
 * El modelo Esparta en detalle (planos, lote, cuadro de áreas y ambientes). Desde la v2.0.0 vive en
 * la ficha de cada casa con la planta Esparta (`#la-casa`), no en la portada (decisión del
 * usuario, 2026-11-23).
 */
export function LaCasa() {
  return (
    <section id="la-casa" className="mt-12 scroll-mt-20 border-t border-line pt-10">
      <h2 className="font-display text-2xl font-extrabold">Modelo Esparta</h2>
      <p className="mt-2 max-w-2xl text-lg text-ink-muted">
        {`${esparta.resumen} Pensada para aprovechar cada metro sin gastar en lo que no hace falta. La casa está en un lote de ${m(esparta.lote.frenteM)} × ${m(esparta.lote.fondoM)}, con estacionamiento, jardín y patio.`}
      </p>
      <div className="mt-6">
      {/* Móvil: casa, lote, fachada. Escritorio: casa y fachada arriba, lote a todo el ancho abajo. */}
      <div className="grid gap-6 md:grid-cols-2 md:items-end">
        {[
          { ...esparta.planoCasa, anchoCompleto: false },
          { ...esparta.plano, anchoCompleto: true },
          { ...esparta.fachada, anchoCompleto: false },
        ].map((img) => (
          <figure key={img.src} className={img.anchoCompleto ? "md:order-last md:col-span-2" : undefined}>
            <ImagenAmpliable
              src={img.src}
              alt={img.alt}
              ancho={img.ancho}
              alto={img.alto}
              protegida={"protegida" in img && img.protegida}
              sizes={img.anchoCompleto ? "(max-width: 1024px) 100vw, 992px" : "(max-width: 768px) 100vw, 480px"}
            />
            <figcaption className="mt-2 font-semibold text-ink">{img.texto}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-muted">{esparta.avisoPlanos}</p>

      {/* Lote, del frente al fondo */}
      <div className="mt-8">
        <h3 className="font-display text-xl font-bold">
          Lote de {m(esparta.lote.frenteM)} × {m(esparta.lote.fondoM)}, de la calle al fondo
        </h3>
        <ol className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
          {esparta.lote.franjas.map((f) => (
            <li key={f.nombre} className="bg-surface-raised p-4">
              <p className="text-sm text-ink-muted">{f.nombre}</p>
              <p className="font-display text-2xl font-bold">{m(f.fondoM)}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.4fr]">
        {/* Cuadro de áreas */}
        <div className="rounded-sm tono-oscuro bg-surface p-6 text-ink">
          <h3 className="font-display text-sm font-semibold tracking-[0.15em] text-accent uppercase">
            Cuadro de áreas
          </h3>
          {/* Ficha técnica: el área va aquí, sin protagonismo (ver DECISIONES.md, 2026-11-12) */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-ink-muted">Área construida</dt>
            <dd className="font-display text-lg font-bold">{m2(esparta.areas.construidaM2)}</dd>
            <dt className="text-ink-muted">Área útil interior</dt>
            <dd className="font-display text-lg font-bold">{m2(esparta.areas.utilM2)}</dd>
          </dl>
          <p className="mt-2 text-sm text-ink-muted">
            La construida incluye el corredor techado de entrada ({m2(esparta.areas.corredorTechadoM2)}); la
            útil es el interior, sin el corredor. El estacionamiento no cuenta.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-sm">
            <dt className="text-ink-muted">Cuerpo principal</dt>
            <dd>{esparta.volumetria.cuerpoPrincipal}</dd>
            <dt className="text-ink-muted">Extensión de sala</dt>
            <dd>{esparta.volumetria.extensionSala}</dd>
            <dt className="text-ink-muted">Muros</dt>
            <dd>{esparta.muros.sistema}</dd>
            <dt className="text-ink-muted">Exteriores</dt>
            <dd>{m(esparta.muros.exterioresM)}</dd>
            <dt className="text-ink-muted">Interiores</dt>
            <dd>{m(esparta.muros.interioresM)}</dd>
            <dt className="text-ink-muted">Techo</dt>
            <dd>
              {esparta.techo.cubierta}
            </dd>
            <dt className="text-ink-muted">Alero / cumbrera</dt>
            <dd>
              {m(esparta.techo.aleroM)} / {m(esparta.techo.cumbreraM)}
            </dd>
            <dt className="text-ink-muted">Pretil de fachada</dt>
            <dd>
              {m(esparta.pretil.altoM)} (hasta {m(esparta.pretil.hastaM)})
            </dd>
            <dt className="text-ink-muted">Corredor techado</dt>
            <dd>
              {m(esparta.corredor.frenteM)} × {m(esparta.corredor.fondoM)}
            </dd>
          </dl>
          <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
            {esparta.implantacion} {esparta.techo.desague}
          </p>
          <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Fachada:</span> el pretil oculta el techo
            desde la calle. Acabados: {esparta.acabadosFachada.join(", ")}.
          </p>
        </div>

        {/* Ambientes */}
        <div>
          <h3 className="font-display text-xl font-bold">Ambientes</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {esparta.ambientes.map((a) => (
              <li key={a.nombre} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">{a.nombre}</p>
                  <p className="text-sm text-ink-muted">{a.notas.join(" ")}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display font-bold">{m2(a.areaM2)}</p>
                  <p className="text-sm text-ink-muted">{a.medidas}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Modelo económico, no incluye:</span>{" "}
            {esparta.noIncluye.join(", ").toLowerCase()}.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
