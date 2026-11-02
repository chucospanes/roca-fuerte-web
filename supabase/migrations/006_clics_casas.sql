-- 006_clics_casas.sql — Clics del botón de WhatsApp de cada casa del catálogo
--
-- - Opción `casa` y ubicación `casa` (botón de la página /casas/[slug]).
-- - Ubicación `catalogo`: botón de WhatsApp de /casas cuando no hay casas o no cargan
--   (opción `general`).
-- - Columna `casa_id`: qué casa (no es un dato personal). Solo con la opción `casa`. Si se
--   borra la casa, el clic se conserva sin ella. /api/clic solo la llena con el id de una
--   casa publicada (lo revisa antes de insertar).
-- - La vista `clics_venta_resumen` agrega la casa (slug) al final, y sigue SIN permisos para
--   anon y authenticated: el bloque final lo comprueba y, si no se cumple, revierte todo.
--
-- ANTES DE APLICAR: 005 aplicada. Nombres de los CHECK confirmados el 2026-10-30 (ver 003);
-- sin "if exists" a propósito: si el nombre no coincide, la transacción falla y no cambia nada.
-- Ver docs/DECISIONES.md (2026-11-02).

begin;

alter table public.clics_venta drop constraint clics_venta_opcion_check;
alter table public.clics_venta drop constraint clics_venta_ubicacion_check;

alter table public.clics_venta
  add constraint clics_venta_opcion_check
    check (opcion in ('comprar', 'construir', 'general', 'inversionista', 'casa')),
  add constraint clics_venta_ubicacion_check
    check (ubicacion in ('hero', 'precios', 'contacto', 'flotante', 'pie', 'inversionistas',
                         'casa', 'catalogo')),
  add column casa_id uuid references public.casas_venta (id) on delete set null,
  add constraint clics_venta_casa_check check (casa_id is null or opcion = 'casa');

create index clics_venta_casa on public.clics_venta (casa_id) where casa_id is not null;

comment on column public.clics_venta.casa_id is
  'Casa del catálogo (solo opción casa). Null si se borró la casa.';

-- Misma vista, con la casa como columna nueva al final (create or replace solo permite
-- agregar columnas al final). security_invoker: respeta los permisos de quien la lee.
create or replace view public.clics_venta_resumen
with (security_invoker = true) as
select
  (v.created_at at time zone 'America/El_Salvador')::date as dia,
  v.opcion,
  v.ubicacion,
  coalesce(v.utm_source, '(sin utm)')   as utm_source,
  coalesce(v.utm_campaign, '(sin utm)') as utm_campaign,
  count(*)                              as clics,
  c.slug                                as casa
from public.clics_venta v
left join public.casas_venta c on c.id = v.casa_id
group by 1, 2, 3, 4, 5, 7
order by dia desc, clics desc;

-- create or replace conserva los permisos de la vista; se quitan otra vez por si acaso
revoke all on table public.clics_venta_resumen from anon, authenticated;

-- Comprobación: ni anon ni authenticated tienen ningún permiso sobre la tabla ni la vista
-- (has_table_privilege también cuenta lo concedido a PUBLIC). Si alguno lo tiene, se
-- revierte toda la migración.
do $$
declare
  rol     text;
  objeto  text;
  permiso text;
begin
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
