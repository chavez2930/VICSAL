/* ======================================================================
   COMPORTAMIENTO DEL FOOTER (assets/js/footer.js)
   Antes era un atributo onclick escrito dentro de footer.html. loadpartials.js lo carga automáticamente
   justo después de inyectar el footer (ver COMPONENT_SCRIPTS en loadpartials.js), así que el botón ya existe.

   Botón "Ver catálogo" (#btn-catalogo): al hacer clic la descarga del PDF sigue su curso normal, y durante
   4 segundos el botón cambia a "Descargando..." con un ícono girando y no acepta más clics.
   ====================================================================== */

(function () {
  var b = document.getElementById('btn-catalogo');
  if (!b) return; // la página no tiene el botón: no hay nada que hacer

  b.addEventListener('click', function (event) {
    // Si ya está en espera, se ignora el clic (evita descargas repetidas)
    if (b.dataset.espera) { event.preventDefault(); return false; }

    // Entra en modo espera: bandera, estilo (.en-espera en styles.css) y aria-disabled para lectores de pantalla
    b.dataset.espera = '1';
    b.classList.add('en-espera');
    b.setAttribute('aria-disabled', 'true');

    // Guarda el ícono y el texto originales y los cambia por el estado "Descargando..."
    var i = b.querySelector('.vs-btn-icon'), t = b.querySelector('.vs-btn-text'), i0 = i.textContent, t0 = t.textContent;
    i.textContent = 'progress_activity';
    t.textContent = 'Descargando...';

    // A los 4 segundos deja el botón como estaba
    setTimeout(function () {
      delete b.dataset.espera;
      b.classList.remove('en-espera');
      b.removeAttribute('aria-disabled');
      i.textContent = i0;
      t.textContent = t0;
    }, 4000);
  });
})();
