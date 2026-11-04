import { diferencias } from "@/content/landing";
import { Seccion } from "./ui";

function Lista({ puntos }: { puntos: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {puntos.map((p) => (
        <li key={p} className="flex gap-3">
          <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-terracota" />
          <span className="text-lg">{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** Lo que nos diferencia: lo que va en todas las casas y lo propio de las casas a pedido. */
export function Diferencias() {
  return (
    <Seccion id="diferencias" numero="01" etiqueta="Nuestra forma de construir" titulo="Lo que nos diferencia">
      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div className="rounded-lg border border-piedra-200 bg-blanco p-6">
          <h3 className="font-display text-2xl font-extrabold">{diferencias.todas.titulo}</h3>
          <Lista puntos={diferencias.todas.puntos} />
        </div>
        <div className="rounded-lg border-2 border-terracota bg-blanco p-6">
          <h3 className="font-display text-2xl font-extrabold">{diferencias.aPedido.titulo}</h3>
          <Lista puntos={diferencias.aPedido.puntos} />
        </div>
      </div>
    </Seccion>
  );
}
