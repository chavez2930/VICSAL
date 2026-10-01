<?php
/**
 * Configuración de conexión a la base de datos, reCAPTCHA y correo.
 * Hosting Neubox (cPanel).
 *
 * Aquí ya NO hay contraseñas ni llaves: todo se lee del archivo ".env" que está en
 * esta misma carpeta. No subas el .env a Git y bloquéalo en el .htaccess.
 *
 * Formato del .env (una variable por línea):
 *   CLAVE=valor
 *   CLAVE="valor con espacios o con # adentro"
 *   # comentario
 *
 * Variables: APP_ENV, MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD,
 *            RECAPTCHA_SECRET_KEY, RECAPTCHA_MIN_SCORE, SMTP_HOST, SMTP_PORT, SMTP_USER,
 *            SMTP_PASS, CONTACTO_MAIL_FROM, CONTACTO_NOTIFY_TO, SITE_URL
 */

/**
 * Lee una variable: 1) variable de entorno real del servidor, 2) archivo .env, 3) valor por defecto.
 */
if (!function_exists('vs_env')) {
    function vs_env(string $clave, string $porDefecto = ''): string
    {
        static $archivo = null;

        if ($archivo === null) {
            $archivo = [];
            $ruta = __DIR__ . '/.env';

            if (is_readable($ruta)) {
                foreach (file($ruta, FILE_IGNORE_NEW_LINES) ?: [] as $i => $linea) {
                    if ($i === 0) { $linea = preg_replace('/^\xEF\xBB\xBF/', '', $linea) ?? $linea; } // BOM de Windows
                    $linea = trim($linea);
                    if ($linea === '' || $linea[0] === '#') { continue; }
                    if (stripos($linea, 'export ') === 0) { $linea = ltrim(substr($linea, 7)); }

                    $pos = strpos($linea, '=');
                    if ($pos === false) { continue; }

                    $k = trim(substr($linea, 0, $pos));
                    $v = trim(substr($linea, $pos + 1));

                    if (strlen($v) >= 2 && ($v[0] === '"' || $v[0] === "'") && substr($v, -1) === $v[0]) {
                        $v = substr($v, 1, -1);                          // entre comillas: tal cual
                    } else {
                        $v = preg_replace('/\s+#.*$/', '', $v) ?? $v;    // comentario al final de la línea
                    }
                    if ($k !== '') { $archivo[$k] = $v; }
                }
            } else {
                error_log('[env] No se encontró o no se puede leer ' . $ruta);
            }
        }

        $real = getenv($clave);
        if ($real !== false && $real !== '') { return $real; }
        if (isset($archivo[$clave]) && $archivo[$clave] !== '') { return $archivo[$clave]; }
        return $porDefecto;
    }
}

// "production" en el hosting; "local" solo en tu computadora (permite probar sin reCAPTCHA)
define('APP_ENV', vs_env('APP_ENV', 'production'));

// --- MySQL ---
define('DB_HOST', vs_env('MYSQL_HOST', 'localhost'));
define('DB_PORT', vs_env('MYSQL_PORT', '3306'));
define('DB_NAME', vs_env('MYSQL_DATABASE'));
define('DB_USER', vs_env('MYSQL_USER'));
define('DB_PASS', vs_env('MYSQL_PASSWORD'));

// --- reCAPTCHA v3 ---
// La SITE KEY (pública) va en Contacto.html. La SECRET KEY (privada) va SOLO en el .env.
define('RECAPTCHA_SECRET_KEY', vs_env('RECAPTCHA_SECRET_KEY'));
define('RECAPTCHA_MIN_SCORE', (float)vs_env('RECAPTCHA_MIN_SCORE', '0.5'));

// --- Correo de aviso de Contacto (SMTP) ---
define('SMTP_HOST', vs_env('SMTP_HOST', 'mail.solucionesvicsal.com'));
define('SMTP_PORT', (int)vs_env('SMTP_PORT', '465'));
define('SMTP_USER', vs_env('SMTP_USER', 'no-reply@solucionesvicsal.com'));
define('SMTP_PASS', vs_env('SMTP_PASS'));
define('CONTACTO_MAIL_FROM', vs_env('CONTACTO_MAIL_FROM', 'no-reply@solucionesvicsal.com'));
define('CONTACTO_NOTIFY_TO', vs_env('CONTACTO_NOTIFY_TO')); // quién recibe el aviso
define('SITE_URL', vs_env('SITE_URL', 'https://solucionesvicsal.com'));

/**
 * Devuelve una conexión PDO a MySQL o termina la ejecución con un
 * error JSON si no puede conectar.
 */
function vs_get_pdo(): PDO
{
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);

    try {
        return new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        error_log('Error de conexión PDO: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'No se pudo conectar a la base de datos.']);
        exit;
    }
}