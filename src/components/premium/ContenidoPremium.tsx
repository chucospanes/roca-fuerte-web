import { esPendiente } from "@/config/site";
import { esparta, type Desglose } from "@/content/esparta";

/** Dentro del área premium, un dato no confirmado se muestra como "Próximamente". */
function Proximamente() {
  return <span className="text-piedra-600 italic">Próximamente</span>;
}

function Valor({ valor }: { valor: string | undefined }) {
  return valor === undefined || esPendiente(valor) ? <Proximamente /> : <>{valor}</>;
}

const m = (n: number) => `${n.toFixed(2)} m`;
const m2 = (n: number) => `${n.toFixed(2)} m²`;

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-piedra-200 pt-8">
      <h2 className="font-display text-2xl font-extrabold">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ListaDesglose({ titulo, desglose }: { titulo: string; desglose: Desglose }) {
  return (
    <div className="rounded-lg border border-piedra-200 bg-blanco p-5">
      <h3 className="font-display text-lg font-bold">{titulo}</h3>
      {esPendiente(desglose) ? (
        <p className="mt-2">
          <Proximamente />
        </p>
      ) : (
        <ul className="mt-2 space-y-1 text-piedra-700">
          {desglose.map((linea) => (
            <li key={linea}>— {linea}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DESCARGAS = [
  { href: "/descargas/plano-casa-esparta-v4.pdf", titulo: "Plano de la casa", detalle: "Planta con medidas y áreas" },
  { href: "/descargas/plano-esparta.pdf", titulo: "Plano del lote", detalle: "Estacionamiento, jardín, casa y patio" },
  { href: "/descargas/fachada-esparta.pdf", titulo: "Fachada principal", detalle: "Vista desde la calle, con alturas" },
];

export function ContenidoPremium() {
  const fila = "grid grid-cols-[minmax(0,11rem)_1fr] gap-x-4 gap-y-1 py-2 sm:grid-cols-[14rem_1fr]";
  return (
    <div className="space-y-10">
      <Bloque titulo="Planos en PDF">
        <ul className="grid gap-4 sm:grid-cols-2">
          {DESCARGAS.map((d) => (
            <li key={d.href}>
              <a
                href={d.href}
                download
                className="flex h-full flex-col rounded-lg border-2 border-piedra-900 bg-blanco p-5 hover:border-terracota"
              >
                <span className="font-display text-lg font-bold">{d.titulo}</span>
                <span className="text-sm text-piedra-600">{d.detalle}</span>
                <span className="mt-3 font-semibold text-terracota">Descargar PDF ↓</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-piedra-600">{esparta.avisoPlanos}</p>
      </Bloque>

      <Bloque titulo="Ficha técnica">
        <dl className="divide-y divide-piedra-200 border-y border-piedra-200">
          <div className={fila}>
            <dt className="text-piedra-600">Área construida / útil</dt>
            <dd>
              {m2(esparta.areas.construidaM2)} / {m2(esparta.areas.utilM2)}
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Volumetría</dt>
            <dd>
              Cuerpo principal {esparta.volumetria.cuerpoPrincipal}; extensión de sala{" "}
              {esparta.volumetria.extensionSala}
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Muros</dt>
            <dd>
              {esparta.muros.sistema}: exteriores {m(esparta.muros.exterioresM)}, interiores{" "}
              {m(esparta.muros.interioresM)}
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Lote</dt>
            <dd>
              {m(esparta.lote.frenteM)} × {m(esparta.lote.fondoM)}:{" "}
              {esparta.lote.franjas.map((f) => `${f.nombre.toLowerCase()} ${m(f.fondoM)}`).join(", ")}
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Implantación</dt>
            <dd>{esparta.implantacion}</dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Techo</dt>
            <dd>
              {esparta.techo.cubierta}, cumbrera {esparta.techo.cumbrera.toLowerCase()}. Alero a{" "}
              {m(esparta.techo.aleroM)}, cumbrera a{" "}
              {m(esparta.techo.cumbreraM)}. {esparta.techo.desague}
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Fachada</dt>
            <dd>
              Pretil de {m(esparta.pretil.altoM)} (hasta {m(esparta.pretil.hastaM)}) que oculta el
              techo desde la calle. Acabados: {esparta.acabadosFachada.join(", ")}.
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Corredor</dt>
            <dd>
              {esparta.corredor.descripcion} Fondo de {m(esparta.corredor.fondoM)}.
            </dd>
          </div>
          <div className={fila}>
            <dt className="text-piedra-600">Diseño estructural</dt>
            <dd>
              <Proximamente />
            </dd>
          </div>
        </dl>
        <h3 className="mt-6 font-display text-lg font-bold">Ambientes</h3>
        <ul className="mt-2 space-y-2">
          {esparta.ambientes.map((a) => (
            <li key={a.nombre}>
              <span className="font-semibold">{a.nombre}</span> — {a.medidas}, {m2(a.areaM2)}.{" "}
              <span className="text-piedra-600">{a.notas.join(" ")}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Materiales y cantidades">
        <ul className="divide-y divide-piedra-200 rounded-lg border border-piedra-200 bg-blanco">
          {esparta.materiales.map((mat) => (
            <li key={mat.material} className="p-4">
              <p className="font-display font-bold">{mat.material}</p>
              <dl className="mt-2 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-piedra-600">Especificación</dt>
                <dd>
                  <Valor valor={mat.especificacion} />
                </dd>
                <dt className="text-piedra-600">Cantidad</dt>
                <dd>
                  <Valor valor={"cantidad" in mat ? (mat.cantidad as string) : undefined} />
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Qué incluye el precio">
        {/* Lo que incluye cada casa a la venta vive en el catálogo (/casas), no aquí */}
        <div className="grid gap-4 sm:grid-cols-2">
          <ListaDesglose
            titulo="Construir a pedido"
            desglose={esparta.desglosePrecio.construirAPedido}
          />
        </div>
      </Bloque>
    </div>
  );
}
