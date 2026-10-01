<?php
/**
 * Correo de aviso interno cuando alguien llena el formulario de Contacto.
 * Se manda DESPUÉS de guardar en la base de datos (ver procesarcontacto.php).
 *
 * Los ajustes vienen del .env a través de db_vicsal.php / db.php (constantes):
 *   CONTACTO_NOTIFY_TO  -> quién(es) reciben el aviso; varios correos separados por coma
 *                          (obligatorio; si falta, no se manda correo)
 *   CONTACTO_MAIL_FROM  -> remitente. Debe ser un correo DEL DOMINIO del sitio
 *                          para que Gmail no lo mande a spam.
 *   SITE_URL            -> dirección pública del sitio (para el logo del correo)
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS -> cuenta SMTP (con SMTP_PASS el correo
 *                          se manda autenticado, mucho más confiable que mail()).
 * Abajo solo quedan valores por defecto NO sensibles, por si una constante no está definida.
 */

declare(strict_types=1);

if (!defined('CONTACTO_NOTIFY_TO')) { define('CONTACTO_NOTIFY_TO', ''); }
if (!defined('CONTACTO_MAIL_FROM')) { define('CONTACTO_MAIL_FROM', 'no-reply@solucionesvicsal.com'); }
if (!defined('SITE_URL'))           { define('SITE_URL', 'https://solucionesvicsal.com'); }

if (!defined('SMTP_HOST')) { define('SMTP_HOST', 'mail.solucionesvicsal.com'); }
if (!defined('SMTP_PORT')) { define('SMTP_PORT', 465); }
if (!defined('SMTP_USER')) { define('SMTP_USER', CONTACTO_MAIL_FROM); }
if (!defined('SMTP_PASS')) { define('SMTP_PASS', ''); }

function vs_h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Arma el correo (HTML + texto plano).
 * $d: nombre, empresa, correo, telefono, mensaje, producto, categoria,
 *     referencia, ip, score, id
 * Devuelve [html, texto].
 */
