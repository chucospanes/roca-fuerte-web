import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * La landing y el aviso de privacidad: el área premium no se indexa (noindex y robots.txt).
 * Vacío mientras `site.lanzado` esté apagado. Sin `lastModified`: una fecha calculada en el
 * build cambiaría en cada despliegue aunque el contenido no cambie.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.lanzado) return [];
  return [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
