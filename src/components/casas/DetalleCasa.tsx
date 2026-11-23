import Link from "next/link";
import type { ReactNode } from "react";
import { ImagenAmpliable } from "@/components/ImagenAmpliable";
import { LaCasa } from "@/components/LaCasa";
import { Materiales } from "@/components/Materiales";
import { Pendiente } from "@/components/ui";
import { VideoLazy } from "@/components/VideoLazy";
import { precioUSD } from "@/config/site";
import {
  catalogo,
  loteCorto,
  modalidadesCasa,
  muestraPrecio,
  nombresAguasNegras,
  textoPrecioCasa,
  ubicacionCasa,
} from "@/content/casas";
import { esparta } from "@/content/esparta";
import { precioDesde, type DetalleCasa as Casa, type Modalidad } from "@/lib/casas";
import { BotonWhatsAppCasa } from "./BotonWhatsAppCasa";
import { AvanceObra } from "./AvanceObra";
import { DiarioObra } from "./DiarioObra";
import { EtiquetaEstado, EtiquetaPropia } from "./TarjetaCasa";

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
 * Una modalidad de venta: lote (con su nota pequeña, si tiene), estacionamientos, detalles, precio
 * (si la casa lo muestra) y su botón de WhatsApp (que nombra la modalidad y cuenta su clic). Van
 * lado a lado también en el celular, para compararlas; precio y botón alineados abajo.
 */
