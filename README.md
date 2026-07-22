# Hoja de Vida

Proyecto de hoja de vida personal desarrollado como una web estática con un backend ligero para el formulario de contacto.

## Descripción

La aplicación muestra la información personal, perfil profesional, educación, proyectos, habilidades, idiomas y un formulario de contacto.

El frontend está construido con HTML, CSS y JavaScript. El backend en Node.js recibe los mensajes del formulario, los guarda en PostgreSQL y trata de enviarlos por correo.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- PostgreSQL
- Nodemailer
- CORS

## Estructura del proyecto

- [frontend](frontend) - Interfaz visual del sitio
- [backend](backend) - API y lógica del formulario de contacto
- [LICENSE](LICENSE) - Licencia del proyecto

## Funcionalidades

- Secciones de perfil, educación, proyectos, habilidades e idiomas
- Animaciones y estilos personalizados
- Formulario de contacto con validación
- Guardado de mensajes en base de datos
- Envío de correo al propietario y confirmación al usuario

## Cómo ejecutar en local

### Frontend y backend juntos

1. Instala las dependencias del backend:

```bash
cd backend
npm install
```

2. Configura el archivo `.env` dentro de `backend/`.

3. Inicia el servidor:

```bash
npm start
```

4. Abre la aplicación en:

```text
http://localhost:3000
```

## Variables de entorno

El backend usa estas variables:

```env
PORT=3000
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
EMAIL_RECIPIENT=tu_email@gmail.com
DB_USER=postgres
DB_PASSWORD=tu_clave
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hoja_de_vida
```

## Despliegue

El proyecto puede desplegarse como una sola aplicación Node.js, porque el backend también sirve el frontend.

### Railway

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Configura en Railway las variables de entorno de base de datos y correo.

## Notas

- El formulario de contacto depende del backend para funcionar.
- Si el correo falla por credenciales, el mensaje igualmente queda guardado en la base de datos.
- Para producción es recomendable usar un proveedor de correo transaccional más estable que Gmail.
