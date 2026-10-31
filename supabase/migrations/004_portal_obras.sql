-- 004_portal_obras.sql — Portal privado de clientes: obras, avances y documentos (Fase 7)
--
-- Cada cliente (comprador, "construir en tu terreno" o inversionista) ve SOLO las obras
-- donde es miembro. Es la primera vez que usuarios autenticados leen datos:
--   - RLS en las 6 tablas, solo SELECT para `authenticated`, solo filas de sus obras.
--   - Ningún permiso ni política de escritura: los datos los carga el constructor desde el
--     panel de Supabase (docs/GUIA_CARGA_OBRAS.md), que usa un rol que salta RLS.
--   - `anon` no tiene ningún permiso.
-- Archivos en el bucket privado `obras`. Las rutas empiezan con el id de la obra, sin
-- prefijo: fotos en {obra_id}/avances/{avance_id}/archivo y documentos en
-- {obra_id}/documentos/archivo. Ver docs/DECISIONES.md (2026-10-30).
--
-- Todo en una transacción: si algo falla (por ejemplo, la política de Storage), no queda
-- nada a medias.

begin;

-- ---------------------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------------------

create table public.obras (
  id                      uuid primary key default gen_random_uuid(),
  nombre                  text not null check (char_length(nombre) between 2 and 120),
  modalidad               text not null
                          check (modalidad in ('compra', 'construccion_terreno', 'inversionista')),
  modelo                  text check (char_length(modelo) <= 80),
  ubicacion               text check (char_length(ubicacion) <= 200),
  estado                  text not null default 'por_iniciar'
                          check (estado in ('por_iniciar', 'en_obra', 'pausada', 'entregada')),
  fecha_inicio            date,
  fecha_entrega_estimada  date,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.obras is
  'Obras de clientes del portal. Cada cliente ve solo las suyas (obra_miembros).';

-- Qué usuario ve qué obra. Si se borra el usuario de Auth, pierde el acceso.
create table public.obra_miembros (
  obra_id     uuid not null references public.obras (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (obra_id, user_id)
);

create index obra_miembros_user_id on public.obra_miembros (user_id);

comment on table public.obra_miembros is
  'Acceso al portal: un usuario de Auth ve una obra si tiene una fila aquí.';

create table public.etapas (
  id           uuid primary key default gen_random_uuid(),
  obra_id      uuid not null references public.obras (id) on delete cascade,
  orden        smallint not null check (orden between 1 and 99),
  nombre       text not null check (char_length(nombre) between 2 and 120),
  estado       text not null default 'por_iniciar'
               check (estado in ('por_iniciar', 'en_proceso', 'terminada')),
  fecha_inicio date,
  fecha_fin    date check (fecha_fin is null or fecha_inicio is null or fecha_fin >= fecha_inicio),
  descripcion  text check (char_length(descripcion) <= 2000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (obra_id, orden),
  -- Para que un avance solo pueda colgar de una etapa de su misma obra (FK compuesta)
  unique (id, obra_id)
);

create table public.avances (
  id           uuid primary key default gen_random_uuid(),
  obra_id      uuid not null references public.obras (id) on delete cascade,
  etapa_id     uuid,
  fecha        date not null,
  titulo       text not null check (char_length(titulo) between 2 and 160),
  descripcion  text check (char_length(descripcion) <= 4000),
  -- Solo YouTube y Vimeo. El portal arma la URL del reproductor a partir del id del video
  -- (youtube-nocookie.com / player.vimeo.com); nunca incrusta esta URL tal cual.
  video_url    text check (
                 char_length(video_url) <= 300
                 and video_url ~ '^https://((www\.|m\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/'
               ),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Si se borra la etapa, el avance queda sin etapa (no se borra ni cambia de obra)
  foreign key (etapa_id, obra_id)
    references public.etapas (id, obra_id) on delete set null (etapa_id)
);

create index avances_obra_fecha on public.avances (obra_id, fecha desc);

comment on table public.avances is
  'Diario de obra. Fotos en el bucket "obras", ruta {obra_id}/avances/{avance_id}/archivo (sin prefijo obras/).';

create table public.obra_materiales (
  id              uuid primary key default gen_random_uuid(),
  obra_id         uuid not null references public.obras (id) on delete cascade,
  orden           smallint not null default 1 check (orden between 1 and 999),
  material        text not null check (char_length(material) between 2 and 120),
  especificacion  text check (char_length(especificacion) <= 500),
  marca           text check (char_length(marca) <= 120),
  cantidad        text check (char_length(cantidad) <= 120),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index obra_materiales_obra on public.obra_materiales (obra_id, orden);

create table public.documentos (
  id          uuid primary key default gen_random_uuid(),
  obra_id     uuid not null references public.obras (id) on delete cascade,
  tipo        text not null check (tipo in ('contrato', 'plano', 'permiso', 'otro')),
  titulo      text not null check (char_length(titulo) between 2 and 160),
  -- Ruta dentro del bucket `obras`: siempre en la carpeta de documentos de SU obra
  ruta        text not null check (
                char_length(ruta) <= 500
                and ruta like obra_id::text || '/documentos/%'
                and position('..' in ruta) = 0
              ),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index documentos_obra on public.documentos (obra_id);

comment on table public.documentos is
  'Documentos de la obra (contrato, planos, permisos). El archivo vive en Storage (bucket obras).';

-- ---------------------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------------------

create function public.portal_actualizar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger obras_updated_at before update on public.obras
  for each row execute function public.portal_actualizar_updated_at();
create trigger etapas_updated_at before update on public.etapas
  for each row execute function public.portal_actualizar_updated_at();
create trigger avances_updated_at before update on public.avances
  for each row execute function public.portal_actualizar_updated_at();
create trigger obra_materiales_updated_at before update on public.obra_materiales
  for each row execute function public.portal_actualizar_updated_at();
create trigger documentos_updated_at before update on public.documentos
  for each row execute function public.portal_actualizar_updated_at();

revoke all on function public.portal_actualizar_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- Seguridad: RLS de solo lectura por membresía
-- ---------------------------------------------------------------------------------------

alter table public.obras           enable row level security;
alter table public.obra_miembros   enable row level security;
alter table public.etapas          enable row level security;
alter table public.avances         enable row level security;
alter table public.obra_materiales enable row level security;
alter table public.documentos      enable row level security;

-- Supabase da permisos por defecto en `public`: se quitan todos y se devuelve solo SELECT
revoke all on table
  public.obras, public.obra_miembros, public.etapas,
  public.avances, public.obra_materiales, public.documentos
from anon, authenticated;

grant select on table
  public.obras, public.obra_miembros, public.etapas,
  public.avances, public.obra_materiales, public.documentos
to authenticated;

-- Cada usuario ve solo sus propias membresías (no ve quién más es miembro de su obra).
-- Las demás políticas consultan esta tabla, y esa consulta también pasa por esta política.
create policy obra_miembros_lee_propias on public.obra_miembros
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy obras_lee_miembro on public.obras
  for select to authenticated
  using (id in (select m.obra_id from public.obra_miembros m
                where m.user_id = (select auth.uid())));

create policy etapas_lee_miembro on public.etapas
  for select to authenticated
  using (obra_id in (select m.obra_id from public.obra_miembros m
                     where m.user_id = (select auth.uid())));

create policy avances_lee_miembro on public.avances
  for select to authenticated
  using (obra_id in (select m.obra_id from public.obra_miembros m
                     where m.user_id = (select auth.uid())));

create policy obra_materiales_lee_miembro on public.obra_materiales
  for select to authenticated
  using (obra_id in (select m.obra_id from public.obra_miembros m
                     where m.user_id = (select auth.uid())));

create policy documentos_lee_miembro on public.documentos
  for select to authenticated
  using (obra_id in (select m.obra_id from public.obra_miembros m
                     where m.user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------------------
-- Storage: bucket privado `obras`, lectura solo de la carpeta de sus obras
-- ---------------------------------------------------------------------------------------

-- 10 MB por archivo; fotos JPEG/PNG/WebP y documentos PDF
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('obras', 'obras', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- La primera carpeta de la ruta es el id de la obra. Sirve para listar las fotos de un
-- avance y para firmar URLs con la sesión del usuario. Sin políticas de escritura.
create policy obras_archivos_lee_miembro on storage.objects
  for select to authenticated
  using (
    bucket_id = 'obras'
    and (storage.foldername(name))[1] in (
      select m.obra_id::text from public.obra_miembros m
      where m.user_id = (select auth.uid())
    )
  );

commit;
