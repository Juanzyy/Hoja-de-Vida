// Variables globales
const formularioContacto = document.getElementById('formularioContacto');

// Agregar evento al formulario
if (formularioContacto) {
    formularioContacto.addEventListener('submit', enviarMensaje);
}

// Función para enviar el mensaje
async function enviarMensaje(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    // Validación básica en frontend
    if (!nombre || !email || !asunto || !mensaje) {
        mostrarAlerta('Por favor completa todos los campos', 'error');
        return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarAlerta('Por favor ingresa un email válido', 'error');
        return;
    }

    // Deshabilitar botón mientras se envía
    const btnEnviar = formularioContacto.querySelector('.btn-enviar');
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';

    try {
        // Enviar datos al servidor
        const response = await fetch('http://localhost:3000/api/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre,
                email,
                asunto,
                mensaje
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            mostrarAlerta('¡Mensaje enviado exitosamente!', 'success');
            formularioContacto.reset();
        } else {
            mostrarAlerta(data.message || 'Error al enviar el mensaje', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al conectar con el servidor. Verifica que esté en funcionamiento.', 'error');
    } finally {
        // Reabilitar botón
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Mensaje';
    }
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        ${tipo === 'success' 
            ? 'background: #4caf50; color: white;' 
            : 'background: #f44336; color: white;'
        }
    `;

    document.body.appendChild(alerta);

    // Eliminar alerta después de 5 segundos
    setTimeout(() => {
        alerta.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alerta.remove(), 300);
    }, 5000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
