-- 012_clics_hermanos.sql — Ubicación "hermanos" en el conteo de clics
--
-- La sección "Hermano cercano" de la portada (salvadoreños en el exterior) tiene su propio botón
-- de WhatsApp. `clics_venta` acepta solo listas cerradas (CHECK), así que se agrega la ubicación
-- `hermanos`. La opción del botón es `general` (ya existe): no cambia el CHECK de opciones.
--
-- Lista anterior (006): hero, precios, contacto, flotante, pie, inversionistas, casa, catalogo.
-- Sin "if exists" a propósito (como la 003 y la 006): si el nombre del CHECK no coincide, la
-- transacción falla y no cambia nada. Ver docs/DECISIONES.md (2026-11-05).

begin;

alter table public.clics_venta drop constraint clics_venta_ubicacion_check;

alter table public.clics_venta
  add constraint clics_venta_ubicacion_check
    check (ubicacion in ('hero', 'precios', 'contacto', 'flotante', 'pie', 'inversionistas',
                         'casa', 'catalogo', 'hermanos'));

-- Comprobación: anon y authenticated siguen sin ningún permiso sobre la tabla ni la vista
do $$
declare
  rol     text;
  objeto  text;
  permiso text;
begin
  foreach rol in array array['anon', 'authenticated'] loop
    foreach objeto in array array['public.clics_venta', 'public.clics_venta_resumen'] loop
      foreach permiso in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
        if has_table_privilege(rol, objeto, permiso) then
          raise exception 'ALTO: % tiene % sobre %. No se aplicó nada.', rol, permiso, objeto;
        end if;
      end loop;
    end loop;
  end loop;
end;
$$;

commit;
