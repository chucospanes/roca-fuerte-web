import Image from "next/image";
import Link from "next/link";
import { catalogo, muestraPrecio, nombresEstado, resumenCasa, textoPrecioCasa, ubicacionCasa } from "@/content/casas";
import { casaDisponible, precioDesde, type CasaListada, type CasaVendida } from "@/lib/casas";

/** Etiqueta del estado de una casa; "Vendida" en oscuro, el resto en terracota. */
export function EtiquetaEstado({ estado }: { estado: CasaListada["estado"] }) {
  const vendida = estado === "vendida";
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${vendida ? "bg-piedra-900 text-blanco" : "bg-terracota text-blanco"}`}
    >
      {nombresEstado[estado]}
    </span>
  );
}

/** "Casa Roca Fuerte · En venta": solo en las disponibles (en construcción o terminadas). */
export function EtiquetaPropia({ estado }: { estado: CasaListada["estado"] }) {
  if (!casaDisponible(estado)) return null;
  return (
    <span className="inline-flex rounded border border-terracota px-2 py-0.5 text-xs font-semibold tracking-wide text-terracota uppercase">
      {catalogo.propiaEnVenta}
    </span>
  );
}

/** Tarjeta del catálogo: foto de portada, nombre, ubicación, estado y precio. */
export function TarjetaCasa({ casa }: { casa: CasaListada }) {
  return (
    <li>
      <Link
        href={`/casas/${casa.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-piedra-200 bg-blanco hover:border-terracota focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota"
      >
        <div className="relative aspect-[4/3] bg-piedra-100">
          {casa.portada ? (
            <Image
              src={casa.portada.url}
              alt={casa.portada.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-piedra-600">
              Foto próximamente
            </span>
          )}
          <span className="absolute top-3 left-3">
            <EtiquetaEstado estado={casa.estado} />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          {casaDisponible(casa.estado) && (
            <p className="mb-2">
              <EtiquetaPropia estado={casa.estado} />
            </p>
          )}
          <h3 className="font-display text-xl font-bold group-hover:text-terracota">{casa.nombre}</h3>
          <p className="mt-1 text-piedra-600">{ubicacionCasa(casa)}</p>
          {resumenCasa(casa).length > 0 && (
            <p className="mt-2 font-semibold text-piedra-800">{resumenCasa(casa).join(" · ")}</p>
          )}
          {muestraPrecio(casa.estado) && (
            <p className="mt-auto pt-4 font-display text-2xl font-extrabold">
              {textoPrecioCasa(precioDesde(casa.modalidades))}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

/**
 * Tarjeta mínima de una casa vendida: "{modelo} · Vendida · {departamento}", con la ilustración
 * de la fachada del modelo (nunca una foto real). Sin enlace, precio, distrito ni municipio: la
 * base solo entrega modelo y departamento (`casas_vendidas()`, 011).
 */
export function TarjetaVendida({ casa }: { casa: CasaVendida }) {
  const esEsparta = casa.modelo.trim().toLowerCase() === "esparta";
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-piedra-200 bg-blanco">
      <div className="relative aspect-[4/3] bg-blanco">
        {esEsparta ? (
          <Image
            src={catalogo.vendidas.fachadaLimpia}
            alt={catalogo.vendidas.altFachada(casa.modelo)}
            fill
            unoptimized
            className="object-contain p-4"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-piedra-600">
            {casa.modelo}
          </span>
        )}
        <span className="absolute top-3 left-3">
          <EtiquetaEstado estado="vendida" />
        </span>
      </div>
      <p className="p-5 font-display text-lg font-bold text-piedra-800">
        {catalogo.vendidas.tarjeta(casa.modelo, casa.departamento)}
      </p>
    </li>
  );
}
