// =========================================
// 🎨 script.js → Animaciones y Efectos Visuales
// =========================================
// Contiene:
// 1. Animación de íconos en el encabezado (seguimiento al cursor + dispersión)
// 2. Barra de progreso animada en la sección de educación
// 3. Fondo interactivo tipo "Pulpo Energético"
// =========================================


// ====================================================
// 1. ANIMACIÓN DE ÍCONOS DEL ENCABEZADO
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
  const iconos = document.querySelectorAll('.presentacion .icono');
  const container = document.querySelector('.presentacion');

  if (container && iconos.length) {
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Inicializar cada icono con propiedades aleatorias
    iconos.forEach(icono => {
      resetIconPosition(icono);
      icono.dataset.vx = (Math.random() - 0.5) * 0.5; // velocidad X aleatoria
      icono.dataset.vy = (Math.random() - 0.5) * 0.5; // velocidad Y aleatoria
      icono.dataset.size = 30 + Math.random() * 30;   // tamaño aleatorio

      // Offset respecto al cursor (para que no se amontonen)
      icono.dataset.offsetX = (Math.random() - 0.5) * 100; 
      icono.dataset.offsetY = (Math.random() - 0.5) * 100; 

      // Velocidad personalizada (más natural)
      icono.dataset.speed = 0.02 + Math.random() * 0.03;

      // Estilo inicial
      icono.style.width = icono.dataset.size + 'px';
      icono.style.height = icono.dataset.size + 'px';
      icono.style.position = 'absolute';
    });

    let mouseX = null;
    let mouseY = null;

    // 📌 Detectar posición del mouse dentro del contenedor
    container.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    // 📌 Cuando el mouse sale → los íconos vuelven a su posición inicial
    container.addEventListener('mouseleave', () => {
      mouseX = null;
      mouseY = null;
      iconos.forEach(icono => resetIconPosition(icono));
    });

    // Función para colocar un icono en posición aleatoria
    function resetIconPosition(icono) {
      const x = Math.random() * (containerWidth - 50);
      const y = Math.random() * (containerHeight - 50);
      icono.dataset.x = x;
      icono.dataset.y = y;
      icono.style.left = x + 'px';
      icono.style.top = y + 'px';
    }

    // Animación principal
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
          // Seguir al mouse con suavidad + offset
          x += (mouseX + offsetX - x) * speed;
          y += (mouseY + offsetY - y) * speed;
        } else {
          // Movimiento libre rebotando en los bordes
          x += vx;
          y += vy;
          if (x < 0 || x > containerWidth - icono.offsetWidth) icono.dataset.vx = -vx;
          if (y < 0 || y > containerHeight - icono.offsetHeight) icono.dataset.vy = -vy;
        }

        // Guardar nueva posición
        icono.dataset.x = x;
        icono.dataset.y = y;
        icono.style.left = x + 'px';
        icono.style.top = y + 'px';
      });

      requestAnimationFrame(animarIconos);
    }

    animarIconos();
  }

  // ====================================================
  // 2. ANIMACIÓN DE BARRA DE PROGRESO (EDUCACIÓN)
  // ====================================================
  document.querySelectorAll('.progreso-bar').forEach(bar => {
    const porcentaje = getComputedStyle(bar).getPropertyValue('--progreso-width').trim();
    bar.style.width = '0';
    bar.style.transition = 'width 1.2s cubic-bezier(.77,0,.18,1)';
    setTimeout(() => {
      bar.style.width = porcentaje || '80%';
    }, 100);
  });
});


// ====================================================
// 3. PULPO ENERGÉTICO INTERACTIVO (CANVAS)
// ====================================================
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

// Ajustar tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Posición inicial del mouse
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// Configuración
const numPoints = 120;       // Cantidad de nodos
const maxDist = 120;         // Conexión entre puntos
const tentacleReach = 200;   // Alcance de tentáculos

// Nodo principal ("pulpo")
const pulpo = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  glow: 25,
  vx: 0,
  vy: 0
};

// Lista de nodos flotantes
let points = [];
let angleOffset = 0;

// Clase para puntos
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,200,255,0.9)";
    ctx.fill();
  }
}

// Crear nodos iniciales
for (let i = 0; i < numPoints; i++) {
  points.push(new Point(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Dibujar pulpo con brillo
function drawPulpo() {
  let gradient = ctx.createRadialGradient(pulpo.x, pulpo.y, pulpo.radius, pulpo.x, pulpo.y, pulpo.glow);
  gradient.addColorStop(0, "rgba(0,255,200,1)");
  gradient.addColorStop(1, "rgba(0,255,200,0)");
  ctx.beginPath();
  ctx.arc(pulpo.x, pulpo.y, pulpo.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

// Conectar pulpo → puntos (tentáculos dinámicos)
function connectPulpo() {
  points.forEach((p, i) => {
    let dx = pulpo.x - p.x;
    let dy = pulpo.y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < tentacleReach) {
      let offsetX = Math.sin(angleOffset + i) * 5;
      let offsetY = Math.cos(angleOffset + i) * 5;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0,255,200,${1 - dist / tentacleReach})`;
      ctx.lineWidth = 1.2;
      ctx.moveTo(pulpo.x + offsetX, pulpo.y + offsetY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  });
}

// Conectar puntos entre sí (red orgánica)
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

// Loop de animación
function animate() {
  ctx.fillStyle = "rgba(5,5,5,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  points.forEach(p => { p.move(); p.draw(); });

  // Movimiento suave del pulpo
  pulpo.vx += (mouse.x - pulpo.x) * 0.02;
  pulpo.vy += (mouse.y - pulpo.y) * 0.02;
  pulpo.vx *= 0.9;
  pulpo.vy *= 0.9;
  pulpo.x += pulpo.vx;
  pulpo.y += pulpo.vy;

  connectPoints();
  connectPulpo();
  drawPulpo();

  angleOffset += 0.03;
  requestAnimationFrame(animate);
}
animate();

// Eventos
window.addEventListener("mousemove", e => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
