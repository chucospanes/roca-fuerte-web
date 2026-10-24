-- 002_clics_venta.sql — Conteo anónimo de clics en los botones de venta (Fase 5)
--
-- Un registro por clic en un botón de WhatsApp de venta, con el UTM de primer contacto.
-- SIN datos personales: ni IP, ni navegador, ni identificador de dispositivo, ni correo o
-- teléfono. Dos clics de la misma persona no se pueden relacionar: se cuentan clics, no
-- personas. Solo escribe el servidor (ruta POST /api/clic) con la clave secreta.
-- Ver docs/PLAN_V1.md y docs/DECISIONES.md.

create table public.clics_venta (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),

  -- Qué botón y dónde estaba
  opcion           text not null check (opcion in ('comprar', 'construir', 'general')),
  ubicacion        text not null check (ubicacion in ('hero', 'precios', 'contacto', 'flotante', 'pie')),

  -- Origen de primer contacto (el mismo que guarda el navegador para el registro premium)
  utm_source       text check (char_length(utm_source) <= 200),
  utm_medium       text check (char_length(utm_medium) <= 200),
  utm_campaign     text check (char_length(utm_campaign) <= 200),
  utm_content      text check (char_length(utm_content) <= 200),
  -- Solo el dominio del sitio de procedencia, nunca la URL completa
  referrer_dominio text check (char_length(referrer_dominio) <= 253
                               and referrer_dominio ~ '^[a-z0-9.-]+$')
);

comment on table public.clics_venta is
  'Clics anónimos en los botones de venta de WhatsApp, con UTM de primer contacto. Sin datos personales.';

create index clics_venta_created_at on public.clics_venta (created_at desc);

-- Resumen para leer en el panel de Supabase: clics por día (hora de El Salvador), botón,
-- ubicación y campaña. security_invoker: la vista respeta los permisos de quien la lee,
-- así no abre la tabla a la clave publishable.
create view public.clics_venta_resumen
with (security_invoker = true) as
select
  (created_at at time zone 'America/El_Salvador')::date as dia,
  opcion,
  ubicacion,
  coalesce(utm_source, '(sin utm)')   as utm_source,
  coalesce(utm_campaign, '(sin utm)') as utm_campaign,
  count(*)                            as clics
from public.clics_venta
group by 1, 2, 3, 4, 5
order by dia desc, clics desc;

comment on view public.clics_venta_resumen is
  'Clics de venta por día (hora de El Salvador), botón, ubicación y campaña.';

-- Seguridad: nadie con la clave publishable puede leer ni escribir
alter table public.clics_venta enable row level security;
revoke all on table public.clics_venta from anon, authenticated;
revoke all on table public.clics_venta_resumen from anon, authenticated;
revoke all on sequence public.clics_venta_id_seq from anon, authenticated;
