import { esPendiente, site } from "@/config/site";
import { esparta } from "@/content/esparta";
import { jsonLd } from "@/lib/json-ld";

/**
 * Datos estructurados schema.org (`HomeAndConstructionBusiness`) para buscadores.
 * Solo datos confirmados: sin dirección, horario, reseñas ni calificaciones. El teléfono y
 * las redes se agregan solos cuando dejan de ser placeholder / PENDIENTE.
 */
export function DatosEstructurados() {
  const redes = Object.values(site.redes).filter((url) => !esPendiente(url));
  const datos = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.marca,
    url: `${site.url}/`,
    description: `${site.modelo}: casa de una planta con ${esparta.dormitorios} dormitorios, en terreno desde ${esparta.lote.frenteM * esparta.lote.fondoM} m². Construcción documentada etapa por etapa.`,
    image: `${site.url}${esparta.fachada.src}`,
    areaServed: { "@type": "Country", name: site.pais },
    telephone: `+${site.whatsapp}`,
    ...(redes.length > 0 ? { sameAs: redes } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // `<` escapado para que ningún texto pueda cerrar la etiqueta <script>
      dangerouslySetInnerHTML={{ __html: jsonLd(datos) }}
    />
  );
}
