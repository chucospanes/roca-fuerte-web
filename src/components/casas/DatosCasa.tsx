import { site } from "@/config/site";
import { muestraPrecio } from "@/content/casas";
import { esparta } from "@/content/esparta";
import type { DetalleCasa } from "@/lib/casas";
import { jsonLd } from "@/lib/json-ld";

/**
 * Datos estructurados de una casa del catálogo: `RealEstateListing` (tipo reciente de
 * schema.org, fuera del vocabulario estable) con la casa (`SingleFamilyResidence`) en `about`.
 * Solo datos cargados: ubicación hasta municipio y departamento (sin calle), y `offers` solo
 * si el precio se muestra en la página (no en reservadas, vendidas ni "Consultar").
 */
export function DatosCasa({ casa }: { casa: DetalleCasa }) {
  const url = `${site.url}/casas/${casa.slug}`;
  const construccion = casa.planta_esparta ? esparta.areas.construidaM2 : casa.construccion_m2;
  const dormitorios = casa.planta_esparta ? esparta.dormitorios : casa.dormitorios;
  const banos = casa.planta_esparta ? esparta.banos : casa.banos;

  const residencia = {
    "@type": "SingleFamilyResidence",
    name: casa.nombre,
    address: {
      "@type": "PostalAddress",
      addressLocality: casa.municipio,
      addressRegion: casa.departamento,
      addressCountry: "SV",
    },
    ...(dormitorios !== null ? { numberOfBedrooms: dormitorios } : {}),
    ...(banos !== null ? { numberOfBathroomsTotal: banos } : {}),
    ...(construccion !== null
      ? { floorSize: { "@type": "QuantitativeValue", value: construccion, unitCode: "MTK" } }
      : {}),
  };

  const datos = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    url,
    name: casa.nombre,
    ...(casa.descripcion ? { description: casa.descripcion } : {}),
    ...(casa.portada ? { image: casa.portada.url } : {}),
    about: residencia,
    ...(muestraPrecio(casa.estado) && casa.precio_usd !== null
      ? {
          offers: {
            "@type": "Offer",
            price: casa.precio_usd,
            priceCurrency: "USD",
            businessFunction: "http://purl.org/goodrelations/v1#Sell",
            url,
            seller: { "@type": "HomeAndConstructionBusiness", name: site.marca, url: `${site.url}/` },
          },
        }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(datos) }} />;
}
