import Image from "next/image";
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { Boton } from "@/components/ui";
import { precioUSD } from "@/config/site";
import { loteCorto, muestraPrecio, resumenCasa } from "@/content/casas";
import { esparta } from "@/content/esparta";
import { mensajeVisita, portada } from "@/content/portada";
import type { EtapaCasa, Modalidad } from "@/lib/casas";
import type { Proyecto } from "@/lib/portada";
import { EncabezadoSeccion, SeccionPortada } from "./ui";

/** Resumen de la casa: una planta, dormitorios, baño y terreno (los de la planta Esparta o los de la casa). */
function resumen(casa: Proyecto["casa"]): string[] {
  // resumenCasa: ["Una planta" (solo planta Esparta), terreno]
  const partes = resumenCasa(casa);
  const planta = casa.planta_esparta ? partes[0] : null;
  const terreno = casa.planta_esparta ? partes.slice(1) : partes;
  const dormitorios = casa.planta_esparta ? esparta.dormitorios : casa.dormitorios;
  const banos = casa.planta_esparta ? esparta.banos : casa.banos;
  return [
    planta,
    dormitorios ? `${dormitorios} ${dormitorios === 1 ? "dormitorio" : "dormitorios"}` : null,
    banos ? `${banos} ${banos === 1 ? "baño" : "baños"}` : null,
    ...terreno,
  ].filter((x): x is string => Boolean(x));
}

/** Una modalidad de venta: la primera clara, la segunda oscura. Precio de la base o "A consultar". */
function TarjetaModalidad({ m, oscura, conPrecio }: { m: Modalidad; oscura: boolean; conPrecio: boolean }) {
  const lote = loteCorto(m);
  return (
    <li
      className={`aparecer flex flex-col rounded-sm p-6 ${oscura ? "tono-oscuro bg-surface text-ink" : "border border-line bg-surface-raised"}`}
    >
      <h3 className="font-display text-lg leading-tight font-bold">{m.nombre}</h3>
      <dl className="mt-4 space-y-2">
        <div>
          <dt className="text-sm text-ink-muted">{portada.proyecto.lote}</dt>
          <dd className="font-semibold">
            {lote.medidas} <span className="font-normal text-ink-muted">({lote.area})</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-muted">{portada.proyecto.estacionamientos}</dt>
          <dd className="font-semibold">{m.estacionamientos}</dd>
        </div>
      </dl>
      {conPrecio && (
        <p className="mt-6 font-display text-[clamp(2.25rem,4vw,2.75rem)] leading-none font-black tracking-[-0.02em]">
          {m.precio_usd !== null ? precioUSD(m.precio_usd) : portada.proyecto.sinPrecio}
        </p>
      )}
      {m.detalles.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-ink-muted">
          {m.detalles.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      {m.nota && <p className="mt-4 border-t border-line pt-3 text-sm text-ink-muted">{m.nota}</p>}
    </li>
  );
}

const barras: Record<EtapaCasa["estado"], string> = {
  terminada: "bg-ink",
  en_proceso: "bg-accent",
  por_iniciar: "bg-line",
};

/** Línea de avance: las etapas de la base en orden, cada una con su barra de 8 px. */
function LineaAvance({ etapas }: { etapas: EtapaCasa[] }) {
  return (
    <div className="mt-16 border-t border-line pt-10">
      <h3 className="font-display text-[13px] font-bold tracking-[0.16em] uppercase">{portada.proyecto.avance}</h3>
      <ol className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4 lg:grid-cols-8">
        {etapas.map((e) => (
          <li key={e.id} aria-current={e.estado === "en_proceso" ? "step" : undefined}>
            <span aria-hidden className={`block h-2 ${barras[e.estado]}`} />
            <p className={`mt-3 leading-snug font-semibold ${e.estado === "en_proceso" ? "text-accent" : ""}`}>
              {e.nombre}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-muted">{portada.proyecto.estados[e.estado]}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Proyecto actual (5.6): la casa en obra, con sus modalidades y su avance desde la base. Los
 * botones: "Ver la casa" (enlace, no cuenta) y "Agendar visita a la obra" (`comprar`/`hero`,
 * heredero del "Quiero esta casa" del hero anterior; ver DECISIONES.md, 2026-11-23).
 */
export function ProyectoActual({ proyecto }: { proyecto: Proyecto }) {
  const { casa, etapas } = proyecto;
  const { proyecto: textos } = portada;
  const conPrecio = muestraPrecio(casa.estado);

  return (
    <SeccionPortada id="proyectos" tono="claro">
      <EncabezadoSeccion
        etiqueta={textos.etiqueta}
        titulo={`Casa Modelo ${casa.modelo}`}
        lado={<p className="font-display text-2xl leading-tight font-bold text-ink sm:text-3xl">{textos.lema}</p>}
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <figure>
          <div className="foto-marco relative aspect-[16/10] rounded-lg bg-surface-raised">
            <Image
              src={textos.imagen.src}
              alt={textos.imagen.alt}
              fill
              sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 52vw, 100vw"
              quality={60}
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-sm font-semibold text-ink-muted">{textos.imagen.rotulo}</figcaption>
        </figure>

        <div>
          <ul className="grid grid-cols-2 gap-px border border-line bg-line font-semibold">
            {resumen(casa).map((r) => (
              <li key={r} className="bg-surface px-4 py-3">
                {r}
              </li>
            ))}
          </ul>

          {casa.modalidades.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {casa.modalidades.map((m, i) => (
                <TarjetaModalidad key={m.id} m={m} oscura={i % 2 === 1} conPrecio={conPrecio} />
              ))}
            </ul>
          )}

          <p className="mt-6 text-lg font-semibold">{textos.pagos}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Boton href={`/casas/${casa.slug}`}>{textos.verCasa}</Boton>
            <BotonWhatsApp
              opcion="comprar"
              ubicacion="hero"
              mensaje={mensajeVisita(casa.nombre, casa.municipio)}
              variante="secundario"
            >
              {textos.agendar}
            </BotonWhatsApp>
          </div>
        </div>
      </div>

      {etapas.length > 0 && <LineaAvance etapas={etapas} />}
    </SeccionPortada>
  );
}
