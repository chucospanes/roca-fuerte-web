# Aviso de privacidad — BORRADOR

> **PENDIENTE DE REVISIÓN LEGAL.** Publicado en `/privacidad` con la franja "Borrador
> pendiente de revisión legal" hasta que un abogado lo revise. Redactado como punto de
> partida, no como asesoría legal.
>
> Para el abogado:
> - Verificar la ley aplicable en El Salvador. Hay una Ley para la Protección de Datos
>   Personales (Decreto Legislativo N.° 144) y una reforma posterior; no se confirmaron en
>   el Diario Oficial su vigencia ni la versión actual.
> - Confirmar si hacen falta menciones sobre transferencias internacionales (los
>   proveedores están en Estados Unidos) y sobre la base legal del tratamiento.
> - Responsable: por ahora la persona natural titular. Cuando "Roca Fuerte, S.A.S." quede
>   inscrita en el CNR, pasa a ser la sociedad (se cambia en `src/config/site.ts`).
> - Conservación de datos de clientes: precisar el plazo que exige la ley (contratos,
>   facturas, obligaciones tributarias). En el aviso dice "el tiempo que exija la ley".
> - Nueva sección "Si eres cliente: tu portal privado" (contratos, documentos y facturas):
>   revisarla completa, en especial base legal y plazo.
> - Revisar el alcance de la mención sobre la IP (sección "Qué datos pedimos").
> - Borrador para cuando se instale un píxel de publicidad (NO se publica todavía: el
>   píxel no está instalado; hoy el aviso dice "No usamos cookies de publicidad"):
>
>   **Píxeles de publicidad.** Usamos el píxel de Meta (Facebook e Instagram) y el de
>   TikTok para medir qué anuncios traen visitas y personas interesadas, y para mostrar
>   anuncios a quienes ya visitaron el sitio. Estos píxeles guardan cookies de esas
>   empresas en tu navegador y les envían datos de tu visita a este sitio (páginas vistas y
>   clics en los botones de WhatsApp), junto con datos técnicos como tu IP y tu navegador.
>   Meta y TikTok tratan esos datos según sus propias políticas. Puedes rechazarlos
>   [cómo: banner de consentimiento o configuración del navegador, a definir].
>
>   Preguntas: ¿hace falta consentimiento previo (banner) o basta con informar? ¿Cómo se
>   ofrece la opción de rechazarlo?
>
> En el texto publicado, `{marca}`, `{titular}`, `{domicilio}`, `{correo}` y `{whatsapp}` se
> reemplazan por los datos de `src/config/site.ts`. Los datos entre corchetes
> `[PENDIENTE: ...]` faltan y se muestran con un sello.

---

**Última actualización:** [PENDIENTE: fecha de publicación]

## Quién es responsable de tus datos
{titular}, que opera con la marca {marca}, con domicilio en {domicilio}. Contacto para
temas de privacidad: {correo} o por WhatsApp al {whatsapp}.

## Qué datos pedimos
**Si solo nos escribes por WhatsApp** desde los botones "Quiero esta casa" o "Construir a
pedido", este sitio no guarda ningún dato tuyo: la conversación ocurre en WhatsApp.

**Si pides acceso a la ficha técnica y los planos en PDF**, te pedimos:
- Nombre.
- Número de WhatsApp.
- Correo electrónico, que verificamos con un código de 6 dígitos.

**Si además completas el formulario opcional de interés:** país donde vives, si quieres
comprar una casa o construir a pedido, departamento y municipio del terreno, si está
escriturado a tu nombre, forma de pago que piensas usar, cuándo quieres iniciar y un
comentario libre.

**De forma automática** guardamos de qué página o red social llegaste (parámetros UTM y
página de referencia) y la fecha en que aceptaste este aviso. No guardamos tu dirección IP
en nuestra base de leads; los proveedores de alojamiento y de verificación del correo sí
registran datos técnicos de acceso (como la IP) en sus registros de seguridad.
[PENDIENTE: confirmar con el abogado el alcance de esta mención.]

## Si eres cliente: tu portal privado
Si compras una casa o contratas una construcción con nosotros, creamos tu cuenta en el
portal de clientes con tu correo electrónico. En el portal guardamos los datos de tu obra:
- Etapas y avances, con fotos (y video cuando lo hay).
- Materiales usados en tu obra.
- Documentos: contrato, planos, permisos y **facturas**.

Solo pueden verlos las cuentas que asignamos a tu obra: entras con un código que te
enviamos al correo, sin contraseña. Los documentos y las facturas se abren con un enlace
que vence a los 60 segundos. Los usamos para mostrarte el avance de tu obra y para cumplir
el contrato.

## Para qué los usamos
- Darte acceso a la ficha técnica, la lista de materiales y los planos en PDF.
- Contactarte por WhatsApp o correo sobre las casas a la venta o sobre construir a pedido,
  si lo pediste.
- Mostrarte el avance de tu obra en el portal privado, si eres cliente.
- Saber qué redes y campañas traen a las personas interesadas, para decidir dónde publicar.

No usamos tus datos para nada distinto sin pedirte permiso antes.

## Lo que no hacemos
- **No vendemos ni alquilamos tus datos**, ni los compartimos con terceros para que te
  ofrezcan sus productos.
- No te inscribimos en listas de correo masivo.

## Quién más los procesa
Usamos proveedores que guardan o procesan los datos por cuenta nuestra, solo para que el
sitio funcione:
- **Supabase** — base de datos, archivos del portal de clientes y verificación del correo
  (servidores en Estados Unidos).
- **Resend** — envío del correo con el código de verificación.
- **Vercel** — alojamiento del sitio.
- **WhatsApp (Meta)** — si nos escribes por ahí, la conversación se rige también por las
  condiciones de WhatsApp.

## Cookies
Usamos una cookie de sesión para recordar que verificaste tu correo (en la ficha técnica o
en el portal de clientes) y mostrarte el contenido en ese navegador. Además, si llegas
desde un enlace con parámetros de campaña o desde otro sitio, guardamos ese origen en el
almacenamiento local de tu navegador, y solo se envía a nosotros si pides el acceso a la
ficha técnica. No usamos cookies de publicidad.

Contamos de forma anónima los clics en los botones de WhatsApp, junto con la campaña o red
social de la que llegaste: no guardamos tu IP ni ningún dato que te identifique. Si
llegaste desde una campaña, el mensaje que se abre en WhatsApp incluye al final una
referencia corta a esa campaña (por ejemplo "Ref: tiktok · video12"), que puedes borrar
antes de enviarlo.

## Cuánto tiempo los guardamos
Si nos dejaste tus datos y no llegaste a ser cliente, los guardamos 6 meses desde el último
contacto y después los eliminamos. Si eres cliente, los conservamos el tiempo que exija la
ley.

## Tus derechos y cómo pedir que borremos tus datos
Puedes pedirnos en cualquier momento:
- Ver qué datos tenemos tuyos.
- Corregirlos.
- **Eliminarlos.**
- Que dejemos de contactarte.

Escríbenos a {correo} o por WhatsApp al {whatsapp} con el asunto "Privacidad", desde el
correo o el número que registraste para confirmar que eres tú. Confirmamos que recibimos tu
solicitud en un máximo de 24 horas hábiles y la resolvemos en un máximo de 10 días hábiles.

## Cambios a este aviso
Si cambiamos este aviso, publicaremos la nueva versión en esta página con su fecha. Si el
cambio afecta el uso de datos que ya nos diste, te lo avisaremos.
