import { portada } from "@/content/portada";
import { IconoTrazo, type Icono } from "./portada/Iconos";
import { EncabezadoSeccion, SeccionPortada } from "./portada/ui";

/**
 * Calidad comprobable (5.5): oscura, con la cuadrícula. Solo afirmaciones comprobables hoy (brief,
 * sección 7); la norma y el profesional que firma siguen ocultos (`calidadConIngeniero`).
 */
export function Calidad() {
  const { calidad } = portada;
  return (
    <SeccionPortada id="calidad" tono="oscuro" cuadricula>
      <EncabezadoSeccion etiqueta={calidad.etiqueta} titulo={calidad.titulo} lado={<p>{calidad.texto}</p>} />
      <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {calidad.bloques.map((b) => (
          <li key={b.titulo} className="aparecer bg-surface p-7 sm:p-8">
            <IconoTrazo icono={b.icono as Icono} className="size-12 text-accent" />
            <h3 className="mt-8 font-display text-xl leading-tight font-extrabold uppercase">{b.titulo}</h3>
            <p className="mt-3 leading-relaxed text-ink-muted">{b.texto}</p>
          </li>
        ))}
      </ul>
    </SeccionPortada>
  );
}
