import type { ReactNode } from "react";

/**
 * Tonos de sección de la portada v2.0.0. Cada uno fija los tokens (`tono-claro`, `tono-oscuro`
 * en globals.css) y su fondo; la portada alterna claras y oscuras.
 */
const tonos = {
  claro: "tono-claro bg-surface",
  elevado: "tono-claro bg-surface-raised",
  oscuro: "tono-oscuro bg-surface",
  /** "Así trabajamos": oscura sobre #2e3133. */
  grafito: "tono-oscuro bg-grafito",
} as const;

export type Tono = keyof typeof tonos;

/** Ancho de la portada: 16 px de margen en el celular. */
export const contenedor = "mx-auto w-full max-w-[78rem] px-4 sm:px-6 lg:px-8";

export function SeccionPortada({
  id,
  tono,
  cuadricula = false,
  etiquetaAria,
  className = "",
  children,
}: {
  id?: string;
  tono: Tono;
  /** Cuadrícula de plano de fondo (secciones oscuras: portada, calidad, hermano). */
  cuadricula?: boolean;
  etiquetaAria?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={etiquetaAria}
      className={`${tonos[tono]} ${cuadricula ? "cuadricula-plano" : ""} py-20 text-ink sm:py-28 ${className}`}
    >
      <div className={contenedor}>{children}</div>
    </section>
  );
}

/** Etiqueta: 13 px, 700, mayúsculas, espaciado .16em, en el acento. */
export function Etiqueta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-display text-[13px] font-bold tracking-[0.16em] text-accent uppercase ${className}`}>
      {children}
    </p>
  );
}

/** Título de sección (h2): Archivo 800 en mayúsculas, `clamp(34px, 4.4vw, 60px)`. */
export function TituloSeccion({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`titular titular-seccion aparecer ${className}`}>{children}</h2>;
}

/** La línea de cimiento: barra de 120 × 6 px en el acento. */
export function Cimiento({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-1.5 w-[120px] bg-accent ${className}`} />;
}

/**
 * Encabezado de sección: etiqueta y título a la izquierda; a la derecha (en escritorio), el texto
 * corto que lo acompaña. En el celular, uno debajo del otro.
 */
export function EncabezadoSeccion({
  etiqueta,
  titulo,
  lado,
}: {
  etiqueta?: string;
  titulo: ReactNode;
  lado?: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
      <div>
        {etiqueta && <Etiqueta className="mb-4">{etiqueta}</Etiqueta>}
        <TituloSeccion>{titulo}</TituloSeccion>
      </div>
      {lado && <div className="max-w-[34rem] text-lg text-ink-muted lg:pb-1.5">{lado}</div>}
    </div>
  );
}

/** Sección con su encabezado y el contenido debajo (las secciones que ya existían antes del brief). */
export function SeccionConTitulo({
  id,
  tono,
  etiqueta,
  titulo,
  intro,
  children,
}: {
  id: string;
  tono: Tono;
  etiqueta?: string;
  titulo: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SeccionPortada id={id} tono={tono}>
      <EncabezadoSeccion etiqueta={etiqueta} titulo={titulo} lado={intro} />
      <div className="mt-12">{children}</div>
    </SeccionPortada>
  );
}
