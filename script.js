// script.js animacion de iconos para el encabezado
document.addEventListener('DOMContentLoaded', () => {
  const iconos = document.querySelectorAll('.presentacion .icono');
  const container = document.querySelector('.presentacion');

  if (container && iconos.length) {
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Inicializar iconos
    iconos.forEach(icono => {
      resetIconPosition(icono);
      icono.dataset.vx = (Math.random() - 0.5) * 0.5;
      icono.dataset.vy = (Math.random() - 0.5) * 0.5;
      icono.dataset.size = 30 + Math.random() * 30;

      // ✨ cada icono tendrá un "offset" respecto al cursor
      icono.dataset.offsetX = (Math.random() - 0.5) * 100; 
      icono.dataset.offsetY = (Math.random() - 0.5) * 100; 

      // ✨ velocidad personalizada
      icono.dataset.speed = 0.02 + Math.random() * 0.03;

      icono.style.width = icono.dataset.size + 'px';
      icono.style.height = icono.dataset.size + 'px';
      icono.style.position = 'absolute';
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

      // 🔥 Redistribuir con animación suave
      iconos.forEach(icono => {
        resetIconPosition(icono);
      });
    });

    function resetIconPosition(icono) {
      const x = Math.random() * (containerWidth - 50);
      const y = Math.random() * (containerHeight - 50);
      icono.dataset.x = x;
      icono.dataset.y = y;
      icono.style.left = x + 'px';
      icono.style.top = y + 'px';
    }

    function animarIconos() {
      iconos.forEach(icono => {
        let x = parseFloat(icono.dataset.x);
        let y = parseFloat(icono.dataset.y);
        let vx = parseFloat(icono.dataset.vx);
        let vy = parseFloat(icono.dataset.vy);
        let speed = parseFloat(icono.dataset.speed);
        let offsetX = parseFloat(icono.dataset.offsetX);
        let offsetY = parseFloat(icono.dataset.offsetY);

        if (mouseX !== null && mouseY !== null) {
          // 👌 siguen al mouse pero con offset y suavidad
          x += (mouseX + offsetX - x) * speed;
          y += (mouseY + offsetY - y) * speed;
        } else {
          // Se mueven libremente
          x += vx;
          y += vy;

          if (x < 0 || x > containerWidth - icono.offsetWidth) icono.dataset.vx = -vx;
          if (y < 0 || y > containerHeight - icono.offsetHeight) icono.dataset.vy = -vy;
        }

        icono.dataset.x = x;
        icono.dataset.y = y;

        icono.style.left = x + 'px';
        icono.style.top = y + 'px';
      });

      requestAnimationFrame(animarIconos);
    }

    animarIconos();
  }

  /* BARRA DE PROGRESO PARA LA SECCION DE EDUCACION */
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


// ================================
// 🐙 Pulpo Energético Interactivo
// ================================
// - Nodo central (pulpo) que sigue al cursor con inercia
// - Puntos flotantes que se mueven por la pantalla
// - Tentáculos dinámicos que se conectan entre el pulpo y los puntos
// - Conexiones entre puntos para dar efecto de red orgánica
// - Tentáculos con movimiento oscilante tipo "vivos"
// ================================

// Obtener canvas y contexto
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

// Ajustar tamaño inicial
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Guardar posición del mouse (centro por defecto)
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// Configuración principal
const numPoints = 120;       // cantidad de puntos flotantes
const maxDist = 120;         // distancia máxima para conectar puntos entre sí
const tentacleReach = 200;   // alcance máximo de tentáculos hacia los puntos

// Objeto pulpo (nodo principal)
const pulpo = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,   // tamaño del nodo principal
    glow: 25,    // radio del brillo
    vx: 0,       // velocidad en X
    vy: 0        // velocidad en Y
};

// Lista de puntos
let points = [];
let angleOffset = 0; // ángulo usado para oscilación de tentáculos

// Clase para generar puntos flotantes
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // velocidad aleatoria suave
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
    }

    // Actualizar posición
    move() {
        this.x += this.vx;
        this.y += this.vy;

        // Rebote contra los bordes del canvas
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    // Dibujar el punto
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,200,255,0.9)"; // color azul turquesa
        ctx.fill();
    }
}

// Crear puntos iniciales
for (let i = 0; i < numPoints; i++) {
    points.push(new Point(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Dibujar el pulpo con efecto de brillo
function drawPulpo() {
    let gradient = ctx.createRadialGradient(
        pulpo.x, pulpo.y, pulpo.radius,
        pulpo.x, pulpo.y, pulpo.glow
    );
    gradient.addColorStop(0, "rgba(0,255,200,1)");   // centro brillante
    gradient.addColorStop(1, "rgba(0,255,200,0)");   // difuminado hacia afuera

    ctx.beginPath();
    ctx.arc(pulpo.x, pulpo.y, pulpo.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Conectar el pulpo con puntos cercanos → tentáculos
function connectPulpo() {
    points.forEach((p, index) => {
        let dx = pulpo.x - p.x;
        let dy = pulpo.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tentacleReach) {
            // Movimiento oscilante en los tentáculos
            let offsetX = Math.sin(angleOffset + index) * 5;
            let offsetY = Math.cos(angleOffset + index) * 5;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,200,${1 - dist / tentacleReach})`; // opacidad según distancia
            ctx.lineWidth = 1.2;
            ctx.moveTo(pulpo.x + offsetX, pulpo.y + offsetY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }
    });
}

// Conectar puntos entre sí → red orgánica
function connectPoints() {
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            let dx = points[i].x - points[j].x;
            let dy = points[i].y - points[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0,150,255,${1 - dist / maxDist})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }
        }
    }
}

// Bucle de animación
function animate() {
    // Fondo con leve transparencia → efecto de "rastro"
    ctx.fillStyle = "rgba(5,5,5,0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Actualizar y dibujar puntos
    points.forEach(p => {
        p.move();
        p.draw();
    });

    // Mover el pulpo suavemente hacia el cursor (inercia)
    pulpo.vx += (mouse.x - pulpo.x) * 0.02;
    pulpo.vy += (mouse.y - pulpo.y) * 0.02;
    pulpo.vx *= 0.9; // fricción
    pulpo.vy *= 0.9;
    pulpo.x += pulpo.vx;
    pulpo.y += pulpo.vy;

    // Dibujar conexiones
    connectPoints();
    connectPulpo();
    drawPulpo();

    // Avanzar en el ángulo de oscilación
    angleOffset += 0.03;

    requestAnimationFrame(animate);
}

// Iniciar animación
animate();

// Eventos del mouse
window.addEventListener("mousemove", function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
