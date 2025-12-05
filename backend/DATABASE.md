# Configuración de Base de Datos - PostgreSQL

Esta guía te muestra cómo configurar la base de datos PostgreSQL para el sistema de contactos.

## Requisitos

- PostgreSQL instalado (v12 o superior)
- pgAdmin 4 (opcional, pero recomendado)

## Instalación de PostgreSQL

### Windows

1. Descarga PostgreSQL desde https://www.postgresql.org/download/windows/
2. Ejecuta el instalador
3. Durante la instalación:
   - Elige una contraseña para el usuario `postgres`
   - Guarda esta contraseña (la necesitarás)
   - Deja el puerto por defecto: 5432
4. Instala pgAdmin 4 (incluido en el instalador)

### Mac

```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Crear la Base de Datos

### Opción 1: Usando pgAdmin (Visual)

1. Abre pgAdmin 4
2. Haz clic derecho en "Databases"
3. Selecciona "Create" → "Database"
4. Nombre: `hoja_de_vida`
5. Haz clic en "Save"
6. Haz clic derecho en la base de datos → "Query Tool"
7. Copia el contenido de `database.sql` y pégalo
8. Ejecuta la consulta

### Opción 2: Usando terminal

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE hoja_de_vida;

# Conectarse a la nueva BD
\c hoja_de_vida

# Ejecutar el script SQL
\i database.sql
```

## Estructura de la Base de Datos

### Tabla: `mensajes_contacto`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único (PK) |
| nombre | VARCHAR(100) | Nombre del remitente |
| email | VARCHAR(100) | Email del remitente |
| asunto | VARCHAR(200) | Asunto del mensaje |
| mensaje | TEXT | Contenido del mensaje |
| estado | VARCHAR(20) | pendiente, leído, respondido |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| fecha_actualizacion | TIMESTAMP | Fecha de última actualización |
| ip_origen | VARCHAR(45) | IP del remitente |
| user_agent | TEXT | Navegador del remitente |

### Tabla: `auditoria_mensajes`

Registra todos los cambios en los mensajes:
- Actualizaciones de estado
- Eliminaciones
- Cambios importantes

## Vistas disponibles

### `mensajes_pendientes`
Muestra solo los mensajes con estado "pendiente"

```sql
SELECT * FROM mensajes_pendientes;
```

### `estadisticas_mensajes`
Muestra estadísticas generales

```sql
SELECT * FROM estadisticas_mensajes;
```

## Configuración en Node.js

1. Abre el archivo `.env` en la carpeta backend
2. Actualiza las variables:

```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hoja_de_vida
```

3. Instala el driver de PostgreSQL:

```bash
npm install pg
```

## Consultas útiles

### Ver todos los mensajes
```sql
SELECT * FROM mensajes_contacto ORDER BY fecha_creacion DESC;
```

### Ver mensajes pendientes
```sql
SELECT * FROM mensajes_pendientes;
```

### Contar mensajes por estado
```sql
SELECT estado, COUNT(*) FROM mensajes_contacto GROUP BY estado;
```

### Marcar un mensaje como respondido
```sql
UPDATE mensajes_contacto SET estado = 'respondido' WHERE id = 1;
```

### Ver auditoría de un mensaje
```sql
SELECT * FROM auditoria_mensajes WHERE mensaje_id = 1;
```

### Eliminar un mensaje
```sql
DELETE FROM mensajes_contacto WHERE id = 1;
```

## Respaldo de la Base de Datos

### Crear un respaldo

```bash
pg_dump -U postgres hoja_de_vida > respaldo.sql
```

### Restaurar desde un respaldo

```bash
psql -U postgres hoja_de_vida < respaldo.sql
```

## Solución de problemas

### "connection refused"
- Verifica que PostgreSQL esté corriendo
- Comprueba que el puerto 5432 sea accesible

### "password authentication failed"
- Verifica la contraseña en `.env`
- Reinicia el servicio de PostgreSQL

### "database does not exist"
- Crea la base de datos con el comando CREATE DATABASE

## Optimización para producción

1. Configura contraseñas fuertes
2. Habilita SSL en las conexiones
3. Crea backups automáticos
4. Monitorea el uso de disk
5. Realiza mantenimiento regular (VACUUM, ANALYZE)

```sql
-- Mantenimiento
VACUUM FULL ANALYZE mensajes_contacto;
```

