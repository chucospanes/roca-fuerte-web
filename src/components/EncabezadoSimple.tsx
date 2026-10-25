import Link from "next/link";
import { site } from "@/config/site";

/** Encabezado de las páginas internas (ficha premium, privacidad): marca y volver al inicio. */
export function EncabezadoSimple() {
  return (
    <header className="border-b border-piedra-200 bg-blanco">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
          <span aria-hidden className="size-3 bg-terracota" />
          {site.marca}
        </Link>
        <Link
          href="/"
          className="flex min-h-11 items-center text-sm font-semibold text-terracota underline-offset-4 hover:underline"
        >
          ← Volver a la casa
        </Link>
      </div>
    </header>
  );
}
