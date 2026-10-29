/**
 * Etiquetas de los formularios (paso 1 de desbloqueo y paso 2 de calificación).
 * Los valores internos están en `src/lib/validacion.ts` y coinciden con la base de datos.
 */

import type {
  FORMAS_PAGO,
  INICIOS,
  INTERESES,
  PAISES_RESIDENCIA,
  TERRENO_ESCRITURADO,
} from "@/lib/validacion";

type Etiquetas<T extends readonly string[]> = Record<T[number], string>;

export const campos = {
  nombre: "Nombre",
  whatsapp: "WhatsApp",
  codigoPais: "Código de país",
  correo: "Correo",
  codigo: "Código del correo",
  aceptoPrivacidad: "Acepto el aviso de privacidad",
  paisResidencia: "¿Dónde vives?",
  interes: "¿Qué te interesa?",
  departamento: "Departamento del terreno",
  // Desde la reforma de 2024 hay 44 municipios y los anteriores son distritos; la gente
  // sigue usando los nombres viejos, por eso es texto libre.
  municipio: "Municipio o distrito",
  terrenoEscriturado: "¿El terreno está escriturado a tu nombre?",
  formaPago: "¿Cómo piensas pagar?",
  inicio: "¿Cuándo quieres iniciar?",
  comentario: "Comentario (opcional)",
} as const;

export const paisesResidencia: Etiquetas<typeof PAISES_RESIDENCIA> = {
  el_salvador: "El Salvador",
  estados_unidos: "Estados Unidos",
  otro: "Otro país",
};

export const intereses: Etiquetas<typeof INTERESES> = {
  comprar: "Comprar esta casa",
  construir: "Construir Esparta en mi terreno",
};

export const terrenoEscriturado: Etiquetas<typeof TERRENO_ESCRITURADO> = {
  si: "Sí",
  no: "No",
  en_tramite: "En trámite",
};

export const formasPago: Etiquetas<typeof FORMAS_PAGO> = {
  contado: "Contado",
  fsv: "Crédito del FSV",
  banco: "Crédito bancario",
  otro: "Otro",
};

export const inicios: Etiquetas<typeof INICIOS> = {
  inmediato: "De inmediato",
  "3_meses": "En unos 3 meses",
  "6_meses": "En unos 6 meses",
  mas_6_meses: "En más de 6 meses",
};
