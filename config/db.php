<?php
/**
 * Configuración de conexión a la base de datos y reCAPTCHA.
 *
 * Puedes definir estos valores como variables de entorno del servidor
 * (recomendado en producción) o editar directamente los valores por
 * defecto de abajo (getenv devuelve false si no existe la variable).
 */

// --- MySQL (deben coincidir con tu docker/.env) ---
define('DB_HOST', getenv('MYSQL_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('MYSQL_PORT') ?: '3306');
define('DB_NAME', getenv('MYSQL_DATABASE') ?: 'vicsal');
define('DB_USER', getenv('MYSQL_USER') ?: 'vicsal_app');
define('DB_PASS', getenv('MYSQL_PASSWORD') ?: 'vicsal');

// --- reCAPTCHA v3 ---
// La SITE KEY (pública) ya está en Contacto.html.
// Aquí va la SECRET KEY (privada), NUNCA la publiques en el frontend.
define('RECAPTCHA_SECRET_KEY', getenv('RECAPTCHA_SECRET_KEY') ?: 'PON_AQUI_TU_SECRET_KEY');
define('RECAPTCHA_MIN_SCORE', 0.5);

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
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'No se pudo conectar a la base de datos.']);
        exit;
    }
}