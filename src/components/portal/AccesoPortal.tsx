"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { campos } from "@/content/formularios";
import { crearClienteNavegador } from "@/lib/supabase/navegador";
import { CODIGO_MAX, CODIGO_MIN, correo as esquemaCorreo, esquemaCodigo } from "@/lib/validacion";
import { whatsappHref } from "@/lib/whatsapp";
import * as e from "@/components/premium/estilos";
import { useEnvioUnico } from "@/components/premium/useEnvioUnico";
import { useHidratado } from "@/components/premium/useHidratado";

const ESPERA_REENVIO_S = 60;

type Resultado = "enviado" | "espera" | "sin_conexion";

/**
 * Acceso al portal: correo → código de 6 dígitos → sesión. Igual que el acceso premium,
 * pero SIN crear cuentas (`shouldCreateUser: false`): las cuentas las crea el constructor
 * en el panel de Supabase (docs/GUIA_CARGA_OBRAS.md).
 *
 * No revela quién es cliente: si el correo no tiene cuenta, Supabase responde con un error,
 * pero la pantalla dice lo mismo que cuando sí la tiene ("si tu correo tiene acceso, te
 * llegó un código"). Solo se distingue el límite de envíos (429) y la falta de conexión.
 */
export function AccesoPortal() {
  const router = useRouter();
  const hidratado = useHidratado();
  const [paso, setPaso] = useState<"correo" | "codigo">("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; whatsapp?: boolean } | null>(null);
  const { enviando, ejecutar } = useEnvioUnico();
  const reenvio = useEnvioUnico();
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function pedirCodigo(correoValidado: string): Promise<Resultado> {
    let respuesta: Awaited<ReturnType<ReturnType<typeof crearClienteNavegador>["auth"]["signInWithOtp"]>>;
    try {
      respuesta = await crearClienteNavegador().auth.signInWithOtp({
        email: correoValidado,
        options: { shouldCreateUser: false },
      });
    } catch {
      return "sin_conexion";
    }
    const { error: fallo } = respuesta;
    if (fallo?.status === 429) return "espera";
    // Sin estado HTTP o error del servidor: no llegó a Supabase o Supabase falló
    if (fallo && (!fallo.status || fallo.status >= 500)) return "sin_conexion";
    // Cualquier otro caso (incluido "el correo no tiene cuenta") se trata igual que un envío
    setEspera(ESPERA_REENVIO_S);
    return "enviado";
  }

  function mostrarFallo(resultado: Exclude<Resultado, "enviado">) {
    setAviso(
      resultado === "espera"
        ? { texto: "Pediste varios códigos seguidos. Espera un minuto y vuelve a intentarlo." }
        : {
            texto: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.",
            whatsapp: true,
          },
    );
  }

  async function enviarCorreo(ev: React.FormEvent) {
    ev.preventDefault();
    setAviso(null);
    const r = esquemaCorreo.safeParse(correo);
    if (!r.success) {
      setError(r.error.issues[0]?.message ?? "Revisa el correo.");
      return;
    }
    setError(null);
    await ejecutar(async () => {
      const resultado = await pedirCodigo(r.data);
      if (resultado !== "enviado") return mostrarFallo(resultado);
      setCorreo(r.data);
      setPaso("codigo");
    });
  }

  async function enviarCodigo(ev: React.FormEvent) {
    ev.preventDefault();
    setAviso(null);
    const r = esquemaCodigo.safeParse(codigo);
    if (!r.success) {
      setError(r.error.issues[0]?.message ?? "Revisa el código.");
      return;
    }
    setError(null);
    await ejecutar(async () => {
      let fallo = false;
      try {
        const { error: errorCodigo } = await crearClienteNavegador().auth.verifyOtp({
          email: correo,
          token: r.data,
          type: "email",
        });
        fallo = Boolean(errorCodigo);
      } catch {
        mostrarFallo("sin_conexion");
        return false;
      }
      if (fallo) {
        setError("El código no es correcto o ya venció. Revísalo o pide uno nuevo.");
        return false;
      }
      router.refresh(); // el servidor lee la sesión y muestra las obras
      return true;
    });
  }

  const avisoVisible = aviso && (
    <div role="alert" className="mt-4 rounded-md border border-terracota/40 bg-terracota/5 p-4 text-piedra-800">
      <p>{aviso.texto}</p>
      {aviso.whatsapp && (
        <a href={whatsappHref()} className={`mt-2 inline-block ${e.botonTexto}`}>
          Escribir por WhatsApp →
        </a>
      )}
    </div>
  );

  if (paso === "codigo") {
    return (
      <form method="post" onSubmit={enviarCodigo} noValidate className="max-w-md">
        <p className="text-piedra-700">
          Si <strong className="break-all">{correo}</strong> tiene acceso al portal, te llegó un
          código. Escríbelo aquí, en esta misma página.
        </p>
        <label htmlFor="codigo" className={`${e.etiqueta} mt-6`}>
          {campos.codigo}
        </label>
        <input
          id="codigo"
          name="codigo"
          value={codigo}
          onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, "").slice(0, CODIGO_MAX))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={`[0-9]{${CODIGO_MIN},${CODIGO_MAX}}`}
          maxLength={CODIGO_MAX}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "codigo-error" : undefined}
          className={`${e.campo} max-w-64 text-center font-display text-2xl tracking-[0.3em]`}
        />
        {error && (
          <p id="codigo-error" className={e.error}>
            {error}
          </p>
        )}
        <p className="mt-2 text-sm text-piedra-600">
          Si no lo ves, revisa la carpeta de spam o promociones. El código vence en 10 minutos. Si
          no te llega, puede que tu correo no esté registrado: escríbenos por WhatsApp.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button type="submit" disabled={enviando || !hidratado} aria-busy={enviando} className={e.botonPrimario}>
            {enviando ? "Entrando…" : "Entrar"}
          </button>
          <button
            type="button"
            disabled={espera > 0 || enviando || reenvio.enviando}
            onClick={() =>
              reenvio.ejecutar(async () => {
                setAviso(null);
                const resultado = await pedirCodigo(correo);
                if (resultado !== "enviado") mostrarFallo(resultado);
              })
            }
            className={e.botonTexto}
          >
            {reenvio.enviando
              ? "Enviando…"
              : espera > 0
                ? `Pedir otro código en ${espera} s`
                : "Pedir otro código"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setPaso("correo");
            setCodigo("");
            setError(null);
          }}
          className={`mt-4 text-sm ${e.botonTexto}`}
        >
          Cambiar el correo
        </button>
        {avisoVisible}
      </form>
    );
  }

  return (
    <form method="post" onSubmit={enviarCorreo} noValidate className="max-w-md">
      <label htmlFor="correo" className={e.etiqueta}>
        {campos.correo}
      </label>
      <input
        id="correo"
        name="correo"
        type="email"
        value={correo}
        onChange={(ev) => setCorreo(ev.target.value)}
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "correo-error" : undefined}
        className={e.campo}
      />
      {error && (
        <p id="correo-error" className={e.error}>
          {error}
        </p>
      )}
      <p className="mt-2 text-sm text-piedra-600">
        Usa el correo que nos diste al firmar. Te enviaremos un código para entrar.
      </p>
      <button
        type="submit"
        disabled={enviando || !hidratado}
        aria-busy={enviando}
        className={`${e.botonPrimario} mt-6`}
      >
        {enviando ? "Enviando…" : "Enviarme el código"}
      </button>
      {avisoVisible}
    </form>
  );
}
