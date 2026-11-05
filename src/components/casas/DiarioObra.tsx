import Image from "next/image";
import { VideoLazy } from "@/components/VideoLazy";
import { fecha } from "@/content/portal";
import type { AvancePublico } from "@/lib/casas";

/**
 * Diario de obra de una casa del catálogo (010): avances del portal publicados desde el panel,
 * en orden cronológico. Fotos del bucket público `casas` (copias); cada una se abre completa.
 */
export function DiarioObra({ avances, titulo }: { avances: AvancePublico[]; titulo: string }) {
  return (
    <ol className="space-y-10">
      {avances.map((a) => (
        <li key={a.id} className="border-l-4 border-terracota pl-4">
          <p className="text-sm font-semibold text-piedra-600">{fecha(a.fecha)}</p>
          <h4 className="font-display text-xl font-bold">{a.titulo}</h4>
          {a.descripcion && <p className="mt-1 whitespace-pre-line text-piedra-700">{a.descripcion}</p>}
          {a.fotos.length > 0 && (
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {a.fotos.map((f, i) => (
                <li key={f.nombre}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="block">
                    <span className="relative block aspect-square overflow-hidden rounded-md bg-piedra-100">
                      <Image
                        src={f.url}
                        alt={`${a.titulo}, foto ${i + 1} (${titulo})`}
                        fill
                        sizes="(max-width: 640px) 33vw, 220px"
                        className="object-cover"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {a.video && (
            <div className="mt-4 max-w-xl">
              <VideoLazy
                src={a.video.src}
                vertical={a.video.vertical}
                plataforma={a.video.plataforma}
                titulo={`${a.titulo}: video`}
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
