"use client";

import Link from "next/link";
import { useRef } from "react";

export type EnlaceMenu = { href: string; texto: string };

/**
 * Menú de secciones en el celular. Es un `<details>`: abre y cierra sin JavaScript. Con
 * JavaScript, además se cierra al tocar un enlace (si no, quedaría abierto tapando la
 * sección a la que se saltó).
 */
export function MenuMovil({ enlaces }: { enlaces: EnlaceMenu[] }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const cerrar = () => menu.current?.removeAttribute("open");

  return (
    <details ref={menu} className="group md:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-md border border-piedra-300 px-3 text-sm font-semibold text-piedra-800 [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Menú</span>
        <span className="hidden group-open:inline">Cerrar</span>
      </summary>
      <nav
        aria-label="Secciones"
        className="absolute inset-x-0 top-14 border-b border-piedra-200 bg-concreto shadow-md"
      >
        <ul className="mx-auto max-w-5xl divide-y divide-piedra-200 px-4">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                onClick={cerrar}
                className="flex min-h-12 items-center font-semibold text-piedra-800 hover:text-terracota"
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
