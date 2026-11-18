"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { elegirPortada } from "@/app/admin/acciones";
import type { FotoPublicada } from "@/lib/admin";

export const AVISO_VERTICAL = "Esta foto es vertical: en la tarjeta se recortará arriba y abajo";

/**
 * Fotos de un avance publicado en la ficha, cada una con "Usar como foto de la tarjeta". La
 * base registra la copia pública como portada de la casa (015) y la anterior deja de serlo.
 * Si la foto es vertical se avisa (la tarjeta es horizontal), pero se puede elegir igual.
 */
export function FotosTarjeta({ avanceId, fotos }: { avanceId: string; fotos: FotoPublicada[] }) {
  const router = useRouter();
  const [verticales, setVerticales] = useState<Record<string, boolean>>({});
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  async function elegir(nombre: string) {
    setTrabajando(nombre);
    setResultado(null);
    const r = await elegirPortada({ avanceId, foto: nombre }).catch(() => null);
    setTrabajando(null);
    setResultado(
      !r
        ? { ok: false, texto: "No se pudo cambiar. Revisa la conexión y vuelve a intentarlo." }
        : r.ok
          ? { ok: true, texto: `Listo: la foto ${nombre} es la foto de la tarjeta. El catálogo se actualiza en la próxima visita.` }
          : { ok: false, texto: r.mensaje },
    );
    router.refresh();
  }

  if (fotos.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-piedra-800">Fotos en la ficha</p>
      <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos.map((f) => (
          <li key={f.nombre}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-piedra-100">
              <Image
                src={f.url}
                alt={`Foto ${f.nombre} del avance`}
                fill
                sizes="(min-width: 640px) 200px, 45vw"
                className="object-cover"
                onLoad={(ev) => {
                  const img = ev.currentTarget;
                  const vertical = img.naturalHeight > img.naturalWidth;
                  setVerticales((v) => (v[f.nombre] === vertical ? v : { ...v, [f.nombre]: vertical }));
                }}
              />
            </div>
            {f.esPortada ? (
              <p className="flex min-h-11 items-center text-sm font-semibold text-piedra-800">Foto de la tarjeta ✓</p>
            ) : (
              <button
                type="button"
                disabled={trabajando !== null}
                onClick={() => elegir(f.nombre)}
                className="inline-flex min-h-11 items-center text-left text-sm font-semibold text-terracota disabled:opacity-60"
              >
                {trabajando === f.nombre ? "Cambiando…" : "Usar como foto de la tarjeta"}
              </button>
            )}
            {verticales[f.nombre] && <p className="text-xs text-terracota-oscuro">{AVISO_VERTICAL}</p>}
          </li>
        ))}
      </ul>
      {resultado && (
        <p
          role={resultado.ok ? "status" : "alert"}
          className={`mt-2 text-sm font-semibold ${resultado.ok ? "text-piedra-800" : "text-terracota-oscuro"}`}
        >
          {resultado.texto}
        </p>
      )}
    </div>
  );
}
