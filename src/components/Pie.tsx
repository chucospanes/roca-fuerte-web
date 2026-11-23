import Image from "next/image";
import Link from "next/link";
import { esPendiente, site, whatsappVisible, type RedSocial } from "@/config/site";
import { portada } from "@/content/portada";
import { mensajesVenta, whatsappHref } from "@/lib/whatsapp";

const nombresRedes: Record<RedSocial, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

/** Solo las redes que ya existen; sin ninguna, no aparecen (se agregan una por una). */
const redesActivas = (Object.keys(nombresRedes) as RedSocial[]).filter((red) => !esPendiente(site.redes[red]));

/** El dominio, sin protocolo: sale de `site.url`. */
const dominio = new URL(site.url).host;

const enlace = "inline-flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline";

/**
 * Pie de la v2.0.0 (5.10): oscuro, con el borde superior de 6 px en el acento (el cimiento). El
 * número de WhatsApp cuenta como `general`/`pie`. Abajo de todo deja lugar al botón flotante del
 * celular.
 */
export function Pie() {
  const { pie } = portada;
  return (
    <footer className="tono-oscuro border-t-[6px] border-accent bg-surface pt-16 pb-28 text-ink md:pb-12">
      <div className="mx-auto grid w-full max-w-[78rem] gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:px-8">
        <div>
          <Image
            src="/brand/rf-logo-horizontal-claro.svg"
            alt={site.marca}
            width={651}
            height={120}
            unoptimized
            className="h-10 w-auto"
          />
          <p className="mt-8 max-w-[28rem] font-display text-2xl leading-tight font-extrabold">{pie.constructora}</p>
          <p className="mt-3 text-ink-muted">{site.lema}</p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-[13px] font-bold tracking-[0.16em] text-ink-muted uppercase">
              {pie.contacto}
            </h2>
            <ul className="mt-3">
              <li>
                <a
                  href={whatsappHref(mensajesVenta.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-venta="general"
                  data-ubicacion="pie"
                  className={enlace}
                >
                  WhatsApp {whatsappVisible()}
                </a>
              </li>
              <li>
                <Link href="/" className={enlace}>
                  {dominio}
                </Link>
              </li>
              {site.portalClientes && (
                <li>
                  <Link href="/portal" className={enlace}>
                    {portada.menu.portal}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <nav aria-label="Más del sitio">
            <ul className="sm:mt-8">
              <li>
                <Link href="/casas" className={enlace}>
                  {pie.enlaces.casas}
                </Link>
              </li>
              <li>
                <Link href="/inversionistas" className={enlace}>
                  {pie.enlaces.inversionistas}
                </Link>
              </li>
              <li>
                <Link href="/#preguntas" className={enlace}>
                  {pie.enlaces.preguntas}
                </Link>
              </li>
              {redesActivas.map((red) => (
                <li key={red}>
                  <a href={site.redes[red]} target="_blank" rel="noopener noreferrer" className={enlace}>
                    {nombresRedes[red]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="mx-auto mt-14 w-full max-w-[78rem] px-4 sm:px-6 lg:px-8">
        <p className="flex flex-wrap items-center gap-x-3 border-t border-line pt-6 text-sm text-ink-muted">
          <span>
            © {pie.anio} {site.marca}
          </span>
          <span aria-hidden>·</span>
          <Link href="/privacidad" className={enlace}>
            {pie.enlaces.privacidad}
          </Link>
        </p>
      </div>
    </footer>
  );
}
