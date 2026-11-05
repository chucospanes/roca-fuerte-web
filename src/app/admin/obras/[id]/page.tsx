import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorCarga, sesionAdmin } from "@/components/admin/Guardias";
import { VistaObraAdmin } from "@/components/admin/Vistas";
import { hoyElSalvador, leerObraAdmin } from "@/lib/admin";
import { esquemaIdPortal } from "@/lib/validacion";

async function Obra({ params }: { params: Promise<{ id: string }> }) {
  const sesion = await sesionAdmin();
  if (sesion === "error") return <ErrorCarga />;
  if (!sesion) redirect("/admin");

  const { id } = await params;
  if (!esquemaIdPortal.safeParse(id).success) notFound();
  const detalle = await leerObraAdmin(id);
  if (!detalle) notFound();
  return <VistaObraAdmin detalle={detalle} hoy={hoyElSalvador()} />;
}

/** Una obra: nuevo avance, cambiar etapas y agregar fotos a sus avances. */
export default function AdminObraPage({ params }: PageProps<"/admin/obras/[id]">) {
  return (
    <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
      <Obra params={params} />
    </Suspense>
  );
}
