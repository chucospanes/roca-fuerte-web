import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EncabezadoSimple } from "@/components/EncabezadoSimple";
import { Pie } from "@/components/Pie";
import { Pendiente } from "@/components/ui";
import { site, whatsappVisible } from "@/config/site";

export const metadata: Metadata = {
  title: `Aviso de privacidad · ${site.marca}`,
  description: `Qué datos guarda ${site.marca}, para qué los usa y cómo pedir que los borremos.`,
  alternates: { canonical: "/privacidad" },
  // Sin `robots` propio: hereda el del layout (interruptor de lanzamiento)
};

/**
 * Aviso de privacidad. Una sola fuente: `docs/AVISO_PRIVACIDAD.md`, el mismo texto que
 * revisa el abogado. Se lee al compilar (página estática). Lo que va antes de la primera
 * línea `---` son notas para el abogado y no se publica. En el texto: `{marca}`, `{titular}`,
 * `{domicilio}`, `{correo}` y `{whatsapp}` salen de `site.ts`; `[PENDIENTE: …]` se muestra con
 * el sello de pendiente.
 * Formato admitido: `## título`, párrafos, listas con `- ` y `**negrita**`.
 */
const fuente = await readFile(join(process.cwd(), "docs", "AVISO_PRIVACIDAD.md"), "utf8");

type Bloque =
  | { tipo: "titulo"; texto: string }
  | { tipo: "parrafo"; texto: string }
  | { tipo: "lista"; items: string[] };

function leerBloques(markdown: string): Bloque[] {
  const lineas = markdown.replace(/\r\n/g, "\n").split("\n");
  const inicio = lineas.findIndex((l) => l.trim() === "---");
  const bloques: Bloque[] = [];
  for (const linea of lineas.slice(inicio + 1)) {
    const l = linea.trim();
    const ultimo = bloques.at(-1);
    if (!l) {
      bloques.push({ tipo: "parrafo", texto: "" }); // separador; los vacíos se descartan
    } else if (l.startsWith("## ")) {
      bloques.push({ tipo: "titulo", texto: l.slice(3) });
    } else if (l.startsWith("- ")) {
      if (ultimo?.tipo === "lista") ultimo.items.push(l.slice(2));
      else bloques.push({ tipo: "lista", items: [l.slice(2)] });
    } else if (ultimo?.tipo === "lista" && linea.startsWith("  ")) {
      ultimo.items[ultimo.items.length - 1] += ` ${l}`; // continuación de un ítem
    } else if (ultimo?.tipo === "parrafo" && ultimo.texto) {
      ultimo.texto += ` ${l}`;
    } else {
      bloques.push({ tipo: "parrafo", texto: l });
    }
  }
  return bloques.filter((b) => b.tipo !== "parrafo" || b.texto);
}

/** Datos de `site.ts`, `**negrita**` y `[PENDIENTE: …]` dentro de una línea. */
function enLinea(texto: string): ReactNode[] {
  return texto
    .replaceAll("{marca}", site.marca)
    .replaceAll("{titular}", site.privacidad.titular)
    .replaceAll("{domicilio}", site.privacidad.domicilio)
    .replaceAll("{correo}", site.privacidad.correo)
    .replaceAll("{whatsapp}", whatsappVisible())
    .split(/(\*\*[^*]+\*\*|\[PENDIENTE:[^\]]+\])/)
    .filter(Boolean)
    .map((parte, i) => {
      if (parte.startsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-piedra-900">
            {enLinea(parte.slice(2, -2))}
          </strong>
        );
      }
      if (parte.startsWith("[PENDIENTE:")) {
        return <Pendiente key={i} texto={`Pendiente: ${parte.slice(11, -1).trim()}`} />;
      }
      return parte;
    });
}

const bloques = leerBloques(fuente);

export default function PrivacidadPage() {
  return (
    <>
      <EncabezadoSimple />
      <main className="bg-piedra-50">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-terracota uppercase">
            {site.marca}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Aviso de privacidad
          </h1>

          <div
            role="note"
            className="mt-6 rounded border-2 border-dashed border-pendiente/60 bg-pendiente-fondo p-4 text-pendiente"
          >
            <p className="font-display text-sm font-bold tracking-wide uppercase">
              Borrador pendiente de revisión legal
            </p>
            <p className="mt-1 text-sm">
              Este texto todavía no ha sido revisado por un abogado y puede cambiar. Los datos
              marcados como pendientes aún no están confirmados.
            </p>
          </div>

          <div className="mt-8 text-piedra-700">
            {bloques.map((b, i) => {
              if (b.tipo === "titulo") {
                return (
                  <h2 key={i} className="mt-10 font-display text-xl font-bold text-piedra-900">
                    {enLinea(b.texto)}
                  </h2>
                );
              }
              if (b.tipo === "lista") {
                return (
                  <ul key={i} className="mt-3 list-disc space-y-1 pl-6">
                    {b.items.map((item, j) => (
                      <li key={j}>{enLinea(item)}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="mt-3">
                  {enLinea(b.texto)}
                </p>
              );
            })}
          </div>
        </article>
      </main>
      <Pie />
    </>
  );
}
