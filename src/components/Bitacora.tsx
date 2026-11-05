import Link from "next/link";
import { bitacoraCasa } from "@/content/casas";
import { leerObraEnCurso } from "@/lib/casas";
import { AvanceObra } from "./casas/AvanceObra";
import { Seccion } from "./ui";

/**
 * Bitácora de obra: el avance público de una casa del catálogo (`casas_venta_etapas`, una sola
 * fuente con su ficha). Nombre, estado y enlace salen de la casa; nada se escribe a mano. Sin
 * obra con etapas, o si Supabase no responde, queda el título genérico (la sección sigue
 * existiendo: el menú y el hero enlazan a #bitacora).
 */
export async function Bitacora() {
  const resultado = await leerObraEnCurso();
  const obra = resultado.ok ? resultado.datos : null;

  return (
    <Seccion
      id="bitacora"
      numero="05"
      etiqueta="Obra en vivo"
      titulo={obra ? bitacoraCasa.titulo(obra.casa.nombre) : bitacoraCasa.tituloSinObra}
      intro={
        <>
          {obra ? (
            <p>
              {bitacoraCasa.linea[obra.casa.estado]}{" "}
              <Link
                href={`/casas/${obra.casa.slug}`}
                className="font-semibold text-terracota underline underline-offset-4"
              >
                {bitacoraCasa.verCasa}
              </Link>
            </p>
          ) : (
            <p>{resultado.ok ? bitacoraCasa.sinObra : bitacoraCasa.error}</p>
          )}
          <p className="mt-2 text-sm text-piedra-600">{bitacoraCasa.nota}</p>
        </>
      }
    >
      {obra && <AvanceObra etapas={obra.etapas} />}
    </Seccion>
  );
}
