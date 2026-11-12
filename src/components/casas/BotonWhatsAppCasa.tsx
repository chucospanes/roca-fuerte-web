import { Boton } from "@/components/ui";
import { mensajeCasa, mensajeModalidad, whatsappHref } from "@/lib/whatsapp";
import type { DetalleCasa, Modalidad } from "@/lib/casas";

/**
 * Botón de WhatsApp de una casa del catálogo: el mensaje nombra la casa y el conteo de clics
 * lleva su id (`data-casa`; /api/clic revisa que sea de una casa publicada). Con `modalidad`, el
 * mensaje dice cuál le interesa y el clic lleva también su id (`data-modalidad`).
 */
export function BotonWhatsAppCasa({
  casa,
  modalidad,
  texto = "Quiero esta casa",
  variante,
  className,
}: {
  casa: Pick<DetalleCasa, "id" | "nombre" | "municipio">;
  modalidad?: { modalidad: Pick<Modalidad, "id" | "nombre">; lote: string };
  texto?: string;
  variante?: "primario" | "secundario";
  className?: string;
}) {
  const mensaje = modalidad
    ? mensajeModalidad(casa.nombre, casa.municipio, modalidad.modalidad.nombre, modalidad.lote)
    : mensajeCasa(casa.nombre, casa.municipio);
  return (
    <Boton
      href={whatsappHref(mensaje)}
      externo
      variante={variante}
      className={className}
      datos={{
        "data-venta": "casa",
        "data-ubicacion": "casa",
        "data-casa": casa.id,
        ...(modalidad ? { "data-modalidad": modalidad.modalidad.id } : {}),
      }}
    >
      {texto}
    </Boton>
  );
}
