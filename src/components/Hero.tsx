import Image from "next/image";
import { mensajeInformacion, portada } from "@/content/portada";
import { etapaEnCurso, leerProyecto } from "@/lib/portada";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { Cimiento, contenedor, Etiqueta } from "./portada/ui";
import { Boton } from "./ui";

/** La foto real de la obra (bastones y fundación) que ya usaba la portada: es el LCP. */
const foto = {
  src: "/hero/obra-sjv-bastones.jpg",
  alt: "Bastones de varilla de hierro anclados a la fundación, donde se levantarán las paredes",
  /** En vertical se centra en los bastones y la zanja. */
  posicion: "65% 50%",
};

/**
 * Portada de la v2.0.0 (docs/REDISENO_PORTADA.md, 5.2): oscura, con la cuadrícula de plano. Con
 * proyecto, el botón principal es "Escríbenos por WhatsApp" (`comprar`/`hero`, el mismo de
 * "Proyecto actual") y el secundario baja a #proyectos. Sin proyecto (no hay casa disponible o
 * Supabase no respondió), queda solo el WhatsApp de comprar (`comprar`/`hero`), la regla de antes. La tarjeta sobre la foto
 * sale de la base: el lugar de la casa y su etapa en proceso.
 */
export async function Hero() {
  const proyecto = await leerProyecto();
  const { hero } = portada;
  const etapa = proyecto ? etapaEnCurso(proyecto.etapas) : null;
  const enObra = proyecto?.casa.estado === "en_construccion";

  return (
    <section id="inicio" className="tono-oscuro cuadricula-plano bg-surface text-ink">
      <div
        className={`${contenedor} grid gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center lg:gap-12 lg:py-24 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:gap-14`}
      >
        <div className="min-w-0">
          <Etiqueta>{hero.etiqueta}</Etiqueta>
          <h1 className="titular titular-portada mt-6">
            {hero.titulo.inicio} <span className="text-accent">{hero.titulo.destacado}</span>
          </h1>
          <Cimiento className="mt-8 sm:mt-10" />
          <p className="mt-8 max-w-[36rem] text-lg leading-relaxed text-ink-muted sm:text-xl">{hero.texto}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {proyecto ? (
              <>
                <BotonWhatsApp opcion="comprar" ubicacion="hero" mensaje={mensajeInformacion(proyecto.casa.modelo)}>
                  {hero.whatsapp}
                </BotonWhatsApp>
                <Boton href="#proyectos" variante="secundario">
                  {hero.verProyecto}
                </Boton>
              </>
            ) : (
              <BotonWhatsApp opcion="comprar" ubicacion="hero">
                {hero.sinProyecto}
              </BotonWhatsApp>
            )}
          </div>
        </div>

        <figure className="relative aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-lg bg-surface-raised lg:max-w-none">
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            sizes="(min-width: 1280px) 26rem, (min-width: 1024px) 22rem, (min-width: 480px) 28rem, 100vw"
            quality={60}
            loading="eager"
            fetchPriority="high"
            className="object-cover"
            style={{ objectPosition: foto.posicion }}
          />
          {proyecto && (
            <figcaption className="tono-claro absolute right-4 bottom-4 left-4 rounded-sm border-l-[6px] border-accent bg-surface-raised px-5 py-4 text-ink sm:right-auto sm:min-w-[16rem]">
              {enObra && <Etiqueta className="text-[12px]">{hero.tarjeta.etiqueta}</Etiqueta>}
              <p className="mt-1 font-display text-xl font-extrabold uppercase leading-tight">
                {proyecto.casa.distrito}
              </p>
              {etapa && (
                <p className="mt-1 text-ink-muted">
                  {hero.tarjeta.etapa}: <span className="font-semibold text-ink">{etapa}</span>
                </p>
              )}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
