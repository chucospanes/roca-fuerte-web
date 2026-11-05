import { Suspense } from "react";
import { ErrorCarga, sesionAdmin } from "@/components/admin/Guardias";
import { ListaObrasAdmin } from "@/components/admin/Vistas";
import { AccesoPortal } from "@/components/portal/AccesoPortal";
import { Salir } from "@/components/premium/Salir";
import { listarObrasAdmin } from "@/lib/admin";

async function Inicio() {
  const sesion = await sesionAdmin();
  if (sesion === "error") return <ErrorCarga />;
  if (!sesion) {
    return (
      <>
        <h1 className="font-display text-2xl font-extrabold">Entrar</h1>
        <div className="mt-6">
          <AccesoPortal para="admin" />
        </div>
      </>
    );
  }

  const obras = await listarObrasAdmin();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold">Obras</h1>
      {obras === null ? <ErrorCarga /> : <ListaObrasAdmin obras={obras} />}
      <p className="text-sm text-piedra-600">
        Entraste como <strong className="break-all text-piedra-800">{sesion.correo}</strong>.
      </p>
      <Salir />
    </div>
  );
}

/** Inicio del panel: acceso con código o la lista de obras. */
export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-piedra-600">Cargando…</p>}>
      <Inicio />
    </Suspense>
  );
}
