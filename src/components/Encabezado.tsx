import Link from "next/link";
import { site } from "@/config/site";
import { hayBitacora } from "@/lib/casas";
import { MenuMovil, type EnlaceMenu } from "./MenuMovil";

// Rutas absolutas ("/#..."): el encabezado también se usa en /casas
const secciones: EnlaceMenu[] = [
  { href: "/casas", texto: "Casas" },
  { href: "/#hermanos", texto: "Hermano cercano" },
  { href: "/#la-casa", texto: "La casa" },
  { href: "/#calidad", texto: "Calidad" },
  { href: "/#materiales", texto: "Materiales" },
  { href: "/#bitacora", texto: "Bitácora" },
  { href: "/#opciones", texto: "Precios" },
  { href: "/#inversionistas", texto: "Inversionistas" },
  { href: "/#preguntas", texto: "Preguntas" },
];

/** "Acceso clientes" solo aparece con el portal encendido (`site.portalClientes`). */
const accesoClientes: EnlaceMenu = { href: "/portal", texto: "Acceso clientes" };

/** Sin casa en obra no hay bitácora en la portada: el menú no la enlaza. */
export async function Encabezado() {
  const conBitacora = await hayBitacora();
  const visibles = conBitacora ? secciones : secciones.filter((e) => e.href !== "/#bitacora");
  const enlaces = site.portalClientes ? [...visibles, accesoClientes] : visibles;
  return (
    <header className="sticky top-0 z-30 border-b border-piedra-200 bg-concreto/95 backdrop-blur">
      {/* Con 10 enlaces, el menú en línea solo cabe desde 1280 px; antes, el menú desplegable */}
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 xl:max-w-6xl">
        <Link href="/#inicio" className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
          <span aria-hidden className="block size-3 bg-terracota" />
          {site.marca}
        </Link>
        <nav aria-label="Secciones" className="hidden xl:block">
          <ul className="flex gap-4 text-sm font-semibold whitespace-nowrap text-piedra-700">
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
        <Link
          href="/#contacto"
          className="flex min-h-11 items-center rounded-md bg-piedra-900 px-4 text-sm font-semibold text-blanco hover:bg-terracota"
        >
          Contactar
        </Link>
      </div>
    </header>
  );
}
