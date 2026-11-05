import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Administración · ${site.marca}`,
  // Privado: noindex aquí y X-Robots-Tag (next.config.ts y proxy), sin Disallow ni enlaces
  robots: { index: false, follow: false },
};

/** Panel de administración: encabezado propio, sin enlaces al sitio público ni WhatsApp. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-piedra-200 bg-blanco">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <Link href="/admin" className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            <span aria-hidden className="size-3 bg-terracota" />
            {site.marca}
            <span className="font-semibold text-piedra-600">· Admin</span>
          </Link>
        </div>
      </header>
      <main className="min-h-dvh bg-piedra-50">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">{children}</div>
      </main>
    </>
  );
}
