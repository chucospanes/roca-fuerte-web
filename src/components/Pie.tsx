import Link from "next/link";
import { esPendiente, site, whatsappVisible, type RedSocial } from "@/config/site";
import { mensajesVenta, whatsappHref } from "@/lib/whatsapp";
import { Pendiente } from "./ui";

const nombresRedes: Record<RedSocial, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

export function Pie() {
  return (
    <footer className="bg-piedra-900 pt-12 pb-28 text-piedra-200 md:pb-12">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold text-blanco">
            <span aria-hidden className="block size-3 bg-terracota" />
            {site.marca}
          </p>
          <p className="mt-2 text-sm">
            {site.modelo}. Construcción documentada en {site.pais}.
          </p>
          <p className="mt-3 text-sm text-blanco italic">{site.lema}</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold tracking-[0.15em] text-blanco uppercase">
            Contacto
          </h2>
          <p className="mt-3 text-sm">
            WhatsApp:{" "}
            <a
              href={whatsappHref(mensajesVenta.general)}
              target="_blank"
              rel="noopener noreferrer"
              data-venta="general"
              data-ubicacion="pie"
              className="text-blanco underline"
            >
              {whatsappVisible()}
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold tracking-[0.15em] text-blanco uppercase">
            Redes
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(Object.keys(nombresRedes) as RedSocial[]).map((red) => (
              <li key={red}>
                {esPendiente(site.redes[red]) ? (
                  <>
                    {nombresRedes[red]} <Pendiente />
                  </>
                ) : (
                  <a
                    href={site.redes[red]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blanco underline"
                  >
                    {nombresRedes[red]}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-piedra-700 px-4 pt-6 text-sm">
        <ul className="flex flex-wrap gap-x-6">
          <li>
            <Link href="/casas" className="flex min-h-11 items-center text-blanco underline">
              Casas en venta
            </Link>
          </li>
          <li>
            <Link href="/#inversionistas" className="flex min-h-11 items-center text-blanco underline">
              Para inversionistas
            </Link>
          </li>
          {site.portalClientes && (
            <li>
              <Link href="/portal" className="flex min-h-11 items-center text-blanco underline">
                Acceso clientes
              </Link>
            </li>
          )}
          <li>
            <Link href="/privacidad" className="flex min-h-11 items-center text-blanco underline">
              Aviso de privacidad
            </Link>
          </li>
        </ul>
        <p className="text-piedra-300">© {site.marca}</p>
      </div>
    </footer>
  );
}
