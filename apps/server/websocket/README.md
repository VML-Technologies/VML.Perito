# Sistema de WebSockets - Movilidad Mundial

Un sistema extensible de WebSockets para notificaciones en tiempo real, actualizaciones de datos y comunicación bidireccional.

## 🚀 Características

- ✅ **Autenticación JWT**: Todos los WebSockets están protegidos con autenticación JWT
- ✅ **Sistema RBAC**: Permisos basados en roles para diferentes funcionalidades
- ✅ **Notificaciones**: Sistema completo de notificaciones tipificadas
- ✅ **Tiempo Real**: Actualizaciones de datos en tiempo real por canales
- ✅ **Salas**: Sistema de salas para comunicación grupal
- ✅ **Extensible**: Fácil agregar nuevos eventos y funcionalidades
- ✅ **Escalable**: Arquitectura modular y bien estructurada

## 📁 Estructura

```
websocket/
├── socketManager.js      # Gestor principal de WebSockets
├── notificationHandler.js # Manejo de notificaciones
├── realtimeHandler.js   # Actualizaciones en tiempo real
├── index.js             # Sistema principal (entry point)
└── README.md           # Esta documentación
```

## 🔧 Configuración

### 1. Instalación

El sistema se inicializa automáticamente al arrancar el servidor Express:

```javascript
import webSocketSystem from './websocket/index.js';

// En el startServer()
await webSocketSystem.initialize(server);
```

### 2. Variables de Entorno

```env
JWT_SECRET=tu_secreto_jwt
FRONTEND_URL=http://192.168.20.6:5173
```

## 📡 Conexión desde el Cliente

### JavaScript/React

```javascript
import { io } from 'socket.io-client';

const socket = io('http://192.168.20.6:3000', {
  auth: {
    token: 'tu_jwt_token_aqui',
  },
});

socket.on('connect', () => {
  console.log('Conectado al WebSocket');
});
```

### Eventos de Conexión

```javascript
// Confirmación de conexión exitosa
socket.on('connected', (data) => {
  console.log('Usuario conectado:', data);
});

// Errores de conexión
socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error.message);
});
```

## 📢 Sistema de Notificaciones

### Tipos de Notificaciones Disponibles

- `system` - Notificaciones del sistema
- `user` - Relacionadas con usuarios
- `security` - Alertas de seguridad
- `document` - Documentos
- `rbac` - Roles y permisos

### Escuchar Notificaciones

```javascript
socket.on('notification', (notification) => {
  console.log('Nueva notificación:', {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    priority: notification.priority, // low, normal, high, urgent
    timestamp: notification.timestamp,
  });
});
```

### Enviar Notificaciones (Backend)

```javascript
import webSocketSystem from './websocket/index.js';

// A un usuario específico
await webSocketSystem.sendNotification(userId, {
  type: 'user',
  title: 'Perfil actualizado',
  message: 'Tu perfil ha sido actualizado exitosamente.',
  priority: 'normal',
});

// A un rol específico
await webSocketSystem.sendNotificationToRole('super_admin', {
  type: 'system',
  title: 'Nuevo usuario',
  message: 'Se ha registrado un nuevo usuario.',
});

// Broadcast a todos
await webSocketSystem.broadcastNotification({
  type: 'system',
  title: 'Mantenimiento',
  message: 'El sistema estará en mantenimiento.',
});
```

## 📊 Actualizaciones en Tiempo Real

### Suscribirse a Canales

```javascript
// Suscribirse a canales de datos
socket.emit('subscribe_to_data', {
  channels: ['users', 'roles', 'documents'],
});

socket.on('subscribed_to_data', (data) => {
  console.log('Suscrito a:', data.channels);
});
```

### Recibir Actualizaciones

```javascript
socket.on('data_update', (update) => {
  console.log('Actualización recibida:', {
    channel: update.channel,
    data: update.data,
    timestamp: update.timestamp,
  });
});
```

### Canales Disponibles

- `users` - Cambios en usuarios
- `roles` - Cambios en roles
- `permissions` - Cambios en permisos
- `documents` - Cambios en documentos
- `system` - Datos del sistema

## 🏠 Sistema de Salas

### Unirse a Salas

```javascript
socket.emit('join_room', { roomName: 'mi_sala' });

socket.on('joined_room', (data) => {
  console.log('Unido a sala:', data.roomName);
});
```

### Salir de Salas

```javascript
socket.emit('leave_room', { roomName: 'mi_sala' });

socket.on('left_room', (data) => {
  console.log('Salió de sala:', data.roomName);
});
```

## 🎮 Eventos Disponibles

### Eventos del Cliente → Servidor

| Evento                  | Descripción                  | Permisos       |
| ----------------------- | ---------------------------- | -------------- |
| `ping`                  | Test de conectividad         | Ninguno        |
| `test_connection`       | Prueba de conexión           | Ninguno        |
| `join_room`             | Unirse a sala                | Ninguno        |
| `leave_room`            | Salir de sala                | Ninguno        |
| `get_connected_users`   | Obtener usuarios conectados  | `users.read`   |
| `subscribe_to_data`     | Suscribirse a canales        | Según canal    |
| `get_realtime_data`     | Obtener datos en tiempo real | Según canal    |
| `get_system_stats`      | Estadísticas del sistema     | `system.read`  |
| `send_admin_message`    | Enviar mensaje a admin       | `admin.notify` |
| `broadcast_maintenance` | Aviso de mantenimiento       | `super_admin`  |

