import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import { Boton } from "@/components/ui";
import { catalogo } from "@/content/casas";

/**
 * Supabase no respondió al leer la casa. Sale con 200 (la respuesta ya empezó a enviarse),
 * por eso lleva noindex: React sube el <meta> al <head>.
 */
export function CasaSinCargar() {
  return (
    <div>
      <meta name="robots" content="noindex, nofollow" />
      <h1 className="font-display text-3xl font-extrabold">No pudimos cargar esta casa</h1>
      <p className="mt-3 max-w-xl text-lg text-piedra-700">{catalogo.error}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <BotonWhatsApp opcion="general" ubicacion="catalogo">
          Escribir por WhatsApp
        </BotonWhatsApp>
        <Boton href="/casas" variante="secundario">
          {catalogo.verTodas}
        </Boton>
      </div>
    </div>
  );
}
