"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BUCKET_FOTOS_OBRAS } from "@/components/admin/constantes";
import { FotoIlegible, nombresSiguientes, prepararFoto, tamano } from "@/lib/fotos-navegador";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Fotos de un avance desde el celular: se eligen (cámara o galería), se preparan una por una
 * (JPG de 2000 px, sin EXIF) y se suben UNA POR UNA directo a Storage con la sesión del
 * usuario (la política de 009 solo deja subir a un administrador, y solo a la carpeta de un
 * avance que existe). Los nombres (01.jpg, 02.jpg…) se fijan al empezar a subir: un
 * reintento usa el mismo nombre, y si la foto ya había llegado ("ya existe"), cuenta como
 * subida. Nunca se sobrescribe ni se borra nada.
 */

type EstadoFoto = "preparando" | "lista" | "ilegible" | "subiendo" | "subida" | "fallo";

export type Foto = {
  clave: string;
  original: string;
  estado: EstadoFoto;
  blob: Blob | null;
  vista: string | null;
  nombre: string | null;
};

let contador = 0;

/** ¿El error de Storage dice que el archivo ya existe? (una subida anterior sí llegó) */
function yaExiste(error: { message?: string; statusCode?: string; status?: number }): boolean {
  return error.statusCode === "409" || error.status === 409 || /exists|duplicate/i.test(error.message ?? "");
}

export function useFotos({ existentes, maximo }: { existentes: string[]; maximo: number }) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  // La lista vive en la ref (se actualiza al instante) y el estado la refleja para dibujar:
  // así `subir` nunca lee una lista vieja justo después de preparar la última foto.
  const fotosRef = useRef<Foto[]>([]);
  const preparando = useRef(Promise.resolve());

  const actualizar = useCallback((cambio: (lista: Foto[]) => Foto[]) => {
    fotosRef.current = cambio(fotosRef.current);
    setFotos(fotosRef.current);
  }, []);

  const cambiar = useCallback(
    (clave: string, cambio: Partial<Foto>) =>
      actualizar((lista) => lista.map((f) => (f.clave === clave ? { ...f, ...cambio } : f))),
    [actualizar],
  );

  // Libera las vistas previas al salir
  useEffect(
    () => () => {
      for (const f of fotosRef.current) if (f.vista) URL.revokeObjectURL(f.vista);
    },
    [],
  );

  const elegir = useCallback(
    (archivos: FileList | null) => {
      if (!archivos?.length) return;
      const libres = maximo - fotosRef.current.filter((f) => f.estado !== "ilegible").length;
      const elegidas = Array.from(archivos).slice(0, Math.max(0, libres));
      setAviso(
        elegidas.length < archivos.length
          ? `Solo caben ${maximo} fotos en este avance: se tomaron las primeras ${elegidas.length}.`
          : null,
      );
      const nuevas: Foto[] = elegidas.map((a) => ({
        clave: `f${++contador}`,
        original: a.name,
        estado: "preparando",
        blob: null,
        vista: null,
        nombre: null,
      }));
      actualizar((lista) => [...lista, ...nuevas]);
      // De una en una (en cola), para no llenar la memoria del celular
      nuevas.forEach((foto, i) => {
        preparando.current = preparando.current.then(async () => {
          try {
            const { blob } = await prepararFoto(elegidas[i]);
            cambiar(foto.clave, { estado: "lista", blob, vista: URL.createObjectURL(blob) });
          } catch (e) {
            if (!(e instanceof FotoIlegible)) console.error(e);
            cambiar(foto.clave, { estado: "ilegible" });
          }
        });
      });
    },
    [actualizar, cambiar, maximo],
  );

  const quitar = useCallback(
    (clave: string) => {
      const foto = fotosRef.current.find((f) => f.clave === clave);
      if (foto?.vista) URL.revokeObjectURL(foto.vista);
      actualizar((lista) => lista.filter((f) => f.clave !== clave));
    },
    [actualizar],
  );

  /**
   * Sube a `carpeta` las fotos listas o que fallaron. Devuelve cuántas quedaron sin subir.
   * Espera a que terminen de prepararse las que falten.
   */
  const subir = useCallback(
    async (carpeta: string): Promise<number> => {
      await preparando.current;
      const actuales = fotosRef.current;
      // Nombres fijos desde el primer intento: siguen a los que ya hay en la carpeta
      const sinNombre = actuales.filter((f) => f.nombre === null && f.estado === "lista");
      const nombres = nombresSiguientes(
        [...existentes, ...actuales.flatMap((f) => (f.nombre ? [f.nombre] : []))],
        sinNombre.length,
      );
      const conNombre = new Map(sinNombre.map((f, i) => [f.clave, nombres[i]]));
      actualizar((lista) => lista.map((f) => (conNombre.has(f.clave) ? { ...f, nombre: conNombre.get(f.clave)! } : f)));

      const almacen = crearClienteNavegador().storage.from(BUCKET_FOTOS_OBRAS);
      let fallidas = 0;
      for (const f of actuales) {
        if (!(f.estado === "lista" || f.estado === "fallo") || !f.blob) continue;
        const nombre = f.nombre ?? conNombre.get(f.clave)!;
        cambiar(f.clave, { estado: "subiendo" });
        let ok = false;
        try {
          const { error } = await almacen.upload(`${carpeta}${nombre}`, f.blob, {
            contentType: "image/jpeg",
            upsert: false,
          });
          ok = !error || yaExiste(error as never);
        } catch {
          ok = false;
        }
        cambiar(f.clave, { estado: ok ? "subida" : "fallo" });
        if (!ok) fallidas++;
      }
      return fallidas;
    },
    [actualizar, cambiar, existentes],
  );

  const resumen = {
    total: fotos.length,
    listas: fotos.filter((f) => f.estado === "lista").length,
    preparando: fotos.filter((f) => f.estado === "preparando").length,
    subidas: fotos.filter((f) => f.estado === "subida").length,
    fallidas: fotos.filter((f) => f.estado === "fallo").length,
    ilegibles: fotos.filter((f) => f.estado === "ilegible").length,
    subiendo: fotos.some((f) => f.estado === "subiendo"),
    peso: fotos.reduce((s, f) => s + (f.blob && f.estado !== "subida" ? f.blob.size : 0), 0),
  };

  return { fotos, aviso, elegir, quitar, subir, resumen };
}

