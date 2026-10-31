/**
 * Validación de toda entrada externa con zod. Los mismos esquemas se usan en el cliente
 * (mensajes inmediatos) y en el servidor (la validación que cuenta).
 *
 * Los valores de las listas coinciden con los `check` de `supabase/migrations/001_leads.sql`.
 */

import { z } from "zod";
import { videoObra } from "./video";

// ---------------------------------------------------------------------------
// Valores permitidos (iguales a los de la base de datos)

export const PAISES_RESIDENCIA = ["el_salvador", "estados_unidos", "otro"] as const;
export const INTERESES = ["comprar", "construir"] as const;
export const TERRENO_ESCRITURADO = ["si", "no", "en_tramite"] as const;
export const FORMAS_PAGO = ["contado", "fsv", "banco", "otro"] as const;
export const INICIOS = ["inmediato", "3_meses", "6_meses", "mas_6_meses"] as const;
export const ESTADOS_LEAD = ["nuevo", "contactado", "calificado", "descartado", "cliente"] as const;
// Deben coincidir con los CHECK de clics_venta (003_clics_inversionistas.sql)
export const OPCIONES_VENTA = ["comprar", "construir", "general", "inversionista"] as const;
export const UBICACIONES_VENTA = [
  "hero",
  "precios",
  "contacto",
  "flotante",
  "pie",
  "inversionistas",
] as const;

// Portal de clientes: deben coincidir con los CHECK de 004_portal_obras.sql
export const MODALIDADES_OBRA = ["compra", "construccion_terreno", "inversionista"] as const;
export const ESTADOS_OBRA = ["por_iniciar", "en_obra", "pausada", "entregada"] as const;
export const ESTADOS_ETAPA = ["por_iniciar", "en_proceso", "terminada"] as const;
export const TIPOS_DOCUMENTO = ["contrato", "plano", "permiso", "otro"] as const;

/** Los 14 departamentos de El Salvador. */
export const DEPARTAMENTOS = [
  "Ahuachapán",
  "Cabañas",
  "Chalatenango",
  "Cuscatlán",
  "La Libertad",
  "La Paz",
  "La Unión",
  "Morazán",
  "San Miguel",
  "San Salvador",
  "San Vicente",
  "Santa Ana",
  "Sonsonate",
  "Usulután",
] as const;

// ---------------------------------------------------------------------------
// Campos

const nombre = z
  .string({ error: "Escribe tu nombre." })
  .trim()
  .min(2, { error: "El nombre es demasiado corto." })
  .max(120, { error: "El nombre es demasiado largo." });

/**
 * WhatsApp en formato internacional E.164 (+ código de país + número, 8 a 15 dígitos).
 * Acepta espacios, guiones y paréntesis al escribir; se guardan solo "+" y dígitos.
 */
export const whatsapp = z
  .string({ error: "Escribe tu número de WhatsApp." })
  .trim()
  .transform((s) => s.replace(/[\s\-().]/g, ""))
  .pipe(
    z.string().regex(/^\+[1-9]\d{7,14}$/, {
      error: "Escribe el número con código de país, por ejemplo +503 7000 0000.",
    }),
  );

export const correo = z
  .string({ error: "Escribe tu correo." })
  .trim()
  .toLowerCase()
  .max(254, { error: "El correo es demasiado largo." })
  .pipe(z.email({ error: "Revisa el correo: no parece válido." }));

const aceptoPrivacidad = z.literal(true, { error: "Debes aceptar el aviso de privacidad." });

/** Campo trampa: invisible para personas. Si llega con texto, es un bot. */
const sitioWeb = z.string().max(500).optional();

/** Texto opcional: vacío o solo espacios cuenta como no enviado. */
function textoOpcional(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((s) => (s ? s : undefined));
}

// ---------------------------------------------------------------------------
// Esquemas

const sinOrigen = {
  utm_source: undefined,
  utm_medium: undefined,
  utm_campaign: undefined,
  utm_content: undefined,
  referrer: undefined,
};

/**
 * Origen de la visita (primer contacto). Nunca bloquea un registro: un valor inválido se
 * descarta y los campos desconocidos se ignoran.
 */
export const esquemaOrigen = z
  .object({
    utm_source: textoOpcional(200).catch(undefined),
    utm_medium: textoOpcional(200).catch(undefined),
    utm_campaign: textoOpcional(200).catch(undefined),
    utm_content: textoOpcional(200).catch(undefined),
    referrer: textoOpcional(500).catch(undefined),
  })
  .catch(sinOrigen);

/** Paso 1 en el navegador, antes de pedir el código. */
export const esquemaDesbloqueo = z.strictObject({
  nombre,
  whatsapp,
  correo,
  aceptoPrivacidad,
  sitioWeb,
});

