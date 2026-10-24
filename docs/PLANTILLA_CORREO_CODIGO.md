# Plantilla del correo con el código de acceso (Supabase Auth)

Se pega en Supabase → Authentication → Emails, en **dos** plantillas: "Magic link" (o
"Magic link or OTP") y "Confirm sign up". La documentación no aclara cuál recibe quien se
registra por primera vez; con ambas, el código llega siempre.

Requiere SMTP propio (Resend) en proyectos gratuitos creados después de junio de 2026.

- Sin enlaces a propósito: algunos correos abren los enlaces para revisarlos y gastan el
  acceso antes que la persona.
- "10 minutos" asume **Email OTP Expiration = 600** segundos, y el código es de 6 dígitos
  con **Email OTP Length = 6** (por defecto puede venir en 8).
- Resto de la configuración externa: `docs/CONFIGURACION_EXTERNA.md`.
- La marca está escrita a mano (la plantilla vive fuera del repo): si cambia la marca en
  `src/config/site.ts`, cambiarla también aquí y en Supabase.

**Asunto**

```
Tu código de acceso: {{ .Token }}
```

**Cuerpo**

```html
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2724;">
  <p style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #b0502c; margin: 0 0 8px;">
    Roca Fuerte · Casa Modelo Bonaire
  </p>
  <h1 style="font-size: 22px; margin: 0 0 16px;">Tu código de acceso</h1>
  <p style="font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
    Escribe este código en la página donde pediste la ficha técnica:
  </p>
  <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: #f5f3ef; border-radius: 8px; padding: 16px; text-align: center; margin: 0 0 16px;">
    {{ .Token }}
  </p>
  <p style="font-size: 14px; line-height: 1.5; color: #6b635c; margin: 0 0 8px;">
    El código vence en 10 minutos. No lo compartas con nadie.
  </p>
  <p style="font-size: 14px; line-height: 1.5; color: #6b635c; margin: 0;">
    Si no pediste este código, ignora este correo: sin el código nadie puede entrar con tu correo.
  </p>
</div>
```
