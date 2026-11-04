-- 007_documentos_factura.sql — Tipo de documento `factura` en el portal de clientes
--
-- Agrega 'factura' a la lista de tipos de `documentos` (004). Las facturas se muestran en su
-- propio apartado de la obra. No cambia tablas, políticas, permisos ni Storage: solo el CHECK.
--
-- ANTES DE APLICAR: confirmar el nombre real del CHECK con la consulta de solo lectura que va
-- en docs/ESTADO.md (se esperaba `documentos_tipo_check`, el nombre que Postgres le da a un
-- CHECK escrito en la columna). Sin "if exists" a propósito: si el nombre no coincide, la
-- transacción falla y no cambia nada.
-- Ver docs/DECISIONES.md (2026-11-03).

begin;

alter table public.documentos drop constraint documentos_tipo_check;

alter table public.documentos
  add constraint documentos_tipo_check
    check (tipo in ('contrato', 'plano', 'permiso', 'otro', 'factura'));

comment on table public.documentos is
  'Documentos de la obra (contrato, planos, permisos, facturas). El archivo vive en Storage (bucket obras).';

-- Comprobación: queda un solo CHECK sobre `tipo` y acepta factura. Si no, se revierte todo.
do $$
declare
  n   int;
  def text;
begin
  select count(*), max(pg_get_constraintdef(oid)) into n, def
  from pg_constraint
  where conrelid = 'public.documentos'::regclass and contype = 'c'
    and pg_get_constraintdef(oid) like '%(tipo = ANY%';
  if n <> 1 or def not like '%factura%' then
    raise exception 'ALTO: el CHECK de documentos.tipo no quedó como se esperaba (% CHECK, %). No se aplicó nada.', n, def;
  end if;
end;
$$;

commit;
