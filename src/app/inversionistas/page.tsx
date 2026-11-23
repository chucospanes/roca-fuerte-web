import type { Metadata } from "next";
import { Encabezado } from "@/components/Encabezado";
import { Inversionistas } from "@/components/Inversionistas";
import { Pie } from "@/components/Pie";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { site } from "@/config/site";
import { inversionistas } from "@/content/inversionistas";

export const metadata: Metadata = {
  title: `Para inversionistas · ${site.marca}`,
  description: inversionistas.intro,
  alternates: { canonical: "/inversionistas" },
  // Sin `robots` propio: hereda el del layout (interruptor de lanzamiento)
};

/**
 * Construcción para inversionistas: el mismo contenido y el mismo botón
 * (`inversionista`/`inversionistas`) que tenía la portada hasta la v2.0.0 (decisión del usuario,
 * 2026-11-23). No es una oferta de inversión (DECISIONES.md, 2026-10-30).
 */
export default function InversionistasPage() {
  return (
    <>
      <Encabezado />
      <main>
        <Inversionistas />
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
