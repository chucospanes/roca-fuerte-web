"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * Protección ligera (plano de la casa): sin menú del clic derecho, sin arrastrar, sin el menú
 * de mantener presionado en el celular y sin selección. Disuade la copia casual; no la impide.
 */
const proteccion = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  style: { WebkitTouchCallout: "none" },
} as const;

/** Imagen (plano, fachada) que se abre a pantalla completa al tocarla; dentro se puede desplazar. */
export function ImagenAmpliable({
  src,
  alt,
  ancho,
  alto,
  sizes = "(max-width: 1024px) 100vw, 960px",
  protegida = false,
}: {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  sizes?: string;
  protegida?: boolean;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const extra = protegida ? proteccion : {};
  const sinSeleccion = protegida ? " select-none" : "";

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-piedra-200 bg-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
      >
        <Image
          src={src}
          alt={alt}
          width={ancho}
          height={alto}
          sizes={sizes}
          className={`h-auto w-full${sinSeleccion}`}
          {...extra}
        />
        <span className="absolute right-3 bottom-3 rounded-md bg-piedra-900/90 px-3 py-1.5 text-sm font-semibold text-blanco group-hover:bg-terracota">
          Toca para ampliar
        </span>
      </button>

      <dialog
        ref={dialogo}
        aria-label={alt}
        onClick={(e) => {
          // cerrar al tocar el fondo
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between bg-piedra-900 px-4 py-3 text-blanco">
            <p className="text-sm">Desliza para moverte por la imagen.</p>
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              className="rounded-md bg-terracota px-4 py-2 text-sm font-semibold"
            >
              Cerrar
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-blanco">
            {/* En móvil se muestra a 1400 px de ancho para leer las cotas; en escritorio, ancho completo */}
            <Image
              src={src}
              alt={alt}
              width={ancho}
              height={alto}
              sizes="1400px"
              className={`h-auto w-[1400px] max-w-none lg:w-full${sinSeleccion}`}
              {...extra}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
