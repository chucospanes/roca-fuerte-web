"use client";

import { useState } from "react";

const nombres = { youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram" } as const;

/**
 * Video embebido que solo carga el reproductor al tocarlo.
 * Antes del clic no se descarga nada del proveedor (ahorra datos móviles).
 */
export function VideoLazy({
  src,
  vertical,
  plataforma,
  titulo,
}: {
  src: string;
  vertical: boolean;
  plataforma: keyof typeof nombres;
  titulo: string;
}) {
  const [activo, setActivo] = useState(false);
  const proporcion = vertical ? "aspect-[9/16] max-w-xs" : "aspect-video";

  if (activo) {
    return (
      <iframe
        src={src}
        title={titulo}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={`w-full rounded-md border-0 bg-piedra-900 ${proporcion}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivo(true)}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-md bg-piedra-900 text-blanco hover:bg-piedra-800 ${proporcion}`}
    >
      <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-terracota">
        <svg viewBox="0 0 24 24" className="ml-1 size-6 fill-current">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="px-4 text-center text-sm font-semibold">{titulo}</span>
      <span className="text-xs text-piedra-300">Ver en {nombres[plataforma]}</span>
    </button>
  );
}
