import { Boton, Seccion } from "@/components/ui";
import { catalogo } from "@/content/casas";
import { listarCasas } from "@/lib/casas";
import { TarjetaCasa } from "./TarjetaCasa";

/** Las casas que se muestran en la portada; el resto, en `/casas`. */
const EN_PORTADA = 3;

/**
 * Bloque "Casas disponibles" de la portada: las primeras 3 no vendidas, en el orden del
 * catálogo. Sin casas disponibles (o si Supabase falla), no se muestra nada.
 */
export async function CasasDisponibles() {
  const resultado = await listarCasas();
  if (!resultado.ok) return null;
  const disponibles = resultado.datos.filter((c) => c.estado !== "vendida");
  if (disponibles.length === 0) return null;

  return (
    <Seccion id="casas-disponibles" etiqueta="Casas en venta" titulo="Casas disponibles" fondo="blanco">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {disponibles.slice(0, EN_PORTADA).map((c) => (
          <TarjetaCasa key={c.id} casa={c} />
        ))}
      </ul>
      <Boton href="/casas" variante="secundario" className="mt-8">
        {catalogo.verTodas}
      </Boton>
    </Seccion>
  );
}
