import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { FormAvance } from "@/components/admin/FormAvance";
import { ErrorCarga, sesionAdmin } from "@/components/admin/Guardias";
import { hoyElSalvador, leerObraAdmin, MAX_FOTOS_AVANCE } from "@/lib/admin";
import { esquemaIdPortal } from "@/lib/validacion";

async function NuevoAvance({ params }: { params: Promise<{ id: string }> }) {
  const sesion = await sesionAdmin();
  if (sesion === "error") return <ErrorCarga />;
  if (!sesion) redirect("/admin");

  const { id } = await params;
  if (!esquemaIdPortal.safeParse(id).success) notFound();
  const detalle = await leerObraAdmin(id);
  if (!detalle) notFound();
  const enProceso = detalle.etapas.find((e) => e.estado === "en_proceso");

  return (
    <>
      <Link href={`/admin/obras/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-terracota">
        ← {detalle.obra.nombre}
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-extrabold">Nuevo avance</h1>
      <FormAvance
        obraId={id}
        etapas={detalle.etapas.map(({ orden, nombre, estado }) => ({ orden, nombre, estado }))}
        etapaPorDefecto={enProceso?.orden ?? null}
        hoy={hoyElSalvador()}
        maximoFotos={MAX_FOTOS_AVANCE}
        casaPublicable={detalle.casa && detalle.casa.estado !== "vendida" ? detalle.casa.nombre : null}
      />
    </>
  );
}

export default function AdminNuevoAvancePage({ params }: PageProps<"/admin/obras/[id]/avance">) {
  return (
    <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
      <NuevoAvance params={params} />
    </Suspense>
  );
}
