# Sistema de Tareas Programadas - Movilidad Mundial

## 🎯 Descripción General

El sistema de tareas programadas permite ejecutar consultas y procesos automáticamente en horarios específicos. Actualmente implementa el marcado automático de órdenes de inspección vencidas (más de 31 días).

## 🚀 Características

- **Ejecución automática**: Tareas que se ejecutan según horarios configurados
- **Zona horaria**: Configurado para Colombia (America/Bogota)
- **Logging completo**: Registro detallado de ejecuciones y errores
- **API de gestión**: Endpoints para monitorear y ejecutar tareas manualmente
- **Cierre graceful**: Detención segura de tareas al cerrar el servidor

## 📋 Tareas Implementadas

### 1. Marcado de Órdenes Vencidas

**Horario**: Diario a medianoche (00:00)
**Expresión Cron**: `0 0 * * *`
**Descripción**: Marca automáticamente como vencidas las órdenes de inspección con más de 31 días

**Consulta SQL equivalente**:
```sql
UPDATE inspection_orders 
SET status = 6 
WHERE status != 6 
AND created_at < DATEADD(dd, -31, GETDATE())
```

**Funcionalidad**:
- Busca órdenes creadas hace más de 31 días
- Excluye órdenes que ya están marcadas como vencidas (status = 6)
- Actualiza el status a 6 (vencida) y el timestamp de actualización
- Registra cantidad de órdenes encontradas y actualizadas
- Muestra las órdenes que fueron marcadas como vencidas
- Proporciona logging detallado del proceso

## 🔧 Configuración

### Variables de Entorno

No se requieren variables adicionales. El sistema usa la configuración existente de base de datos.

### Inicialización

El servicio se inicializa automáticamente al arrancar el servidor:

```javascript
// En index.js
scheduledTasksService.start();
```

## 📡 API Endpoints

### Obtener Estado del Servicio

```http
GET /api/scheduled-tasks/status
Authorization: Bearer <token>
Permission: system.read
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Estado del servicio de tareas programadas obtenido exitosamente",
  "data": {
    "isRunning": true,
    "tasksCount": 1,
    "tasks": ["marcar-ordenes-vencidas"]
  }
}
```

### Ejecutar Tarea Manualmente

```http
POST /api/scheduled-tasks/execute/marcar-ordenes-vencidas
Authorization: Bearer <token>
Permission: system.admin
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Tarea \"marcar-ordenes-vencidas\" ejecutada exitosamente",
  "data": {
    "success": true,
    "ordenesEncontradas": 15,
    "ordenesActualizadas": 15,
    "fechaConsulta": "2024-01-15T00:00:00.000Z",
    "fechaLimite": "2023-12-15T00:00:00.000Z",
    "ordenes": [
      {
        "id": 123,
        "numero": "ORD-001",
        "nombre_cliente": "Juan Pérez",
        "status_anterior": 1,
        "status_nuevo": 6,
        "created_at": "2023-12-10T10:30:00.000Z"
      }
    ]
  }
}
```

### Obtener Tareas Disponibles

```http
GET /api/scheduled-tasks/available
Authorization: Bearer <token>
Permission: system.read
```

### Obtener Logs de Ejecución

```http
GET /api/scheduled-tasks/logs
Authorization: Bearer <token>
Permission: system.read
```

## 🧪 Testing

### Script de Prueba

Ejecutar el script de prueba para verificar el funcionamiento:

```bash
npm run test:scheduled-tasks
```

Este script:
1. Conecta a la base de datos
2. Inicia el servicio de tareas programadas
3. Ejecuta la consulta de órdenes antiguas
4. Muestra los resultados
5. Detiene el servicio y cierra la conexión

### Ejecución Manual

También se puede ejecutar la tarea manualmente desde la API:

