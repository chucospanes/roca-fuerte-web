import { VideoLazy } from "@/components/VideoLazy";
import type { EtapaCasa } from "@/lib/casas";

// "por_iniciar" significa "no ha empezado": se muestra como "Por iniciar", sin sello de
// pendiente, para no confundirlo con un dato no confirmado.
const estilosEstado: Record<EtapaCasa["estado"], { punto: string; etiqueta: string; texto: string }> = {
  terminada: {
    punto: "bg-piedra-900 border-piedra-900",
    etiqueta: "bg-piedra-900 text-blanco",
    texto: "Terminada",
  },
  en_proceso: {
    punto: "bg-terracota border-terracota",
    etiqueta: "bg-terracota text-blanco",
    texto: "En proceso",
  },
  por_iniciar: {
    punto: "bg-blanco border-piedra-300",
    etiqueta: "bg-piedra-100 text-piedra-600",
    texto: "Por iniciar",
  },
};

const formato = new Intl.DateTimeFormat("es-SV", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Fecha `AAAA-MM-DD` de la base (columna `date`) en texto, sin correrse por zona horaria. */
function fecha(valor: string): string {
  const d = new Date(`${valor.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? valor : formato.format(d);
}

/**
 * Avance de una casa del catálogo, etapa por etapa (`casas_venta_etapas`): solo el estado y la
 * fecha de inicio, sin porcentajes. Lo usan la bitácora de la portada y la ficha de la casa.
 */
export function AvanceObra({
  etapas,
  encabezado: Encabezado = "h3",
}: {
  etapas: EtapaCasa[];
  encabezado?: "h2" | "h3";
}) {
  return (
    <ol className="relative space-y-8 border-l-2 border-piedra-200 pl-6 sm:pl-8">
      {etapas.map((etapa) => {
        const estilo = estilosEstado[etapa.estado];
        return (
          <li key={etapa.id} className="relative">
            <span
              aria-hidden
              className={`absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2 sm:-left-[calc(2rem+7px)] ${estilo.punto}`}
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Encabezado className="font-display text-xl font-bold">{etapa.nombre}</Encabezado>
              <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${estilo.etiqueta}`}>
                {estilo.texto}
              </span>
            </div>
            {etapa.fecha_inicio && (
              <p className="mt-1 text-sm text-piedra-600">Inicio: {fecha(etapa.fecha_inicio)}</p>
            )}
            {etapa.descripcion && <p className="mt-2 text-piedra-700">{etapa.descripcion}</p>}
            {etapa.video && (
              <div className="mt-4 max-w-xl">
                <VideoLazy
                  src={etapa.video.src}
                  vertical={etapa.video.vertical}
                  plataforma={etapa.video.plataforma}
                  titulo={`${etapa.nombre}: video`}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
