import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AreaPremium } from "@/components/premium/AreaPremium";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Ficha técnica y planos · ${site.modelo} · ${site.marca}`,
  description: `Planos en PDF, ficha técnica y materiales de la ${site.modelo}.`,
  // Contenido detrás de registro: no se indexa
  robots: { index: false, follow: false },
};

/**
 * Contenido premium. Apagado (`site.accesoPremium`), responde 404.
 * La parte que lee la sesión va en <Suspense>: con `cacheComponents`, leer cookies fuera
 * de un límite de Suspense es un error de build, y así el encabezado sale de inmediato.
 */
export default function FichaPage() {
  if (!site.accesoPremium) notFound();

  return (
    <>
      <header className="border-b border-piedra-200 bg-blanco">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            <span aria-hidden className="size-3 bg-terracota" />
            {site.marca}
          </Link>
          <Link href="/" className="text-sm font-semibold text-terracota underline-offset-4 hover:underline">
            ← Volver a la casa
          </Link>
        </div>
      </header>

      <main className="bg-piedra-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-terracota uppercase">
            {site.modelo}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Ficha técnica y planos en PDF
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-piedra-600">
            Planos imprimibles, ficha técnica completa, cantidades de materiales y qué incluye el
            precio. Te pedimos tus datos una sola vez y confirmamos tu correo con un código.
          </p>

          <div className="mt-10">
            <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
              <AreaPremium />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
