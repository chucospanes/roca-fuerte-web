import type { Metadata, Viewport } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import { site } from "@/config/site";
import { esparta } from "@/content/esparta";
import { SCRIPT_CAPTURA_ORIGEN, SCRIPT_CLICS_VENTA } from "@/lib/origen";
import "./globals.css";

// "optional": si Archivo no llega en los primeros ~100 ms, esa visita se queda con la fuente
// de respaldo y el titular del hero no cambia de alto (evita el salto de diseño, ver
// DECISIONES.md). Queda en caché para la siguiente página. Fuente variable (sin `weight`): un
// solo archivo cubre del 600 que usan las páginas internas al 900 del titular de la portada, y
// el eje de ancho (`wdth`), con el que los titulares de la portada van al 85 % (ver globals.css).
const titulos = Archivo({
  variable: "--font-titulos",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "optional",
});

const texto = Source_Sans_3({
  variable: "--font-texto",
  subsets: ["latin"],
});

// Sin el área construida: abre con la casa de una planta y el terreno (ver DECISIONES.md, 2026-11-12)
const descripcion = `${site.modelo}: casa de una planta con ${esparta.dormitorios} dormitorios, en terreno desde ${esparta.lote.frenteM * esparta.lote.fondoM} m². Construcción documentada etapa por etapa, en ${site.pais}.`;

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
  themeColor: "#1c1e1f",
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
