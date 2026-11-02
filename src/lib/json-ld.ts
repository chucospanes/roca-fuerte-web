// La secuencia de texto barra invertida + "u003c", armada por código: escrita literal en el
// código, algunas herramientas la convierten en "<" y el escape deja de funcionar.
const ESCAPE_MENOR = String.fromCharCode(92) + "u003c";

/**
 * JSON para un `<script type="application/ld+json">`. Escapa `<` como `\u003c` (en el texto
 * del script, no en el string de JS) para que ningún dato, por ejemplo un nombre cargado en
 * Supabase, pueda cerrar la etiqueta con `</script>`.
 */
export function jsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, ESCAPE_MENOR);
}
