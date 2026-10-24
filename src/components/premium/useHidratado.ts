import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/**
 * `true` cuando React ya tomó el control de la página en el navegador.
 * Los botones de enviar se desactivan hasta entonces: si alguien envía antes (datos móviles
 * lentos), el navegador mandaría el formulario por su cuenta, sin validar ni pedir código.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}
