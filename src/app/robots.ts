import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Se indexan la landing, el catálogo de casas y la privacidad. El área premium, las
 * descargas y la API quedan fuera. El portal de clientes y `/casa-no-disponible` NO van en
 * Disallow: llevan noindex (metadata y X-Robots-Tag) y Google tiene que poder leerlo.
 * Antes del lanzamiento (`site.lanzado` apagado) NO se bloquea todo con Disallow: el noindex
 * va en cada página y en el encabezado X-Robots-Tag, y Google tiene que poder leerlo (ver
 * DECISIONES.md). Solo se omite el sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/esparta/ficha", "/descargas/", "/api/"],
    },
    ...(site.lanzado ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}
