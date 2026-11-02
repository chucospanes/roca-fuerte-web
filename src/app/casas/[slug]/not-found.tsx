import { CasaNoDisponible } from "@/components/casas/CasaNoDisponible";

/**
 * Respaldo: normalmente el proxy ya respondió 404 antes de llegar aquí. Este caso (por
 * ejemplo, una casa que se ocultó hace segundos) sale con 200 y el `noindex` que agrega Next.
 */
export default function CasaNoEncontrada() {
  return <CasaNoDisponible />;
}
