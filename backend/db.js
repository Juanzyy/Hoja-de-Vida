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

const schemaSql = `
CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'leído', 'respondido')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_email ON mensajes_contacto(email);
CREATE INDEX IF NOT EXISTS idx_estado ON mensajes_contacto(estado);
CREATE INDEX IF NOT EXISTS idx_fecha_creacion ON mensajes_contacto(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_asunto ON mensajes_contacto(asunto);

CREATE OR REPLACE VIEW mensajes_pendientes AS
SELECT id, nombre, email, asunto, fecha_creacion
FROM mensajes_contacto
WHERE estado = 'pendiente'
ORDER BY fecha_creacion DESC;

CREATE OR REPLACE VIEW estadisticas_mensajes AS
SELECT
    COUNT(*) as total_mensajes,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'leído' THEN 1 END) as leidos,
    COUNT(CASE WHEN estado = 'respondido' THEN 1 END) as respondidos,
    DATE(CURRENT_TIMESTAMP) as fecha_consulta
FROM mensajes_contacto;

CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_fecha ON mensajes_contacto;
CREATE TRIGGER trigger_actualizar_fecha
BEFORE UPDATE ON mensajes_contacto
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_actualizacion();
`;

// Manejador de errores de conexión
pool.on('error', (err) => {
    console.error('Error en pool de conexiones:', err);
});

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        await client.query(schemaSql);
        console.log('✓ Esquema de base de datos inicializado correctamente');
    } finally {
        client.release();
    }
}

// Función para conectar a la BD
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a PostgreSQL:', err);
    } else {
        console.log('✓ Conectado a PostgreSQL exitosamente');
        release();
        initializeDatabase().catch(schemaError => {
            console.error('Error inicializando esquema:', schemaError);
        });
    }
});

// Exportar pool
module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
