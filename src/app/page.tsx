import { Bitacora } from "@/components/Bitacora";
import { CasasDisponibles } from "@/components/casas/CasasDisponibles";
import { Calidad } from "@/components/Calidad";
import { ComoTrabajamos } from "@/components/ComoTrabajamos";
import { Contacto } from "@/components/Contacto";
import { DatosEstructurados } from "@/components/DatosEstructurados";
import { Encabezado } from "@/components/Encabezado";
import { Hero } from "@/components/Hero";
import { Inversionistas } from "@/components/Inversionistas";
import { LaCasa } from "@/components/LaCasa";
import { Materiales } from "@/components/Materiales";
import { Opciones } from "@/components/Opciones";
import { Pie } from "@/components/Pie";
import { PorQue } from "@/components/PorQue";
import { Preguntas } from "@/components/Preguntas";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";

export default function Home() {
  return (
    <>
      <DatosEstructurados />
      <Encabezado />
      <main>
        <Hero />
        <CasasDisponibles />
        <PorQue />
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
