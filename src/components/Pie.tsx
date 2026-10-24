import { esPendiente, site, whatsappEsPlaceholder, type RedSocial } from "@/config/site";
import { whatsappHref } from "@/lib/whatsapp";
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
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold tracking-[0.15em] text-blanco uppercase">
            Contacto
          </h2>
          <p className="mt-3 text-sm">
            WhatsApp:{" "}
            {whatsappEsPlaceholder() ? (
              <Pendiente />
            ) : (
              <a href={whatsappHref()} className="text-blanco underline">
                +{site.whatsapp}
              </a>
            )}
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

      <div id="privacidad" className="mx-auto mt-10 max-w-5xl border-t border-piedra-700 px-4 pt-6 text-sm">
        <h2 className="font-semibold text-blanco">Aviso de privacidad</h2>
        <p className="mt-2">
          <Pendiente texto="Texto del aviso pendiente" />
        </p>
        <p className="mt-6 text-piedra-500">
          © {site.marca}
        </p>
      </div>
    </footer>
  );
}
