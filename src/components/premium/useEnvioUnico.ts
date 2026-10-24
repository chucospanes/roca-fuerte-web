import { useCallback, useRef, useState } from "react";

/**
 * Evita el doble envío. `ejecutar(tarea)` no hace nada si ya hay una tarea en curso (el
 * candado es una ref, así que también frena dos toques en el mismo instante, antes de que
 * React vuelva a dibujar el botón desactivado).
 *
 * Si la tarea devuelve `true` (éxito que lleva a otra pantalla), el candado NO se suelta:
 * el botón sigue desactivado mientras la página carga lo siguiente.
 */
export function useEnvioUnico() {
  const candado = useRef(false);
  const [enviando, setEnviando] = useState(false);

  const ejecutar = useCallback(async (tarea: () => Promise<boolean | void>) => {
    if (candado.current) return;
    candado.current = true;
    setEnviando(true);
    let mantener = false;
    try {
      mantener = (await tarea()) === true;
    } finally {
      if (!mantener) {
        candado.current = false;
        setEnviando(false);
      }
    }
  }, []);

  return { enviando, ejecutar };
}
