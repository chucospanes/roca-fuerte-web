import {
  mensajesVenta,
  whatsappHref,
  type OpcionVenta,
  type UbicacionVenta,
} from "@/lib/whatsapp";
import type { ReactNode } from "react";
import { Boton } from "./ui";

/**
 * Botón de venta: abre WhatsApp directo con el mensaje de su opción. No pide correo ni
 * código (ver DECISIONES.md); el registro con correo es solo para el contenido premium.
 * `data-venta` y `data-ubicacion` los usa el script de conteo de clics (lib/origen.ts).
 */
export function BotonWhatsApp({
  opcion,
  ubicacion,
  variante = "primario",
  className,
  children,
}: {
  opcion: OpcionVenta;
  ubicacion: UbicacionVenta;
  variante?: "primario" | "secundario";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Boton
      href={whatsappHref(mensajesVenta[opcion])}
      externo
      variante={variante}
      className={className}
      datos={{ "data-venta": opcion, "data-ubicacion": ubicacion }}
    >
      {children}
    </Boton>
  );
}
