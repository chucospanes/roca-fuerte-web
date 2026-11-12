-- 014_clics_modalidad_sin_casa.sql — Borrar una casa con clics por modalidad (corrige 013)
--
-- Falla de la 013 (la detectó su prueba, 2026-11-12): borrar una casa que tiene clics con
-- modalidad daba 23503 en "clics_venta_modalidad_id_fkey". Causa: al borrar la casa se disparan
-- dos acciones en cadena, y Postgres las ejecuta en cola:
--   1. clics_venta.casa_id → null (llave de la 006). Esa actualización deja en cola la REVISIÓN
--      de la llave simple modalidad_id → casas_venta_modalidades(id).
--   2. casas_venta_modalidades se borra en cascada (llave de la 013).
-- La revisión de (1) corre después de (2): busca la modalidad, ya no existe, y falla antes de
-- que llegue la acción "on delete set null" de esa misma llave. (Postgres revisa aunque
-- modalidad_id no haya cambiado cuando la fila del clic se creó en la misma transacción, como
-- en la prueba; con clics viejos podía pasar o no según el orden: no se deja a la suerte.)
--
-- Corrección: la regla queda explícita y sin depender del orden de la cola.
--   - Sale la llave simple `clics_venta_modalidad_id_fkey`. Se queda la compuesta
--     `clics_venta_modalidad_de_la_casa` (la modalidad es de ESA casa; al borrarla, el clic
--     queda con la casa y sin modalidad).
--   - CHECK `clics_venta_modalidad_con_casa`: no hay modalidad sin casa.
--   - Trigger BEFORE UPDATE OF casa_id: si la casa pasa a null, la modalidad también, en la
--     MISMA actualización (así la acción de la 006 no choca con el CHECK ni deja la modalidad
--     colgando). Un INSERT con modalidad y sin casa lo rechaza el CHECK; no se arregla en
--     silencio.
--
-- ANTES DE APLICAR: 013 aplicada. Sin "if exists" a propósito: si el nombre de la llave no
-- coincide, la transacción falla y no cambia nada (el nombre sale del error de la prueba).
-- Prueba con rollback: supabase/pruebas/014_clics_modalidad_sin_casa.sql (y la de la 013, que
-- después de esta debe dar "PRUEBA SUPERADA").
-- Ver docs/DECISIONES.md (2026-11-12).

begin;

alter table public.clics_venta drop constraint clics_venta_modalidad_id_fkey;

-- Ninguna fila actual tiene modalidad sin casa (013 recién aplicada); si alguna la tuviera,
-- falla aquí y no se aplica nada
alter table public.clics_venta
  add constraint clics_venta_modalidad_con_casa check (modalidad_id is null or casa_id is not null);

create function public.clics_venta_modalidad_sigue_a_casa()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.casa_id is null then
    new.modalidad_id := null;
  end if;
  return new;
end;
$$;

revoke all on function public.clics_venta_modalidad_sigue_a_casa() from public, anon, authenticated;

create trigger clics_venta_modalidad_sigue_a_casa
  before update of casa_id on public.clics_venta
  for each row execute function public.clics_venta_modalidad_sigue_a_casa();

-- Comprobaciones finales: si algo no cumple, se revierte toda la migración
do $$
declare
  rol     text;
  objeto  text;
  permiso text;
begin
  -- Queda exactamente una llave de clics_venta hacia las modalidades: la compuesta
  if (select count(*) from pg_constraint
      where conrelid = 'public.clics_venta'::regclass
        and confrelid = 'public.casas_venta_modalidades'::regclass
        and contype = 'f') <> 1
     or not exists (select 1 from pg_constraint
                    where conrelid = 'public.clics_venta'::regclass
                      and conname = 'clics_venta_modalidad_de_la_casa') then
    raise exception 'ALTO: las llaves de clics_venta hacia las modalidades no son las esperadas. No se aplicó nada.';
  end if;

  -- clics_venta y su vista siguen sin permisos para anon ni authenticated
  foreach rol in array array['anon', 'authenticated'] loop
    foreach objeto in array array['public.clics_venta', 'public.clics_venta_resumen'] loop
      foreach permiso in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
                                     'REFERENCES', 'TRIGGER'] loop
        if has_table_privilege(rol, objeto, permiso) then
          raise exception 'ALTO: % tiene % sobre %. No se aplicó nada.', rol, permiso, objeto;
        end if;
      end loop;
    end loop;
  end loop;
end;
$$;

commit;
