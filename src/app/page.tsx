import { Calidad } from "@/components/Calidad";
import { ComoTrabajamos } from "@/components/ComoTrabajamos";
import { Contacto } from "@/components/Contacto";
import { DatosEstructurados } from "@/components/DatosEstructurados";
import { Encabezado } from "@/components/Encabezado";
import { Hermanos } from "@/components/Hermanos";
import { Hero } from "@/components/Hero";
import { Inversionistas } from "@/components/Inversionistas";
import { LaCasa } from "@/components/LaCasa";
import { Materiales } from "@/components/Materiales";
import { Opciones } from "@/components/Opciones";
import { Pie } from "@/components/Pie";
import { DiarioPortada } from "@/components/portada/DiarioPortada";
import { Franja } from "@/components/portada/Franja";
import { ProyectoActual } from "@/components/portada/ProyectoActual";
import { QuienesSomos } from "@/components/portada/QuienesSomos";
import { Preguntas } from "@/components/Preguntas";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { leerProyecto } from "@/lib/portada";

/**
 * Portada v2.0.0 (docs/REDISENO_PORTADA.md): el orden del brief (5.1 a 5.10) y, después de
 * "Hermano cercano", las secciones que ya existían (decisión del usuario, 2026-11-23). Sin
 * proyecto (no hay casa disponible o Supabase no respondió), "Proyecto actual" y el Diario no
 * aparecen y Precios vuelve a mostrar la tarjeta de comprar.
 */
export default async function Home() {
  const proyecto = await leerProyecto();
  return (
    <>
      <DatosEstructurados />
      <Encabezado />
      <main>
        <Hero />
        <Franja />
        <QuienesSomos />
        <Calidad />
        {proyecto && <ProyectoActual proyecto={proyecto} />}
        {proyecto && <DiarioPortada slug={proyecto.casa.slug} />}
        <ComoTrabajamos />
        <Hermanos />
        <LaCasa />
        <Materiales />
        <Opciones conProyecto={proyecto !== null} />
        <Inversionistas />
        <Preguntas />
        <Contacto />
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
