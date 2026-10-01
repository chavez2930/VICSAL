# VICSAL — Configuración del servidor (`.env` y `.htaccess`)

Este documento explica solo dos archivos de configuración del sitio: el `.env` y el `.htaccess`.

| Archivo | ¿Se sube a git? | Motivo |
|---|---|---|
| `.env` | **No, nunca** | Tiene contraseñas y claves secretas |
| `.env.example` | Sí | Plantilla con los nombres de las variables, sin valores |
| `.htaccess` | Sí | Es configuración y no contiene secretos |

---

## 1. Archivo `.env`

Va en la **misma carpeta que los archivos `.php`** (la del formulario de contacto). Guarda los datos privados del servidor, y los `.php` los leen desde ahí en lugar de tenerlos escritos en el código.

### Variables

| Variable | Para qué sirve | ¿Secreta? |
|---|---|---|
| `APP_ENV` | Modo de la aplicación. En el servidor real: `production` | No |
| `MYSQL_HOST` | Servidor de la base de datos | Sí |
| `MYSQL_PORT` | Puerto de MySQL (normalmente `3306`) | No |
| `MYSQL_DATABASE` | Nombre de la base de datos | Sí |
| `MYSQL_USER` | Usuario de MySQL | Sí |
| `MYSQL_PASSWORD` | Contraseña de MySQL | **Sí, crítica** |
| `RECAPTCHA_SECRET_KEY` | Llave **secreta** de reCAPTCHA v3; el servidor la usa para validar el token del formulario | **Sí, crítica** |
| `RECAPTCHA_MIN_SCORE` | Puntaje mínimo (0.0 a 1.0) para aceptar un mensaje. Con `0.5` se rechaza lo que parezca un bot | No |
| `SMTP_HOST` | Servidor de correo saliente | Sí |
| `SMTP_PORT` | Puerto SMTP (por ejemplo `465` con SSL) | No |
| `SMTP_USER` | Usuario de la cuenta de correo que envía los avisos | Sí |
| `SMTP_PASS` | Contraseña de esa cuenta de correo | **Sí, crítica** |
| `CONTACTO_MAIL_FROM` | Dirección desde la que se envía el aviso de un nuevo mensaje | No |
| `CONTACTO_NOTIFY_TO` | Dirección que recibe el aviso de cada mensaje de contacto | No |
| `SITE_URL` | Dirección del sitio (por ejemplo `https://solucionesvicsal.com`) | No |

### Plantilla `.env.example` (esta sí va en git)

```
APP_ENV=production

# --- MySQL ---
MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

# --- reCAPTCHA v3 (llave secreta) ---
RECAPTCHA_SECRET_KEY=
RECAPTCHA_MIN_SCORE=0.5

# --- Correo de aviso (SMTP) ---
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
CONTACTO_MAIL_FROM=
CONTACTO_NOTIFY_TO=
SITE_URL=
```

### Cómo crearlo en un servidor nuevo

1. Copia la plantilla: `cp .env.example .env`
2. Llena cada variable con los valores reales.
3. Súbelo por FTP/SFTP o desde el panel del hosting, **nunca por git**.
4. Comprueba que no se pueda descargar: abre `https://solucionesvicsal.com/.env`. Debe dar **403 o 404**. Si muestra el contenido, revisa el `.htaccess` (sección 2) y cambia todas las contraseñas y claves.

### Agregar `.env` al `.gitignore`

```
.env
```

### Si el `.env` ya se subió a git por error

Borrarlo en un commit nuevo no basta, porque sigue en el historial.

1. Cambia de inmediato la contraseña de MySQL, la de SMTP y la llave secreta de reCAPTCHA.
2. Quítalo del seguimiento: `git rm --cached .env`
3. Agrégalo al `.gitignore` y haz commit.
4. Si el repositorio es público, limpia el historial con `git filter-repo` o BFG.

---

## 2. Archivo `.htaccess`

Va en la **misma carpeta que el `.env`**. Solo tiene una regla, que **impide descargar el `.env` desde el navegador**:

```apache
# Bloquea la descarga del .env desde el navegador
<FilesMatch "^\.env">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>
```

### Qué hace

- Bloquea cualquier archivo cuyo nombre empiece con `.env` (`.env`, `.env.backup`, `.env.local`, etc.).
- Tiene dos versiones de la misma regla para que funcione tanto en Apache 2.4 (`Require all denied`) como en versiones antiguas (`Order` / `Deny`).

### Cómo verificar que funciona

Abre `https://solucionesvicsal.com/.env` en el navegador. Debe aparecer un error **403 (Forbidden)** o 404. Si se ve el contenido del archivo, el `.htaccess` no se está aplicando: revisa que esté en la misma carpeta que el `.env` y que el hosting permita `.htaccess` (`AllowOverride`).

### Importante

- Como esta regla protege el `.env`, **el `.htaccess` y el `.env` siempre tienen que subirse juntos** al servidor.
- El `.htaccess` **sí se sube a git**; no lleva contraseñas. Si algún día le agregas datos privados, muévelos al `.env`.