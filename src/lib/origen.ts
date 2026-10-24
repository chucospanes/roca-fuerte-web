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

/**
 * Script que guarda el origen apenas el navegador lee el HTML, SIN esperar a que cargue
 * React: si la persona toca un enlace antes (datos móviles lentos, navegador de TikTok),
 * los parámetros de la URL se perderían. Va en línea en el layout (`app/layout.tsx`).
 * Mismo criterio que antes: solo si no hay origen guardado, solo si la visita trae datos,
 * referrer solo si es de otro sitio, todo dentro de try/catch.
 */
export const SCRIPT_CAPTURA_ORIGEN = `(function(){try{
var k=${JSON.stringify(CLAVE)};
if(localStorage.getItem(k))return;
var q=new URLSearchParams(location.search),o={},n=0;
${JSON.stringify(PARAMETROS)}.forEach(function(p){var v=(q.get(p)||"").trim();if(v){o[p]=v.slice(0,200);n++;}});
var r=document.referrer;
if(r){try{if(new URL(r).origin!==location.origin){o.referrer=r.slice(0,500);n++;}}catch(e){}}
if(n)localStorage.setItem(k,JSON.stringify(o));
}catch(e){}})();`;

/** Origen guardado, para enviarlo con el registro. El servidor lo vuelve a validar. */
export function leerOrigen(): Origen | undefined {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as Origen) : undefined;
  } catch {
    return undefined;
  }
}
