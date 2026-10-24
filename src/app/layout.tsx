import type { Metadata, Viewport } from "next";
import { Archivo, Source_Sans_3 } from "next/font/google";
import { CapturaOrigen } from "@/components/CapturaOrigen";
import { site } from "@/config/site";
import "./globals.css";

const titulos = Archivo({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const texto = Source_Sans_3({
  variable: "--font-texto",
  subsets: ["latin"],
});

// SEO completo (Open Graph, sitemap, schema.org) en la Fase 5.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.modelo} · ${site.marca}`,
  description: `${site.modelo}: 2 dormitorios, 43.60 m². Construcción documentada etapa por etapa en ${site.pais}.`,
};

export const viewport: Viewport = {
  themeColor: "#efece7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${titulos.variable} ${texto.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-base leading-relaxed">
        {children}
        <CapturaOrigen />
      </body>
    </html>
  );
}
