import { Bitacora } from "@/components/Bitacora";
import { CasasDisponibles } from "@/components/casas/CasasDisponibles";
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
import { Diferencias } from "@/components/Diferencias";
import { Preguntas } from "@/components/Preguntas";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";

export default function Home() {
  return (
    <>
      <DatosEstructurados />
      <Encabezado />
      <main className="secciones-numeradas">
        <Hero />
        <CasasDisponibles />
        <Diferencias />
        <Hermanos />
        <LaCasa />
        <Calidad />
        <Materiales />
        <Bitacora />
        <Opciones />
        <Inversionistas />
        <ComoTrabajamos />
        <Preguntas />
        <Contacto />
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
