"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/navegador";
import { botonTexto } from "./estilos";

/** Cierra la sesión en este navegador (útil en un celular compartido). */
export function Salir() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  return (
    <button
      type="button"
      disabled={saliendo}
      onClick={async () => {
        setSaliendo(true);
        await crearClienteNavegador().auth.signOut();
        router.refresh();
      }}
      className={`text-sm ${botonTexto}`}
    >
      {saliendo ? "Cerrando…" : "Cerrar sesión en este navegador"}
    </button>
  );
}
