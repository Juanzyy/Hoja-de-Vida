-- ==================== SCRIPT COMPLETO DE BASE DE DATOS ====================
-- PostgreSQL - Hoja de Vida
-- Este script crea toda la estructura de BD y contiene consultas útiles

-- ==================== CREAR TABLAS ====================

-- Crear tabla de mensajes
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

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria_mensajes (
    id SERIAL PRIMARY KEY,
    mensaje_id INTEGER NOT NULL REFERENCES mensajes_contacto(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles TEXT
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_email ON mensajes_contacto(email);
CREATE INDEX idx_estado ON mensajes_contacto(estado);
CREATE INDEX idx_fecha_creacion ON mensajes_contacto(fecha_creacion);
CREATE INDEX idx_asunto ON mensajes_contacto(asunto);

-- Crear vista para mensajes pendientes
CREATE OR REPLACE VIEW mensajes_pendientes AS
SELECT id, nombre, email, asunto, fecha_creacion
FROM mensajes_contacto
WHERE estado = 'pendiente'
ORDER BY fecha_creacion DESC;

-- Crear vista para estadísticas
CREATE OR REPLACE VIEW estadisticas_mensajes AS
SELECT 
    COUNT(*) as total_mensajes,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'leído' THEN 1 END) as leidos,
    COUNT(CASE WHEN estado = 'respondido' THEN 1 END) as respondidos,
    DATE(CURRENT_TIMESTAMP) as fecha_consulta
FROM mensajes_contacto;

-- Crear función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_fecha
BEFORE UPDATE ON mensajes_contacto
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Crear función para auditoría (UPDATE)
CREATE OR REPLACE FUNCTION registrar_auditoria_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_mensajes (mensaje_id, accion, detalles)
    VALUES (NEW.id, 'actualización', 'Estado cambió de ' || OLD.estado || ' a ' || NEW.estado);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear función para auditoría (DELETE)
CREATE OR REPLACE FUNCTION registrar_auditoria_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_mensajes (mensaje_id, accion, detalles)
    VALUES (OLD.id, 'eliminación', 'Mensaje eliminado');
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auditoría en UPDATE
CREATE TRIGGER trigger_auditoria_update
AFTER UPDATE ON mensajes_contacto
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria_update();

-- Crear trigger para auditoría en DELETE (BEFORE para capturar antes de eliminar)
CREATE TRIGGER trigger_auditoria_delete
BEFORE DELETE ON mensajes_contacto
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria_delete();

-- ==================== INSERTAR DATOS DE EJEMPLO ====================

INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje, estado, ip_origen)
VALUES 
    ('Juan Test', 'juan@example.com', 'Mensaje de prueba', 'Este es un mensaje de prueba para la base de datos', 'pendiente', '192.168.1.1'),
    ('María Test', 'maria@example.com', 'Consulta sobre servicios', 'Me gustaría saber más sobre los servicios', 'leído', '192.168.1.2')
ON CONFLICT DO NOTHING;

-- ==================== CONSULTAS ÚTILES ====================

-- 1. Ver todos los mensajes
SELECT id, nombre, email, asunto, estado, fecha_creacion
FROM mensajes_contacto
ORDER BY fecha_creacion DESC;

-- 2. Contar total de mensajes
SELECT COUNT(*) as total_mensajes FROM mensajes_contacto;

-- 3. Ver estadísticas
SELECT * FROM estadisticas_mensajes;

-- 4. Ver solo mensajes pendientes
SELECT * FROM mensajes_pendientes;

-- 5. Mensajes por estado (con conteo)
SELECT estado, COUNT(*) as cantidad
FROM mensajes_contacto
GROUP BY estado
ORDER BY cantidad DESC;

-- 6. Mensajes de los últimos 7 días
SELECT id, nombre, email, asunto, fecha_creacion
FROM mensajes_contacto
WHERE fecha_creacion >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY fecha_creacion DESC;

-- 7. Buscar mensajes por email
SELECT * FROM mensajes_contacto
WHERE email ILIKE '%gmail%'
ORDER BY fecha_creacion DESC;

-- 8. Contar mensajes por dominio de email
SELECT 
    SUBSTRING(email, POSITION('@' IN email) + 1) as dominio,
    COUNT(*) as cantidad
FROM mensajes_contacto
GROUP BY dominio
ORDER BY cantidad DESC;

-- 9. Ver historial de cambios de un mensaje
SELECT 
    m.id,
    m.nombre,
    m.asunto,
    a.accion,
    a.detalles,
    a.fecha
FROM mensajes_contacto m
LEFT JOIN auditoria_mensajes a ON m.id = a.mensaje_id
WHERE m.id = 1
ORDER BY a.fecha DESC;

-- 10. Marcar un mensaje como leído
UPDATE mensajes_contacto 
SET estado = 'leído' 
WHERE id = 1;

-- 11. Marcar un mensaje como respondido
UPDATE mensajes_contacto 
SET estado = 'respondido' 
WHERE id = 1;

-- 12. Actualizar el estado de múltiples mensajes
UPDATE mensajes_contacto 
SET estado = 'leído' 
WHERE fecha_creacion < CURRENT_TIMESTAMP - INTERVAL '3 days'
AND estado = 'pendiente';

-- 13. Eliminar un mensaje específico (también elimina auditoria)
DELETE FROM mensajes_contacto 
WHERE id = 1;

-- 14. Eliminar mensajes muy antiguos
DELETE FROM mensajes_contacto 
WHERE fecha_creacion < CURRENT_TIMESTAMP - INTERVAL '1 year';

-- 15. Reporte de mensajes por mes
SELECT 
    DATE_TRUNC('month', fecha_creacion)::date as mes,
    COUNT(*) as total,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'respondido' THEN 1 END) as respondidos
FROM mensajes_contacto
GROUP BY mes
ORDER BY mes DESC;

-- 16. Top 10 personas que más han contactado
SELECT 
    email,
    nombre,
    COUNT(*) as total_mensajes,
    MAX(fecha_creacion) as ultimo_mensaje
FROM mensajes_contacto
GROUP BY email, nombre
ORDER BY total_mensajes DESC
LIMIT 10;

-- 17. Duración promedio de respuesta
SELECT 
    AVG(EXTRACT(EPOCH FROM (fecha_actualizacion - fecha_creacion))/3600)::numeric(5,2) as horas_promedio
FROM mensajes_contacto
WHERE estado = 'respondido';

-- 18. Copiar a archivo CSV (descomenta para usar)
-- \COPY (
--     SELECT id, nombre, email, asunto, estado, fecha_creacion
--     FROM mensajes_contacto
--     ORDER BY fecha_creacion DESC
-- ) TO '/tmp/mensajes_export.csv' WITH CSV HEADER;

-- 19. Copiar datos JSON
SELECT json_agg(row_to_json(t)) FROM (
    SELECT * FROM mensajes_contacto ORDER BY fecha_creacion DESC
) t;

-- 20. Optimizar la tabla (ejecutar por separado, fuera de transacción)
-- VACUUM ANALYZE mensajes_contacto;

-- 21. Ver tamaño de la tabla
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename = 'mensajes_contacto';

-- 22. Ver índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'mensajes_contacto';

-- ==================== FIN DEL SCRIPT ====================
SELECT 'Base de datos creada exitosamente' as mensaje;
SELECT COUNT(*) as total_tablas FROM information_schema.tables WHERE table_schema = 'public';
