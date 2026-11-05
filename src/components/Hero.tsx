import Image from "next/image";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { esparta } from "@/content/esparta";
import { heroPantallas } from "@/content/landing";
import { casasDisponibles, destinoCompra, hayBitacora } from "@/lib/casas";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { CarruselHero } from "./CarruselHero";
import { Boton } from "./ui";

const fondos = {
  foto: "bg-piedra-900",
  oscuro: "cuadricula-clara bg-piedra-900",
  terracota: "cuadricula-clara bg-terracota",
};

/**
 * Una pantalla del hero: foto real de la obra de fondo (con un velo para leer el texto) o un
 * color de la marca. La foto de la primera pantalla carga de inmediato y con prioridad alta.
 */
function Pantalla({
  foto,
  fondo = "terracota",
  primera = false,
  children,
}: {
  foto?: { src: string; alt: string };
  fondo?: "oscuro" | "terracota";
  primera?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative flex min-h-[34rem] items-end sm:min-h-[36rem] md:items-center ${fondos[foto ? "foto" : fondo]}`}
    >
      {foto && (
        <>
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            sizes="100vw"
            quality={60}
            {...(primera ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-piedra-900/95 via-piedra-900/75 to-piedra-900/30 md:bg-gradient-to-r md:from-piedra-900/90 md:via-piedra-900/70 md:to-piedra-900/10"
          />
        </>
      )}
      <div className="relative mx-auto w-full max-w-5xl px-4 pt-16 pb-28 text-blanco md:py-24">
        <div className="max-w-xl">{children}</div>
      </div>
    </div>
  );
}

const estiloTitulo =
  "font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl";
const estiloSubtitulo = "mt-3 font-display text-2xl font-bold text-terracota-claro sm:text-3xl";

/**
 * Hero en 3 pantallas, avance solo manual (ver DECISIONES.md, 2026-11-03). Botón de la
 * primera: con casas disponibles, al catálogo (o a la casa, si hay una sola). Sin casas o si
 * Supabase no responde, el WhatsApp de comprar: la acción principal nunca lleva a un catálogo
 * vacío.
 */
export async function Hero() {
  const [disponibles, conBitacora] = await Promise.all([casasDisponibles(), hayBitacora()]);
  const destino = disponibles && disponibles.length > 0 ? destinoCompra(disponibles) : null;
  const { reforzada, documentada, hogar } = heroPantallas;

  return (
    <section
      id="inicio"
      aria-roledescription="carrusel"
      aria-label="Presentación"
      className="border-b border-piedra-200"
    >
      <CarruselHero
        etiquetas={[reforzada.titulo, documentada.titulo, hogar.titulo]}
      >
        <Pantalla foto={reforzada.foto} primera>
          {/* cada dato no se parte entre líneas */}
          <p className="flex flex-wrap gap-x-2 font-display text-sm font-semibold tracking-[0.15em] text-terracota-claro uppercase">
            <span className="whitespace-nowrap">{site.modelo}</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{esparta.dormitorios} dormitorios</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{esparta.areas.construidaM2.toFixed(2)} m²</span>
          </p>
          <h1 className={`mt-4 ${estiloTitulo}`}>{reforzada.titulo}</h1>
          <p className={estiloSubtitulo}>{reforzada.subtitulo}</p>
          <div className="mt-8">
            {destino ? (
              <Boton href={destino.href}>{destino.texto}</Boton>
            ) : (
              <BotonWhatsApp opcion="comprar" ubicacion="hero">
                Quiero esta casa
              </BotonWhatsApp>
            )}
          </div>
        </Pantalla>

        <Pantalla fondo="oscuro">
          <h2 className={estiloTitulo}>{documentada.titulo}</h2>
          <p className={estiloSubtitulo}>{documentada.subtitulo}</p>
          {/* Sin casa en obra no hay bitácora: la pantalla queda sin botón */}
          {conBitacora && (
            <div className="mt-8">
              <Boton href={documentada.boton.href}>{documentada.boton.texto}</Boton>
            </div>
          )}
        </Pantalla>

        <Pantalla>
          <h2 className={estiloTitulo}>{hogar.titulo}</h2>
          <p className="mt-3 font-display text-2xl font-bold text-blanco/90 sm:text-3xl">
            {hogar.subtitulo}
          </p>
          <div className="mt-8">
            <BotonWhatsApp opcion="construir" ubicacion="hero" variante="claro">
              {hogar.boton}
            </BotonWhatsApp>
          </div>
        </Pantalla>
      </CarruselHero>
    </section>
  );
}
