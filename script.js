// script.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Fondo de iconos ---
  const iconos = document.querySelectorAll('.presentacion .icono');
  const container = document.querySelector('.presentacion');

  if (container && iconos.length) {
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Inicializar iconos
    iconos.forEach(icono => {
      icono.dataset.x = Math.random() * containerWidth;
      icono.dataset.y = Math.random() * containerHeight;
      icono.dataset.vx = (Math.random() - 0.5) * 0.5;
      icono.dataset.vy = (Math.random() - 0.5) * 0.5;
      icono.dataset.size = 30 + Math.random() * 30;
      icono.style.width = icono.dataset.size + 'px';
      icono.style.height = icono.dataset.size + 'px';
      icono.style.left = icono.dataset.x + 'px';
      icono.style.top = icono.dataset.y + 'px';
    });

    let mouseX = null;
    let mouseY = null;

    container.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
      mouseX = null;
      mouseY = null;
    });

    function animarIconos() {
      iconos.forEach(icono => {
        let x = parseFloat(icono.dataset.x);
        let y = parseFloat(icono.dataset.y);
        let vx = parseFloat(icono.dataset.vx);
        let vy = parseFloat(icono.dataset.vy);

        if (mouseX !== null && mouseY !== null) {
          x += (mouseX - x) * 0.03;
          y += (mouseY - y) * 0.03;
        } else {
          x += vx;
          y += vy;
          if (x < 0 || x > containerWidth - icono.offsetWidth) icono.dataset.vx = -vx;
          if (y < 0 || y > containerHeight - icono.offsetHeight) icono.dataset.vy = -vy;
        }

        icono.dataset.x = x;
        icono.dataset.y = y;

        icono.style.transform = `translate(${x}px, ${y}px)`;
      });

      requestAnimationFrame(animarIconos);
    }

    animarIconos();
  }

  // --- Barras de progreso ---
  document.querySelectorAll('.progreso-bar').forEach(bar => {
    // Obtener el valor de la variable CSS correctamente (incluye inline y CSS)
    const porcentaje = getComputedStyle(bar).getPropertyValue('--progreso-width').trim();
    bar.style.width = '0';
    // si quieres que el cambio sea suave vía JS, activa una transición:
    bar.style.transition = 'width 1.2s cubic-bezier(.77,0,.18,1)';
    setTimeout(() => {
      bar.style.width = porcentaje || '80%';
    }, 100); // pequeño delay para permitir el render
  });
});
