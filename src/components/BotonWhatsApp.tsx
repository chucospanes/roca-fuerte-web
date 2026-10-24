import { mensajesVenta, whatsappEsExterno, whatsappHref, type OpcionVenta } from "@/lib/whatsapp";
import type { ReactNode } from "react";
import { Boton } from "./ui";

/**
 * Botón de venta: abre WhatsApp directo con el mensaje de su opción. No pide correo ni
 * código (ver DECISIONES.md); el registro con correo es solo para el contenido premium.
 */
export function BotonWhatsApp({
  opcion,
  variante = "primario",
  className,
  children,
}: {
  opcion: OpcionVenta;
  variante?: "primario" | "secundario";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Boton
      href={whatsappHref(mensajesVenta[opcion])}
      externo={whatsappEsExterno()}
      variante={variante}
      className={className}
    >
      {children}
    </Boton>
  );
}
