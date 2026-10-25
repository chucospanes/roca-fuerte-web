import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Solo la landing: el área premium no se indexa (noindex y robots.txt).
 * Sin `lastModified`: una fecha calculada en el build cambiaría en cada despliegue
 * aunque el contenido no cambie.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/`, changeFrequency: "weekly", priority: 1 }];
}
