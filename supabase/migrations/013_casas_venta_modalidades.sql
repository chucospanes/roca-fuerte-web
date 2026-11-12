-- 013_casas_venta_modalidades.sql — Modalidades de venta de cada casa (lote, estacionamientos, precio)
--
-- Una casa del catálogo puede venderse de más de una forma (por ejemplo, con su lote de 5 × 20 m
-- o con el terreno completo de 10 × 20 m). Cada forma es una MODALIDAD con su lote,
-- estacionamientos, precio, detalles y una nota opcional. Toda casa debe tener al menos una (la
-- web la trata como una sola fuente de lote, estacionamientos y precio; sin modalidades muestra
-- "Consultar" y el lote "Por confirmar").
--
-- 1. Tabla `casas_venta_modalidades`. Lectura pública solo de las modalidades `disponible` de una
--    casa publicada (la política de casas_venta ya excluye las vendidas: en cascada, nada de una
--    vendida se ve). Administradores leen todo. Nadie escribe desde la web (SQL Editor, guía).
-- 2. Carga inicial: una modalidad por cada casa existente, copiada de sus columnas de hoy
--    (lote, parqueos y precio). Lo que se ve en la web no cambia hasta cargar otras.
-- 3. Columnas viejas `casas_venta.precio_usd`, `lote_frente_m`, `lote_fondo_m`, `lote_m2` y
--    `parqueos`: quedan SIN USO desde el código de esta versión, pero NO se borran aquí (el sitio
--    desplegado todavía las lee). Se borran en una migración posterior, ya desplegado el código.
-- 4. `clics_venta.modalidad_id`: qué modalidad se tocó en la ficha. Clave foránea compuesta
--    (modalidad_id, casa_id): la modalidad tiene que ser de ESA casa. Si se borra la modalidad,
--    el clic se conserva con la casa y sin la modalidad. La vista de resumen la agrega al final.
--
-- ANTES DE APLICAR: 005, 006, 009 y 011 aplicadas (PostgreSQL 15 o más, por el
-- "on delete set null (columna)"; el proyecto está en 17.11).
-- Prueba con rollback: supabase/pruebas/013_casas_venta_modalidades.sql.
-- Ver docs/DECISIONES.md (2026-11-11, "Precio por modalidad").

begin;

-- ---------------------------------------------------------------------------------------
-- 1. Tabla
-- ---------------------------------------------------------------------------------------

create table public.casas_venta_modalidades (
  id                uuid primary key default gen_random_uuid(),
  casa_id           uuid not null references public.casas_venta (id) on delete cascade,
  -- Orden en la ficha (menor primero). El "desde" es el menor precio, no el primero.
  orden             smallint not null default 1 check (orden between 1 and 9),
  nombre            text not null check (char_length(nombre) between 2 and 80),
  -- Lote rectangular: el área se calcula, no se escribe (igual que 005)
  lote_frente_m     numeric(5,2) not null check (lote_frente_m > 0 and lote_frente_m <= 200),
  lote_fondo_m      numeric(5,2) not null check (lote_fondo_m > 0 and lote_fondo_m <= 200),
  lote_m2           numeric(9,2) generated always as (lote_frente_m * lote_fondo_m) stored,
  -- null = por confirmar
  estacionamientos  smallint check (estacionamientos between 0 and 20),
  -- null = "Consultar". Mismo rango que casas_venta.precio_usd. Sin descuentos ni preventa.
  precio_usd        integer check (precio_usd between 1000 and 5000000),
  -- Lo que distingue a esta modalidad, una línea por elemento
  detalles          text[] not null default '{}'
                    check (cardinality(detalles) <= 8
                           and char_length(array_to_string(detalles, '')) <= 600),
  -- Nota pequeña bajo la modalidad (p. ej., "Lote de 5 × 20 m sujeto a segregación en trámite")
  nota              text check (char_length(nota) between 2 and 200),
  -- false = ya no se ofrece (p. ej., vendido el lote de al lado): no se ve, no se borra
  disponible        boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (casa_id, orden),
  -- Para la clave foránea compuesta de clics_venta
  unique (id, casa_id)
);

comment on table public.casas_venta_modalidades is
  'Formas de vender cada casa del catálogo: lote, estacionamientos y precio. Toda casa tiene al menos una. Lectura pública solo de las disponibles de una casa publicada y no vendida.';

create trigger casas_venta_modalidades_updated_at before update on public.casas_venta_modalidades
  for each row execute function public.casas_actualizar_updated_at();

alter table public.casas_venta_modalidades enable row level security;
revoke all on table public.casas_venta_modalidades from anon, authenticated;
grant select on table public.casas_venta_modalidades to anon, authenticated;