function TarjetaModalidad({ casa, modalidad, conPrecio }: { casa: Casa; modalidad: Modalidad; conPrecio: boolean }) {
  const lote = loteCorto(modalidad);
  return (
    <li className="flex flex-col rounded-lg border-2 border-piedra-200 bg-blanco p-3 sm:p-5">
      <h3 className="font-display text-lg leading-tight font-extrabold sm:text-xl">{modalidad.nombre}</h3>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-sm text-piedra-600">{modalidadesCasa.lote}</dt>
          <dd className="font-semibold">
            <span className="whitespace-nowrap">{lote.medidas}</span>{" "}
            <span className="font-normal whitespace-nowrap text-piedra-700">({lote.area})</span>
          </dd>
          {modalidad.nota && <dd className="mt-1 text-xs text-piedra-600 sm:text-sm">{modalidad.nota}</dd>}
        </div>
        <div>
          <dt className="text-sm text-piedra-600">{modalidadesCasa.estacionamientos}</dt>
          <dd className="font-semibold">{modalidad.estacionamientos ?? porConfirmar}</dd>
        </div>
      </dl>
      {modalidad.detalles.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-piedra-700 sm:text-base">
          {modalidad.detalles.map((d) => (
            <li key={d}>— {d}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-4 sm:pt-5">
        {conPrecio && (
          <p className="font-display text-2xl font-extrabold sm:text-3xl">
            {modalidad.precio_usd === null ? "Consultar" : precioUSD(modalidad.precio_usd)}
          </p>
        )}
        <BotonWhatsAppCasa
          casa={casa}
          modalidad={{ modalidad, lote: lote.medidas }}
          texto={modalidadesCasa.boton}
          variante="secundario"
          className="mt-4 w-full"
        />
      </div>
    </li>
  );
}

/**
 * Detalle de una casa del catálogo (la página la lee con `leerCasa`). Una casa con la planta
 * del modelo toma m², dormitorios y baños de `esparta.ts`, y muestra el modelo en detalle
 * (`LaCasa`, con su plano) y sus materiales confirmados. Al final va solo el plano propio.
 */
export function DetalleCasa({ casa }: { casa: Casa }) {

  const construccion = casa.planta_esparta ? esparta.areas.construidaM2 : casa.construccion_m2;
  const dormitorios = casa.planta_esparta ? esparta.dormitorios : casa.dormitorios;
  const banos = casa.planta_esparta ? esparta.banos : casa.banos;
  // El plano del modelo ya sale en "Modelo Esparta" (#la-casa): al final, solo el plano propio
  const plano = casa.plano
    ? { src: casa.plano.url, alt: casa.plano.alt, ancho: casa.plano.ancho, alto: casa.plano.alto }
    : null;
  // Etapa actual: la que está en proceso en su avance (una sola fuente); sin avance cargado,
  // la columna etapa_actual de la casa.
  const etapaActual = casa.etapas.find((e) => e.estado === "en_proceso")?.nombre ?? casa.etapa_actual;
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
        <p className="flex flex-wrap gap-2">
          <EtiquetaEstado estado={casa.estado} />
          <EtiquetaPropia estado={casa.estado} />
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
          {casa.nombre}
        </h1>
        <p className="mt-2 text-lg text-piedra-700">{ubicacionCasa(casa, true)}</p>
        {(casa.etapas.length > 0 || casa.diario.length > 0) && (
          <a
            href="#avance"
            className="mt-1 inline-flex min-h-11 items-center font-semibold text-terracota underline-offset-4 hover:underline"
          >
            {catalogo.verAvance} ↓
          </a>
        )}
        {muestraPrecio(casa.estado) && (
          <p className="mt-4 font-display text-3xl font-extrabold">
            {textoPrecioCasa(precioDesde(casa.modalidades), "Precio: consultar")}
          </p>
        )}
        {/* Vendida: sin botón. Reservada: con botón (puede liberarse o haber otra parecida) */}
        {/* Las vendidas no llegan aquí (011: la base no las entrega; el proxy responde 404) */}
        <BotonWhatsAppCasa casa={casa} className="mt-5 w-full sm:w-auto" />
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

      {casa.modalidades.length > 0 && (
        <section id="modalidades" className="mt-10 scroll-mt-20">
          <h2 className="font-display text-2xl font-extrabold">
            {modalidadesCasa.titulo(casa.modalidades.length)}
          </h2>
          {casa.modalidades.length > 1 && <p className="mt-2 text-piedra-700">{modalidadesCasa.intro}</p>}
          <ul className={`mt-4 grid gap-3 sm:gap-4 ${casa.modalidades.length > 1 ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            {casa.modalidades.map((mod) => (
              <TarjetaModalidad key={mod.id} casa={casa} modalidad={mod} conPrecio={muestraPrecio(casa.estado)} />
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-10 font-display text-2xl font-extrabold">La casa</h2>
      <Datos
        datos={[
          { nombre: "Modelo", valor: casa.modelo },
          // Sin modalidades cargadas, el lote queda por confirmar (con ellas, va en cada una)
          casa.modalidades.length === 0 && { nombre: "Lote", valor: porConfirmar },
          { nombre: "Construcción", valor: construccion === null ? porConfirmar : m2(construccion) },
          { nombre: "Dormitorios", valor: dormitorios ?? porConfirmar },
          { nombre: "Baños", valor: banos ?? porConfirmar },
          casa.estado === "en_construccion" && {
            nombre: "Etapa actual",
            valor: etapaActual ?? porConfirmar,
          },
        ]}
      />
      {casa.planta_esparta && (
        <Link
          href="#la-casa"
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

      {/* El modelo en detalle y sus materiales (antes en la portada; decisión del 2026-11-23) */}
      {casa.planta_esparta && (
        <>
          <LaCasa />
          <Materiales />
        </>
      )}

      {(casa.etapas.length > 0 || casa.diario.length > 0) && (
        <section id="avance" className="mt-10 scroll-mt-20">
          <h2 className="font-display text-2xl font-extrabold">Avance de la obra</h2>
          {casa.etapas.length > 0 && (
            <div className="mt-6">
              <AvanceObra etapas={casa.etapas} />
            </div>
          )}
          {casa.diario.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xl font-extrabold">Diario de obra</h3>
              <div className="mt-4">
                <DiarioObra avances={casa.diario} titulo={casa.nombre} />
              </div>
            </div>
          )}
        </section>
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
            Plano de esta casa. {esparta.avisoPlanos}
          </figcaption>
        </figure>
      )}
    </article>
  );
}
