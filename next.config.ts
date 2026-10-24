import type { NextConfig } from "next";

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
    "/descargas/\\[archivo\\]": ["./assets/*.png", "./assets/*.py"],
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
