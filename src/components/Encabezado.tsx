import Link from "next/link";
import { site } from "@/config/site";
import { MenuMovil, type EnlaceMenu } from "./MenuMovil";

const secciones: EnlaceMenu[] = [
  { href: "#la-casa", texto: "La casa" },
  { href: "#calidad", texto: "Calidad" },
  { href: "#materiales", texto: "Materiales" },
  { href: "#bitacora", texto: "Bitácora" },
  { href: "#opciones", texto: "Precios" },
  { href: "#inversionistas", texto: "Inversionistas" },
  { href: "#preguntas", texto: "Preguntas" },
];

/** "Acceso clientes" solo aparece con el portal encendido (`site.portalClientes`). */
const accesoClientes: EnlaceMenu = { href: "/portal", texto: "Acceso clientes" };

export function Encabezado() {
  const enlaces = site.portalClientes ? [...secciones, accesoClientes] : secciones;
  return (
    <header className="sticky top-0 z-30 border-b border-piedra-200 bg-concreto/95 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <a href="#inicio" className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span aria-hidden className="block size-3 bg-terracota" />
          {site.marca}
        </a>
        <nav aria-label="Secciones" className="hidden md:block">
          <ul className="flex gap-5 text-sm font-semibold text-piedra-700">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="hover:text-terracota">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MenuMovil enlaces={enlaces} />
        <a
          href="#contacto"
          className="flex min-h-11 items-center rounded-md bg-piedra-900 px-4 text-sm font-semibold text-blanco hover:bg-terracota"
        >
          Contactar
        </a>
      </div>
    </header>
  );
}
