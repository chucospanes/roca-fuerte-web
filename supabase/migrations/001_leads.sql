-- 001_leads.sql — Tabla única de leads (Fase 4)
--
-- Un registro por correo. Se crea al verificar el código de acceso al contenido premium
-- (paso 1) y se completa con la calificación opcional (paso 2). Solo el servidor escribe,
-- con la clave secreta: RLS activado y sin políticas para anon ni authenticated.
-- Ver docs/PLAN_V1.md y docs/DECISIONES.md.

create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid unique references auth.users (id) on delete set null,

  -- Paso 1: desbloqueo (correo verificado con código de 6 dígitos)
  -- Siempre en minúsculas (check), así el unique simple equivale a uno sin distinguir
  -- mayúsculas y el upsert puede usar onConflict: 'correo'
  correo               text not null unique
                       check (correo = lower(correo) and correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nombre               text not null check (char_length(nombre) between 2 and 120),
  whatsapp             text not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),  -- E.164
  acepto_privacidad_at timestamptz not null,
  correo_verificado_at timestamptz not null,

  -- Paso 2: calificación (opcional)
  pais_residencia      text check (pais_residencia in ('el_salvador', 'estados_unidos', 'otro')),
  interes              text check (interes in ('comprar', 'construir')),
  departamento         text check (char_length(departamento) <= 60),
  municipio            text check (char_length(municipio) <= 80),
  terreno_escriturado  text check (terreno_escriturado in ('si', 'no', 'en_tramite')),
  forma_pago           text check (forma_pago in ('contado', 'fsv', 'banco', 'otro')),
  inicio               text check (inicio in ('inmediato', '3_meses', '6_meses', 'mas_6_meses')),
  comentario           text check (char_length(comentario) <= 1000),
  calificado_at        timestamptz,

  -- Origen del primer contacto: se escribe al crear el registro y no se sobrescribe
  utm_source           text check (char_length(utm_source) <= 200),
  utm_medium           text check (char_length(utm_medium) <= 200),
  utm_campaign         text check (char_length(utm_campaign) <= 200),
  utm_content          text check (char_length(utm_content) <= 200),
  referrer             text check (char_length(referrer) <= 500),

  estado               text not null default 'nuevo'
                       check (estado in ('nuevo', 'contactado', 'calificado', 'descartado', 'cliente')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.leads is
  'Prospectos con correo verificado. Un registro por correo; solo escribe el servidor.';

create index leads_created_at on public.leads (created_at desc);
create index leads_estado on public.leads (estado);

-- updated_at automático
create function public.leads_actualizar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.leads_actualizar_updated_at();

-- Los UTM y el referrer son de primer contacto: un update nunca los cambia
create function public.leads_conservar_origen()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.utm_source   := old.utm_source;
  new.utm_medium   := old.utm_medium;
  new.utm_campaign := old.utm_campaign;
  new.utm_content  := old.utm_content;
  new.referrer     := old.referrer;
  new.created_at   := old.created_at;
  return new;
end;
$$;

create trigger leads_origen_fijo
  before update on public.leads
  for each row execute function public.leads_conservar_origen();

-- Seguridad: nadie con la clave publishable puede leer ni escribir
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
revoke all on function public.leads_actualizar_updated_at() from public, anon, authenticated;
revoke all on function public.leads_conservar_origen() from public, anon, authenticated;
