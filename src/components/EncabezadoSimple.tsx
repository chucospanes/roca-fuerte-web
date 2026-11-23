import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

/** Encabezado de las páginas internas (ficha premium, privacidad, portal): logo y volver al inicio. */
export function EncabezadoSimple() {
  return (
    <header className="tono-oscuro border-b border-line bg-surface text-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-h-11 shrink-0 items-center" aria-label={`${site.marca}, inicio`}>
          <Image
            src="/brand/rf-logo-horizontal-claro.svg"
            alt=""
            width={651}
            height={120}
            unoptimized
            className="h-8 w-auto"
          />
        </Link>
        <Link
          href="/"
          className="flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          ← Volver a la casa
        </Link>
      </div>
    </header>
  );
}
