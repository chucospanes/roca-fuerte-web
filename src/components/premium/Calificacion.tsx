"use client";

import { useState } from "react";
import { calificarLead } from "@/app/acciones";
import {
  campos,
  formasPago,
  inicios,
  intereses,
  paisesResidencia,
  terrenoEscriturado,
} from "@/content/formularios";
import type { LeadVisible } from "@/lib/leads";
import { DEPARTAMENTOS } from "@/lib/validacion";
import * as e from "./estilos";
import { useHidratado } from "./useHidratado";

type Opciones = Record<string, string>;

function Radios({
  nombre,
  leyenda,
  opciones,
  valor,
  onChange,
  error,
}: {
  nombre: string;
  leyenda: string;
  opciones: Opciones;
  valor: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className={e.etiqueta}>{leyenda}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(opciones).map(([v, texto]) => (
          <label
            key={v}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-piedra-300 bg-blanco px-3 has-checked:border-terracota has-checked:bg-terracota/5"
          >
            <input
              type="radio"
              name={nombre}
              value={v}
              checked={valor === v}
              onChange={() => onChange(v)}
              className="accent-terracota"
            />
            {texto}
          </label>
        ))}
      </div>
      {error && <p className={e.error}>{error}</p>}
    </fieldset>
  );
}

/**
 * Paso 2 (opcional): calificación. Llega precargado con lo que ya está guardado para el
 * correo de la sesión; al guardar, actualiza ese mismo registro.
 */
export function Calificacion({ inicial }: { inicial: LeadVisible }) {
  const hidratado = useHidratado();
  const [pais, setPais] = useState<string>(inicial.pais_residencia ?? "");
  const [interes, setInteres] = useState<string>(inicial.interes ?? "");
  const [departamento, setDepartamento] = useState<string>(inicial.departamento ?? "");
  const [municipio, setMunicipio] = useState(inicial.municipio ?? "");
  const [escriturado, setEscriturado] = useState<string>(inicial.terreno_escriturado ?? "");
  const [pago, setPago] = useState<string>(inicial.forma_pago ?? "");
  const [inicio, setInicio] = useState<string>(inicial.inicio ?? "");
  const [comentario, setComentario] = useState(inicial.comentario ?? "");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"editando" | "enviando" | "listo" | "error">("editando");
  const [whatsapp, setWhatsapp] = useState<string | undefined>();

  const vacio = (s: string) => (s ? s : undefined);

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    setEstado("enviando");
    const resultado = await calificarLead({
      pais_residencia: vacio(pais),
      interes: vacio(interes),
      departamento: vacio(departamento),
      municipio: vacio(municipio),
      terreno_escriturado: vacio(escriturado),
      forma_pago: vacio(pago),
      inicio: vacio(inicio),
      comentario: vacio(comentario),
    });
    if (resultado.ok) {
      setErrores({});
      setWhatsapp(resultado.whatsapp);
      setEstado("listo");
      return;
    }
    setErrores(resultado.errores ?? {});
    setWhatsapp(resultado.whatsapp);
    setEstado(resultado.error === "datos_invalidos" ? "editando" : "error");
  }

  if (estado === "listo") {
    return (
      <div role="status" className="rounded-lg border border-piedra-200 bg-blanco p-6">
        <p className="font-display text-xl font-bold">Gracias, {inicial.nombre}.</p>
        <p className="mt-2 text-piedra-700">
          Guardamos tus respuestas. Si quieres, sigue la conversación por WhatsApp con el mensaje
          listo.
        </p>
        {whatsapp && (
          <a href={whatsapp} className={`mt-4 ${e.botonPrimario}`}>
            Seguir por WhatsApp
          </a>
        )}
        <button type="button" onClick={() => setEstado("editando")} className={`mt-4 block ${e.botonTexto}`}>
          Cambiar mis respuestas
        </button>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={enviar} noValidate className="max-w-2xl space-y-6">
      <p className="text-sm text-piedra-600">
        Registrado como <strong>{inicial.nombre}</strong> · {inicial.whatsapp} ·{" "}
        <span className="break-all">{inicial.correo}</span>
      </p>

      <Radios nombre="pais" leyenda={campos.paisResidencia} opciones={paisesResidencia} valor={pais} onChange={setPais} error={errores.pais_residencia} />
      <Radios nombre="interes" leyenda={campos.interes} opciones={intereses} valor={interes} onChange={setInteres} error={errores.interes} />

      {interes === "construir" && (
        <div className="space-y-6 border-l-2 border-terracota/30 pl-4">
          <div>
            <label htmlFor="departamento" className={e.etiqueta}>
              {campos.departamento}
            </label>
            <select
              id="departamento"
              value={departamento}
              onChange={(ev) => setDepartamento(ev.target.value)}
              aria-invalid={Boolean(errores.departamento)}
              className={e.campo}
            >
              <option value="">Elige…</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errores.departamento && <p className={e.error}>{errores.departamento}</p>}
          </div>
          <div>
            <label htmlFor="municipio" className={e.etiqueta}>
              {campos.municipio}
            </label>
            <input
              id="municipio"
              value={municipio}
              onChange={(ev) => setMunicipio(ev.target.value)}
              maxLength={80}
              aria-invalid={Boolean(errores.municipio)}
              className={e.campo}
            />
            {errores.municipio && <p className={e.error}>{errores.municipio}</p>}
          </div>
          <Radios nombre="escriturado" leyenda={campos.terrenoEscriturado} opciones={terrenoEscriturado} valor={escriturado} onChange={setEscriturado} error={errores.terreno_escriturado} />
        </div>
      )}

      <Radios nombre="pago" leyenda={campos.formaPago} opciones={formasPago} valor={pago} onChange={setPago} error={errores.forma_pago} />
      <Radios nombre="inicio" leyenda={campos.inicio} opciones={inicios} valor={inicio} onChange={setInicio} error={errores.inicio} />

      <div>
        <label htmlFor="comentario" className={e.etiqueta}>
          {campos.comentario}
        </label>
        <textarea
          id="comentario"
          value={comentario}
          onChange={(ev) => setComentario(ev.target.value)}
          maxLength={1000}
          rows={4}
          className={e.campo}
        />
      </div>

      <button type="submit" disabled={estado === "enviando" || !hidratado} className={e.botonPrimario}>
        {estado === "enviando" ? "Guardando…" : "Guardar y seguir por WhatsApp"}
      </button>

      {estado === "error" && (
        <div role="alert" className="rounded-md border border-terracota/40 bg-terracota/5 p-4">
          <p>No pudimos guardar tus respuestas. Puedes escribirnos directamente por WhatsApp.</p>
          {whatsapp && (
            <a href={whatsapp} className={`mt-2 inline-block ${e.botonTexto}`}>
              Escribir por WhatsApp →
            </a>
          )}
        </div>
      )}
    </form>
  );
}
