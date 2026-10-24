import { mensajesVenta, whatsappEsExterno, whatsappHref } from "@/lib/whatsapp";

/** Botón de WhatsApp fijo, siempre visible en móvil. */
export function WhatsAppFlotante() {
  const href = whatsappHref(mensajesVenta.general);
  const externo = whatsappEsExterno();
  return (
    <a
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label="Escribir por WhatsApp"
      data-venta="general"
      data-ubicacion="flotante"
      className="fixed right-4 bottom-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-[#1c8147] py-3 pr-5 pl-4 font-display font-semibold text-blanco shadow-lg shadow-piedra-900/30 hover:bg-[#155f34] md:hidden"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-current">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.47.24.55.79 1.9.86 2.04.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.33Z" />
      </svg>
      WhatsApp
    </a>
  );
}
