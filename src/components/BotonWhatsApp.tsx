import {
  mensajesVenta,
  whatsappHref,
  type OpcionMensajeFijo,
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
  mensaje,
  className,
  children,
}: {
  opcion: OpcionMensajeFijo;
  ubicacion: UbicacionVenta;
  /** Mensaje propio de una sección (por ejemplo, "Hermano cercano"); si no, el de la opción. */
  mensaje?: string;
  variante?: "primario" | "secundario" | "claro";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Boton
      href={whatsappHref(mensaje ?? mensajesVenta[opcion])}
      externo
      variante={variante}
      className={className}
      datos={{ "data-venta": opcion, "data-ubicacion": ubicacion }}
    >
      {children}
    </Boton>
  );
}
