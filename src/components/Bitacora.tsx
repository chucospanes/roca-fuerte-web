import { esPendiente } from "@/config/site";
import { bitacora, type EstadoEtapa } from "@/content/bitacora";
import { videoEmbed } from "@/lib/video";
import { Pendiente, Seccion } from "./ui";
import { VideoLazy } from "./VideoLazy";

// "pendiente" en la bitácora significa "no ha empezado"; se muestra como "Por iniciar"
// para no confundirlo con la marca de dato no confirmado.
const estilosEstado: Record<EstadoEtapa, { punto: string; etiqueta: string; texto: string }> = {
  terminada: {
    punto: "bg-piedra-900 border-piedra-900",
    etiqueta: "bg-piedra-900 text-blanco",
    texto: "Terminada",
  },
  "en proceso": {
    punto: "bg-terracota border-terracota",
    etiqueta: "bg-terracota text-blanco",
    texto: "En proceso",
  },
  pendiente: {
    punto: "bg-blanco border-piedra-300",
    etiqueta: "bg-piedra-100 text-piedra-600",
    texto: "Por iniciar",
  },
};

function formatoFecha(iso: string) {
  const fecha = new Date(`${iso}T12:00:00`);
  return Number.isNaN(fecha.getTime())
    ? iso
    : fecha.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" });
}

export function Bitacora() {
  return (
    <Seccion
      id="bitacora"
      numero="05"
      etiqueta="Obra en vivo"
      titulo="Bitácora de obra"
      intro="Cada etapa de la Casa Esparta con su fecha, su avance y los videos donde se ve el trabajo. Los videos cargan solo cuando los tocas."
    >
      <ol className="relative space-y-8 border-l-2 border-piedra-200 pl-6 sm:pl-8">
        {bitacora.map((etapa) => {
          const estilo = estilosEstado[etapa.estado];
          return (
            <li key={etapa.id} className="relative">
              <span
                aria-hidden
                className={`absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2 sm:-left-[calc(2rem+7px)] ${estilo.punto}`}
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-display text-xl font-bold">{etapa.titulo}</h3>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${estilo.etiqueta}`}>
                  {estilo.texto}
                </span>
              </div>
              <p className="mt-1 text-sm text-piedra-600">
                Inicio:{" "}
                {esPendiente(etapa.fecha) ? <Pendiente /> : formatoFecha(etapa.fecha)}
              </p>
              <p className="mt-2 text-piedra-700">{etapa.descripcion}</p>

              {etapa.estado !== "pendiente" && (
              <div className="mt-3 max-w-md">
                {esPendiente(etapa.avance) ? (
                  <p className="text-sm text-piedra-600">
                    Avance: <Pendiente />
                  </p>
                ) : (
                  <>
                    <div className="flex justify-between text-sm text-piedra-600">
                      <span>Avance</span>
                      <span className="font-semibold text-piedra-800">{etapa.avance} %</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={etapa.avance}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Avance de ${etapa.titulo}`}
                      className="mt-1 h-2 overflow-hidden rounded-full bg-piedra-100"
                    >
                      <div className="h-full bg-terracota" style={{ width: `${etapa.avance}%` }} />
                    </div>
                  </>
                )}
              </div>
              )}

              {etapa.materiales.length > 0 && (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">Materiales: </span>
                  {etapa.materiales.join(", ")}
                </p>
              )}

              {etapa.videos.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {etapa.videos.map((video) => {
                    const embed = videoEmbed(video);
                    const titulo = video.titulo ?? `${etapa.titulo}: video`;
                    return embed ? (
                      <VideoLazy
                        key={video.url}
                        src={embed.src}
                        vertical={embed.vertical}
                        plataforma={video.plataforma}
                        titulo={titulo}
                      />
                    ) : (
                      <a
                        key={video.url}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-terracota underline"
                      >
                        {titulo}
                      </a>
                    );
                  })}
                </div>
              ) : (
                etapa.estado !== "pendiente" && (
                  <p className="mt-3 text-sm text-piedra-600">
                    Videos: <Pendiente texto="Próximamente" />
                  </p>
                )
              )}
            </li>
          );
        })}
      </ol>
    </Seccion>
  );
}