-- La subconsulta pasa por la política de casas_venta (publicada y no vendida, 011)
create policy casas_venta_modalidades_lee_publicadas on public.casas_venta_modalidades
  for select to anon, authenticated
  using (disponible and exists (select 1 from public.casas_venta c
                                where c.id = casas_venta_modalidades.casa_id));

create policy casas_venta_modalidades_lee_admin on public.casas_venta_modalidades
  for select to authenticated using ((select public.es_admin()));

-- ---------------------------------------------------------------------------------------
-- 2. Carga inicial: una modalidad por casa, con sus datos de hoy
-- ---------------------------------------------------------------------------------------

insert into public.casas_venta_modalidades
  (casa_id, orden, nombre, lote_frente_m, lote_fondo_m, estacionamientos, precio_usd)
select c.id, 1,
       'Lote de ' || trim_scale(c.lote_frente_m)::text || ' × ' || trim_scale(c.lote_fondo_m)::text || ' m',
       c.lote_frente_m, c.lote_fondo_m, c.parqueos, c.precio_usd
from public.casas_venta c;

comment on column public.casas_venta.precio_usd is
  'SIN USO desde 013: el precio vive en casas_venta_modalidades. Se borra en una migración posterior.';
comment on column public.casas_venta.lote_frente_m is
  'SIN USO desde 013: el lote vive en casas_venta_modalidades. Se borra en una migración posterior.';
comment on column public.casas_venta.lote_fondo_m is
  'SIN USO desde 013: el lote vive en casas_venta_modalidades. Se borra en una migración posterior.';
comment on column public.casas_venta.parqueos is
  'SIN USO desde 013: los estacionamientos viven en casas_venta_modalidades. Se borra en una migración posterior.';

-- ---------------------------------------------------------------------------------------
-- 4. Clics por modalidad
-- ---------------------------------------------------------------------------------------

-- Dos claves: la compuesta exige que la modalidad sea de esa casa; la simple deja la modalidad en
-- null aunque casa_id ya sea null (si se borra la casa, la compuesta no encuentra el clic).
alter table public.clics_venta
  add column modalidad_id uuid references public.casas_venta_modalidades (id) on delete set null,
  add constraint clics_venta_modalidad_de_la_casa foreign key (modalidad_id, casa_id)
    references public.casas_venta_modalidades (id, casa_id)
    on delete set null (modalidad_id);

create index clics_venta_modalidad on public.clics_venta (modalidad_id) where modalidad_id is not null;

comment on column public.clics_venta.modalidad_id is
  'Modalidad de la casa que se tocó en la ficha (de esa misma casa: clave compuesta). Null si no aplica o se borró.';

-- Misma vista (006), con la modalidad como columna nueva al final
create or replace view public.clics_venta_resumen
with (security_invoker = true) as
select
  (v.created_at at time zone 'America/El_Salvador')::date as dia,
  v.opcion,
  v.ubicacion,
  coalesce(v.utm_source, '(sin utm)')   as utm_source,
  coalesce(v.utm_campaign, '(sin utm)') as utm_campaign,
  count(*)                              as clics,
  c.slug                                as casa,
  m.nombre                              as modalidad
from public.clics_venta v
left join public.casas_venta c on c.id = v.casa_id
left join public.casas_venta_modalidades m on m.id = v.modalidad_id
group by 1, 2, 3, 4, 5, 7, 8
order by dia desc, clics desc;

revoke all on table public.clics_venta_resumen from anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- Comprobaciones finales: si algo no cumple, se revierte toda la migración
-- ---------------------------------------------------------------------------------------

do $$
declare
  rol     text;
  objeto  text;
  permiso text;
  n       bigint;
begin
  -- clics_venta y su vista: sin ningún permiso para anon ni authenticated
  foreach rol in array array['anon', 'authenticated'] loop
    foreach objeto in array array['public.clics_venta', 'public.clics_venta_resumen'] loop
      foreach permiso in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
                                     'REFERENCES', 'TRIGGER'] loop
        if has_table_privilege(rol, objeto, permiso) then
          raise exception 'ALTO: % tiene % sobre %. No se aplicó nada.', rol, permiso, objeto;
        end if;
      end loop;
    end loop;
    -- Modalidades: solo lectura
    foreach permiso in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
      if has_table_privilege(rol, 'public.casas_venta_modalidades', permiso) then
        raise exception 'ALTO: % tiene % sobre casas_venta_modalidades. No se aplicó nada.', rol, permiso;
      end if;
    end loop;
  end loop;

  -- Toda casa quedó con exactamente una modalidad
  select count(*) into n
  from public.casas_venta c
  where (select count(*) from public.casas_venta_modalidades m where m.casa_id = c.id) <> 1;
  if n <> 0 then
    raise exception 'ALTO: % casas sin su modalidad inicial. No se aplicó nada.', n;
  end if;
end;
$$;

commit;
