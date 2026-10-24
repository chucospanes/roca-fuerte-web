/**
 * Origen de la visita (UTM y referrer), del lado del navegador.
 *
 * Se guarda la PRIMERA visita que trae datos (primer contacto) en `localStorage`, para que
 * llegue al registro aunque la persona pida el acceso premium días después o desde otra
 * página del sitio. La base de datos tampoco lo sobrescribe (trigger en 001_leads.sql).
 * Todo va en try/catch: en modo privado o con el almacenamiento bloqueado, simplemente no
 * hay origen y el registro sigue igual.
 */

const CLAVE = "rf_origen_v1";
const PARAMETROS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

export type Origen = Partial<Record<(typeof PARAMETROS)[number] | "referrer", string>>;

/** Referrer solo si viene de otro sitio (no de una página de este mismo sitio). */
function referrerExterno(): string | undefined {
  const ref = document.referrer;
  if (!ref) return undefined;
  try {
    return new URL(ref).origin === window.location.origin ? undefined : ref.slice(0, 500);
  } catch {
    return undefined;
  }
}

/** Lee la visita actual y la guarda si todavía no hay un origen guardado. */
export function capturarOrigen(): void {
  try {
    if (window.localStorage.getItem(CLAVE)) return;

    const params = new URLSearchParams(window.location.search);
    const origen: Origen = {};
    for (const p of PARAMETROS) {
      const valor = params.get(p)?.trim();
      if (valor) origen[p] = valor.slice(0, 200);
    }
    const referrer = referrerExterno();
    if (referrer) origen.referrer = referrer;

    // Una visita directa sin datos no ocupa el lugar del primer contacto
    if (Object.keys(origen).length === 0) return;
    window.localStorage.setItem(CLAVE, JSON.stringify(origen));
  } catch {
    // almacenamiento no disponible: sin origen
  }
}

/** Origen guardado, para enviarlo con el registro. El servidor lo vuelve a validar. */
export function leerOrigen(): Origen | undefined {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as Origen) : undefined;
  } catch {
    return undefined;
  }
}
