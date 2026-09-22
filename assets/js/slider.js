document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('comparison-container');
    const clippedLayer = document.getElementById('slider-clipped-layer');
    const handle = document.getElementById('slider-handle');
    const leftImage = document.getElementById('slider-left-image');
    
    if (!container || !clippedLayer || !handle || !leftImage) return;

    let isDragging = false;

    function setSliderPosition(x) {
      const rect = container.getBoundingClientRect();
      let offsetX = x - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      clippedLayer.style.width = percentage + '%';

      // La línea/flecha del handle se mueve por separado, en píxeles y con
      // un margen mínimo respecto a los bordes, para que el botón circular
      // (48px) nunca quede cortado por el "overflow-hidden" del contenedor
      // ni se salga visualmente de las esquinas redondeadas.
      const handleRadius = 24; // mitad de w-12 (48px)
      const margin = 6;
      const minX = handleRadius + margin;
      const maxX = rect.width - handleRadius - margin;
      const handleX = Math.min(Math.max(offsetX, minX), maxX);
      handle.style.left = handleX + 'px';

      leftImage.style.width = rect.width + 'px';
    }

    function syncLeftImageWidth() {
      const rect = container.getBoundingClientRect();
      leftImage.style.width = rect.width + 'px';

      // Al cambiar el ancho del contenedor (resize), recalcula el límite
      // en píxeles del handle a partir del porcentaje actual del recorte,
      // para que siga sin salirse ni cortarse en el nuevo tamaño.
      const currentPercentage = parseFloat(clippedLayer.style.width) || 50;
      const offsetX = (currentPercentage / 100) * rect.width;
      const handleRadius = 24;
      const margin = 6;
      const minX = handleRadius + margin;
      const maxX = rect.width - handleRadius - margin;
      handle.style.left = Math.min(Math.max(offsetX, minX), maxX) + 'px';
    }

    window.addEventListener('resize', syncLeftImageWidth);
    syncLeftImageWidth();

    container.addEventListener('mousedown', function(e) {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', function() {
      isDragging = false;
    });

    container.addEventListener('touchstart', function(e) {
      isDragging = true;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', function() {
      isDragging = false;
    });

    const swatches = document.querySelectorAll('.color-swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', function() {
        swatches.forEach(s => {
          s.classList.remove('ring-2', 'ring-offset-2', 'ring-primary-container');
        });
        this.classList.add('ring-2', 'ring-offset-2', 'ring-primary-container');
      });
    });
});