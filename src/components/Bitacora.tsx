import Link from "next/link";
import { bitacoraCasa } from "@/content/casas";
import { leerObraEnCurso } from "@/lib/casas";
import { AvanceObra } from "./casas/AvanceObra";
import { Seccion } from "./ui";

/**
 * Bitácora de obra: el avance público de una casa nuestra en obra (`casas_venta_etapas`, una
 * sola fuente con su ficha). Nombre, estado y enlace salen de la casa; nada se escribe a mano.
 * Sin casa en obra, la sección NO aparece (y `hayBitacora()` oculta sus enlaces en el menú, el
 * hero y Calidad). Si Supabase no responde, queda con el título genérico y el aviso.
 */
export async function Bitacora() {
  const resultado = await leerObraEnCurso();
  if (resultado.ok && resultado.datos === null) return null;
  const obra = resultado.ok ? resultado.datos : null;
  const linea = obra && obra.casa.estado !== "vendida" ? bitacoraCasa.linea[obra.casa.estado] : null;

  return (
    <Seccion
      id="bitacora"
      numerada
      etiqueta="Obra en vivo"
      titulo={obra ? bitacoraCasa.titulo(obra.casa.nombre) : bitacoraCasa.tituloSinDatos}
      intro={
        <>
          {obra ? (
            <p>
              {linea}{" "}
              <Link
                href={`/casas/${obra.casa.slug}`}
                className="font-semibold text-terracota underline underline-offset-4"
              >
                {bitacoraCasa.verCasa}
              </Link>
            </p>
          ) : (
            <p>{bitacoraCasa.error}</p>
          )}
          <p className="mt-2 text-sm text-piedra-600">{bitacoraCasa.nota}</p>
        </>
      }
    >
      {obra && <AvanceObra etapas={obra.etapas} />}
    </Seccion>
  );
}
