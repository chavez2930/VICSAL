document.addEventListener('DOMContentLoaded', () => {

  const track = document.getElementById('solutions-carousel');
  const prevBtn = document.getElementById('solutions-prev');
  const nextBtn = document.getElementById('solutions-next');

  if (!track) return;

  // ---------- Clonar tarjetas para el efecto de carrusel infinito ----------
  const originalCards = Array.from(track.children);

  const clones = originalCards.map((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
    return clone;
  });

  clones.forEach((clone) => track.appendChild(clone));

  let loopWidth = 0;

  function computeLoopWidth() {
    if (!clones.length) return 0;
    // Distancia entre el inicio de la primera tarjeta y el inicio de su
    // clon: es exactamente el ancho de una "vuelta" completa del set.
    return clones[0].offsetLeft - originalCards[0].offsetLeft;
  }

  function getStep() {
    const firstCard = originalCards[0];
    if (!firstCard) return track.clientWidth;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;

    return firstCard.getBoundingClientRect().width + gap;
  }

  // Salto INSTANTÁNEO a una posición del carrusel.
  // El track tiene la clase "scroll-smooth" (scroll-behavior: smooth), y por
  // eso cualquier "track.scrollLeft = ..." se anima en vez de saltar: al
  // reacomodar el loop se veía cómo todo el carrusel se rebobinaba. Aquí se
  // desactiva ese comportamiento (y el snap) solo durante el salto y se
  // restaura enseguida, así el cambio entre originales y copias no se nota.
  function jumpTo(left) {
    const prevBehavior = track.style.scrollBehavior;
    const prevSnap = track.style.scrollSnapType;

    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    void track.offsetWidth; // fuerza al navegador a aplicar el salto ya

    track.style.scrollBehavior = prevBehavior;
    track.style.scrollSnapType = prevSnap;
  }

  function normalizeScroll() {
    if (!loopWidth) return;

    if (track.scrollLeft >= loopWidth) {
      jumpTo(track.scrollLeft - loopWidth);
    } else if (track.scrollLeft < 0) {
      jumpTo(track.scrollLeft + loopWidth);
    }
  }

  function scrollByCards(direction) {
    track.scrollBy({ left: direction * getStep(), behavior: 'smooth' });
  }

  function refreshLoopWidth() {
    loopWidth = computeLoopWidth();
  }

  // Recalcular una vez que las imágenes carguen y en cada resize
  refreshLoopWidth();
  window.addEventListener('load', refreshLoopWidth);
  window.addEventListener('resize', refreshLoopWidth);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      // Al inicio no hay nada a la izquierda: se salta (sin que se note) a la
      // misma posición dentro de las copias y de ahí se retrocede, para que
      // la flecha izquierda también sea infinita.
      if (loopWidth && track.scrollLeft < getStep()) {
        jumpTo(track.scrollLeft + loopWidth);
      }
      scrollByCards(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => scrollByCards(1));
  }

  // Reacomoda el scroll (sin que se note) una vez que el usuario/la
  // animación deja de mover el carrusel, para simular el loop infinito
  // tanto con las flechas como arrastrando/haciendo swipe.
  let scrollSettleTimer;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(normalizeScroll, 120);
    },
    { passive: true }
  );

});