function vs_correo_contacto_armar(array $d): array
{
    $nombre     = (string)($d['nombre'] ?? '');
    $empresa    = (string)($d['empresa'] ?? '');
    $correo     = (string)($d['correo'] ?? '');
    $telefono   = (string)($d['telefono'] ?? '');
    $mensaje    = (string)($d['mensaje'] ?? '');
    $producto   = (string)($d['producto'] ?? '');
    $categoria  = (string)($d['categoria'] ?? '');
    $referencia = (string)($d['referencia'] ?? '');
    $ip         = (string)($d['ip'] ?? '');
    $score      = $d['score'] ?? null;
    $id         = (string)($d['id'] ?? '');

    $logo  = rtrim(SITE_URL, '/') . '/assets/img/logo.png';
    $fecha = (new DateTime('now', new DateTimeZone('America/Mexico_City')))->format('d/m/Y H:i');

    // --- Botones de respuesta rápida ---------------------------------
    $primerNombre = trim(explode(' ', $nombre)[0] ?? $nombre);
    $asunto = 'Re: Tu solicitud en VICSAL';
    $cuerpoMail = "Hola {$primerNombre},\n\nGracias por escribir a VICSAL. "
        . ($producto !== '' ? "Recibimos tu interés en: {$producto}.\n\n" : "Recibimos tu solicitud.\n\n")
        . "Con gusto te apoyamos. ";
    $mailto = 'mailto:' . $correo . '?subject=' . rawurlencode($asunto) . '&body=' . rawurlencode($cuerpoMail);

    $telDigits = preg_replace('/\D/', '', $telefono) ?? '';
    $waTexto = "Hola {$primerNombre}, gracias por contactar a VICSAL. "
        . ($producto !== '' ? "Vimos tu interés en {$producto}. " : "Recibimos tu solicitud. ")
        . "¿Te parece si platicamos los detalles?";
    $wa  = $telDigits !== '' ? 'https://wa.me/' . $telDigits . '?text=' . rawurlencode($waTexto) : '';
    $tel = $telDigits !== '' ? 'tel:+' . $telDigits : '';

    // --- Filas de datos ----------------------------------------------
    $filas = [
        ['Nombre',   $nombre],
        ['Empresa',  $empresa !== '' ? $empresa : '—'],
        ['Correo',   $correo],
        ['Teléfono', $telefono !== '' ? $telefono : '—'],
    ];
    if ($producto !== '')   { $filas[] = ['Producto de interés', $producto]; }
    if ($categoria !== '')  { $filas[] = ['Categoría', $categoria]; }
    if ($referencia !== '') { $filas[] = ['Referencia', $referencia]; }

    $filasHtml = '';
    foreach ($filas as $i => $f) {
        $bg = $i % 2 === 0 ? '#ffffff' : '#f7f9fb';
        $filasHtml .= '<tr>'
            . '<td class="stack lbl" style="padding:12px 16px;background:' . $bg . ';font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b;width:38%;border-bottom:1px solid #e8ecf1;">' . vs_h($f[0]) . '</td>'
            . '<td class="stack val" style="padding:12px 16px;background:' . $bg . ';font-size:15px;color:#1a1c1e;border-bottom:1px solid #e8ecf1;word-break:break-word;">' . vs_h($f[1]) . '</td>'
            . '</tr>';
    }

    // --- Botones -----------------------------------------------------
    $btn = function (string $href, string $label, string $bg, string $color, string $border) {
        return '<a class="btn" href="' . vs_h($href) . '" target="_blank" '
            . 'style="display:inline-block;margin:0 8px 10px 0;padding:13px 22px;border-radius:8px;background:' . $bg . ';border:2px solid ' . $border . ';'
            . 'color:' . $color . ';font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">'
            . vs_h($label) . '</a>';
    };
    $botones = '';
    if ($wa !== '') { $botones .= $btn($wa, 'Responder por WhatsApp', '#059669', '#ffffff', '#059669'); }
    $botones .= $btn($mailto, 'Responder por correo', '#0b1b3d', '#ffffff', '#0b1b3d');
    if ($tel !== '') { $botones .= $btn($tel, 'Llamar', '#ffffff', '#0b1b3d', '#0b1b3d'); }

    $idTxt   = ($id !== '' && $id !== '0') ? ' #' . vs_h($id) : '';
    $scoreTx = $score !== null ? ' · reCAPTCHA ' . vs_h((string)$score) : '';

    $html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>Nuevo mensaje de contacto</title>'
        . '<style>'
        . 'img{-ms-interpolation-mode:bicubic;}'
        . '@media only screen and (max-width:480px){'
        . '.wrap{padding:0 !important;}'
        . '.card{border-radius:0 !important;}'
        . '.px{padding-left:18px !important;padding-right:18px !important;}'
        . '.h1{font-size:20px !important;}'
        . '.logo{height:44px !important;}'
        . '.stack{display:block !important;width:100% !important;box-sizing:border-box !important;}'
        . '.lbl{padding:12px 16px 0 16px !important;border-bottom:0 !important;}'
        . '.val{padding:2px 16px 12px 16px !important;}'
        . '.btn{display:block !important;width:100% !important;box-sizing:border-box !important;margin:0 0 10px 0 !important;text-align:center !important;}'
        . '}'
        . '</style></head>'
        . '<body style="margin:0;padding:0;background:#eef1f5;font-family:Arial,Helvetica,sans-serif;">'
        . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Nuevo contacto de ' . vs_h($nombre) . ($empresa !== '' ? ' (' . vs_h($empresa) . ')' : '') . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;"><tr><td class="wrap" align="center" style="padding:24px 12px;">'
        . '<table class="card" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(11,27,61,.10);">'

        // Encabezado con logo
        . '<tr><td class="px" style="background:#ffffff;padding:22px 28px 18px 28px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
        . '<td align="left" style="vertical-align:middle;"><img class="logo" src="' . vs_h($logo) . '" alt="VICSAL" height="56" style="display:block;height:56px;width:auto;border:0;"></td>'
        . '<td align="right" style="vertical-align:middle;font-size:12px;color:#64748b;">' . vs_h($fecha) . '</td>'
        . '</tr></table></td></tr>'

        // Franja de color de la marca
        . '<tr><td style="height:5px;line-height:5px;font-size:0;background:#ec4899;background-image:linear-gradient(90deg,#ec4899,#fb923c 50%,#10b981);">&nbsp;</td></tr>'

        // Título
        . '<tr><td class="px" style="background:#0b1b3d;padding:26px 28px;">'
        . '<div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fb923c;">Nuevo contacto' . $idTxt . '</div>'
        . '<div class="h1" style="font-size:24px;font-weight:700;color:#ffffff;margin-top:6px;line-height:1.25;">' . vs_h($nombre) . ' quiere cotizar</div>'
        . ($empresa !== '' ? '<div style="font-size:15px;color:#cbd5e1;margin-top:4px;">' . vs_h($empresa) . '</div>' : '')
        . '</td></tr>'

        // Datos
        . '<tr><td class="px" style="padding:26px 28px 6px 28px;">'
        . '<div style="font-size:16px;font-weight:700;color:#0b1b3d;margin-bottom:12px;">Datos del cliente</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ecf1;border-radius:10px;overflow:hidden;">' . $filasHtml . '</table>'
        . '</td></tr>'

        // Mensaje
        . '<tr><td class="px" style="padding:20px 28px 6px 28px;">'
        . '<div style="font-size:16px;font-weight:700;color:#0b1b3d;margin-bottom:12px;">¿Qué necesita?</div>'
        . '<div style="background:#f7f9fb;border-left:4px solid #ec4899;border-radius:6px;padding:16px 18px;font-size:15px;line-height:1.6;color:#1a1c1e;">' . nl2br(vs_h($mensaje)) . '</div>'
        . '</td></tr>'

        // Botones
        . '<tr><td class="px" style="padding:24px 28px 10px 28px;">'
        . '<div style="font-size:16px;font-weight:700;color:#0b1b3d;margin-bottom:12px;">Responder al cliente</div>'
        . '<div>' . $botones . '</div>'
        . ($wa === '' ? '<div style="font-size:12px;color:#64748b;margin-top:4px;">El cliente no dejó teléfono, por eso no hay botón de WhatsApp.</div>' : '')
        . '</td></tr>'

        // Pie
        . '<tr><td class="px" style="padding:22px 28px 26px 28px;">'
        . '<div style="border-top:1px solid #e8ecf1;padding-top:16px;font-size:12px;line-height:1.6;color:#94a3b8;">'
        . 'Aviso automático del formulario de contacto de solucionesvicsal.com. Ya quedó guardado en la base de datos.<br>'
        . 'IP ' . vs_h($ip !== '' ? $ip : '—') . $scoreTx . '<br>'
        . '<span style="color:#64748b;font-weight:700;">VICSAL</span> · Proveedor Integral Empresarial'
        . '</div></td></tr>'

        . '</table></td></tr></table></body></html>';

    // --- Versión en texto plano (respaldo) ---------------------------
    $texto = "NUEVO CONTACTO{$idTxt} - {$fecha}\n\n";
    foreach ($filas as $f) { $texto .= $f[0] . ': ' . $f[1] . "\n"; }
    $texto .= "\nMensaje:\n{$mensaje}\n\nResponder:\n- Correo: {$mailto}\n";
    if ($wa !== '') { $texto .= "- WhatsApp: {$wa}\n"; }
    if ($tel !== '') { $texto .= "- Llamar: {$tel}\n"; }

    return [$html, $texto];
}

