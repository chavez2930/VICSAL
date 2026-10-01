/* ======================================================================
   LÓGICA DEL FORMULARIO DE CONTACTO (assets/js/contacto.js)
   Antes estaba dentro de contacto.html. Se carga al final de esa página, después de loadpartials.js,
   intl-tel-input y SweetAlert2 (librerías de las que depende: window.intlTelInput y Swal).

   Qué hace: campos que crecen solos, teléfono internacional, validación en el navegador (igual que la del
   servidor), reCAPTCHA v3 invisible y envío por fetch a config/procesarcontacto.php.
   ====================================================================== */

(function () {
    // El formulario de la página (es el único form)
    var form = document.querySelector('form');

    /* Campos que crecen solos (sin tirador de tamaño) */
    var grow = Array.prototype.slice.call(document.querySelectorAll('[data-autogrow]'));
    // Ajusta la altura del campo a su contenido: así crece mientras se escribe
    function fit(el) {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight + el.offsetHeight - el.clientHeight) + 'px';
    }
    grow.forEach(function (el) {
        el.addEventListener('input', function () {
            if (el.hasAttribute('data-single')) el.value = el.value.replace(/[\r\n]+/g, ' ');
            fit(el);
        });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && el.hasAttribute('data-single')) e.preventDefault();
        });
        el.addEventListener('focus', function () { fit(el); });
        el.addEventListener('blur', function () { fit(el); });
    });
    // Reajusta todos los campos que crecen solos (al cargar, al cambiar el tamaño y tras enviar)
    function fitAll() { grow.forEach(fit); }
    window.addEventListener('resize', fitAll);
    window.addEventListener('load', fitAll);
    fitAll();

    /* Teléfono: todos los países (intl-tel-input) con búsqueda y validación por país */
    var tel = document.getElementById('telefono');
    var iti = window.intlTelInput(tel, {
        initialCountry: 'mx',
        countryOrder: ['mx', 'us', 'ca'],
        separateDialCode: true,
        countryNameLocale: 'es',
        uiTranslations: {
            selectedCountryAriaLabel: 'Cambiar país del teléfono, seleccionado ${countryName} (${dialCode})',
            noCountrySelected: 'Selecciona el país del teléfono',
            countryListAriaLabel: 'Lista de países',
            searchPlaceholder: 'Buscar país o lada',
            clearSearchAriaLabel: 'Borrar búsqueda',
            searchEmptyState: 'Sin resultados',
            searchSummaryAria: function (n) { return n === 0 ? 'Sin resultados' : n === 1 ? '1 resultado' : n + ' resultados'; }
        },
        loadUtils: function () { return import('https://cdn.jsdelivr.net/npm/intl-tel-input@29/dist/js/utils.js'); }
    });
    // Marca el teléfono como inválido (mensaje nativo del navegador) si no corresponde al país elegido
    function checkTel() {
        var ok = null;
        try { ok = iti.isValidNumber(); } catch (e) {}
        tel.setCustomValidity(tel.value.trim() && ok === false ? 'Escribe un número de teléfono válido para el país seleccionado.' : '');
    }
    tel.addEventListener('input', checkTel);
    tel.addEventListener('countrychange', checkTel);
    if (iti.promise) iti.promise.then(checkTel);

    /* Captcha (Google reCAPTCHA v3, invisible) */
    var RECAPTCHA_SITE_KEY = '6LdkTsUtAAAAAKq2VZidT8EBJ0gwEx5c61zxKRre'; /* solo la clave del sitio; la secreta NUNCA va aquí */
    var rc = document.createElement('script');
    rc.src = 'https://www.google.com/recaptcha/api.js?render=' + RECAPTCHA_SITE_KEY + '&hl=es';
    rc.async = true;
    document.head.appendChild(rc);

    /* Endpoint que guarda el mensaje en la base de datos (MySQL) */
    // Archivo PHP que recibe el formulario: valida en el servidor, verifica reCAPTCHA,
    // guarda el mensaje en MySQL y manda el aviso por correo
    var ENDPOINT_CONTACTO = 'config/procesarcontacto.php';

    // Botón de enviar y su texto (cambia a "Enviando…" mientras se manda)
    var submitBtn = document.getElementById('form-submit');
    var submitText = document.getElementById('form-submit-text');

    // Campos que se validan en el navegador antes de enviar
    var nombre = document.getElementById('nombre');
    var correo = document.getElementById('correo');
    var mensaje = document.getElementById('mensaje');

    // Alerta de error (SweetAlert2) con el mensaje indicado
    function showError(msg) {
        Swal.fire({
            icon: 'error',
            title: 'Revisa tu formulario',
            text: msg,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#ec4899',
            background: '#f7f9fb',
            color: '#1a1c1e'
        });
    }
    // Alerta de éxito con los colores de la marca (la palomita se estiliza en contacto.css)
    function showSuccess() {
        Swal.fire({
            icon: 'success',
            title: '¡Mensaje enviado!',
            text: 'Gracias por escribirnos. Un ejecutivo de cuenta te contactará a la brevedad.',
            confirmButtonText: 'Perfecto',
            confirmButtonColor: '#0b1b3d',
            background: '#f7f9fb',
            color: '#1a1c1e',
            customClass: { icon: 'vs-swal-success-icon' }
        });
    }
    // Activa o desactiva el botón y cambia su texto mientras se envía
    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitText.textContent = loading ? 'Enviando…' : 'Enviar mensaje';
    }

    /* Validación en el cliente (misma lógica que valida el servidor) */
    function validarFormulario() {
        var nombreVal = nombre.value.trim();
        var correoVal = correo.value.trim();
        var mensajeVal = mensaje.value.trim();
        var correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (nombreVal.length < 2 || nombreVal.length > 150) {
            return 'Escribe tu nombre completo (mínimo 2 caracteres).';
        }
        if (!/^[\p{L}\s.'-]+$/u.test(nombreVal)) {
            return 'El nombre solo puede contener letras y espacios.';
        }
        if (!correoRegex.test(correoVal) || correoVal.length > 150) {
            return 'Escribe un correo electrónico válido.';
        }
        if (tel.value.trim()) {
            var ok = null;
            try { ok = iti.isValidNumber(); } catch (e) {}
            if (ok === false) return 'Escribe un número de teléfono válido para el país seleccionado.';
        }
        if (mensajeVal.length < 5 || mensajeVal.length > 2000) {
            return 'Cuéntanos qué necesitas (entre 5 y 2000 caracteres).';
        }
        return null;
    }

    // Envío del formulario:
    // 1) valida en el navegador; 2) pide el token de reCAPTCHA v3 (acción "contacto");
    // 3) arma el payload con los campos y los datos del producto que vienen en la URL (?producto, ?categoria, ?ref);
    // 4) lo manda por fetch en JSON; 5) muestra éxito o el primer error que devuelva el servidor.
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var validationError = validarFormulario();
        if (validationError) return showError(validationError);

        if (!window.grecaptcha) return showError('No pudimos verificar que eres una persona. Inténtalo de nuevo.');

        setLoading(true);
        window.grecaptcha.ready(function () {
            window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contacto' }).then(function (token) {
                var q = new URLSearchParams(window.location.search);
                var phone = '';
                if (tel.value.trim()) {
                    phone = iti.getNumber('INTERNATIONAL') || ('+' + iti.getSelectedCountryData().dialCode + ' ' + tel.value.trim());
                }
                var payload = {
                    nombre: nombre.value.trim(),
                    empresa: document.getElementById('empresa').value.trim(),
                    correo: correo.value.trim(),
                    telefono: phone,
                    mensaje: mensaje.value.trim(),
                    producto: (q.get('producto') || '').trim(),
                    categoria: (q.get('categoria') || '').trim(),
                    referencia: (q.get('ref') || '').trim(),
                    captchaToken: token
                };

                fetch(ENDPOINT_CONTACTO, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(function (res) { return res.json().then(function (data) { return { status: res.status, data: data }; }); })
                    .then(function (r) {
                        if (r.data && r.data.ok) {
                            showSuccess();
                            form.reset();
                            fitAll();
                        } else {
                            var msg = 'No pudimos enviar tu mensaje. Inténtalo de nuevo.';
                            if (r.data && r.data.errors) {
                                msg = Object.values(r.data.errors)[0];
                            } else if (r.data && r.data.error) {
                                msg = r.data.error;
                            }
                            showError(msg);
                        }
                    })
                    .catch(function () {
                        showError('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
                    })
                    .finally(function () { setLoading(false); });
            }, function () {
                setLoading(false);
                showError('No pudimos verificar que eres una persona. Inténtalo de nuevo.');
            });
        });
    });
})();
