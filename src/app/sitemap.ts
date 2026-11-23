import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { listarCasas } from "@/lib/casas";

/**
 * La landing, el aviso de privacidad, /inversionistas y el catálogo de casas (con cada casa publicada): el
 * área premium no se indexa (noindex y robots.txt). Vacío mientras `site.lanzado` esté
 * apagado. Sin `lastModified`: una fecha calculada en el build cambiaría en cada despliegue
 * aunque el contenido no cambie. Las casas salen de Supabase (caché de minutos); si la
 * consulta falla, el sitemap sale sin ellas en vez de fallar.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.lanzado) return [];
  const resultado = await listarCasas();
  const casas = resultado.ok ? resultado.datos : [];
  return [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/casas`, changeFrequency: "weekly", priority: 0.8 },
    ...casas.map((c) => ({
      url: `${site.url}/casas/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${site.url}/inversionistas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
