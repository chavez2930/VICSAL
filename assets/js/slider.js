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
      handle.style.left = percentage + '%';
      
      leftImage.style.width = rect.width + 'px';
    }

    function syncLeftImageWidth() {
      const rect = container.getBoundingClientRect();
      leftImage.style.width = rect.width + 'px';
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