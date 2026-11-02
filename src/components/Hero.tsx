import { site } from "@/config/site";
import { esparta } from "@/content/esparta";
import { hero } from "@/content/landing";
import { casasDisponibles, destinoCompra } from "@/lib/casas";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { Boton, Pendiente } from "./ui";

/**
 * Botón principal: con casas disponibles, al catálogo (o a la casa, si hay una sola). Sin casas
 * o si Supabase no responde, el WhatsApp de comprar: la acción principal nunca lleva a un
 * catálogo vacío.
 */
export async function Hero() {
  const disponibles = await casasDisponibles();
  const destino = disponibles && disponibles.length > 0 ? destinoCompra(disponibles) : null;

  return (
    <section id="inicio" className="fondo-plano border-b border-piedra-200">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:py-16 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          {/* cada dato no se parte entre líneas */}
          <p className="flex flex-wrap gap-x-2 font-display text-sm font-semibold tracking-[0.15em] text-terracota uppercase">
            <span className="whitespace-nowrap">{site.modelo}</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{esparta.dormitorios} dormitorios</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{esparta.areas.construidaM2.toFixed(2)} m²</span>
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">
            {hero.titulo}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-piedra-700">{hero.bajada}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {destino ? (
              <Boton href={destino.href}>{destino.texto}</Boton>
            ) : (
              <BotonWhatsApp opcion="comprar" ubicacion="hero">
                Quiero esta casa
              </BotonWhatsApp>
            )}
            <BotonWhatsApp opcion="construir" ubicacion="hero" variante="secundario">
              Construir Esparta en mi terreno
            </BotonWhatsApp>
          </div>
        </div>

        {/* Espacio para el video o la foto principal de la obra */}
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-piedra-300 bg-blanco/70 md:aspect-[4/5] md:max-h-[28rem]">
          <div className="px-6 text-center">
            <Pendiente texto="Video de la obra pendiente" />
            <p className="mt-3 text-sm text-piedra-600">
              Aquí irá el video o la foto principal de la Casa Esparta en construcción.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
