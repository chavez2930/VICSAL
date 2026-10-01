/* ======================================================================
   PRE-LLENADO DEL MENSAJE DE CONTACTO (assets/js/contacto-prefill.js)
   Antes estaba dentro de contacto.html. Cuando alguien llega desde "Más info" en el catálogo, la URL trae
   ?producto=...&categoria=...&ref=... y este script escribe un mensaje inicial en el campo
   "¿Qué necesitas?". Si se entra a la página normal (sin ?producto=), no hace nada.
   El envío de esos mismos datos al servidor lo hace contacto.js.
   ====================================================================== */

/* Pre-llena "¿Qué necesitas?" cuando llegan desde el catálogo (productos.html -> "Más info").
   El catálogo manda: contacto.html?producto=...&categoria=...&ref=...
   Si entran a esta página normal (sin ?producto=) no hace nada. */
(function () {
    var q = new URLSearchParams(window.location.search);
    var producto = (q.get('producto') || '').trim().slice(0, 200);
    var mensaje = document.getElementById('mensaje');
    if (!producto || !mensaje || mensaje.value) return;
    var categoria = (q.get('categoria') || '').trim().slice(0, 120);
    mensaje.value = 'Hola, me interesa el producto: ' + producto + (categoria ? ' (' + categoria + ')' : '') +
        '. Me gustaría recibir informes y cotización.\n\nCantidad aproximada: ';
    mensaje.dispatchEvent(new Event('input', { bubbles: true })); /* activa el auto-crecimiento del campo */
})();
