# Backend - Formulario de Contacto

Este backend procesa los mensajes del formulario de contacto de la hoja de vida.

## Requisitos

- Node.js (v14 o superior)
- npm

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno (.env):**

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```
PORT=3000
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
EMAIL_RECIPIENT=tu_email@gmail.com
```

## Configuración de Gmail

Si usas Gmail, sigue estos pasos:

1. Habilita la **Autenticación de dos factores** en tu cuenta de Google
2. Ve a [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Selecciona "Mail" y "Windows Computer" (o tu dispositivo)
4. Copia la contraseña generada
5. Usa esa contraseña en `EMAIL_PASSWORD`

## Uso

### Modo desarrollo (con reinicio automático):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints

### POST /api/contacto
Recibe los datos del formulario y envía emails

**Body:**
```json
{
  "nombre": "Juan",
  "email": "juan@example.com",
  "asunto": "Mi asunto",
  "mensaje": "Mi mensaje"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Tu mensaje ha sido enviado exitosamente"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

### GET /api/test
Verifica que el servidor esté funcionando

**Respuesta:**
```json
{
  "message": "Backend funcionando correctamente"
}
```

## Características

✅ Validación de email en servidor  
✅ Envío de email al propietario  
✅ Envío de confirmación al usuario  
✅ Manejo de errores robusto  
✅ CORS habilitado para acceso desde frontend  
✅ Variables de entorno seguras  

## Notas

- El servidor usa CORS para permitir solicitudes desde el frontend
- Los emails se envían usando Nodemailer
- Asegúrate de que el frontend envíe las solicitudes a `http://localhost:3000/api/contacto`
- Para producción, actualiza la URL del servidor en `frontend/js/script.js`

