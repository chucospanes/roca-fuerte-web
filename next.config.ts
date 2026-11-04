import type { NextConfig } from "next";
import { site } from "./src/config/site";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Solo desarrollo: permite revisar `npm run dev` desde el celular en la red local
  // (rangos de IP privadas). No afecta producción.
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "172.*.*.*"],
  // Fotos y planos del catálogo de casas: solo el bucket PÚBLICO `casas` de Supabase (nunca
  // el privado `obras`: el portal no usa next/image para no guardar copias en caché).
  images: {
    // AVIF primero (más liviano), WebP de respaldo. 60: foto del hero, que va bajo un velo oscuro
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/casas/**`)]
      : [],
  },
  // Los PDF premium no están en public/: la ruta de descargas los lee de assets/ y aquí
  // se incluyen en el despliegue (solo los PDF, no el resto de assets/).
  outputFileTracingIncludes: {
    "/descargas/\\[archivo\\]": ["./assets/*.pdf"],
  },
  outputFileTracingExcludes: {
    "/descargas/\\[archivo\\]": ["./assets/*.png", "./assets/*.py", "./assets/fonts/**"],
  },
  // Interruptor de lanzamiento (site.lanzado): apagado, todas las rutas (páginas, PDF,
  // imagen Open Graph, API) responden con noindex. Se lee de site.ts, no de una variable.
  // El portal de clientes lleva noindex SIEMPRE, también con el sitio lanzado (sin
  // Disallow en robots.txt, para que Google pueda leerlo; ver DECISIONES.md).
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    if (site.lanzado) return [{ source: "/portal/:path*", headers: noindex }];
    return [{ source: "/:path*", headers: noindex }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
