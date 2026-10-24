"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { registrarLead } from "@/app/acciones";
import { campos } from "@/content/formularios";
import { leerOrigen } from "@/lib/origen";
import { crearClienteNavegador } from "@/lib/supabase/navegador";
import { erroresPorCampo, esBot, esquemaCodigo, esquemaDesbloqueo } from "@/lib/validacion";
import { whatsappHref } from "@/lib/whatsapp";
import * as e from "./estilos";

/** Códigos de país más probables para el público (El Salvador y diáspora). */
const CODIGOS_PAIS = [
  { valor: "+503", texto: "El Salvador (+503)" },
  { valor: "+1", texto: "EE. UU. / Canadá (+1)" },
  { valor: "+502", texto: "Guatemala (+502)" },
  { valor: "+504", texto: "Honduras (+504)" },
  { valor: "+505", texto: "Nicaragua (+505)" },
  { valor: "+506", texto: "Costa Rica (+506)" },
  { valor: "+52", texto: "México (+52)" },
  { valor: "+34", texto: "España (+34)" },
  { valor: "+39", texto: "Italia (+39)" },
  { valor: "+61", texto: "Australia (+61)" },
];

const ESPERA_REENVIO_S = 60;

type Paso = "datos" | "codigo";
type Errores = Record<string, string>;

/**
 * Paso 1 del acceso premium: nombre, WhatsApp, correo y aviso de privacidad → código de 6
 * dígitos por correo → registro. El código se pide y se verifica desde el navegador (clave
 * publishable); el registro lo hace la Server Action con el correo de la sesión.
 *
 * Con `correoVerificado` la persona ya tiene sesión pero no registro (por ejemplo, falló el
 * guardado): se piden solo los datos que faltan, sin código.
 */
