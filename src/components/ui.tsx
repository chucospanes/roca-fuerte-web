import type { ReactNode } from "react";
import type { Punto } from "@/content/landing";

/** Marca visible para datos no confirmados. Nunca se reemplaza por un dato inventado. */
export function Pendiente({ texto = "Pendiente" }: { texto?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-dashed border-pendiente/60 bg-pendiente-fondo px-1.5 py-0.5 text-xs font-semibold tracking-wide text-pendiente uppercase">
      {texto}
    </span>
  );
}

export function Seccion({
  id,
  numerada = false,
  etiqueta,
  titulo,
  intro,
  fondo = "claro",
  children,
}: {
  id: string;
  /**
   * Sección numerada de la landing (01, 02…). El número lo pone CSS con un contador
   * (`.seccion-numerada` en globals.css): cuenta solo las secciones que están en la página, así
   * que si una no aparece (la bitácora sin casa en obra), las siguientes se corren solas. Las
   * páginas sueltas (catálogo) van sin número.
   */
  numerada?: boolean;
  etiqueta: string;
  titulo: string;
  intro?: ReactNode;
  fondo?: "claro" | "blanco" | "oscuro";
  children: ReactNode;
}) {
  const fondos = {
    claro: "bg-piedra-50",
    blanco: "bg-blanco",
    oscuro: "bg-piedra-900 text-piedra-50",
  };
  const oscuro = fondo === "oscuro";
  return (
    <section id={id} className={`${fondos[fondo]} py-16 sm:py-20`}>
      <div className="mx-auto max-w-5xl px-4">
        <p
          className={`font-display text-xs font-semibold tracking-[0.2em] uppercase ${numerada ? "seccion-numerada" : ""} ${oscuro ? "text-terracota-claro" : "text-terracota"}`}
        >
          {etiqueta}
        </p>
        <h2 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
          {titulo}
        </h2>
        {intro && (
          <div className={`mt-3 max-w-2xl text-lg ${oscuro ? "text-piedra-200" : "text-piedra-600"}`}>
            {intro}
          </div>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/**
 * Cuadrícula de puntos numerados (Calidad y resistencia, Para inversionistas).
 * `columnas={3}` para tres puntos (con 2 columnas quedaría una celda vacía); `encabezado`
 * baja el nivel del título cuando los puntos van dentro de un subtítulo (pilares).
 */
export function PuntosNumerados({
  puntos,
  columnas = 2,
  encabezado: Encabezado = "h3",
}: {
  puntos: Punto[];
  columnas?: 2 | 3;
  encabezado?: "h3" | "h4";
}) {
  return (
    <ul
      className={`grid gap-px overflow-hidden rounded-lg border border-piedra-200 bg-piedra-200 ${columnas === 3 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {puntos.map((p, i) => (
        <li key={p.titulo} className="flex flex-col bg-blanco p-6">
          <span className="font-display text-sm font-semibold text-terracota">
            {String(i + 1).padStart(2, "0")}
          </span>
          <Encabezado className="mt-1 font-display text-xl font-bold">{p.titulo}</Encabezado>
          <p className="mt-2 text-piedra-600">{p.texto}</p>
          {p.pendientes && p.pendientes.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {p.pendientes.map((texto) => (
                <li key={texto}>
                  <Pendiente texto={texto} />
                </li>
              ))}
            </ul>
          )}
          {p.enlace && (
            <a
              href={p.enlace.href}
              className="mt-2 inline-flex min-h-11 items-center self-start font-semibold text-terracota underline-offset-4 hover:underline"
            >
              {p.enlace.texto} →
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

const estilosBoton = {
  primario:
    "bg-terracota text-blanco hover:bg-terracota-oscuro focus-visible:outline-terracota",
  secundario:
    "border-2 border-piedra-900 bg-blanco text-piedra-900 hover:bg-piedra-900 hover:text-blanco focus-visible:outline-piedra-900",
  /** Sobre fondo de color (pantalla del hero en terracota). */
  claro: "bg-blanco text-piedra-900 hover:bg-piedra-100 focus-visible:outline-blanco",
} as const;

export function Boton({
  href,
  variante = "primario",
  children,
  className = "",
  externo = false,
  datos,
}: {
  href: string;
  variante?: keyof typeof estilosBoton;
  children: ReactNode;
  className?: string;
  /** Abre en otra pestaña (enlaces fuera del sitio, como WhatsApp). */
  externo?: boolean;
  /** Atributos `data-*` (por ejemplo, para el conteo de clics de venta). */
  datos?: Record<`data-${string}`, string>;
}) {
  return (
    <a
      href={href}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...datos}
      className={`inline-flex min-h-12 items-center justify-center rounded-md px-6 py-3 text-center font-display text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${estilosBoton[variante]} ${className}`}
    >
      {children}
    </a>
  );
}