### Eventos del Servidor → Cliente

| Evento            | Descripción                  |
| ----------------- | ---------------------------- |
| `connected`       | Confirmación de conexión     |
| `notification`    | Nueva notificación           |
| `data_update`     | Actualización de datos       |
| `connected_users` | Lista de usuarios conectados |
| `system_stats`    | Estadísticas del sistema     |
| `error`           | Error en operación           |

## 🔧 Extensión del Sistema

### Agregar Nuevos Eventos

```javascript
// En cualquier parte de tu aplicación
import webSocketSystem from './websocket/index.js';

const socketManager = webSocketSystem.getSocketManager();

socketManager.registerEventHandler('mi_evento_personalizado', async (socket, data) => {
  // Tu lógica aquí
  console.log('Evento personalizado recibido:', data);

  // Responder al cliente
  socket.emit('mi_respuesta', {
    mensaje: 'Evento procesado',
    timestamp: new Date().toISOString(),
  });
});
```

### Agregar Nuevos Tipos de Notificaciones

```javascript
const notificationHandler = webSocketSystem.getNotificationHandler();

notificationHandler.registerNotificationType('mi_tipo', {
  icon: 'custom-icon',
  color: '#ff6b6b',
  sound: true,
  description: 'Mi tipo personalizado de notificación',
});
```

### Agregar Nuevos Canales de Datos

```javascript
const realtimeHandler = webSocketSystem.getRealtimeHandler();

// Extender los métodos getChannelData y hasChannelPermission
// en realtimeHandler.js para agregar nuevos canales
```

## 📈 Monitoreo y Estadísticas

### API REST para Estadísticas

```bash
# Obtener estadísticas completas (requiere permisos system.read)
GET /api/websocket/stats

# Obtener usuarios conectados (requiere permisos users.read)
GET /api/websocket/connected-users
```

### Estadísticas en Tiempo Real

```javascript
socket.emit('get_system_stats');

socket.on('system_stats', (stats) => {
  console.log('Estadísticas:', {
    conexiones: stats.websocket.totalConnections,
    canales: stats.realtime.totalChannels,
    uptime: stats.server.uptime,
  });
});
```

## 🧪 Pruebas

### Ejecutar Pruebas del Sistema

```bash
cd apps/server
node test-websockets.js
```

### Pruebas Incluidas

- ✅ Autenticación JWT
- ✅ Conexión y desconexión
- ✅ Ping/Pong
- ✅ Salas personalizadas
- ✅ Suscripción a canales
- ✅ Obtener usuarios conectados
- ✅ Estadísticas del sistema

## 🔒 Seguridad

### Autenticación

- Todos los WebSockets requieren token JWT válido
- Verificación automática de usuario en base de datos
- Carga automática de roles y permisos

### Autorización

- Verificación de permisos por evento
- Control de acceso basado en roles (RBAC)
- Aislamiento por salas y canales

### Mejores Prácticas

1. **Siempre verificar permisos** antes de procesar eventos
2. **Validar datos de entrada** en todos los eventos
3. **Usar salas** para aislar comunicaciones
4. **Limpiar recursos** al desconectar usuarios
5. **Monitorear conexiones** para detectar anomalías

## 🚀 Casos de Uso

### 1. Notificaciones de Usuario

```javascript
// Cuando se actualiza un perfil
await webSocketSystem.sendNotification(userId, {
  type: 'user',
  title: 'Perfil actualizado',
  message: 'Tu información ha sido actualizada.',
});
```

### 2. Actualizaciones de Dashboard

```javascript
// Suscribirse a datos del dashboard
socket.emit('subscribe_to_data', { channels: ['system', 'users'] });

// Recibir actualizaciones automáticamente
socket.on('data_update', (update) => {
  if (update.channel === 'system') {
    updateDashboardStats(update.data);
  }
});
```

### 3. Chat de Soporte

```javascript
// Unirse a sala de soporte
socket.emit('join_room', { roomName: `support_${ticketId}` });

// Enviar mensaje al soporte
socket.emit('send_admin_message', {
  message: 'Necesito ayuda con...',
  priority: 'high',
});
```

### 4. Colaboración en Tiempo Real

```javascript
// Notificar cambios en documentos
await webSocketSystem.broadcastDataUpdate('documents', {
  type: 'document_change',
  changeType: 'updated',
  documentId: docId,
  data: updatedDocument,
});
```

## 📝 Notas de Desarrollo

- El sistema está diseñado para ser **stateless** y **escalable**
- Todas las operaciones son **asíncronas** y manejan errores gracefully
- La arquitectura es **modular** y permite extensiones fáciles
- Se incluye **logging** detallado para debugging
- Compatible con **clustering** y **load balancing**

## 🔮 Futuras Mejoras

- [ ] Persistencia de notificaciones en base de datos
- [ ] Cola de mensajes para usuarios desconectados
- [ ] Métricas avanzadas y analytics
- [ ] Integración con servicios externos (email, SMS)
- [ ] Compresión de mensajes para optimizar ancho de banda
- [ ] Soporte para múltiples instancias (Redis adapter)
