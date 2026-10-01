/* ======================================================================
   CARRUSEL DEL HERO (assets/js/herocarousel.js)
   Carrusel de la foto principal de index.html (#hero-carousel): cambia de slide solo con un fundido y actualiza
   el título, subtítulo y contador de la etiqueta flotante. Pausa la rotación si la pestaña no está visible.
   ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // Elementos del carrusel: contenedor, slides, título, subtítulo y contador (si falta alguno esencial, el script no hace nada)
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.hero-carousel-slide');
  const titleEl = document.getElementById('hero-carousel-title');
  const subtitleEl = document.getElementById('hero-carousel-subtitle');
  const counterEl = document.getElementById('hero-carousel-counter');

  if (!slides.length) return;

  const INTERVAL_MS = 4500; // milisegundos entre cada cambio de imagen (4500 = 4.5 s)
  let current = 0;
  const total = slides.length;

  // Formatea un número con dos dígitos (1 -> 01) para el contador
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // Copia el título y el subtítulo (data-title y data-subtitle) del slide activo a la etiqueta flotante
  function updateCaption() {
    const active = slides[current];
    if (titleEl) titleEl.textContent = active.dataset.title || '';
    if (subtitleEl) subtitleEl.textContent = active.dataset.subtitle || '';
  }

  // Actualiza el contador con el formato "01 / 06"
  function updateCounter() {
    if (counterEl) counterEl.textContent = pad(current + 1) + ' / ' + pad(total);
  }

  // Muestra el slide indicado: oculta el actual y muestra el nuevo con un fundido de opacidad
  function goTo(index) {
    slides[current].classList.remove('opacity-100');
    slides[current].classList.add('opacity-0');

    current = index;

    slides[current].classList.remove('opacity-0');
    slides[current].classList.add('opacity-100');

    updateCaption();
    updateCounter();
  }

  // Estado inicial
  updateCaption();
  updateCounter();

  // Rotación automática: avanza al siguiente slide cada INTERVAL_MS y vuelve al primero al llegar al final
  let timer = setInterval(() => {
    goTo((current + 1) % total);
  }, INTERVAL_MS);

  // Pausar la rotación si el usuario deja de ver la pestaña, para no desperdiciar recursos
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      timer = setInterval(() => {
        goTo((current + 1) % total);
      }, INTERVAL_MS);
    }
  });

});