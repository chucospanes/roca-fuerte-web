import { site } from "@/config/site";
import { BotonWhatsApp } from "./BotonWhatsApp";
import { Boton, Seccion } from "./ui";

export function Contacto() {
  return (
    <Seccion
      id="contacto"
      numero="10"
      etiqueta="Contacto"
      titulo="Cuéntanos qué buscas"
      intro="Elige una opción y se abre WhatsApp con el mensaje listo. No tienes que registrarte."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <BotonWhatsApp opcion="general" ubicacion="contacto">Quiero más información</BotonWhatsApp>
        <BotonWhatsApp opcion="construir" ubicacion="contacto" variante="secundario">
          Construir a pedido
        </BotonWhatsApp>
      </div>

      {site.accesoPremium && (
        <div className="mt-10 rounded-lg border border-piedra-200 bg-blanco p-6">
          <h3 className="font-display text-xl font-bold">Ficha técnica y planos en PDF</h3>
          <p className="mt-2 max-w-2xl text-piedra-600">
            Planos imprimibles, ficha técnica completa, cantidades de materiales y el
            desglose de qué incluye el precio. Te pedimos tu correo y te enviamos un código para
            darte acceso.
          </p>
          <Boton href="/esparta/ficha" variante="secundario" className="mt-4">
            Ver la ficha técnica
          </Boton>
        </div>
      )}
    </Seccion>
  );
}
