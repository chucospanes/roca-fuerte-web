import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { portada } from "@/content/portada";
import { leerProyecto } from "@/lib/portada";
import { mensajesVenta, whatsappHref } from "@/lib/whatsapp";
import { MenuMovil, type EnlaceMenu } from "./MenuMovil";

/**
 * Encabezado de la v2.0.0 (5.1): oscuro, logo claro, menú y botón de WhatsApp. Rutas absolutas
 * ("/#..."): también se usa en /casas y la ficha. Sin proyecto en la portada, "Proyectos" lleva
 * al catálogo.
 *
 * El botón de WhatsApp se ve desde 768 px y cuenta como `general`/`flotante`: en el celular está
 * el botón flotante y nunca se ven los dos a la vez ("flotante" = el WhatsApp siempre visible,
 * ver DECISIONES.md, 2026-11-23).
 */
export async function Encabezado() {
  const proyecto = await leerProyecto();
  const { menu } = portada;
  const enlaces: EnlaceMenu[] = [
    { href: proyecto ? "/#proyectos" : "/casas", texto: menu.proyectos },
    { href: "/#calidad", texto: menu.calidad },
    { href: "/#proceso", texto: menu.proceso },
    { href: "/#hermano", texto: menu.hermano },
    ...(site.portalClientes ? [{ href: "/portal", texto: menu.portal, secundario: true }] : []),
  ];

  return (
    <header className="tono-oscuro sticky top-0 z-30 border-b border-line bg-surface text-ink">
      <div className="relative mx-auto flex h-16 w-full max-w-[78rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center" aria-label={`${site.marca}, inicio`}>
          <Image
            src="/brand/rf-logo-horizontal-claro.svg"
            alt=""
            width={651}
            height={120}
            unoptimized
            loading="eager"
            className="h-8 w-auto sm:h-9"
          />
        </Link>
        <nav aria-label="Secciones" className="hidden xl:block">
          <ul className="flex items-center gap-7 text-[15px] font-semibold whitespace-nowrap">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className={`flex min-h-11 items-center hover:text-accent ${e.secundario ? "text-ink-muted" : ""}`}
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <MenuMovil enlaces={enlaces} />
          <a
            href={whatsappHref(mensajesVenta.general)}
            target="_blank"
            rel="noopener noreferrer"
            data-venta="general"
            data-ubicacion="flotante"
            className="hidden min-h-11 items-center rounded-xs bg-accent px-5 font-display text-[15px] font-bold text-accent-ink transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
          >
            {menu.whatsapp}
          </a>
        </div>
      </div>
    </header>
  );
}
