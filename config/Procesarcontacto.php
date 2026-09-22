<?php
/**
 * Recibe el formulario de Contacto.html (JSON por fetch), valida todos
 * los campos en el servidor, verifica el token de reCAPTCHA v3 y guarda
 * el registro en la tabla `contactos`.
 *
 * Responde SIEMPRE en JSON:
 *   éxito  -> { "ok": true }
 *   error  -> { "ok": false, "errors": { "campo": "mensaje" } }
 *          o { "ok": false, "error": "mensaje general" }
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

// ---------------------------------------------------------------------
// 1) Leer datos (acepta JSON o application/x-www-form-urlencoded)
// ---------------------------------------------------------------------
$raw = file_get_contents('php://input');
$json = json_decode($raw, true);
$data = is_array($json) ? $json : $_POST;

function vs_str($v): string
{
    return is_string($v) ? trim($v) : '';
}

$nombre     = vs_str($data['nombre'] ?? '');
$empresa    = vs_str($data['empresa'] ?? '');
$correo     = vs_str($data['correo'] ?? '');
$telefono   = vs_str($data['telefono'] ?? '');
$mensaje    = vs_str($data['mensaje'] ?? '');
$producto   = vs_str($data['producto'] ?? '');
$categoria  = vs_str($data['categoria'] ?? '');
$referencia = vs_str($data['referencia'] ?? '');
$captchaTok = vs_str($data['captchaToken'] ?? '');

// ---------------------------------------------------------------------
// 2) Validación de todos los campos
// ---------------------------------------------------------------------
$errors = [];

// Nombre: 2-150 caracteres, letras (incluye acentos/ñ), espacios y algunos signos
if ($nombre === '') {
    $errors['nombre'] = 'El nombre es obligatorio.';
} elseif (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 150) {
    $errors['nombre'] = 'El nombre debe tener entre 2 y 150 caracteres.';
} elseif (!preg_match('/^[\p{L}\s.\'-]+$/u', $nombre)) {
    $errors['nombre'] = 'El nombre solo puede contener letras y espacios.';
}

// Empresa: opcional, máx 150
if ($empresa !== '' && mb_strlen($empresa) > 150) {
    $errors['empresa'] = 'El nombre de la empresa es demasiado largo (máx. 150 caracteres).';
}

// Correo: obligatorio, formato válido, máx 150
if ($correo === '') {
    $errors['correo'] = 'El correo es obligatorio.';
} elseif (mb_strlen($correo) > 150 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    $errors['correo'] = 'Escribe un correo electrónico válido.';
}

// Teléfono: opcional; si se envía, formato internacional razonable
// (intl-tel-input ya lo manda como "+52 722 349 4427" o similar)
if ($telefono !== '') {
    $telDigits = preg_replace('/\D/', '', $telefono);
    if (strlen($telDigits) < 8 || strlen($telDigits) > 15) {
        $errors['telefono'] = 'Escribe un número de teléfono válido.';
    }
}

// Mensaje: obligatorio, 5-2000 caracteres
if ($mensaje === '') {
    $errors['mensaje'] = 'Cuéntanos qué necesitas.';
} elseif (mb_strlen($mensaje) < 5 || mb_strlen($mensaje) > 2000) {
    $errors['mensaje'] = 'El mensaje debe tener entre 5 y 2000 caracteres.';
}

// Campos que llegan de la URL del catálogo: solo se acotan por longitud
if (mb_strlen($producto) > 200)   { $producto = mb_substr($producto, 0, 200); }
if (mb_strlen($categoria) > 120)  { $categoria = mb_substr($categoria, 0, 120); }
if (mb_strlen($referencia) > 100) { $referencia = mb_substr($referencia, 0, 100); }

// reCAPTCHA: obligatorio
if ($captchaTok === '') {
    $errors['captcha'] = 'No pudimos verificar que eres una persona. Inténtalo de nuevo.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// ---------------------------------------------------------------------
// 3) Verificar el token de reCAPTCHA v3 contra la API de Google
// ---------------------------------------------------------------------
$recaptchaScore = null;
if (RECAPTCHA_SECRET_KEY !== 'PON_AQUI_TU_SECRET_KEY') {
    $verify = @file_get_contents('https://www.google.com/recaptcha/api/siteverify?' . http_build_query([
        'secret'   => RECAPTCHA_SECRET_KEY,
        'response' => $captchaTok,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]));
    $result = $verify ? json_decode($verify, true) : null;

    if (!$result || empty($result['success']) || ($result['score'] ?? 0) < RECAPTCHA_MIN_SCORE) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'errors' => [
            'captcha' => 'No pudimos verificar que eres una persona. Inténtalo de nuevo.',
        ]]);
        exit;
    }
    $recaptchaScore = $result['score'] ?? null;
}

// ---------------------------------------------------------------------
// 4) Guardar en MySQL
// ---------------------------------------------------------------------
$pdo = vs_get_pdo();

$stmt = $pdo->prepare(
    'INSERT INTO contactos
        (nombre, empresa, correo, telefono, mensaje, producto, categoria, referencia,
         ip_origen, user_agent, recaptcha_score)
     VALUES
        (:nombre, :empresa, :correo, :telefono, :mensaje, :producto, :categoria, :referencia,
         :ip_origen, :user_agent, :recaptcha_score)'
);

try {
    $stmt->execute([
        ':nombre'          => $nombre,
        ':empresa'         => $empresa !== '' ? $empresa : null,
        ':correo'          => $correo,
        ':telefono'        => $telefono !== '' ? $telefono : null,
        ':mensaje'         => $mensaje,
        ':producto'        => $producto !== '' ? $producto : null,
        ':categoria'       => $categoria !== '' ? $categoria : null,
        ':referencia'      => $referencia !== '' ? $referencia : null,
        ':ip_origen'       => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent'      => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
        ':recaptcha_score' => $recaptchaScore,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar tu mensaje. Inténtalo de nuevo más tarde.']);
    exit;
}

echo json_encode(['ok' => true]);