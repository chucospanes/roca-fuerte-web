"use client";

import Link from "next/link";
import { useState } from "react";
import { crearAvance } from "@/app/admin/acciones";
import { ElegirFotos, useAvisoAlSalir, useFotos } from "@/components/admin/fotos";
import { publicarEnFicha } from "@/components/admin/publicar";
import * as e from "@/components/premium/estilos";
import { useHidratado } from "@/components/premium/useHidratado";
import { esquemaAvanceNuevo } from "@/lib/validacion";

type EtapaOpcion = { orden: number; nombre: string; estado: string };

/**
 * Avance nuevo desde el celular: 1) se crea el avance en la base (función admin_crear_avance,
 * con sus candados); 2) se suben las fotos a su carpeta, una por una. Si alguna falla, el
 * avance ya existe: se reintenta aquí mismo o después con "Agregar fotos" desde la obra.
 * 3) Si la casilla está marcada (obras ligadas a una casa no vendida), se publica en la ficha.
 */
export function FormAvance({
  obraId,
  etapas,
  etapaPorDefecto,
  hoy,
  maximoFotos,
  casaPublicable,
}: {
  obraId: string;
  etapas: EtapaOpcion[];
  etapaPorDefecto: number | null;
  hoy: string;
  maximoFotos: number;
  /** Nombre de la casa ligada si no está vendida: entonces aparece la casilla de publicar. */
  casaPublicable: string | null;
}) {
  const hidratado = useHidratado();
  const [etapa, setEtapa] = useState(etapaPorDefecto === null ? "" : String(etapaPorDefecto));
  const [fecha, setFecha] = useState(hoy);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [video, setVideo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fase, setFase] = useState<"editando" | "guardando" | "subiendo" | "publicando" | "terminado">("editando");
  const [carpeta, setCarpeta] = useState<string | null>(null);
  const [avanceId, setAvanceId] = useState<string | null>(null);
  const [publicarFicha, setPublicarFicha] = useState(casaPublicable !== null);
  const [publicacion, setPublicacion] = useState<{ ok: boolean; texto: string } | null>(null);
  const [progresoFicha, setProgresoFicha] = useState<string | null>(null);
  const [fallidas, setFallidas] = useState(0);
  const { fotos, aviso, elegir, quitar, subir, resumen } = useFotos({ existentes: [], maximo: maximoFotos });

  const bloqueado = fase !== "editando";
  useAvisoAlSalir(
    fase === "guardando" || fase === "subiendo" || fase === "publicando" || (fase === "terminado" && fallidas > 0),
  );

  async function subirFotos(destino: string, id: string) {
    setFase("subiendo");
    const n = await subir(destino);
    setFallidas(n);
    // Se publica solo con todas las fotos arriba; si faltan, se publica después desde la obra
    if (n === 0 && publicarFicha && casaPublicable) {
      setFase("publicando");
      const r = await publicarEnFicha(id, (hechas, total) =>
        setProgresoFicha(total > 0 ? `Publicando en la ficha: ${hechas} de ${total} fotos…` : "Publicando en la ficha…"),
      );
      setPublicacion(
        r.ok
          ? { ok: true, texto: `También se publicó en la ficha de «${casaPublicable}».` }
          : { ok: false, texto: `El avance se guardó, pero no se publicó en la ficha: ${r.mensaje} Puedes publicarlo desde la obra.` },
      );
    }
    setFase("terminado");
  }

  async function publicar(ev: React.FormEvent) {
    ev.preventDefault();
    if (bloqueado) return;
    const entrada = {
      obraId,
      etapaOrden: etapa ? Number(etapa) : null,
      fecha,
      titulo,
      descripcion,
      video,
    };
    const r = esquemaAvanceNuevo.safeParse(entrada);
    if (!r.success) {
      setError(r.error.issues[0]?.message ?? "Revisa los datos.");
      return;
    }
    if (resumen.preparando > 0) {
      setError("Espera a que terminen de prepararse las fotos.");
      return;
    }
    setError(null);
    setFase("guardando");
    const resultado = await crearAvance(entrada).catch(() => null);
    if (!resultado || !resultado.ok) {
      setError(resultado ? resultado.mensaje : "No se pudo guardar. Revisa la conexión y vuelve a intentarlo.");
      setFase("editando");
      return;
    }
    setCarpeta(resultado.datos.carpeta);
    setAvanceId(resultado.datos.avanceId);
    await subirFotos(resultado.datos.carpeta, resultado.datos.avanceId);
  }

  if (fase === "terminado" && fallidas === 0) {
    return (
      <div role="status" className="rounded-lg border-2 border-piedra-900 bg-blanco p-5">
        <p className="font-display text-xl font-bold">Avance publicado ✓</p>
        <p className="mt-2 text-piedra-700">
          {resumen.subidas > 0
            ? `${resumen.subidas} ${resumen.subidas === 1 ? "foto subida" : "fotos subidas"}. `
            : "Sin fotos. "}
          Ya se ve en el portal de la obra.
        </p>
        {publicacion && (
          <p
            role={publicacion.ok ? undefined : "alert"}
            className={`mt-2 font-semibold ${publicacion.ok ? "text-piedra-800" : "text-terracota-oscuro"}`}
          >
            {publicacion.texto}
          </p>
        )}
        <Link href={`/admin/obras/${obraId}`} className={`${e.botonPrimario} mt-5`}>
          Volver a la obra
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={publicar} noValidate className="space-y-5">
      <div>
        <label htmlFor="etapa" className={e.etiqueta}>
          Etapa
        </label>
        <select id="etapa" value={etapa} disabled={bloqueado} onChange={(ev) => setEtapa(ev.target.value)} className={e.campo}>
          <option value="">Sin etapa</option>
          {etapas.map((et) => (
            <option key={et.orden} value={et.orden}>
              {et.orden}. {et.nombre}
              {et.estado === "en_proceso" ? " (en proceso)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="fecha" className={e.etiqueta}>
          Fecha
        </label>
        <input id="fecha" type="date" value={fecha} max={hoy} disabled={bloqueado} onChange={(ev) => setFecha(ev.target.value)} className={e.campo} />
      </div>
      <div>
        <label htmlFor="titulo" className={e.etiqueta}>
          Título
        </label>
        <input
          id="titulo"
          value={titulo}
          maxLength={160}
          disabled={bloqueado}
          onChange={(ev) => setTitulo(ev.target.value)}
          placeholder="Ej.: Zanjas para las fundaciones"
          className={e.campo}
        />
      </div>
      <div>
        <label htmlFor="descripcion" className={e.etiqueta}>
          Descripción <span className="font-normal text-piedra-600">(opcional)</span>
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          maxLength={4000}
          rows={4}
          disabled={bloqueado}
          onChange={(ev) => setDescripcion(ev.target.value)}
          className={e.campo}
        />
        <p className="mt-1 text-sm text-piedra-600">
          {casaPublicable
            ? "La ven el cliente y, si la publicas en la ficha, cualquiera: sin comentarios internos."
            : "El cliente la ve tal cual: sin comentarios internos."}
        </p>
      </div>
      <div>
        <label htmlFor="video" className={e.etiqueta}>
          Video <span className="font-normal text-piedra-600">(opcional)</span>
        </label>
        <input
          id="video"
          type="url"
          inputMode="url"
          value={video}
          disabled={bloqueado}
          onChange={(ev) => setVideo(ev.target.value)}
          placeholder="https://youtube.com/shorts/…"
          className={e.campo}
        />
        <p className="mt-1 text-sm text-piedra-600">
          YouTube o Vimeo. Los Shorts (youtube.com/shorts/…) se ven verticales; un enlace youtu.be se ve
          horizontal.
        </p>
      </div>
      <div>
        <p className={e.etiqueta}>Fotos <span className="font-normal text-piedra-600">(opcional)</span></p>
        <div className="mt-1">
          <ElegirFotos fotos={fotos} aviso={aviso} elegir={elegir} quitar={quitar} bloqueado={bloqueado} peso={resumen.peso} />
        </div>
      </div>

      {casaPublicable && (
        <label className="flex min-h-12 items-start gap-3 rounded-md border border-piedra-300 bg-blanco p-3">
          <input
            type="checkbox"
            checked={publicarFicha}
            disabled={bloqueado}
            onChange={(ev) => setPublicarFicha(ev.target.checked)}
            className="mt-1 size-5 accent-terracota"
          />
          <span>
            <span className="font-semibold">Publicar también en la ficha de la casa</span>
            <span className="block text-sm text-piedra-600">
              Fecha, título, descripción, video y fotos se ven en la ficha pública de «{casaPublicable}».
            </span>
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-terracota/40 bg-terracota/5 p-3 font-semibold text-terracota-oscuro">
          {error}
        </p>
      )}

      {fase === "publicando" && (
        <p role="status" className="font-semibold text-piedra-800">
          {progresoFicha ?? "Publicando en la ficha…"} No cierres esta página.
        </p>
      )}

      {fase === "subiendo" && (
        <p role="status" className="font-semibold text-piedra-800">
          Avance guardado. Fotos subidas: {resumen.subidas} de {resumen.total - resumen.ilegibles}. No
          cierres esta página.
        </p>
      )}

      {fase === "terminado" && fallidas > 0 && carpeta ? (
        <div role="alert" className="rounded-md border border-terracota/40 bg-terracota/5 p-4">
          <p className="font-semibold">
            El avance se guardó, pero {fallidas} {fallidas === 1 ? "foto no se subió" : "fotos no se subieron"}.
          </p>
          <p className="mt-1 text-piedra-700">Revisa la señal y reintenta. También puedes agregarlas después desde la obra.</p>
          <button type="button" onClick={() => avanceId && subirFotos(carpeta, avanceId)} className={`${e.botonPrimario} mt-3`}>
            Reintentar las que fallaron
          </button>
          <Link href={`/admin/obras/${obraId}`} className={`mt-3 block ${e.botonTexto}`}>
            Volver a la obra sin reintentar
          </Link>
        </div>
      ) : (
        <button type="submit" disabled={bloqueado || !hidratado} aria-busy={fase !== "editando"} className={e.botonPrimario}>
          {fase === "guardando"
            ? "Guardando…"
            : fase === "subiendo"
              ? "Subiendo fotos…"
              : fase === "publicando"
                ? "Publicando en la ficha…"
                : "Publicar avance"}
        </button>
      )}
    </form>
  );
}
