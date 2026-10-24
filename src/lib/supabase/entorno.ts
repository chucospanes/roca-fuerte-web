/**
 * Variables públicas de Supabase. Se leen con el nombre literal (`process.env.NEXT_PUBLIC_...`)
 * porque Next solo incrusta en el código del navegador las que aparecen escritas así.
 * La clave secreta NO va aquí: vive solo en `admin.ts`.
 */

function requerida(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisa .env.local (ver .env.example).`);
  }
  return valor;
}

export function supabaseUrl(): string {
  return requerida("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabasePublishableKey(): string {
  return requerida(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export { requerida };
