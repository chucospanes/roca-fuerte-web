import { site } from "@/config/site";

const enlaces = [
  { href: "#la-casa", texto: "La casa" },
  { href: "#materiales", texto: "Materiales" },
  { href: "#bitacora", texto: "Bitácora" },
  { href: "#opciones", texto: "Precios" },
  { href: "#preguntas", texto: "Preguntas" },
];

export function Encabezado() {
  return (
    <header className="sticky top-0 z-30 border-b border-piedra-200 bg-concreto/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <a href="#inicio" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span aria-hidden className="block size-3 bg-terracota" />
          {site.marca}
        </a>
        <nav aria-label="Secciones" className="hidden md:block">
          <ul className="flex gap-6 text-sm font-semibold text-piedra-700">
            {enlaces.map((e) => (
              <li key={e.href}>
                <a href={e.href} className="hover:text-terracota">
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href="#contacto"
          className="rounded-md bg-piedra-900 px-4 py-2 text-sm font-semibold text-blanco hover:bg-terracota"
        >
          Contactar
        </a>
      </div>
    </header>
  );
}