const etiquetaEstado: Record<EstadoFoto, string> = {
  preparando: "Preparando…",
  lista: "Lista",
  ilegible: "No se pudo abrir",
  subiendo: "Subiendo…",
  subida: "Subida ✓",
  fallo: "Falló",
};

/** Botón para elegir fotos y la cuadrícula con su estado. */
export function ElegirFotos({
  fotos,
  aviso,
  elegir,
  quitar,
  bloqueado,
  peso,
}: {
  fotos: Foto[];
  aviso: string | null;
  elegir: (archivos: FileList | null) => void;
  quitar: (clave: string) => void;
  bloqueado: boolean;
  peso: number;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={entrada}
        id="fotos"
        type="file"
        accept="image/*"
        multiple
        disabled={bloqueado}
        onChange={(ev) => {
          elegir(ev.target.files);
          ev.target.value = ""; // permite volver a elegir la misma foto
        }}
        className="sr-only"
      />
      <button
        type="button"
        disabled={bloqueado}
        onClick={() => entrada.current?.click()}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-piedra-400 bg-blanco px-4 font-display font-semibold text-piedra-800 hover:border-terracota disabled:opacity-60"
      >
        <span aria-hidden>📷</span> Tomar o elegir fotos
      </button>
      {aviso && <p className="mt-2 text-sm font-semibold text-terracota-oscuro">{aviso}</p>}
      {fotos.length > 0 && (
        <>
          <p className="mt-3 text-sm text-piedra-600">
            {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
            {peso > 0 && ` · ${tamano(peso)} por subir`}
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {fotos.map((f, i) => (
              <li key={f.clave} className="relative">
                <div className="aspect-square overflow-hidden rounded-md bg-piedra-100">
                  {f.vista ? (
                    // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
                    <img src={f.vista} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center p-1 text-center text-xs text-piedra-600">
                      {f.estado === "ilegible" ? f.original : "…"}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1 block text-xs font-semibold ${
                    f.estado === "fallo" || f.estado === "ilegible"
                      ? "text-terracota-oscuro"
                      : f.estado === "subida"
                        ? "text-piedra-800"
                        : "text-piedra-600"
                  }`}
                >
                  {f.nombre ?? `#${i + 1}`} · {etiquetaEstado[f.estado]}
                </span>
                {!bloqueado && (f.estado === "lista" || f.estado === "ilegible" || f.estado === "preparando") && (
                  <button
                    type="button"
                    onClick={() => quitar(f.clave)}
                    aria-label={`Quitar la foto ${i + 1}`}
                    className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full bg-piedra-900/80 text-lg leading-none text-blanco"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          {fotos.some((f) => f.estado === "ilegible") && (
            <p className="mt-2 text-sm text-terracota-oscuro">
              Las fotos que no se pudieron abrir no se suben (por ejemplo, HEIC en algunos Android). Quítalas o
              envíalas como JPG.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Avisa antes de salir de la página mientras haya fotos sin subir. */
export function useAvisoAlSalir(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    const aviso = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [activo]);
}
