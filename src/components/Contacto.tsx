import { Pendiente, Seccion } from "./ui";

// PROVISIONAL: el formulario de calificación con Server Action y Supabase se hace en la Fase 4.
export function Contacto() {
  return (
    <Seccion
      id="contacto"
      numero="08"
      etiqueta="Contacto"
      titulo="Cuéntanos qué buscas"
      intro="Unas pocas preguntas para saber si la Bonaire es para ti. Después seguimos la conversación por WhatsApp."
    >
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-piedra-300 bg-blanco p-6 text-center">
        <Pendiente texto="Formulario pendiente (Fase 4)" />
        <p className="max-w-md text-sm text-piedra-600">
          Aquí irá el formulario de calificación: nombre, WhatsApp, país, interés, terreno, forma de
          pago y cuándo quieres iniciar.
        </p>
      </div>
    </Seccion>
  );
}
