# Roca Fuerte — Portal Casa Modelo Esparta

Portal de ventas de la Casa Modelo Esparta: venta de la casa en construcción y del servicio
de construir el modelo en el terreno del cliente.

## Documentación
- `CLAUDE.md` — reglas y protocolo para Claude Code (se carga automáticamente).
- `docs/CONTEXTO.md` — negocio, público y datos del modelo.
- `docs/ESTADO.md` — dónde está el proyecto ahora mismo.
- `docs/DECISIONES.md` — registro de decisiones con su motivo.
- `docs/PLAN_V1.md` — especificación de la versión 1.
- `docs/CONFIGURACION_EXTERNA.md` — todo lo que vive fuera del repo (Supabase, Resend, DNS
  del correo), con los valores exactos.
- `docs/AVISO_PRIVACIDAD.md` — borrador del aviso; es la fuente de la página `/privacidad`.

---

## 1. Desarrollo local

Requisitos: Node.js 20 o superior (probado con 24) y npm.

```bash
npm install
cp .env.example .env.local   # y llenar los valores (ver abajo)
npm run dev                  # http://localhost:3000
```

`.env.local` nunca se commitea. Variables (nombres y comentarios en `.env.example`):

| Variable | Valor en local |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` — solo servidor, salta RLS |
| `NEXT_PUBLIC_ACCESO_PREMIUM` | Opcional, `1` para probar `/esparta/ficha` en desarrollo. No tiene efecto en un build de producción. |

Comandos:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. Para verlo en el celular, usar la URL "Network" que imprime (misma red Wi-Fi). |
| `npm run build` | Build de producción. Correrlo antes de cerrar cada fase. |
| `npm run start` | Sirve el build. Para no chocar con `dev`: `npx next start -p 3100`. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` (no usar `tsc` suelto). |

**Ojo:** con los datos de `.env.local` el sitio local usa la base de **producción**. Todo
lo que se registre en local (códigos, leads) queda en Supabase.

---

## 2. Supabase (una sola vez por proyecto)

El detalle está en `docs/CONFIGURACION_EXTERNA.md`. En resumen y en orden:

1. Crear el proyecto (región East US) y copiar URL, publishable key y secret key.
2. En el **SQL Editor**, ejecutar en orden:
   1. `supabase/migrations/001_leads.sql`
   2. `supabase/migrations/002_clics_venta.sql`
   3. `supabase/migrations/003_clics_inversionistas.sql`
   4. `supabase/migrations/004_portal_obras.sql`
   5. `supabase/migrations/005_casas_venta.sql`
