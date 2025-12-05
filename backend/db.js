const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hoja_de_vida'
});

// Manejador de errores de conexión
pool.on('error', (err) => {
    console.error('Error en pool de conexiones:', err);
});

// Función para conectar a la BD
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a PostgreSQL:', err);
    } else {
        console.log('✓ Conectado a PostgreSQL exitosamente');
        release();
    }
});

// Exportar pool
module.exports = pool;
