import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { Boton } from "@/components/ui";
import { catalogo } from "@/content/casas";

/** Aviso de casa que no existe o no está publicada (lo usan el 404 del proxy y not-found). */
export function CasaNoDisponible() {
  return (
    <>
      <Encabezado />
      <main className="bg-piedra-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h1 className="font-display text-3xl font-extrabold">Esta casa no está disponible</h1>
          <p className="mt-3 max-w-xl text-lg text-piedra-700">
            Puede que ya no esté a la venta o que la dirección esté mal escrita.
          </p>
          <Boton href="/casas" className="mt-6">
            {catalogo.verTodas}
          </Boton>
        </div>
      </main>
      <Pie />
    </>
  );
}