/**
 * Código del correo. Supabase está configurado en 6 dígitos (Email OTP Length, ver
 * docs/CONFIGURACION_EXTERNA.md), pero admite hasta 8: se aceptan 6 a 8 por si cambia.
 */
export const CODIGO_MIN = 6;
export const CODIGO_MAX = 8;

export const esquemaCodigo = z
  .string({ error: "Escribe el código." })
  .trim()
  .regex(new RegExp(`^[0-9]{${CODIGO_MIN},${CODIGO_MAX}}$`), {
    error: `El código tiene entre ${CODIGO_MIN} y ${CODIGO_MAX} dígitos.`,
  });

/**
 * Paso 1 en el servidor (Server Action `registrarLead`), después de verificar el código.
 * No incluye el correo a propósito: el correo sale de la sesión verificada. `strictObject`
 * rechaza cualquier campo extra, incluido un `correo` enviado desde el cliente.
 */
export const esquemaRegistroLead = z.strictObject({
  nombre,
  whatsapp,
  aceptoPrivacidad,
  sitioWeb,
  origen: esquemaOrigen.optional(),
});

/** Paso 2, calificación opcional (solo con sesión verificada). */
export const esquemaCalificacion = z
  .strictObject({
    pais_residencia: z.enum(PAISES_RESIDENCIA, { error: "Elige dónde vives." }),
    interes: z.enum(INTERESES, { error: "Elige qué te interesa." }),
    departamento: z.enum(DEPARTAMENTOS).optional(),
    municipio: textoOpcional(80),
    terreno_escriturado: z.enum(TERRENO_ESCRITURADO).optional(),
    forma_pago: z.enum(FORMAS_PAGO, { error: "Elige la forma de pago." }),
    inicio: z.enum(INICIOS, { error: "Elige cuándo quieres iniciar." }),
    comentario: textoOpcional(1000),
  })
  .superRefine((datos, ctx) => {
    if (datos.interes !== "construir") return;
    if (!datos.departamento) {
      ctx.addIssue({ code: "custom", path: ["departamento"], message: "Elige el departamento del terreno." });
    }
    if (!datos.municipio) {
      ctx.addIssue({ code: "custom", path: ["municipio"], message: "Escribe el municipio o distrito del terreno." });
    }
    if (!datos.terreno_escriturado) {
      ctx.addIssue({
        code: "custom",
        path: ["terreno_escriturado"],
        message: "Indica si el terreno está escriturado a tu nombre.",
      });
    }
  })
  // Si elige comprar la casa, los datos del terreno no aplican y no se guardan
  .transform((datos) =>
    datos.interes === "construir"
      ? datos
      : { ...datos, departamento: undefined, municipio: undefined, terreno_escriturado: undefined },
  );

/**
 * Clic en un botón de venta (POST /api/clic). Sin datos personales. Botón y ubicación son
 * obligatorios; el origen es tolerante: un valor inválido se descarta, no bloquea el conteo.
 */
export const esquemaClic = z.strictObject({
  opcion: z.enum(OPCIONES_VENTA),
  ubicacion: z.enum(UBICACIONES_VENTA),
  utm_source: textoOpcional(200).catch(undefined),
  utm_medium: textoOpcional(200).catch(undefined),
  utm_campaign: textoOpcional(200).catch(undefined),
  utm_content: textoOpcional(200).catch(undefined),
  referrer_dominio: z
    .string()
    .trim()
    .toLowerCase()
    .max(253)
    .regex(/^[a-z0-9.-]+$/)
    .optional()
    .catch(undefined),
});

/** Id de una fila del portal (uuid). Se valida antes de consultar. */
export const esquemaIdPortal = z.uuid();

/**
 * URL de video de un avance: solo YouTube y Vimeo, con un id reconocible. Se valida al leer
 * (los avances se cargan a mano en el panel de Supabase); el CHECK de la base es el filtro
 * grueso y esta es la validación fina.
 */
export const esquemaVideoObra = z
  .string()
  .max(300)
  .refine((url) => videoObra(url) !== null, { error: "Solo videos de YouTube o Vimeo." });

export type DatosClic = z.infer<typeof esquemaClic>;
export type DatosDesbloqueo = z.infer<typeof esquemaDesbloqueo>;
export type DatosRegistroLead = z.infer<typeof esquemaRegistroLead>;
export type DatosCalificacion = z.infer<typeof esquemaCalificacion>;

/** Errores por campo, listos para mostrar junto a cada input. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = issue.path.join(".") || "_";
    salida[campo] ??= issue.message;
  }
  return salida;
}

/** `true` si el campo trampa llegó con texto. */
export function esBot(datos: { sitioWeb?: string }): boolean {
  return Boolean(datos.sitioWeb?.trim());
}