```bash
curl -X POST "http://localhost:3001/api/scheduled-tasks/execute/marcar-ordenes-vencidas" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

## 📊 Monitoreo

### Logs del Servidor

El sistema registra información detallada en los logs:

```
🕐 Ejecutando tarea programada: marcar-ordenes-vencidas - 2024-01-15T00:00:00.000Z
🔄 Iniciando marcado de órdenes vencidas...
📅 Marcando órdenes creadas antes de: 2023-12-15T00:00:00.000Z
📊 Se encontraron 15 órdenes para marcar como vencidas
📋 Primeras 5 órdenes que serán marcadas como vencidas:
   1. ID: 123, Número: ORD-001, Cliente: Juan Pérez, Status actual: 1, Fecha: 2023-12-10T10:30:00.000Z
   2. ID: 124, Número: ORD-002, Cliente: María García, Status actual: 2, Fecha: 2023-12-08T14:20:00.000Z
   ...
✅ Se marcaron 15 órdenes como vencidas (status = 6)
📝 Órdenes marcadas como vencidas:
   1. ID: 123, Número: ORD-001, Cliente: Juan Pérez
   2. ID: 124, Número: ORD-002, Cliente: María García
   ...
✅ Tarea "marcar-ordenes-vencidas" completada exitosamente en 250ms
```

### Estado del Servicio

Verificar que el servicio esté ejecutándose:

```bash
curl -X GET "http://localhost:3001/api/scheduled-tasks/status" \
  -H "Authorization: Bearer <token>"
```

## 🔄 Agregar Nuevas Tareas

### 1. Registrar la Tarea

En `scheduledTasksService.js`, agregar en el método `registerTasks()`:

```javascript
// Ejemplo: Tarea semanal los lunes a las 9:00 AM
this.registerTask('reporte-semanal', '0 9 * * 1', async () => {
    await this.generarReporteSemanal();
});
```

### 2. Implementar la Función

Agregar el método correspondiente:

```javascript
async generarReporteSemanal() {
    try {
        console.log('📊 Generando reporte semanal...');
        // Lógica del reporte
        console.log('✅ Reporte semanal generado exitosamente');
    } catch (error) {
        console.error('❌ Error generando reporte semanal:', error);
        throw error;
    }
}
```

### 3. Agregar al Controlador

En `scheduledTasksController.js`, agregar el caso en `executeTask()`:

```javascript
case 'reporte-semanal':
    return await this.generarReporteSemanal();
```

### 4. Actualizar Lista de Tareas

En `scheduledTasksController.js`, agregar en `getAvailableTasks()`:

```javascript
{
    name: 'reporte-semanal',
    description: 'Genera reporte semanal de actividades',
    schedule: '0 9 * * 1 (Lunes a las 9:00 AM)',
    timezone: 'America/Bogota'
}
```

## 🕐 Expresiones Cron

### Formato

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Día de la semana (0-7, 0 y 7 = Domingo)
│ │ │ └───── Mes (1-12)
│ │ └─────── Día del mes (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

### Ejemplos Comunes

- `0 0 * * *` - Diario a medianoche
- `0 9 * * 1` - Lunes a las 9:00 AM
- `0 0 1 * *` - Primer día de cada mes a medianoche
- `0 0 * * 0` - Domingo a medianoche
- `*/15 * * * *` - Cada 15 minutos
- `0 */6 * * *` - Cada 6 horas

## 🛡️ Seguridad

### Permisos Requeridos

- `system.read`: Para consultar estado y logs
- `system.admin`: Para ejecutar tareas manualmente

### Autenticación

Todas las rutas requieren autenticación JWT válida.

### Rate Limiting

Las rutas de consulta están protegidas con rate limiting (1000 req/15min).

## 🚨 Troubleshooting

### Problema: Tarea no se ejecuta

**Verificaciones**:
1. ¿El servicio está iniciado? `GET /api/scheduled-tasks/status`
2. ¿La expresión cron es válida?
3. ¿Hay errores en los logs del servidor?

### Problema: Error de base de datos

**Verificaciones**:
1. ¿La conexión a BD está activa?
2. ¿Los modelos están correctamente importados?
3. ¿Las tablas existen?

### Problema: Permisos insuficientes

**Verificaciones**:
1. ¿El usuario tiene el rol correcto?
2. ¿El permiso está asignado al rol?
3. ¿El token JWT es válido?

## 📝 Notas Técnicas

- El servicio usa `node-cron` para la programación
- Zona horaria configurada para Colombia
- Cierre graceful al recibir SIGINT/SIGTERM
- Logging detallado para debugging
- API REST para gestión y monitoreo
- Singleton pattern para el servicio
