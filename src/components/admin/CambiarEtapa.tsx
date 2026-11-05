"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cambiarEtapa } from "@/app/admin/acciones";
import * as e from "@/components/premium/estilos";
import { estadosEtapa, fecha as fechaLegible } from "@/content/portal";
import type { Etapa } from "@/lib/supabase/tipos";

type Cambio = { estado: Etapa["estado"]; fecha: string | null };

const estiloEstado: Record<Etapa["estado"], string> = {
  terminada: "bg-piedra-900 text-blanco",
  en_proceso: "bg-terracota text-blanco",
  por_iniciar: "bg-piedra-100 text-piedra-700",
};

/**
 * Una etapa con su acción principal ("Iniciar" o "Terminar") y "Corregir" para cualquier
 * otro estado. Siempre pide confirmar: el cambio llega al portal y, si la obra tiene casa
 * ligada, a la bitácora pública. Lo hace la función admin_cambiar_etapa (todo o nada).
 */
export function CambiarEtapa({
  etapa,
  hoy,
  alcance,
  conAccion,
}: {
  etapa: Pick<Etapa, "id" | "orden" | "nombre" | "estado" | "fecha_inicio">;
  hoy: string;
  /** Qué más cambia, por ejemplo "También cambia en la bitácora pública de …". */
  alcance: string;
  /** Mostrar el botón grande (solo la etapa en proceso y la siguiente por iniciar). */
  conAccion: boolean;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(etapa.fecha_inicio ?? hoy);
  const [corregir, setCorregir] = useState(false);
  const [estadoCorregido, setEstadoCorregido] = useState<Etapa["estado"]>(etapa.estado);
  const [confirmar, setConfirmar] = useState<Cambio | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  const principal: Cambio | null = !conAccion
    ? null
    : etapa.estado === "por_iniciar"
      ? { estado: "en_proceso", fecha }
      : etapa.estado === "en_proceso"
        ? { estado: "terminada", fecha: null }
        : null;

  async function aplicar(cambio: Cambio) {
    setEnviando(true);
    setResultado(null);
    const r = await cambiarEtapa({ etapaId: etapa.id, estado: cambio.estado, fecha: cambio.fecha }).catch(() => null);
    setEnviando(false);
    setConfirmar(null);
    if (!r) {
      setResultado({ ok: false, texto: "No se pudo guardar. Revisa la conexión y vuelve a intentarlo." });
      return;
    }
    if (!r.ok) {
      setResultado({ ok: false, texto: r.mensaje });
      return;
    }
    setResultado({ ok: true, texto: `Portal: ${r.datos.portal}. Bitácora pública: ${r.datos.publica}.` });
    setCorregir(false);
    router.refresh();
  }

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          {etapa.orden}. {etapa.nombre}
        </p>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${estiloEstado[etapa.estado]}`}>
          {estadosEtapa[etapa.estado]}
        </span>
      </div>
      {etapa.fecha_inicio && <p className="text-sm text-piedra-600">Inicio: {fechaLegible(etapa.fecha_inicio)}</p>}

      {confirmar ? (
        <div className="mt-3 rounded-md border border-piedra-300 bg-piedra-50 p-3">
          <p className="font-semibold">
            ¿«{etapa.nombre}» pasa a {estadosEtapa[confirmar.estado].toLowerCase()}
            {confirmar.fecha && `, con inicio el ${fechaLegible(confirmar.fecha) ?? confirmar.fecha}`}?
          </p>
          <p className="mt-1 text-sm text-piedra-700">{alcance}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={enviando} onClick={() => aplicar(confirmar)} className={e.botonPrimario}>
              {enviando ? "Guardando…" : "Sí, confirmar"}
            </button>
            <button type="button" disabled={enviando} onClick={() => setConfirmar(null)} className={`min-h-12 ${e.botonTexto}`}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {principal && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              {etapa.estado === "por_iniciar" && (
                <label className="block sm:w-48">
                  <span className="text-sm font-semibold text-piedra-800">Fecha de inicio</span>
                  <input type="date" value={fecha} max={hoy} onChange={(ev) => setFecha(ev.target.value)} className={e.campo} />
                </label>
              )}
              <button type="button" onClick={() => setConfirmar(principal)} className={e.botonPrimario}>
                {etapa.estado === "por_iniciar" ? "Iniciar etapa" : "Terminar etapa"}
              </button>
            </div>
          )}
          {corregir ? (
            <div className="rounded-md border border-piedra-200 p-3">
              <label className="block">
                <span className="text-sm font-semibold text-piedra-800">Estado</span>
                <select
                  value={estadoCorregido}
                  onChange={(ev) => setEstadoCorregido(ev.target.value as Etapa["estado"])}
                  className={e.campo}
                >
                  {(Object.keys(estadosEtapa) as Etapa["estado"][]).map((est) => (
                    <option key={est} value={est}>
                      {estadosEtapa[est]}
                    </option>
                  ))}
                </select>
              </label>
              {estadoCorregido !== "por_iniciar" && (
                <label className="mt-2 block">
                  <span className="text-sm font-semibold text-piedra-800">Fecha de inicio</span>
                  <input type="date" value={fecha} max={hoy} onChange={(ev) => setFecha(ev.target.value)} className={e.campo} />
                </label>
              )}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmar({
                      estado: estadoCorregido,
                      fecha: estadoCorregido === "por_iniciar" ? null : fecha,
                    })
                  }
                  className={e.botonPrimario}
                >
                  Guardar corrección
                </button>
                <button type="button" onClick={() => setCorregir(false)} className={`min-h-12 ${e.botonTexto}`}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setCorregir(true)} className={`min-h-11 text-sm ${e.botonTexto}`}>
              Corregir estado o fecha
            </button>
          )}
        </div>
      )}

      {resultado && (
        <p
          role={resultado.ok ? "status" : "alert"}
          className={`mt-3 text-sm font-semibold ${resultado.ok ? "text-piedra-800" : "text-terracota-oscuro"}`}
        >
          {resultado.ok ? "Listo. " : ""}
          {resultado.texto}
        </p>
      )}
    </li>
  );
}
