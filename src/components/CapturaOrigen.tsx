"use client";

import { useEffect } from "react";
import { capturarOrigen } from "@/lib/origen";

/** Guarda UTM y referrer de la primera visita (ver `src/lib/origen.ts`). No dibuja nada. */
export function CapturaOrigen() {
  useEffect(() => {
    capturarOrigen();
  }, []);
  return null;
}