export function Desbloqueo({ correoVerificado }: { correoVerificado?: string }) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("datos");
  const [nombre, setNombre] = useState("");
  const [codigoPais, setCodigoPais] = useState("+503");
  const [numero, setNumero] = useState("");
  const [correo, setCorreo] = useState(correoVerificado ?? "");
  const [acepto, setAcepto] = useState(false);
  const [sitioWeb, setSitioWeb] = useState("");
  const [codigo, setCodigo] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [aviso, setAviso] = useState<{ texto: string; whatsapp?: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const datos = () => ({
    nombre,
    whatsapp: `${codigoPais}${numero}`,
    correo,
    aceptoPrivacidad: acepto,
    sitioWeb,
  });

  async function pedirCodigo(correoValidado: string) {
    const { error } = await crearClienteNavegador().auth.signInWithOtp({
      email: correoValidado,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setAviso({
        texto:
          error.status === 429
            ? "Pediste varios códigos seguidos. Espera un minuto y vuelve a intentarlo."
            : "No pudimos enviarte el código. Revisa el correo o escríbenos por WhatsApp.",
        whatsapp: error.status !== 429,
      });
      return false;
    }
    setEspera(ESPERA_REENVIO_S);
    return true;
  }

  async function registrar() {
    const resultado = await registrarLead({
      nombre,
      whatsapp: `${codigoPais}${numero}`,
      aceptoPrivacidad: true,
      sitioWeb,
      origen: leerOrigen(),
    });
    if (resultado.ok) {
      router.refresh(); // el servidor vuelve a leer la sesión y muestra el contenido
      return;
    }
    if (resultado.error === "datos_invalidos") {
      setErrores(resultado.errores ?? {});
      setPaso("datos");
    } else if (resultado.error === "sin_sesion") {
      setAviso({ texto: "Tu sesión venció. Pide un código nuevo." });
      setPaso("datos");
    } else {
      setAviso({
        texto: "No pudimos guardar tus datos. Puedes seguir por WhatsApp mientras lo resolvemos.",
        whatsapp: true,
      });
    }
  }

  async function enviarDatos(ev: React.FormEvent) {
    ev.preventDefault();
    setAviso(null);
    const r = esquemaDesbloqueo.safeParse(datos());
    if (!r.success) {
      setErrores(erroresPorCampo(r.error));
      return;
    }
    setErrores({});
    setEnviando(true);
    try {
      if (esBot(r.data)) return; // campo trampa: no se envía nada
      if (correoVerificado) {
        await registrar();
        return;
      }
      if (await pedirCodigo(r.data.correo)) {
        setCorreo(r.data.correo);
        setPaso("codigo");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function enviarCodigo(ev: React.FormEvent) {
    ev.preventDefault();
    setAviso(null);
    const r = esquemaCodigo.safeParse(codigo);
    if (!r.success) {
      setErrores({ codigo: r.error.issues[0]?.message ?? "Revisa el código." });
      return;
    }
    setErrores({});
    setEnviando(true);
    try {
      const { error } = await crearClienteNavegador().auth.verifyOtp({
        email: correo,
        token: r.data,
        type: "email",
      });
      if (error) {
        setErrores({ codigo: "El código no es correcto o ya venció. Revísalo o pide uno nuevo." });
        return;
      }
      await registrar();
    } finally {
      setEnviando(false);
    }
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
      <form onSubmit={enviarCodigo} noValidate className="max-w-md">
        <p className="text-piedra-700">
          Te enviamos un código de 6 dígitos a <strong className="break-all">{correo}</strong>.
          Escríbelo aquí, en esta misma página.
        </p>
        <label htmlFor="codigo" className={`${e.etiqueta} mt-6`}>
          {campos.codigo}
        </label>
        <input
          id="codigo"
          name="codigo"
          value={codigo}
          onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          aria-invalid={Boolean(errores.codigo)}
          aria-describedby={errores.codigo ? "codigo-error" : undefined}
          className={`${e.campo} max-w-48 text-center font-display text-2xl tracking-[0.4em]`}
        />
        {errores.codigo && (
          <p id="codigo-error" className={e.error}>
            {errores.codigo}
          </p>
        )}
        <p className="mt-2 text-sm text-piedra-600">
          Si no lo ves, revisa la carpeta de spam o promociones. El código vence en 10 minutos.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button type="submit" disabled={enviando} className={e.botonPrimario}>
            {enviando ? "Verificando…" : "Ver la ficha técnica"}
          </button>
          <button
            type="button"
            disabled={espera > 0 || enviando}
            onClick={async () => {
              setAviso(null);
              await pedirCodigo(correo);
            }}
            className={e.botonTexto}
          >
            {espera > 0 ? `Pedir otro código en ${espera} s` : "Pedir otro código"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setPaso("datos");
            setCodigo("");
            setErrores({});
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
    <form onSubmit={enviarDatos} noValidate className="max-w-xl space-y-5">
      <div>
        <label htmlFor="nombre" className={e.etiqueta}>
          {campos.nombre}
        </label>
        <input
          id="nombre"
          name="nombre"
          value={nombre}
          onChange={(ev) => setNombre(ev.target.value)}
          autoComplete="name"
          maxLength={120}
          aria-invalid={Boolean(errores.nombre)}
          className={e.campo}
        />
        {errores.nombre && <p className={e.error}>{errores.nombre}</p>}
      </div>

      <fieldset>
        <legend className={e.etiqueta}>{campos.whatsapp}</legend>
        <div className="mt-1 grid grid-cols-[minmax(0,11rem)_1fr] gap-2">
          <label htmlFor="codigoPais" className="sr-only">
            {campos.codigoPais}
          </label>
          <select
            id="codigoPais"
            name="codigoPais"
            value={codigoPais}
            onChange={(ev) => setCodigoPais(ev.target.value)}
            className={`${e.campo} mt-0`}
          >
            {CODIGOS_PAIS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.texto}
              </option>
            ))}
          </select>
          <label htmlFor="numero" className="sr-only">
            Número
          </label>
          <input
            id="numero"
            name="numero"
            value={numero}
            onChange={(ev) => setNumero(ev.target.value)}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="7000 0000"
            maxLength={20}
            aria-invalid={Boolean(errores.whatsapp)}
            className={`${e.campo} mt-0`}
          />
        </div>
        {errores.whatsapp && <p className={e.error}>{errores.whatsapp}</p>}
      </fieldset>

      <div>
        <label htmlFor="correo" className={e.etiqueta}>
          {campos.correo}
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          value={correo}
          onChange={(ev) => setCorreo(ev.target.value)}
          readOnly={Boolean(correoVerificado)}
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          aria-invalid={Boolean(errores.correo)}
          className={`${e.campo} read-only:bg-piedra-50`}
        />
        {errores.correo && <p className={e.error}>{errores.correo}</p>}
        {!correoVerificado && (
          <p className="mt-1 text-sm text-piedra-600">Te enviaremos un código para confirmarlo.</p>
        )}
      </div>

      {/* Campo trampa: oculto para personas; los bots lo llenan */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="sitioWeb">Sitio web</label>
        <input
          id="sitioWeb"
          name="sitioWeb"
          tabIndex={-1}
          autoComplete="off"
          value={sitioWeb}
          onChange={(ev) => setSitioWeb(ev.target.value)}
        />
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acepto}
            onChange={(ev) => setAcepto(ev.target.checked)}
            aria-invalid={Boolean(errores.aceptoPrivacidad)}
            className="mt-1 size-5 shrink-0 accent-terracota"
          />
          <span>
            {campos.aceptoPrivacidad}.{" "}
            <a href="/#privacidad" className={e.botonTexto} target="_blank">
              Leer el aviso
            </a>
          </span>
        </label>
        {errores.aceptoPrivacidad && <p className={e.error}>{errores.aceptoPrivacidad}</p>}
      </div>

      <button type="submit" disabled={enviando} className={e.botonPrimario}>
        {enviando ? "Enviando…" : correoVerificado ? "Ver la ficha técnica" : "Enviarme el código"}
      </button>
      {avisoVisible}
    </form>
  );
}
