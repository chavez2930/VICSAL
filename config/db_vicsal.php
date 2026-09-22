<?php
/**
 * Configuración de conexión a la base de datos y reCAPTCHA.
 * Ajustado para el hosting Neubox (cPanel) - usuario soluc481.
 */

// --- MySQL (hosting Neubox) ---
define('DB_HOST', getenv('MYSQL_HOST') ?: 'solucionesvicsal.com');
define('DB_PORT', getenv('MYSQL_PORT') ?: '3306');
define('DB_NAME', getenv('MYSQL_DATABASE') ?: 'soluc481_vicsal');
define('DB_USER', getenv('MYSQL_USER') ?: 'soluc481_vicsal');
define('DB_PASS', getenv('MYSQL_PASSWORD') ?: 'vicsal20262728');

// --- reCAPTCHA v3 ---
// La SITE KEY (pública) ya está en Contacto.html.
// Aquí va la SECRET KEY (privada), NUNCA la publiques en el frontend.
define('RECAPTCHA_SECRET_KEY', getenv('RECAPTCHA_SECRET_KEY') ?: '6LdkTsUtAAAAAGj9w30raYNLFaevKTBhCR9gPz5W');
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
        error_log('Error de conexión PDO: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'No se pudo conectar a la base de datos.']);
        exit;
    }
}