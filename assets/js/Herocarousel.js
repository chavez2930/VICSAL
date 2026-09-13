document.addEventListener('DOMContentLoaded', () => {

  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.hero-carousel-slide');
  const titleEl = document.getElementById('hero-carousel-title');
  const subtitleEl = document.getElementById('hero-carousel-subtitle');
  const counterEl = document.getElementById('hero-carousel-counter');

  if (!slides.length) return;

  const INTERVAL_MS = 4500; // segundos entre cada cambio de imagen
  let current = 0;
  const total = slides.length;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCaption() {
    const active = slides[current];
    if (titleEl) titleEl.textContent = active.dataset.title || '';
    if (subtitleEl) subtitleEl.textContent = active.dataset.subtitle || '';
  }

  function updateCounter() {
    if (counterEl) counterEl.textContent = pad(current + 1) + ' / ' + pad(total);
  }

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