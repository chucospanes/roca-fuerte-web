import Image from "next/image";
import Link from "next/link";
import { portada } from "@/content/portada";
import { leerCasa } from "@/lib/casas";
import { EncabezadoSeccion, SeccionPortada } from "./ui";

const EN_PORTADA = 3;
const mes = new Intl.DateTimeFormat("es-SV", { month: "long", timeZone: "UTC" });

/** "Noviembre 2026" desde la fecha `AAAA-MM-DD` de la base, sin correrse por zona horaria. */
function mesAnio(valor: string): string {
  const d = new Date(`${valor.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? valor : `${mes.format(d)} ${d.getUTCFullYear()}`;
}

/**
 * Diario de obra de la portada (5.7): los 3 avances publicados más recientes de la casa del
 * proyecto, los mismos del Diario de obra de su ficha (misma lectura en caché, `leerCasa`). Solo
 * los que tienen foto (cada tarjeta es una foto). Sin ninguno, o si falla, la sección no aparece.
 */
export async function DiarioPortada({ slug }: { slug: string }) {
  const casa = await leerCasa(slug);
  if (!casa.ok || !casa.datos) return null;
  const avances = [...casa.datos.diario]
    .filter((a) => a.fotos.length > 0)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, EN_PORTADA);
  if (avances.length === 0) return null;

  return (
    <SeccionPortada id="diario" tono="elevado">
      <EncabezadoSeccion titulo={portada.diario.titulo} lado={<p>{portada.diario.texto}</p>} />
      {/* Celular: una fila que se desliza (scroll-snap), con una foto y parte de la siguiente.
          Desde 768 px, cuadrícula de 3. Solo CSS. */}
      <ul className="aparecer -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {avances.map((a) => (
          <li key={a.id} className="w-[82%] shrink-0 snap-start md:w-auto">
            <Link href={`/casas/${slug}#avance`} className="group block">
              <span className="foto-marco relative block aspect-[4/3] rounded-sm bg-surface">
                <Image
                  src={a.fotos[0].url}
                  alt={`${a.titulo}, foto 1`}
                  fill
                  sizes="(min-width: 1024px) 24rem, (min-width: 768px) 33vw, 82vw"
                  className="object-cover"
                />
              </span>
              <span className="mt-4 block font-display text-[12px] font-bold tracking-[0.16em] text-accent uppercase">
                {mesAnio(a.fecha)}
              </span>
              <span className="mt-1 block font-display text-xl leading-tight font-extrabold uppercase group-hover:underline group-hover:underline-offset-4">
                {a.titulo}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SeccionPortada>
  );
}
