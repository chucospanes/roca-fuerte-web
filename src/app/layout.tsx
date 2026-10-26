import type { Metadata, Viewport } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import { site } from "@/config/site";
import { bonaire } from "@/content/bonaire";
import { SCRIPT_CAPTURA_ORIGEN, SCRIPT_CLICS_VENTA } from "@/lib/origen";
import "./globals.css";

// "optional": si Archivo no llega en los primeros ~100 ms, esa visita se queda con la fuente
// de respaldo y el titular del hero no cambia de alto (evita el salto de diseño, ver
// DECISIONES.md). Queda en caché para la siguiente página.
const titulos = Archivo({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "optional",
});

const texto = Source_Sans_3({
  variable: "--font-texto",
  subsets: ["latin"],
});

const descripcion = `${site.modelo}: ${bonaire.dormitorios} dormitorios, ${bonaire.areas.construidaM2.toFixed(2)} m² de construcción. Cada material y cada etapa de la obra, documentados en video, en ${site.pais}.`;

// La imagen para compartir la genera `opengraph-image.tsx` (fachada + modelo + marca).
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.modelo} · ${site.marca}`,
  description: descripcion,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_SV",
    siteName: site.marca,
    url: "/",
    title: `${site.modelo} · ${site.marca}`,
    description: descripcion,
  },
  twitter: { card: "summary_large_image" },
  // Interruptor de lanzamiento (site.lanzado): apagado, ninguna página se indexa. Una página
  // que defina su propio `robots` reemplaza este valor (la ficha premium ya lleva noindex);
  // el encabezado X-Robots-Tag de next.config.ts cubre todas las rutas de todos modos.
  ...(site.lanzado ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#efece7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${titulos.variable} ${texto.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-base leading-relaxed">
        {/* Antes de que cargue React (ver lib/origen.ts): guarda UTM y referrer de la primera
            visita, y cuenta los clics de venta agregando la referencia al mensaje */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_CAPTURA_ORIGEN + SCRIPT_CLICS_VENTA }} />
        {children}
      </body>
    </html>
  );
}
