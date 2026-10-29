import { esPendiente, site, whatsappEsPlaceholder } from "@/config/site";
import { esparta } from "@/content/esparta";

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
    description: `${site.modelo}: casa de una planta, ${esparta.dormitorios} dormitorios, ${esparta.areas.construidaM2.toFixed(2)} m² de construcción. Construcción documentada etapa por etapa.`,
    image: `${site.url}/fachada-esparta.png`,
    areaServed: { "@type": "Country", name: site.pais },
    ...(whatsappEsPlaceholder() ? {} : { telephone: `+${site.whatsapp}` }),
    ...(redes.length > 0 ? { sameAs: redes } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // `<` escapado para que ningún texto pueda cerrar la etiqueta <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\u003c") }}
    />
  );
}
