import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Salir } from "@/components/premium/Salir";
import { VideoLazy } from "@/components/VideoLazy";
import { estadosEtapa, estadosObra, fecha, modalidades, tiposDocumento } from "@/content/portal";
import { leerObra, type DocumentoListado } from "@/lib/portal";
import { sesionVerificada } from "@/lib/supabase/servidor";

const tituloBloque = "font-display text-2xl font-extrabold";

function ListaDocumentos({ documentos }: { documentos: DocumentoListado[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {documentos.map((d) => (
        <li key={d.id}>
          {/* La ruta firma una URL de 60 s al tocar el enlace */}
          <a
            href={`/portal/documentos/${d.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full flex-col rounded-lg border-2 border-piedra-900 bg-blanco p-4 hover:border-terracota"
          >
            <span className="text-sm font-semibold text-terracota">
              {tiposDocumento[d.tipo] ?? tiposDocumento.otro}
            </span>
            <span className="font-display text-lg font-bold">{d.titulo}</span>
            <span className="mt-2 font-semibold text-terracota">Abrir ↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Detalle de una obra. Lee `params` y la sesión dentro de <Suspense> (cacheComponents).
 * Si el usuario no es miembro, la RLS no devuelve la obra y responde como si no existiera.
 */
export async function DetalleObra({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const sesion = await sesionVerificada();
  if (!sesion) redirect("/portal");

  const detalle = await leerObra(id);
  if (!detalle) notFound();
  const { obra, etapas, avances, materiales, documentos } = detalle;
  const nombreEtapa = new Map(etapas.map((e) => [e.id, e.nombre]));
  // Las facturas van en su propio apartado; sin facturas (o antes de la 007), no aparece
  const facturas = documentos.filter((d) => d.tipo === "factura");
  const otrosDocumentos = documentos.filter((d) => d.tipo !== "factura");

  return (
    <div className="space-y-12">
      <div>
        <Link href="/portal" className="text-sm font-semibold text-terracota underline-offset-4 hover:underline">
          ← Mis obras
        </Link>
        <p className="mt-4 text-sm font-semibold text-terracota">{modalidades[obra.modalidad]}</p>
        <h1 className="mt-1 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
          {obra.nombre}
        </h1>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-piedra-700 sm:grid-cols-[auto_1fr]">
          <dt className="font-semibold">Estado</dt>
          <dd>{estadosObra[obra.estado]}</dd>
          {obra.modelo && (
            <>
              <dt className="font-semibold">Modelo</dt>
              <dd>{obra.modelo}</dd>
            </>
          )}
          {obra.ubicacion && (
            <>
              <dt className="font-semibold">Ubicación</dt>
              <dd>{obra.ubicacion}</dd>
            </>
          )}
          {fecha(obra.fecha_inicio) && (
            <>
              <dt className="font-semibold">Inicio</dt>
              <dd>{fecha(obra.fecha_inicio)}</dd>
            </>
          )}
          {fecha(obra.fecha_entrega_estimada) && (
            <>
              <dt className="font-semibold">Entrega estimada</dt>
              <dd>{fecha(obra.fecha_entrega_estimada)}</dd>
            </>
          )}
        </dl>
      </div>

      <section>
        <h2 className={tituloBloque}>Etapas</h2>
        {etapas.length === 0 ? (
          <p className="mt-3 text-piedra-600">Todavía no hay etapas cargadas.</p>
        ) : (
          <ol className="mt-4 divide-y divide-piedra-200 border-y border-piedra-200">
            {etapas.map((e) => (
              <li key={e.id} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {e.orden}. {e.nombre}
                  </p>
                  <span className="text-sm font-semibold text-piedra-700">{estadosEtapa[e.estado]}</span>
                </div>
                {(fecha(e.fecha_inicio) || fecha(e.fecha_fin)) && (
                  <p className="text-sm text-piedra-600">
                    {fecha(e.fecha_inicio) && `Inicio: ${fecha(e.fecha_inicio)}`}
                    {fecha(e.fecha_inicio) && fecha(e.fecha_fin) && " · "}
                    {fecha(e.fecha_fin) && `Fin: ${fecha(e.fecha_fin)}`}
                  </p>
                )}
                {e.descripcion && <p className="mt-1 whitespace-pre-line text-piedra-700">{e.descripcion}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className={tituloBloque}>Avance de la obra</h2>
        {avances.length === 0 ? (
          <p className="mt-3 text-piedra-600">Todavía no hay avances publicados.</p>
        ) : (
          <ol className="mt-4 space-y-10">
            {avances.map((a) => (
              <li key={a.id} className="border-l-4 border-terracota pl-4">
                <p className="text-sm font-semibold text-piedra-600">
                  {fecha(a.fecha)}
                  {a.etapa_id && nombreEtapa.get(a.etapa_id) && ` · ${nombreEtapa.get(a.etapa_id)}`}
                </p>
                <h3 className="font-display text-xl font-bold">{a.titulo}</h3>
                {a.descripcion && <p className="mt-1 whitespace-pre-line text-piedra-700">{a.descripcion}</p>}
                {a.video && (
                  <div className="mt-4 max-w-2xl">
                    <VideoLazy
                      src={a.video.src}
                      vertical={a.video.vertical}
                      plataforma={a.video.plataforma}
                      titulo={a.titulo}
                    />
                  </div>
                )}
                {a.fotos.length > 0 && (
                  <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {a.fotos.map((f, i) => (
                      <li key={f.nombre}>
                        {/* URL firmada de 10 min: se abre tal cual para verla completa */}
                        <a href={f.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                          {/* eslint-disable-next-line @next/next/no-img-element -- foto privada: next/image guardaría copias en la caché del optimizador */}
                          <img
                            src={f.url}
                            alt={`${a.titulo}, foto ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="aspect-square w-full rounded-md bg-piedra-100 object-cover"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className={tituloBloque}>Materiales usados</h2>
        {materiales.length === 0 ? (
          <p className="mt-3 text-piedra-600">Todavía no hay materiales cargados.</p>
        ) : (
          <ul className="mt-4 divide-y divide-piedra-200 border-y border-piedra-200">
            {materiales.map((m) => (
              <li key={m.id} className="py-3">
                <p className="font-semibold">{m.material}</p>
                <p className="text-sm text-piedra-700">
                  {[m.especificacion, m.marca && `Marca: ${m.marca}`, m.cantidad && `Cantidad: ${m.cantidad}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className={tituloBloque}>Documentos</h2>
        {otrosDocumentos.length === 0 ? (
          <p className="mt-3 text-piedra-600">Todavía no hay documentos cargados.</p>
        ) : (
          <ListaDocumentos documentos={otrosDocumentos} />
        )}
      </section>

      {facturas.length > 0 && (
        <section>
          <h2 className={tituloBloque}>Facturas</h2>
          <ListaDocumentos documentos={facturas} />
        </section>
      )}

      <Salir />
    </div>
  );
}