/**
 * Cliente SMTP mínimo (SSL 465 o STARTTLS 587). Devuelve true/false y deja el
 * motivo del fallo en $GLOBALS['vs_mail_error'].
 */
function vs_smtp_enviar(array $para, string $cabeceras, string $cuerpo, string $from): bool
{
    $fallo = function (string $m): bool { $GLOBALS['vs_mail_error'] = $m; error_log('[contacto][smtp] ' . $m); return false; };
    $puerto = (int)SMTP_PORT;
    $destino = ($puerto === 465 ? 'ssl://' : 'tcp://') . SMTP_HOST . ':' . $puerto;
    $fp = @stream_socket_client($destino, $errno, $errstr, 15);
    if (!$fp) { return $fallo("No conecta a $destino: $errstr ($errno)"); }
    stream_set_timeout($fp, 15);

    $leer = function () use ($fp): array {
        $resp = ''; 
        while (($linea = fgets($fp, 515)) !== false) {
            $resp .= $linea;
            if (strlen($linea) < 4 || $linea[3] === ' ') { break; }
        }
        return [(int)substr($resp, 0, 3), trim($resp)];
    };
    $cmd = function (string $c, array $ok) use ($fp, $leer, $fallo) {
        fwrite($fp, $c . "\r\n");
        [$code, $resp] = $leer();
        return in_array($code, $ok, true) ? true : $fallo("Respuesta inesperada a '" . (stripos($c, 'AUTH') === 0 || strlen($c) > 40 ? substr($c, 0, 10) . '…' : $c) . "': $resp");
    };

    [$code, $resp] = $leer();
    if ($code !== 220) { fclose($fp); return $fallo("Saludo inválido: $resp"); }
    $host = parse_url(SITE_URL, PHP_URL_HOST) ?: 'localhost';
    if (!$cmd('EHLO ' . $host, [250])) { fclose($fp); return false; }
    if ($puerto === 587) {
        if (!$cmd('STARTTLS', [220]) || !@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) { fclose($fp); return $fallo('No se pudo iniciar TLS'); }
        if (!$cmd('EHLO ' . $host, [250])) { fclose($fp); return false; }
    }
    if (SMTP_PASS !== '') {
        if (!$cmd('AUTH LOGIN', [334]) || !$cmd(base64_encode(SMTP_USER), [334]) || !$cmd(base64_encode(SMTP_PASS), [235])) { fclose($fp); return false; }
    }
    if (!$cmd('MAIL FROM:<' . $from . '>', [250])) { fclose($fp); return false; }
    foreach ($para as $dest) {
        if (!$cmd('RCPT TO:<' . $dest . '>', [250, 251])) { fclose($fp); return false; }
    }
    if (!$cmd('DATA', [354])) { fclose($fp); return false; }

    $datos = preg_replace('/^\./m', '..', $cabeceras . "\r\n\r\n" . $cuerpo);
    fwrite($fp, $datos . "\r\n.\r\n");
    [$code, $resp] = $leer();
    @fwrite($fp, "QUIT\r\n");
    fclose($fp);
    return $code === 250 ? true : $fallo("El servidor rechazó el mensaje: $resp");
}

