import { Bitacora } from "@/components/Bitacora";
import { Calidad } from "@/components/Calidad";
import { ComoTrabajamos } from "@/components/ComoTrabajamos";
import { Contacto } from "@/components/Contacto";
import { Encabezado } from "@/components/Encabezado";
import { Hero } from "@/components/Hero";
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
      <Encabezado />
      <main>
        <Hero />
        <PorQue />
        <LaCasa />
        <Calidad />
        <Materiales />
        <Bitacora />
        <Opciones />
        <ComoTrabajamos />
        <Preguntas />
        <Contacto />
      </main>
      <Pie />
      <WhatsAppFlotante />
    </>
  );
}
