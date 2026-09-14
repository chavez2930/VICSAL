/* Este script controla el header/nav, que vive en
   assets/components/header.html y se inyecta en la página vía
   load-partials.js. Por eso espera al evento "partials:loaded" en
   vez de "DOMContentLoaded": el header todavía no existe en el DOM
   cuando el HTML termina de parsear (se inyecta después, vía fetch).
   Si este script escucha "DOMContentLoaded", #site-header sale null,
   el "if (header)" nunca entra, y el header no se oculta/muestra al
   hacer scroll — ese es justo el bug que se está arreglando aquí. */
document.addEventListener('partials:loaded', () => {

  /* ---------- Header: ocultar al bajar, mostrar al subir ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    let lastScrollY = window.scrollY;
    const hideThreshold = 12; // px mínimos de scroll para reaccionar
    const showAtTop = 80;     // siempre visible cerca del top

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= showAtTop) {
        header.classList.remove('-translate-y-full');
      } else if (Math.abs(delta) > hideThreshold) {
        if (delta > 0) {
          header.classList.add('-translate-y-full');
        } else {
          header.classList.remove('-translate-y-full');
        }
        lastScrollY = currentScrollY;
      }
    }, { passive: true });
  }

  /* ---------- Estado activo según la página actual ---------- */
  /* Cada página es un archivo .html distinto (no es una SPA), así que
     el link activo NO se puede decidir con un click listener: al
     navegar se recarga todo el header desde cero y ese click ya no
     existe. En vez de eso, se compara el archivo actual de la URL
     (window.location.pathname) contra el data-path de cada link, y
     así el link correcto se marca activo en cada carga de página. */
  const topActiveClasses = [
    'text-primary-container', 'font-semibold',
    'after:absolute', 'after:bottom-[-22px]', 'after:left-0', 'after:w-full',
    'after:h-[2px]', 'after:bg-gradient-to-r', 'after:from-pink-500',
    'after:via-orange-400', 'after:to-emerald-500'
  ];

  const topLinks = document.querySelectorAll('nav a[data-nav="top"]');

  // Mapa: nombre de archivo -> data-path correspondiente en el header
  const PAGE_TO_PATH = {
    'index.html': 'home',
    '': 'home', // por si la URL es solo "/" (carpeta raíz)
    'nosotros.html': 'nosotros',
    'productos.html': 'productos',
    'contacto.html': 'contacto',
  };

  function clearTop() {
    topLinks.forEach(link => {
      link.classList.remove(...topActiveClasses);
      link.classList.add('text-on-surface-variant');
      link.removeAttribute('aria-current');
    });
  }

  function setActiveFromUrl() {
    const currentFile = window.location.pathname.split('/').pop();
    const currentPath = PAGE_TO_PATH[currentFile];
    if (!currentPath) return; // página no mapeada, no marcar nada

    clearTop();

    const activeLink = Array.from(topLinks).find(
      (link) => link.getAttribute('data-path') === currentPath
    );

    if (activeLink) {
      activeLink.classList.remove('text-on-surface-variant');
      activeLink.classList.add(...topActiveClasses);
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  setActiveFromUrl();

});


/* ==========================================================
     MENÚ MÓVIL (hamburguesa + acordeón de Productos)
     Igual que el resto de este archivo, va dentro del listener
     'partials:loaded' porque el header se inyecta después.
     ========================================================== */
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menuPanel = document.getElementById('mobile-menu-panel');
  const menuIcon = document.getElementById('mobile-menu-icon');

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener('click', () => {
      const isOpen = !menuPanel.classList.contains('hidden');

      if (isOpen) {
        menuPanel.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
        if (menuIcon) menuIcon.textContent = 'menu';
      } else {
        menuPanel.classList.remove('hidden');
        menuToggle.setAttribute('aria-expanded', 'true');
        if (menuIcon) menuIcon.textContent = 'close';
      }
    });
  }

  // Acordeón de "Productos" dentro del menú móvil
  const productosToggle = document.getElementById('mobile-productos-toggle');
  const productosPanel = document.getElementById('mobile-productos-panel');
  const productosChevron = document.getElementById('mobile-productos-chevron');

  if (productosToggle && productosPanel) {
    productosToggle.addEventListener('click', () => {
      const isOpen = !productosPanel.classList.contains('hidden');

      if (isOpen) {
        productosPanel.classList.add('hidden');
        productosToggle.setAttribute('aria-expanded', 'false');
        if (productosChevron) productosChevron.style.transform = 'rotate(0deg)';
      } else {
        productosPanel.classList.remove('hidden');
        productosToggle.setAttribute('aria-expanded', 'true');
        if (productosChevron) productosChevron.style.transform = 'rotate(180deg)';
      }
    });
  }

  // Si la pantalla crece a tamaño de escritorio (xl) mientras el menú
  // móvil está abierto, ciérralo — evita que quede "atorado" abierto
  // si alguien gira su tablet o cambia de ventana.
  const desktopBreakpoint = window.matchMedia('(min-width: 1280px)');
  desktopBreakpoint.addEventListener('change', (e) => {
    if (e.matches && menuPanel && !menuPanel.classList.contains('hidden')) {
      menuPanel.classList.add('hidden');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      if (menuIcon) menuIcon.textContent = 'menu';
    }
  });