/**
 * Envía el aviso. Nunca lanza errores hacia afuera: si el correo falla, el
 * mensaje ya está guardado en la base de datos y el cliente ve "enviado".
 */
function vs_enviar_correo_contacto(array $d): bool
{
    try {
        if (CONTACTO_NOTIFY_TO === '') {
            $GLOBALS['vs_mail_error'] = 'CONTACTO_NOTIFY_TO no está configurado en el .env';
            error_log('[contacto] CONTACTO_NOTIFY_TO no está configurado en el .env; no se envió el aviso.');
            return false;
        }

        // CONTACTO_NOTIFY_TO puede traer uno o varios correos separados por coma o punto y coma.
        $destinatarios = array_values(array_filter(
            array_map('trim', preg_split('/[,;]+/', CONTACTO_NOTIFY_TO) ?: []),
            fn($e) => filter_var($e, FILTER_VALIDATE_EMAIL)
        ));
        if (!$destinatarios) {
            $GLOBALS['vs_mail_error'] = 'CONTACTO_NOTIFY_TO no tiene correos válidos';
            error_log('[contacto] CONTACTO_NOTIFY_TO no tiene correos válidos.');
            return false;
        }

        [$html, $texto] = vs_correo_contacto_armar($d);

        $nombreLimpio = trim(preg_replace('/[\r\n]+/', ' ', (string)($d['nombre'] ?? '')) ?? '');
        $asunto = 'Nuevo contacto: ' . $nombreLimpio
            . (!empty($d['producto']) ? ' · ' . preg_replace('/[\r\n]+/', ' ', (string)$d['producto']) : '');
        $asuntoCodificado = mb_encode_mimeheader($asunto, 'UTF-8', 'B', "\r\n");

        $limite = 'vs_' . bin2hex(random_bytes(8));
        $from   = CONTACTO_MAIL_FROM;
        $correoCliente = (string)($d['correo'] ?? '');

        $cabeceras = [
            'MIME-Version: 1.0',
            'From: ' . mb_encode_mimeheader('VICSAL Contacto', 'UTF-8', 'B') . ' <' . $from . '>',
            'Reply-To: ' . $correoCliente,
            'Content-Type: multipart/alternative; boundary="' . $limite . '"',
            'X-Mailer: VICSAL-Contacto',
        ];

        $cuerpo = "--{$limite}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($texto))
            . "--{$limite}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($html))
            . "--{$limite}--";

        if (SMTP_PASS !== '') {
            $from = SMTP_USER; // con SMTP el remitente debe ser la cuenta autenticada
            $cabeceras[1] = 'From: ' . mb_encode_mimeheader('VICSAL Contacto', 'UTF-8', 'B') . ' <' . $from . '>';
            $cabeceras[] = 'To: ' . implode(', ', $destinatarios);
            $cabeceras[] = 'Subject: ' . $asuntoCodificado;
            $cabeceras[] = 'Date: ' . date('r');
            $cabeceras[] = 'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . (parse_url(SITE_URL, PHP_URL_HOST) ?: 'localhost') . '>';
            return vs_smtp_enviar($destinatarios, implode("\r\n", $cabeceras), $cuerpo, $from);
        }

        $ok = mail(implode(', ', $destinatarios), $asuntoCodificado, $cuerpo, implode("\r\n", $cabeceras), '-f' . $from);
        if (!$ok) { $GLOBALS['vs_mail_error'] = 'mail() devolvió false (probablemente deshabilitado en el hosting)'; error_log('[contacto] mail() devolvió false.'); }
        return $ok;
    } catch (Throwable $e) {
        $GLOBALS['vs_mail_error'] = $e->getMessage();
        error_log('[contacto] Error armando/enviando correo: ' . $e->getMessage());
        return false;
    }
}