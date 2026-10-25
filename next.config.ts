import type { NextConfig } from "next";
import { site } from "./src/config/site";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Solo desarrollo: permite revisar `npm run dev` desde el celular en la red local
  // (rangos de IP privadas). No afecta producción.
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "172.*.*.*"],
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
  async headers() {
    if (site.lanzado) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
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
