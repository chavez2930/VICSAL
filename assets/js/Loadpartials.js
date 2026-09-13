/* ======================================================================
   CARGADOR DE COMPONENTES (Header / Footer)
   Inyecta assets/components/header.html y assets/components/footer.html
   dentro de los placeholders <div data-include="header"></div> y
   <div data-include="footer"></div> que se pongan en cualquier página
   del sitio. Así el header y el footer viven en UN solo archivo cada
   uno y se reutilizan en todas las páginas sin copiar/pegar HTML.

   CADA COMPONENTE CARGA SU PROPIO JS AUTOMÁTICAMENTE
   ---------------------------------------------------
   El header necesita nav.js para funcionar (ocultar/mostrar al hacer
   scroll, estado activo del menú, etc.). En vez de obligar a cada
   página a acordarse de poner <script src="assets/js/nav.js"></script>
   a mano, ese JS queda registrado aquí, ligado al componente "header".
   Cualquier página que incluya <div data-include="header"></div>
   automáticamente carga y ejecuta nav.js después de inyectar el HTML.
   Si el header nunca se incluye, nav.js nunca se carga (y no truena,
   porque nav.js solo hace cosas cuando el header existe).

   Para agregar JS propio a otro componente (por ejemplo si el footer
   algún día necesita el suyo), solo hay que sumar una entrada al mapa
   COMPONENT_SCRIPTS de aquí abajo — no hay que tocar cada página.

   NOTA TÉCNICA: los <script> que vienen DENTRO del HTML de un partial
   (ej. pegados a mano dentro de header.html) NUNCA se ejecutan, porque
   se inyectan vía innerHTML/outerHTML y los navegadores bloquean eso
   por seguridad. Por eso los scripts de cada componente se cargan
   aparte, con document.createElement('script') — esos sí se ejecutan.

   Cuando terminan de cargar el HTML y el JS de todos los includes,
   se dispara el evento "partials:loaded" en document. nav.js escucha
   ese evento (en vez de "DOMContentLoaded") porque el header todavía
   no existe en el DOM cuando la página termina de parsear.

   IMPORTANTE: fetch() para archivos locales requiere que el sitio se
   sirva por http/https (Live Server, Netlify, etc.). Abrir el
   index.html directamente con doble clic (protocolo file://) hace que
   el navegador bloquee el fetch por CORS y el header/footer no
   aparecerán.
   ====================================================================== */
(function () {
  // Componente -> script(s) que le pertenecen. Se cargan una sola vez
  // por página, en orden, justo después de inyectar el HTML de ese
  // componente.
  const COMPONENT_SCRIPTS = {
    header: ['assets/js/nav.js'],
    footer: [],
  };

  function loadScriptOnce(src) {
    if (document.querySelector('script[src="' + src + '"]')) {
      return Promise.resolve(); // ya está cargado, no lo dupliques
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.body.appendChild(script);
    });
  }

  function loadInclude(el) {
    const name = el.getAttribute('data-include');
    if (!name) return Promise.resolve();

    const url = 'assets/components/' + name + '.html';

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar ' + url + ' (' + res.status + ')');
        return res.text();
      })
      .then((html) => {
        el.outerHTML = html;
      })
      .then(() => {
        const scripts = COMPONENT_SCRIPTS[name] || [];
        return scripts.reduce(
          (chain, src) => chain.then(() => loadScriptOnce(src)),
          Promise.resolve()
        );
      })
      .catch((err) => {
        console.error('[load-partials]', err);
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const includes = Array.from(document.querySelectorAll('[data-include]'));

    Promise.all(includes.map(loadInclude)).then(() => {
      document.dispatchEvent(new CustomEvent('partials:loaded'));
    });
  });
})();