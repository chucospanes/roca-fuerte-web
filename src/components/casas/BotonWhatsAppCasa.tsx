import { Boton } from "@/components/ui";
import { mensajeCasa, whatsappHref } from "@/lib/whatsapp";
import type { DetalleCasa } from "@/lib/casas";

/**
 * Botón de WhatsApp de una casa del catálogo: el mensaje nombra la casa y el conteo de clics
 * lleva su id (`data-casa`; /api/clic revisa que sea de una casa publicada).
 */
export function BotonWhatsAppCasa({
  casa,
  className,
}: {
  casa: Pick<DetalleCasa, "id" | "nombre" | "municipio">;
  className?: string;
}) {
  return (
    <Boton
      href={whatsappHref(mensajeCasa(casa.nombre, casa.municipio))}
      externo
      className={className}
      datos={{ "data-venta": "casa", "data-ubicacion": "casa", "data-casa": casa.id }}
    >
      Quiero esta casa
    </Boton>
  );
}
