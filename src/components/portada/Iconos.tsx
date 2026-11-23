/** Iconos de trazo de 3 px (en un lienzo de 48), en el acento. Decorativos: el título dice lo mismo. */
const trazos = {
  /** Varillas verticales con sus estribos: el refuerzo antes del concreto. */
  refuerzo: (
    <>
      <path d="M15 6v36M33 6v36" />
      <path d="M10 13h28M10 24h28M10 35h28" />
    </>
  ),
  /** Cámara: la estructura fotografiada antes de taparla. */
  camara: (
    <>
      <path d="M6 16h9l3-5h12l3 5h9v23H6z" />
      <circle cx="24" cy="27" r="6.5" />
    </>
  ),
  /** Factura con su borde cortado. */
  factura: (
    <>
      <path d="M11 6h26v36l-4.3-3-4.4 3-4.3-3-4.3 3-4.4-3-4.3 3z" />
      <path d="M17 16h14M17 23h14M17 30h8" />
    </>
  ),
  /** Teléfono con el avance marcado: el portal del cliente. */
  portal: (
    <>
      <rect x="13" y="5" width="22" height="38" rx="2" />
      <path d="M18.5 23.5l4 4 7-8M21 37h6" />
    </>
  ),
};

export type Icono = keyof typeof trazos;

export function IconoTrazo({ icono, className = "" }: { icono: Icono; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {trazos[icono]}
    </svg>
  );
}