3. Verificar cada migración: RLS activo, triggers y vista con `security_invoker`, y que el
   rol `anon` no puede escribir con la prueba con `rollback` (sección "Verificación segura
   de permisos" de `CONFIGURACION_EXTERNA.md`). Esa prueba no deja datos.
4. **Auth:** proveedor Email, OTP de 6 dígitos y 600 s, SMTP de Resend y plantillas con
   `{{ .Token }}` (`docs/PLANTILLA_CORREO_CODIGO.md`).
5. **Auth → URL Configuration** (para producción):

   | Campo | Valor |
   |---|---|
   | Site URL | `https://constructorarocafuerte.com` |
   | Redirect URLs | `https://constructorarocafuerte.com/**` y `http://localhost:3000/**` |

   El acceso es por código (sin enlaces en el correo), así que hoy no se usan las
   redirecciones; se dejan bien por si Supabase arma algún enlace con la Site URL. No
   agregar `*.vercel.app`: las previews no deben iniciar sesión.

---

## 3. Vercel (plan Pro antes del lanzamiento)

El plan Hobby no permite uso comercial (anunciar la venta de un producto o servicio). Mientras
`site.lanzado` sea `false` el proyecto sigue en Hobby; se pasa a **Pro** antes de lanzar
(ver `DECISIONES.md`).

1. Crear el equipo en plan Pro, con un solo miembro (se cobra por miembro).
2. **Add New → Project** e importar `chucospanes/roca-fuerte-web`. Framework: Next.js
   (detectado solo). Build: `npm run build`. Sin cambios en los demás campos.
3. **Settings → Git:** rama de producción `main`. Cada push a `main` publica en producción;
   el trabajo va en ramas `feat/…`, que generan previews (Vercel les pone `noindex` solo).
4. **Settings → Functions:** región `iad1` (Washington, D.C.), junto a Supabase East US.
5. **Settings → Environment Variables**, las cuatro **solo en Production**:

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://constructorarocafuerte.com` (sin `/` final) |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
   | `SUPABASE_SECRET_KEY` | `sb_secret_…`, marcada como **Sensitive** |

   - **No** agregar `NEXT_PUBLIC_ACCESO_PREMIUM`: en producción no tiene efecto (el acceso
     premium solo se enciende cambiando el código).
   - No van en Preview: la única base es la de producción y una preview no debe escribir
     leads ni clics reales. En una preview, la landing funciona igual.
   - Las `NEXT_PUBLIC_*` quedan fijas en el build: si se cambia una, hay que volver a
     desplegar (**Deployments → … → Redeploy**).
6. **Settings → Deployment Protection:** dejar *Vercel Authentication* en las previews.
7. **Settings → Billing → Spend Management:** poner un tope de gasto y alertas.
8. **Settings → Domains:** ver la sección 4.

---

## 4. Dominio y DNS (Namecheap)

Los nameservers se quedan en Namecheap (*BasicDNS*): no se pasan a Vercel, así no se tocan
los registros del correo (Resend).

1. En Vercel, **Settings → Domains**, agregar `constructorarocafuerte.com` y
   `www.constructorarocafuerte.com`. Dejar `constructorarocafuerte.com` como principal y
   `www` con **redirección 308** hacia él (coincide con `NEXT_PUBLIC_SITE_URL` y el
   canonical).
2. En Namecheap, *Domain List → Manage → Advanced DNS → Host Records*:

   **Agregar** (los valores exactos se copian de la tarjeta de cada dominio en Vercel; cada
   proyecto puede tener su propia IP y su propio CNAME):

   | Tipo | Host | Valor | TTL |
   |---|---|---|---|
   | A Record | `@` | IP de la tarjeta de Vercel (p. ej. `76.76.21.21` o `216.198.79.1`) | Automatic |
   | CNAME Record | `www` | Destino de la tarjeta de Vercel (p. ej. `xxxxxxxx.vercel-dns-017.com.`) | Automatic |

   **Borrar** (registros por defecto de Namecheap; verificar cuáles hay):
   - `CNAME Record` · `www` · `parkingpage.namecheap.com.`
   - `URL Redirect Record` · `@` · `http://www.constructorarocafuerte.com/`
   - Cualquier `AAAA Record` en `@` (Vercel no admite IPv6 con DNS externo).

   **No tocar** (correo con Resend, ver `CONFIGURACION_EXTERNA.md` §5):
   - *Mail Settings → Custom MX*: `MX` · `send`.
   - `TXT` · `send` (SPF), `TXT` · `resend._domainkey` (DKIM), `TXT` · `_dmarc`.

   Si hay un registro `CAA`, debe permitir `letsencrypt.org` (Vercel emite el certificado
   con Let's Encrypt).
3. Esperar a que Vercel marque los dos dominios como *Valid Configuration* y emita el
   certificado. La propagación puede tardar desde minutos hasta unas horas.
4. Comprobar:

   ```bash
   nslookup constructorarocafuerte.com
   nslookup www.constructorarocafuerte.com
   curl -sI https://constructorarocafuerte.com/          # 200 y x-robots-tag: noindex, nofollow
   curl -sI https://www.constructorarocafuerte.com/      # 308 hacia el dominio sin www
   curl -s  https://constructorarocafuerte.com/robots.txt
   curl -sI https://constructorarocafuerte.com/descargas/plano-esparta.pdf   # 404 (acceso premium apagado)
   ```

---

## 5. Interruptor de lanzamiento (`site.lanzado`)

El sitio puede estar publicado en el dominio sin aparecer en buscadores. El interruptor es
una constante en `src/config/site.ts` (no una variable de Vercel): encenderlo exige un
commit.

| | Apagado (`false`) | Encendido (`true`) |
|---|---|---|
| Metadata de las páginas | `noindex, nofollow` | indexable (salvo la ficha premium) |
| Encabezado `X-Robots-Tag` | `noindex, nofollow` en todas las rutas | sin encabezado |
| `robots.txt` | permite el acceso, sin sitemap | permite el acceso, con sitemap |
| `sitemap.xml` | vacío | landing y `/privacidad` |

No se usa `Disallow: /` antes del lanzamiento: Google tiene que poder entrar para leer el
`noindex`, y la vista previa de WhatsApp/Facebook tiene que funcionar desde ya.

---

## 6. Lista de verificación antes del lanzamiento

Encender `site.lanzado` solo con todo esto cumplido.

**Contenido y negocio**
- [ ] Número real de WhatsApp Business en `site.whatsapp`.
- [ ] Precios "desde" en `site.precios`.
- [ ] Aviso de privacidad revisado por un abogado, con razón social, domicilio, correo de
      privacidad y plazo de conservación (`docs/AVISO_PRIVACIDAD.md`). Al aprobarlo, quitar
      el aviso de "borrador" de `src/app/privacidad/page.tsx`.
- [ ] Decidir qué PENDIENTE se aceptan visibles el día del lanzamiento (redes, preguntas
      frecuentes, video del hero, materiales, profesional que firma).
- [ ] Publicar los primeros videos de materiales y refuerzo (el hero promete "cada
      material, cada etapa y cada refuerzo, documentados en video").

**Datos de prueba en Supabase** (los borra el dueño del proyecto)
- [ ] Primero las filas de prueba de `leads` (antes, un `select` para confirmar cuáles son).
- [ ] Después los usuarios de prueba de *Authentication → Users*. El orden importa:
      `leads.user_id` tiene `on delete set null`; al revés, las filas quedarían sin usuario.
- [ ] Verificar con lecturas que no queda ningún dato de prueba.

**Prueba real del conteo de clics** (en producción, con el interruptor apagado)
- [ ] Con el número real desplegado, entrar a
      `https://constructorarocafuerte.com/?utm_source=prueba&utm_campaign=lanzamiento`.
- [ ] Tocar un botón de WhatsApp: el mensaje debe terminar en "(Ref: prueba · lanzamiento)".
- [ ] Verificar la fila en `clics_venta` con una lectura y luego borrarla.

**Técnico**
- [ ] Proyecto de Vercel en plan Pro (mientras no esté lanzado, sigue en Hobby).
- [ ] DMARC y límites de envío (Resend y Supabase Auth) anotados en
      `CONFIGURACION_EXTERNA.md`.
- [ ] Dominio con certificado, `www` redirige al dominio sin www (comprobaciones de la
      sección 4).
- [ ] Vista previa del enlace en WhatsApp y en el
      [Sharing Debugger de Facebook](https://developers.facebook.com/tools/debug/).
- [ ] Lighthouse sobre la URL real.

**Lanzamiento**
- [ ] Commit con `site.lanzado = true` en una rama, merge a `main` y despliegue.
- [ ] Comprobar que ya no hay `noindex` (`curl -sI` y el HTML) y que `robots.txt` trae el
      sitemap.
- [ ] Verificar el dominio en Google Search Console (registro TXT en Namecheap) y enviar
      `https://constructorarocafuerte.com/sitemap.xml`.
- [ ] Activar datos de campo de rendimiento (Vercel Speed Insights o Search Console) para
      revisar el LCP con visitas reales.

---

## Estructura
- `docs/` — contexto, estado vivo, decisiones, plan y configuración externa.
- `assets/` — material fuente (planos y fachada en PNG/PDF, fuentes de la imagen Open
  Graph). No se sirve en la web; los PDF los entrega `/descargas/[archivo]` con sesión.
- `src/app/` — App Router: landing, `/privacidad`, `/esparta/ficha`, `/descargas`,
  `/api/clic`, SEO (`robots.ts`, `sitemap.ts`, `opengraph-image.tsx`).
- `src/config/site.ts` — marca, WhatsApp, precios, redes e interruptores (`lanzado`,
  `accesoPremium`).
- `src/content/` — contenido del modelo, bitácora y textos.
- `src/components/` — secciones de la landing y área premium.
- `src/lib/` — Supabase, validación, leads, WhatsApp y captura de origen.
- `supabase/migrations/` — SQL de la base de datos.
- `public/` — archivos servidos tal cual.
