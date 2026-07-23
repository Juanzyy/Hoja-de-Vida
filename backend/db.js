const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexiones a PostgreSQL
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DB_URL;
const port = Number.parseInt(process.env.DB_PORT || '', 10);

const poolConfig = databaseUrl
    ? {
        connectionString: databaseUrl
    }
    : {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: Number.isFinite(port) ? port : 5432,
        database: process.env.DB_NAME || 'hoja_de_vida'
    };

const pool = new Pool(poolConfig);

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
