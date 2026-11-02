import type { Metadata } from "next";
import { CasaNoDisponible } from "@/components/casas/CasaNoDisponible";
import { site } from "@/config/site";

/**
 * Página estática que el proxy envía con estado 404 cuando se pide `/casas/[slug]` de una casa
 * que no existe o no está publicada (ver `proxy.ts`). Siempre `noindex`, también con el sitio
 * lanzado; no está en el sitemap.
 */
export const metadata: Metadata = {
  title: `Casa no disponible · ${site.marca}`,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CasaNoDisponible />;
}
