import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AgregarFotos } from "@/components/admin/AgregarFotos";
import { ErrorCarga, sesionAdmin } from "@/components/admin/Guardias";
import { fecha } from "@/content/portal";
import { leerAvanceAdmin, MAX_FOTOS_AVANCE } from "@/lib/admin";
import { carpetaFotos } from "@/lib/portal";

async function Fotos({ params }: { params: Promise<{ id: string; avanceId: string }> }) {
  const sesion = await sesionAdmin();
  if (sesion === "error") return <ErrorCarga />;
  if (!sesion) redirect("/admin");

  const { id, avanceId } = await params;
  const avance = await leerAvanceAdmin(id, avanceId);
  if (!avance) notFound();

  return (
    <>
      <Link href={`/admin/obras/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-terracota">
        ← Volver a la obra
      </Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold">Agregar fotos</h1>
      <p className="mt-1 text-piedra-700">
        {fecha(avance.fecha)} · {avance.titulo}
      </p>
      <p className="mt-1 mb-6 text-sm text-piedra-600">
        Ya tiene {avance.fotos.length} {avance.fotos.length === 1 ? "foto" : "fotos"}. Las nuevas van después.
      </p>
      <AgregarFotos
        obraId={id}
        carpeta={`${carpetaFotos(id, avanceId)}/`}
        existentes={avance.fotos}
        maximo={MAX_FOTOS_AVANCE - avance.fotos.length}
      />
    </>
  );
}

export default function AdminFotosAvancePage({ params }: PageProps<"/admin/obras/[id]/avances/[avanceId]">) {
  return (
    <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
      <Fotos params={params} />
    </Suspense>
  );
}
