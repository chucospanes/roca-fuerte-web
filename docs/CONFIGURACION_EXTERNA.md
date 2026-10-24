# Configuración que vive fuera del repo

> Todo lo que hay que repetir a mano si se recrea el proyecto de Supabase, la cuenta de
> Resend o el despliegue. Ninguna de estas configuraciones está en git.
> Los valores marcados **[confirmar]** los configuró el usuario y no se registraron aquí.

## 1. Supabase — proyecto
- Proyecto `roca-fuerte-web`, región East US, plan gratuito. Separado de los bots.
- Claves nuevas (no las `anon`/`service_role` antiguas, que se retiran a fines de 2026):
  - URL del proyecto → `NEXT_PUBLIC_SUPABASE_URL`
  - Publishable key (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Secret key (`sb_secret_...`) → `SUPABASE_SECRET_KEY` (solo servidor)
  - Van en `.env.local` (local) y en las variables de entorno de Vercel (producción).
    Nombres en `.env.example`.

## 2. Supabase — base de datos
- Ejecutar `supabase/migrations/001_leads.sql` en el **SQL Editor** (así se aplicó el
  2026-10-23).
- Verificar después: RLS activo en `leads` y los dos triggers creados
  (`leads_updated_at`, `leads_origen_fijo`).

## 3. Supabase — Auth (correo con código)
En *Authentication*:

| Ajuste | Valor | Por qué |
|---|---|---|
| Proveedor Email | Activado | Acceso premium por código al correo |
| **Email OTP Length** | **6** | El formulario y la plantilla están pensados para 6. Si queda en 8 (o cualquier otro valor), el texto del correo y del formulario no coinciden. La validación acepta 6 a 8 por si cambia. |
| **Email OTP Expiration** | **600** segundos | La plantilla dice "vence en 10 minutos". Este ajuste afecta también otros enlaces de correo (confirmación, recuperación), que este sitio no usa. |
| Plantilla "Magic link" (o "Magic link or OTP") | Ver `docs/PLANTILLA_CORREO_CODIGO.md` | Debe incluir `{{ .Token }}` |
| Plantilla "Confirm sign up" | Igual que la anterior | No está documentado cuál recibe quien entra por primera vez: se cambian las dos |
| SMTP propio | Resend (ver sección 4) | En proyectos gratuitos creados después de junio de 2026, sin SMTP propio **no se pueden editar las plantillas**. El correo integrado además solo envía al equipo del proyecto y 2 por hora. |
| Rate limits (*Authentication → Rate Limits*) | **[confirmar]** | Con SMTP propio el límite de correos por hora es configurable. Resend gratis permite 100 correos al día. |

Notas:
- En Auth no hace falta configurar Site URL ni Redirect URLs para el código: no hay
  enlaces en el correo. Revisarlo si algún día se agrega un enlace.
- Cloudflare Turnstile (captcha) se configura también aquí (*Authentication → Attack
  Protection*) cuando se implemente; es requisito antes de activar el acceso premium en
  producción.

## 4. Resend — SMTP
- Dominio `constructorarocafuerte.com` agregado y **verificado** en Resend.
- API key con permiso **solo de envío** (*Sending access*), limitada al dominio. Vive solo
  en la configuración SMTP de Supabase: nunca en el repo ni en `.env.local`.
- En Supabase (*Authentication → Emails → SMTP Settings*):

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | La API key de Resend |
| Sender email | **[confirmar]** (por ejemplo `codigo@constructorarocafuerte.com`) |
| Sender name | **[confirmar]** (por ejemplo `Roca Fuerte`) |

Si cambia la marca (`src/config/site.ts`), cambiar también el nombre del remitente y el
texto de la plantilla.

## 5. Namecheap — DNS de `constructorarocafuerte.com`
Registros que pide Resend. Los **valores exactos se copian del panel de Resend** (dependen
de la cuenta y la región). En Namecheap, *Domain List → Manage → Advanced DNS*; el Host
va sin el dominio.

| Sección | Tipo | Host | Valor |
|---|---|---|---|
| Mail Settings → Custom MX | MX | `send` | El de Resend, prioridad 10 |
| Host Records | TXT | `send` | SPF de Resend (`v=spf1 include:amazonses.com ~all` o similar) |
| Host Records | TXT | `resend._domainkey` | Clave DKIM de Resend (`p=...`) |
| Host Records | TXT | `_dmarc` | `v=DMARC1; p=none;` (recomendado) **[confirmar si se agregó]** |

Cambiar *Mail Settings* a *Custom MX* reemplaza el reenvío de correo de Namecheap del
dominio, si lo hubiera.

## 6. Vercel (Fase 6, pendiente)
- Variables de entorno: las cuatro de `.env.example`. `NEXT_PUBLIC_ACCESO_PREMIUM` no
  tiene efecto en producción (activar el acceso premium exige cambiar el código).
- Dominio y DNS desde Namecheap: se documenta al desplegar.

## Comprobación rápida después de recrear
1. `npm run dev` con `NEXT_PUBLIC_ACCESO_PREMIUM=1` en `.env.local`.
2. En `/bonaire/ficha`, pedir el código con un correo propio: debe llegar por Resend, con
   el código en el asunto y 6 dígitos.
3. Al escribirlo, se muestra la ficha y aparece la fila en `leads` (verificar con una
   lectura).
