import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** Solo la landing se indexa. El área premium, las descargas y la API quedan fuera. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/bonaire/ficha", "/descargas/", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
