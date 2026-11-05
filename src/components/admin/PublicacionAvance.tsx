"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { quitarPublicacion } from "@/app/admin/acciones";
import { publicarEnFicha } from "@/components/admin/publicar";
import * as e from "@/components/premium/estilos";
import type { PublicacionAdmin } from "@/lib/admin";

type Accion = "publicar" | "quitar";

/**
 * Estado de un avance en la ficha de su casa, con "Publicar en la ficha" o "Quitar de la
 * ficha" (con confirmación). Con la casa vendida nada se ve en lo público (011): no se publica,
 * pero sí se puede quitar de la ficha (borra las copias públicas de sus fotos).
 */
export function PublicacionAvance({
  avanceId,
  fotos,
  publicacion,
  casa,
}: {
  avanceId: string;
  fotos: number;
  publicacion: PublicacionAdmin | null;
  /** Casa ligada a la obra: su nombre y si está vendida. Sin casa, no se muestra nada. */
  casa: { nombre: string; vendida: boolean };
}) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState<Accion | null>(null);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  async function aplicar(accion: Accion) {
    setConfirmar(null);
    setResultado(null);
    if (accion === "publicar") {
      setTrabajando("Publicando…");
      const r = await publicarEnFicha(avanceId, (hechas, total) =>
        setTrabajando(total > 0 ? `Copiando fotos: ${hechas} de ${total}…` : "Publicando…"),
      );
      setTrabajando(null);
      setResultado(r.ok ? { ok: true, texto: "Publicado en la ficha." } : { ok: false, texto: r.mensaje });
    } else {
      setTrabajando("Quitando…");
      const r = await quitarPublicacion(avanceId).catch(() => null);
      setTrabajando(null);
      setResultado(
        !r
          ? { ok: false, texto: "No se pudo quitar. Revisa la conexión y vuelve a intentarlo." }
          : !r.ok
            ? { ok: false, texto: r.mensaje }
            : r.datos.pendientes > 0
              ? {
                  ok: false,
                  texto: `Quitado de la ficha, pero ${r.datos.pendientes} ${r.datos.pendientes === 1 ? "copia de foto quedó" : "copias de fotos quedaron"} en Storage → casas (carpeta avances de la casa). Ya no se ven en la ficha; bórralas desde el panel de Supabase.`,
                }
              : { ok: true, texto: "Quitado de la ficha. El avance sigue en el portal." },
      );
    }
    router.refresh();
  }

  // Casa vendida sin nada publicado: nada que mostrar ni hacer
  if (casa.vendida && !publicacion) return null;

  const estado = publicacion
    ? casa.vendida
      ? `Publicado, pero no se ve: casa vendida · ${publicacion.fotos} ${publicacion.fotos === 1 ? "foto" : "fotos"}`
      : publicacion.visible
      ? `En la ficha de la casa ✓ · ${publicacion.fotos} ${publicacion.fotos === 1 ? "foto" : "fotos"}`
      : "Publicación a medias: todavía no se ve en la ficha."
    : null;

  return (
    <div className="mt-2 border-t border-piedra-200 pt-2">
      {estado && <p className="text-sm font-semibold text-piedra-800">{estado}</p>}
      {trabajando ? (
        <p role="status" className="min-h-11 py-2 text-sm font-semibold text-piedra-800">
          {trabajando} No cierres esta página.
        </p>
      ) : confirmar ? (
        <div className="mt-2 rounded-md border border-piedra-300 bg-piedra-50 p-3">
          <p className="text-sm font-semibold">
            {confirmar === "publicar"
              ? `¿Publicar en la ficha pública de «${casa.nombre}»? Se copian la fecha, el título, la descripción, el video y ${fotos} ${fotos === 1 ? "foto" : "fotos"}.`
              : "¿Quitar de la ficha? Se borran las copias públicas; el avance y sus fotos siguen en el portal."}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => aplicar(confirmar)} className={e.botonPrimario}>
              Sí, confirmar
            </button>
            <button type="button" onClick={() => setConfirmar(null)} className={`min-h-12 ${e.botonTexto}`}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-5">
          {!casa.vendida && (!publicacion || !publicacion.visible) && (
            <button
              type="button"
              onClick={() => setConfirmar("publicar")}
              className="inline-flex min-h-11 items-center font-semibold text-terracota"
            >
              {publicacion ? "Terminar publicación" : "Publicar en la ficha"}
            </button>
          )}
          {publicacion && (
            <button
              type="button"
              onClick={() => setConfirmar("quitar")}
              className="inline-flex min-h-11 items-center font-semibold text-piedra-700"
            >
              Quitar de la ficha
            </button>
          )}
        </div>
      )}
      {resultado && (
        <p
          role={resultado.ok ? "status" : "alert"}
          className={`text-sm font-semibold ${resultado.ok ? "text-piedra-800" : "text-terracota-oscuro"}`}
        >
          {resultado.texto}
        </p>
      )}
    </div>
  );
}
