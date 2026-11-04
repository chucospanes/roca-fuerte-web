-- 008_casas_venta_etapas.sql — Avance público de cada casa del catálogo (bitácora)
--
-- Una sola fuente para la bitácora de la portada y el avance de la ficha (/casas/[slug]):
-- reemplaza src/content/bitacora.ts. Mismo modelo de seguridad que las imágenes del catálogo
-- (005): lectura pública SOLO de las etapas de casas publicadas, para anon y authenticated;
-- nadie escribe desde la web (se carga desde el panel de Supabase, docs/GUIA_CARGA_CASAS.md).
--
-- NO toca el portal de clientes (004): las etapas del portal (`etapas`) siguen privadas y
-- separadas. Al venderse una casa, su avance público se congela (no se carga más aquí) y
-- sigue solo en el portal.
--
-- ANTES DE APLICAR: 005 aplicada (usa casas_venta y su función casas_actualizar_updated_at).
-- Prueba con rollback: supabase/pruebas/008_casas_venta_etapas.sql.
-- Ver docs/DECISIONES.md (2026-11-04).

begin;

create table public.casas_venta_etapas (
  id            uuid primary key default gen_random_uuid(),
  casa_id       uuid not null references public.casas_venta (id) on delete cascade,
  orden         smallint not null check (orden between 1 and 99),
  nombre        text not null check (char_length(nombre) between 2 and 120),
  -- Mismos valores que las etapas del portal (004)
  estado        text not null default 'por_iniciar'
                check (estado in ('por_iniciar', 'en_proceso', 'terminada')),
  -- Fecha real de inicio; una etapa por iniciar va sin fecha (se pone cuando arranca)
  fecha_inicio  date,
  descripcion   text check (char_length(descripcion) <= 2000),
  -- Igual que casas_venta.video_url: solo YouTube y Vimeo; la web arma el reproductor a
  -- partir del id y nunca incrusta esta URL tal cual.
  video_url     text check (
                  char_length(video_url) <= 300
                  and video_url ~ '^https://((www\.|m\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/'
                ),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (casa_id, orden),
  constraint casas_venta_etapas_fecha check (estado <> 'por_iniciar' or fecha_inicio is null)
);

comment on table public.casas_venta_etapas is
  'Avance público de cada casa del catálogo (bitácora). Lectura pública solo de casas publicadas. Separado de las etapas privadas del portal.';

-- updated_at automático, con la función de 005
create trigger casas_venta_etapas_updated_at before update on public.casas_venta_etapas
  for each row execute function public.casas_actualizar_updated_at();

-- ---------------------------------------------------------------------------------------
-- Seguridad: lectura pública solo de lo publicado, sin escritura
-- ---------------------------------------------------------------------------------------

alter table public.casas_venta_etapas enable row level security;

-- Supabase da permisos por defecto en `public`: se quitan todos y se devuelve solo SELECT
revoke all on table public.casas_venta_etapas from anon, authenticated;
grant select on table public.casas_venta_etapas to anon, authenticated;

-- La subconsulta también pasa por la política de casas_venta (solo publicadas)
create policy casas_venta_etapas_lee_publicadas on public.casas_venta_etapas
  for select to anon, authenticated
  using (exists (select 1 from public.casas_venta c
                 where c.id = casas_venta_etapas.casa_id and c.publicada));

-- Comprobación: anon y authenticated solo tienen SELECT (has_table_privilege también cuenta
-- lo concedido a PUBLIC). Si no, se revierte toda la migración.
do $$
declare
  rol     text;
  permiso text;
begin
  foreach rol in array array['anon', 'authenticated'] loop
    if not has_table_privilege(rol, 'public.casas_venta_etapas', 'SELECT') then
      raise exception 'ALTO: % no tiene SELECT sobre casas_venta_etapas. No se aplicó nada.', rol;
    end if;
    foreach permiso in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
      if has_table_privilege(rol, 'public.casas_venta_etapas', permiso) then
        raise exception 'ALTO: % tiene % sobre casas_venta_etapas. No se aplicó nada.', rol, permiso;
      end if;
    end loop;
  end loop;
end;
$$;

commit;
