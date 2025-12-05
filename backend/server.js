const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Ruta para recibir mensajes del formulario
app.post('/api/contacto', async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { nombre, email, asunto, mensaje } = req.body;
        const ipOrigen = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Validar que todos los campos estén presentes
        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'El email no es válido'
            });
        }

        // Iniciar transacción
        await client.query('BEGIN');

        // Insertar mensaje en la base de datos
        const insertQuery = `
            INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje, ip_origen, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, fecha_creacion
        `;
        
        const result = await client.query(insertQuery, [
            nombre,
            email,
            asunto,
            mensaje,
            ipOrigen,
            userAgent
        ]);

        const mensajeId = result.rows[0].id;

        // Enviar email al propietario del sitio
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER,
            subject: `Nuevo mensaje de contacto (#${mensajeId}): ${asunto}`,
            html: `
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>ID del mensaje:</strong> ${mensajeId}</p>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${asunto}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>IP: ${ipOrigen}</small></p>
                <p><small>Fecha: ${new Date().toLocaleString('es-CO')}</small></p>
            `
        };

        // Enviar email de confirmación al usuario
        const confirmationMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Hemos recibido tu mensaje',
            html: `
                <h2>¡Gracias por contactarme!</h2>
                <p>Hola ${nombre},</p>
                <p>He recibido tu mensaje y te responderé lo antes posible.</p>
                <p><strong>Número de referencia:</strong> #${mensajeId}</p>
                <br>
                <p><strong>Resumen de tu mensaje:</strong></p>
                <p><strong>Asunto:</strong> ${asunto}</p>
                <p><strong>Tu mensaje:</strong></p>
                <p>${mensaje.replace(/\n/g, '<br>')}</p>
                <br>
                <p>Saludos,<br>Juan Pablo Rodriguez</p>
            `
        };

        // Enviar ambos emails
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(confirmationMailOptions);

        // Confirmar transacción
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Tu mensaje ha sido enviado exitosamente',
            messageId: mensajeId
        });

    } catch (error) {
        // Revertir transacción en caso de error
        await client.query('ROLLBACK');
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje. Intenta más tarde.'
        });
    } finally {
        client.release();
    }
});

// Ruta para obtener todos los mensajes (protegida - requeriría autenticación en producción)
app.get('/api/mensajes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, nombre, email, asunto, estado, fecha_creacion
            FROM mensajes_contacto
            ORDER BY fecha_creacion DESC
            LIMIT 50
        `);
        
        res.json({
            success: true,
            mensajes: result.rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes'
        });
    }
});

// Ruta para obtener un mensaje específico
app.get('/api/mensajes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM mensajes_contacto WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        // Marcar como leído
        await pool.query(
            'UPDATE mensajes_contacto SET estado = $1 WHERE id = $2',
            ['leído', id]
        );

        res.json({
            success: true,
            mensaje: result.rows[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el mensaje'
        });
    }
});

// Ruta para obtener estadísticas
app.get('/api/estadisticas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estadisticas_mensajes');
        
        res.json({
            success: true,
            estadisticas: result.rows[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

// Ruta para obtener mensajes pendientes
app.get('/api/mensajes-pendientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mensajes_pendientes');
        
        res.json({
            success: true,
            pendientes: result.rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes pendientes'
        });
    }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend funcionando correctamente' });
});

// Servir index.html para todas las rutas no-API (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
    console.log(`✓ Conectado a PostgreSQL`);
});
