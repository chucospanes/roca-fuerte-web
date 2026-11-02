-- 005_casas_venta.sql — Catálogo público de casas en venta
--
-- Casas concretas a la venta (distintas del modelo Esparta de la portada). Lectura pública
-- SOLO de las filas con publicada = true, para anon y authenticated; nadie escribe desde la
-- web (los datos se cargan desde el panel de Supabase, docs/GUIA_CARGA_CASAS.md).
-- Una sola fuente por dato: con planta_esparta = true, m², dormitorios y baños van en null
-- y la web los toma de src/content/esparta.ts.
-- Imágenes en el bucket PÚBLICO `casas` (separado del bucket privado `obras`), ruta
-- {casa_id}/archivo, sin políticas en storage.objects: no se lista ni se sube desde la web.
-- No toca ninguna tabla, política ni bucket del portal de clientes (004).
-- Ver docs/DECISIONES.md (2026-11-02). Prueba con rollback: supabase/pruebas/005_casas_venta.sql.

begin;

-- ---------------------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------------------

create table public.casas_venta (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique
                   check (char_length(slug) between 3 and 80
                          and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  publicada        boolean not null default false,
  -- Orden en el catálogo y en el bloque de la portada (menor primero)
  orden            smallint not null default 100 check (orden between 1 and 999),

  nombre           text not null check (char_length(nombre) between 2 and 120),
  modelo           text not null default 'Esparta' check (char_length(modelo) between 2 and 80),
  descripcion      text check (char_length(descripcion) <= 2000),

  -- Ubicación pública: sin dirección exacta
  distrito         text not null check (char_length(distrito) between 2 and 80),
  municipio        text not null check (char_length(municipio) between 2 and 80),
  departamento     text not null check (departamento in (
                     'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad',
                     'La Paz', 'La Unión', 'Morazán', 'San Miguel', 'San Salvador',
                     'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután')),

  estado           text not null default 'en_construccion'
                   check (estado in ('en_construccion', 'terminada', 'reservada', 'vendida')),
  etapa_actual     text check (char_length(etapa_actual) <= 120),
  -- null = "Consultar"
  precio_usd       integer check (precio_usd between 1000 and 5000000),

  -- Lote rectangular: el área se calcula, no se escribe
  lote_frente_m    numeric(5,2) not null check (lote_frente_m > 0 and lote_frente_m <= 200),
  lote_fondo_m     numeric(5,2) not null check (lote_fondo_m > 0 and lote_fondo_m <= 200),
  lote_m2          numeric(9,2) generated always as (lote_frente_m * lote_fondo_m) stored,

  -- Planta: del modelo Esparta (portada) o propia de esta casa
  planta_esparta   boolean not null default true,
  construccion_m2  numeric(6,2) check (construccion_m2 > 0 and construccion_m2 <= 2000),
  dormitorios      smallint check (dormitorios between 0 and 20),
  banos            smallint check (banos between 0 and 20),
  parqueos         smallint check (parqueos between 0 and 20),

  -- Servicios: null = por confirmar (se muestra con el sello de pendiente)
  agua             boolean,
  electricidad     boolean,
  aguas_negras     text check (aguas_negras in ('alcantarillado', 'fosa_septica')),

  -- Qué incluye la compra, una línea por elemento
  incluye          text[] not null default '{}'
                   check (cardinality(incluye) <= 20
                          and char_length(array_to_string(incluye, '')) <= 3000),

  -- Igual que avances.video_url (004): solo YouTube y Vimeo; la web arma el reproductor
  -- a partir del id y nunca incrusta esta URL tal cual.
  video_url        text check (
                     char_length(video_url) <= 300
                     and video_url ~ '^https://((www\.|m\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/'
                   ),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint casas_venta_planta check (
    (planta_esparta and construccion_m2 is null and dormitorios is null and banos is null)
    or (not planta_esparta and construccion_m2 is not null
        and dormitorios is not null and banos is not null)
  )
);

create index casas_venta_publicadas on public.casas_venta (orden) where publicada;

comment on table public.casas_venta is
  'Casas concretas a la venta. Lectura pública solo de las publicadas. Fotos en el bucket público "casas".';

create table public.casas_venta_imagenes (
  id          uuid primary key default gen_random_uuid(),
  casa_id     uuid not null references public.casas_venta (id) on delete cascade,
  tipo        text not null check (tipo in ('foto', 'plano')),
  orden       smallint not null default 1 check (orden between 1 and 99),
  -- Ruta dentro del bucket `casas`: siempre en la carpeta de SU casa
  ruta        text not null unique check (
                char_length(ruta) <= 300
                and ruta like casa_id::text || '/%'
                and position('..' in ruta) = 0
                and lower(ruta) ~ '\.(jpe?g|png|webp)$'
              ),
  -- Medidas reales del archivo (next/image las necesita para no mover el diseño)
  ancho       smallint not null check (ancho between 200 and 4000),
  alto        smallint not null check (alto between 200 and 4000),
  alt         text not null check (char_length(alt) between 5 and 300),
  created_at  timestamptz not null default now(),
  unique (casa_id, tipo, orden),
  -- El plano se publica a resolución media, como el de la portada
  constraint casas_venta_imagenes_plano_media check (tipo <> 'plano' or greatest(ancho, alto) <= 1800)
);

-- Un solo plano por casa
create unique index casas_venta_un_plano on public.casas_venta_imagenes (casa_id) where tipo = 'plano';

comment on table public.casas_venta_imagenes is
  'Fotos y plano de cada casa. Archivo en el bucket público "casas", ruta {casa_id}/archivo. Portada = foto de orden 1.';

-- ---------------------------------------------------------------------------------------
-- updated_at automático (función propia: no se acopla al portal)
-- ---------------------------------------------------------------------------------------

create function public.casas_actualizar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger casas_venta_updated_at before update on public.casas_venta
  for each row execute function public.casas_actualizar_updated_at();

revoke all on function public.casas_actualizar_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- Seguridad: lectura pública solo de lo publicado, sin escritura
-- ---------------------------------------------------------------------------------------

alter table public.casas_venta          enable row level security;
alter table public.casas_venta_imagenes enable row level security;

-- Supabase da permisos por defecto en `public`: se quitan todos y se devuelve solo SELECT
revoke all on table public.casas_venta, public.casas_venta_imagenes from anon, authenticated;
grant select on table public.casas_venta, public.casas_venta_imagenes to anon, authenticated;

create policy casas_venta_lee_publicadas on public.casas_venta
  for select to anon, authenticated
  using (publicada);

-- La subconsulta también pasa por la política de casas_venta
create policy casas_venta_imagenes_lee_publicadas on public.casas_venta_imagenes
  for select to anon, authenticated
  using (exists (select 1 from public.casas_venta c
                 where c.id = casas_venta_imagenes.casa_id and c.publicada));

-- ---------------------------------------------------------------------------------------
-- Storage: bucket PÚBLICO `casas`, 5 MB, solo JPEG/PNG/WebP
-- ---------------------------------------------------------------------------------------
-- Público = cualquier archivo se descarga por su URL (aunque la casa no esté publicada).
-- Sin políticas en storage.objects para este bucket: nadie lo lista ni sube desde la web.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('casas', 'casas', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

commit;
