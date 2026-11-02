import Link from "next/link";
import type { ReactNode } from "react";
import { ImagenAmpliable } from "@/components/ImagenAmpliable";
import { Pendiente } from "@/components/ui";
import { VideoLazy } from "@/components/VideoLazy";
import { precioUSD } from "@/config/site";
import { catalogo, muestraPrecio, nombresAguasNegras, ubicacionCasa } from "@/content/casas";
import { esparta } from "@/content/esparta";
import type { DetalleCasa as Casa } from "@/lib/casas";
import { EtiquetaEstado } from "./TarjetaCasa";

const m = (n: number) => `${n.toFixed(2)} m`;
const m2 = (n: number) => `${n.toFixed(2)} m²`;
const porConfirmar = <Pendiente texto="Por confirmar" />;
const siNo = (v: boolean | null): ReactNode => (v === null ? porConfirmar : v ? "Sí" : "No");

type Dato = { nombre: string; valor: ReactNode };

/** Celda que se estira hasta el final de su fila: 2 columnas en el celular y 3 desde sm. */
const SPAN_CELULAR = ["col-span-1", "col-span-2"];
const SPAN_SM = ["sm:col-span-1", "sm:col-span-3", "sm:col-span-2"];

/**
 * Cuadrícula de datos. La última celda llena lo que queda de su fila, para que no quede un
 * hueco gris cuando el número de datos no es múltiplo de las columnas.
 */
function Datos({ datos }: { datos: (Dato | false)[] }) {
  const celdas = datos.filter((d): d is Dato => d !== false);
  const n = celdas.length;
  return (
    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-piedra-200 bg-piedra-200 sm:grid-cols-3">
      {celdas.map((d, i) => (
        <div
          key={d.nombre}
          className={`bg-blanco p-4 ${i === n - 1 ? `${SPAN_CELULAR[n % 2]} ${SPAN_SM[n % 3]}` : ""}`}
        >
          <dt className="text-sm text-piedra-600">{d.nombre}</dt>
          <dd className="mt-0.5 font-semibold">{d.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Detalle de una casa del catálogo (la página la lee con `leerCasa`). Una casa con la planta
 * del modelo toma m², dormitorios, baños y, si no tiene plano propio, el plano de `esparta.ts`.
 */
export function DetalleCasa({ casa }: { casa: Casa }) {

  const construccion = casa.planta_esparta ? esparta.areas.construidaM2 : casa.construccion_m2;
  const dormitorios = casa.planta_esparta ? esparta.dormitorios : casa.dormitorios;
  const banos = casa.planta_esparta ? esparta.banos : casa.banos;
  const plano = casa.plano
    ? { src: casa.plano.url, alt: casa.plano.alt, ancho: casa.plano.ancho, alto: casa.plano.alto }
    : casa.planta_esparta
      ? esparta.planoCasa
      : null;
  const [portada, ...otrasFotos] = casa.portada
    ? [casa.portada, ...casa.fotos.filter((f) => f.id !== casa.portada?.id)]
    : casa.fotos;

  return (
    <article>
      <Link
        href="/casas"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-terracota underline-offset-4 hover:underline"
      >
        ← {catalogo.verTodas}
      </Link>

      <header className="mt-4">
        <EtiquetaEstado estado={casa.estado} />
        <h1 className="mt-3 font-display text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
          {casa.nombre}
        </h1>
        <p className="mt-2 text-lg text-piedra-700">{ubicacionCasa(casa, true)}</p>
        {muestraPrecio(casa.estado) && (
          <p className="mt-4 font-display text-3xl font-extrabold">
            {casa.precio_usd === null ? "Precio: consultar" : precioUSD(casa.precio_usd)}
          </p>
        )}
      </header>

      {portada && (
        <div className="mt-8">
          <ImagenAmpliable
            src={portada.url}
            alt={portada.alt}
            ancho={portada.ancho}
            alto={portada.alto}
            sizes="(max-width: 1024px) 100vw, 992px"
          />
        </div>
      )}
      {otrasFotos.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otrasFotos.map((f) => (
            <li key={f.id}>
              <ImagenAmpliable
                src={f.url}
                alt={f.alt}
                ancho={f.ancho}
                alto={f.alto}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 330px"
              />
            </li>
          ))}
        </ul>
      )}

      {casa.descripcion && <p className="mt-8 max-w-2xl text-lg text-piedra-700">{casa.descripcion}</p>}

      <h2 className="mt-10 font-display text-2xl font-extrabold">La casa</h2>
      <Datos
        datos={[
          { nombre: "Modelo", valor: casa.modelo },
          {
            nombre: "Lote",
            valor: `${m(casa.lote_frente_m)} × ${m(casa.lote_fondo_m)} (${m2(casa.lote_m2)})`,
          },
          { nombre: "Construcción", valor: construccion === null ? porConfirmar : m2(construccion) },
          { nombre: "Dormitorios", valor: dormitorios ?? porConfirmar },
          { nombre: "Baños", valor: banos ?? porConfirmar },
          { nombre: "Parqueos", valor: casa.parqueos ?? porConfirmar },
          casa.estado === "en_construccion" && {
            nombre: "Etapa actual",
            valor: casa.etapa_actual ?? porConfirmar,
          },
        ]}
      />
      {casa.planta_esparta && (
        <Link
          href="/#la-casa"
          className="mt-2 inline-flex min-h-11 items-center font-semibold text-terracota underline-offset-4 hover:underline"
        >
          Ver el modelo Esparta en detalle →
        </Link>
      )}

      <h2 className="mt-10 font-display text-2xl font-extrabold">Servicios</h2>
      <Datos
        datos={[
          { nombre: "Agua", valor: siNo(casa.agua) },
          { nombre: "Electricidad", valor: siNo(casa.electricidad) },
          {
            nombre: "Aguas negras",
            valor: casa.aguas_negras ? nombresAguasNegras[casa.aguas_negras] : porConfirmar,
          },
        ]}
      />

      <h2 className="mt-10 font-display text-2xl font-extrabold">Qué incluye</h2>
      {casa.incluye.length > 0 ? (
        <ul className="mt-3 space-y-1 text-piedra-700">
          {casa.incluye.map((i) => (
            <li key={i}>— {i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3">
          <Pendiente texto="Detalle pendiente" />
        </p>
      )}

      {casa.video && (
        <div className="mt-10 max-w-3xl">
          <h2 className="font-display text-2xl font-extrabold">Video</h2>
          <div className="mt-4">
            <VideoLazy
              src={casa.video.src}
              vertical={casa.video.vertical}
              plataforma={casa.video.plataforma}
              titulo={`Video de ${casa.nombre}`}
            />
          </div>
        </div>
      )}

      {plano && (
        <figure className="mt-10 max-w-3xl">
          <h2 className="font-display text-2xl font-extrabold">Plano</h2>
          <div className="mt-4">
            <ImagenAmpliable
              src={plano.src}
              alt={plano.alt}
              ancho={plano.ancho}
              alto={plano.alto}
              protegida
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          <figcaption className="mt-2 text-sm text-piedra-600">
            {casa.plano ? "Plano de esta casa." : "Plano del modelo Esparta."} {esparta.avisoPlanos}
          </figcaption>
        </figure>
      )}
    </article>
  );
}
