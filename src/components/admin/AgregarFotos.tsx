"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ElegirFotos, useAvisoAlSalir, useFotos } from "@/components/admin/fotos";
import * as e from "@/components/premium/estilos";
import { useHidratado } from "@/components/premium/useHidratado";

/**
 * Agregar fotos a un avance que ya existe (también para completar una subida que falló).
 * Los nombres siguen después de las fotos que ya tiene la carpeta.
 */
export function AgregarFotos({
  obraId,
  carpeta,
  existentes,
  maximo,
}: {
  obraId: string;
  carpeta: string;
  existentes: string[];
  maximo: number;
}) {
  const router = useRouter();
  const hidratado = useHidratado();
  const [fase, setFase] = useState<"eligiendo" | "subiendo" | "terminado">("eligiendo");
  const [fallidas, setFallidas] = useState(0);
  const { fotos, aviso, elegir, quitar, subir, resumen } = useFotos({ existentes, maximo });
  useAvisoAlSalir(fase === "subiendo" || (fase === "terminado" && fallidas > 0));

  async function subirTodas() {
    setFase("subiendo");
    const n = await subir(carpeta);
    setFallidas(n);
    setFase("terminado");
    router.refresh();
  }

  if (maximo <= 0) {
    return <p className="text-piedra-700">Este avance ya tiene el máximo de fotos que muestra el portal.</p>;
  }

  if (fase === "terminado" && fallidas === 0) {
    return (
      <div role="status" className="rounded-lg border-2 border-piedra-900 bg-blanco p-5">
        <p className="font-display text-xl font-bold">Fotos subidas ✓</p>
        <p className="mt-2 text-piedra-700">Ya se ven en el portal de la obra.</p>
        <Link href={`/admin/obras/${obraId}`} className={`${e.botonPrimario} mt-5`}>
          Volver a la obra
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ElegirFotos
        fotos={fotos}
        aviso={aviso}
        elegir={elegir}
        quitar={quitar}
        bloqueado={fase === "subiendo"}
        peso={resumen.peso}
      />
      {fase === "subiendo" && (
        <p role="status" className="font-semibold text-piedra-800">
          Fotos subidas: {resumen.subidas} de {resumen.total - resumen.ilegibles}. No cierres esta página.
        </p>
      )}
      {fase === "terminado" && fallidas > 0 && (
        <p role="alert" className="rounded-md border border-terracota/40 bg-terracota/5 p-3 font-semibold text-terracota-oscuro">
          {fallidas} {fallidas === 1 ? "foto no se subió" : "fotos no se subieron"}. Revisa la señal y reintenta.
        </p>
      )}
      <button
        type="button"
        disabled={!hidratado || fase === "subiendo" || resumen.preparando > 0 || resumen.listas + resumen.fallidas === 0}
        onClick={subirTodas}
        className={e.botonPrimario}
      >
        {fase === "subiendo"
          ? "Subiendo…"
          : resumen.preparando > 0
            ? "Preparando fotos…"
            : fallidas > 0
              ? "Reintentar las que fallaron"
              : "Subir fotos"}
      </button>
    </div>
  );
}
