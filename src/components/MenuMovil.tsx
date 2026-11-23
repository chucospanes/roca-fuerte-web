"use client";

import Link from "next/link";
import { useRef } from "react";

/** `secundario`: enlace de menor peso (Portal de clientes, en `--ink-muted`). */
export type EnlaceMenu = { href: string; texto: string; secundario?: boolean };

/**
 * Menú de secciones hasta 1280 px. Es un `<details>`: abre y cierra sin JavaScript. Con
 * JavaScript, además se cierra al tocar un enlace (si no, quedaría abierto tapando la
 * sección a la que se saltó).
 */
export function MenuMovil({ enlaces }: { enlaces: EnlaceMenu[] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const cerrar = () => menu.current?.removeAttribute("open");

  return (
    <details ref={menu} className="group xl:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-xs border border-cemento px-4 font-display text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Menú</span>
        <span className="hidden group-open:inline">Cerrar</span>
      </summary>
      <nav aria-label="Secciones" className="absolute inset-x-0 top-16 border-y border-line bg-surface">
        <ul className="mx-auto max-w-[78rem] divide-y divide-line px-4 sm:px-6">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                onClick={cerrar}
                className={`flex min-h-13 items-center font-display text-lg font-bold uppercase hover:text-accent ${e.secundario ? "text-ink-muted" : "text-ink"}`}
              >
                {e.texto}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
