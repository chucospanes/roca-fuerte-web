-- 003_clics_inversionistas.sql — Opción y ubicación de inversionistas en el conteo de clics (Fase 7)
--
-- La sección "Para inversionistas" tiene su propio botón de WhatsApp. `clics_venta` acepta
-- solo listas cerradas (CHECK), así que se agregan la opción `inversionista` y la ubicación
-- `inversionistas`. Ver docs/DECISIONES.md (2026-10-30).
--
-- ANTES DE APLICAR: confirmar el nombre de los CHECK (en 002 no tienen nombre y Postgres
-- los nombra solo):
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.clics_venta'::regclass and contype = 'c';
-- Deben aparecer `clics_venta_opcion_check` y `clics_venta_ubicacion_check`. Sin
-- "if exists" a propósito: si el nombre no coincide, la transacción falla y no cambia nada.
-- Nombres confirmados por el usuario con esa consulta el 2026-10-30 (PostgreSQL 17.11).

begin;

alter table public.clics_venta drop constraint clics_venta_opcion_check;
alter table public.clics_venta drop constraint clics_venta_ubicacion_check;

alter table public.clics_venta
  add constraint clics_venta_opcion_check
    check (opcion in ('comprar', 'construir', 'general', 'inversionista')),
  add constraint clics_venta_ubicacion_check
    check (ubicacion in ('hero', 'precios', 'contacto', 'flotante', 'pie', 'inversionistas'));

commit;
