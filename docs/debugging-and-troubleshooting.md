# Debugging and Troubleshooting

## Common Issues and Solutions

### 1. Loop Infinito de Notificaciones

**Síntomas:**

- Múltiples listeners duplicados para el mismo evento
- Logs repetitivos de notificaciones
- Sistema lento o no responsivo

**Causa:**

- Múltiples llamadas a `createDefaultListeners()`
- Falta de patrón "find or create"

**Solución:**

```javascript
// ✅ Correct: Use find or create pattern
const result = await this.eventRegistry.findOrCreateEvent(
  eventName,
  description,
  category,
  metadata
);

if (result.created) {
  console.log('✅ Event created');
} else {
  console.log('⏭️ Event already exists');
}
```

**Script de Limpieza:**

```bash
cd apps/server && node scripts/cleanupDuplicateListeners.js
```

### 2. Error: "Cannot read properties of undefined (reading 'templateService')"

**Síntomas:**

- Error 500 en endpoints de templates
- `this.templateService` es undefined

**Causa:**

- Falta de binding de métodos en controladores

**Solución:**

```javascript
// ✅ Correct: Bind methods in constructor
constructor() {
  super(Model);
  this.index = this.index.bind(this);
  this.store = this.store.bind(this);
  this.update = this.update.bind(this);
  this.destroy = this.destroy.bind(this);
}
```

### 3. Error: "EventRegistry.trigger is not a function"

**Síntomas:**

- Error durante login o creación de entidades
- `TypeError: EventRegistry.trigger is not a function`

**Causa:**

- Uso incorrecto de EventRegistry directamente

**Solución:**

```javascript
// ❌ Incorrect: Direct EventRegistry usage
import EventRegistry from '../services/eventRegistry.js';
await EventRegistry.trigger('user.login', data);

// ✅ Correct: Use AutomatedEventTriggers
import automatedEventTriggers from '../services/automatedEventTriggers.js';
await automatedEventTriggers.triggerUserEvents('login', userData, context);
```

### 4. Error: "getNotificationTypeByName is not a function"

**Síntomas:**

- Error durante inicialización de listeners
- `TypeError: this.eventService.notificationService.getNotificationTypeByName is not a function`

**Causa:**

- Método faltante en NotificationService

**Solución:**

```javascript
// ✅ Correct: Add missing method to NotificationService
async getNotificationTypeByName(name) {
  try {
    const notificationType = await NotificationType.findOne({
      where: { name: name }
    });
    return notificationType;
  } catch (error) {
    console.error(`❌ Error obteniendo tipo de notificación por nombre ${name}:`, error);
    return null;
  }
}
```

### 5. Error 403: "No tienes permiso para realizar esta acción"

**Síntomas:**

- Error 403 al acceder a `/api/templates`
- Usuario sin permisos

**Causa:**

- Permisos RBAC faltantes

**Solución:**

```javascript
// ✅ Correct: Add permissions to RBAC seeder
const permissions = [
  {
    name: 'templates.read',
    description: 'Ver plantillas de notificación',
    resource: 'templates',
    action: 'read',
  },
  {
    name: 'templates.create',
    description: 'Crear plantillas de notificación',
    resource: 'templates',
    action: 'create',
  },
  // ... más permisos
];
```

### 6. Toast Notifications No Funcionan

**Síntomas:**

- Toasts no aparecen o no desaparecen
- `showToast` no funciona

**Causa:**

- Implementación incorrecta del hook

**Solución:**

```javascript
// ✅ Correct: Toast implementation with auto-hide
const showToast = useCallback((message, type = 'info') => {
  setToast({ message, type });
  // Auto-hide después de 5 segundos
  setTimeout(() => {
    setToast(null);
  }, 5000);
}, []);
```

### 7. Campos Inconsistentes Entre Frontend y Backend

**Síntomas:**

- Errores de mapeo de datos
- Campos faltantes en templates

**Causa:**

- Falta de estandarización de campos

**Solución:**

```javascript
// ✅ Correct: Standardized field mapping
const mapEditorDataToAPI = (editorData) => {
  return {
    ...editorData,
    channels: {
      email: {
        subject: editorData.channels?.email?.subject || '',
        template: editorData.channels?.email?.template || '',
        body: editorData.channels?.email?.body || '',
        html: editorData.channels?.email?.html || '',
        text: editorData.channels?.email?.text || '',
      },
      // ... otros canales
    },
  };
};
```

## Debugging Tools

### 1. Scripts de Prueba

```bash
# Probar sistema completo
cd apps/server && node scripts/testNotificationSystem.js

# Probar eventos automáticos
cd apps/server && node scripts/testAutomatedEvents.js

# Limpiar duplicados
cd apps/server && node scripts/cleanupDuplicateListeners.js
```

### 2. Logs de Debugging

```javascript
// ✅ Correct: Comprehensive logging
console.log('🎯 Event triggered:', eventName);
console.log('📬 Creating notification type:', notificationType);
console.log('📤 Notification sent by listener:', listenerId);
console.log('⚠️ No active configurations for:', notificationType);
```

### 3. Verificación de Estado

```javascript
// ✅ Correct: Check system state
const stats = await automatedEventTriggers.getStats();
console.log('📊 System stats:', JSON.stringify(stats, null, 2));

// Check listeners count
const listeners = await eventService.getEventListeners('inspection_order.created');
console.log(`📊 Listeners for inspection_order.created: ${listeners.length}`);
```

## Testing Patterns

### 1. Event Testing

```javascript
// ✅ Correct: Test event triggering
await automatedEventTriggers.triggerInspectionOrderEvents(
  'created',
  {
    id: 999,
    numero: 'TEST-001',
    nombre_cliente: 'Cliente de Prueba',
    tipo_vehiculo: 'Automóvil',
    status: 'Nueva',
    sede_name: 'Sede de Prueba',
  },
  {
    created_by: testUser?.id || 1,
    ip_address: '127.0.0.1',
  }
);
```

### 2. Template Testing

```javascript
// ✅ Correct: Test template creation
const testTemplate = {
  name: 'Test Template',
  description: 'Test template for debugging',
  channels: {
    email: {
      subject: 'Test Subject',
      template: 'Hello {{user.name}}, this is a test.',
    },
    sms: {
      message: 'Test SMS message',
    },
  },
};
```

## Prevention Strategies

### 1. Always Use Find or Create

```javascript
// ✅ Correct: Prevent duplicates
const result = await this.findOrCreateListener(listenerData);
if (result.created) {
  console.log('✅ Listener created');
} else {
  console.log('⏭️ Listener already exists');
}
```

### 2. Validate Before Operations

```javascript
// ✅ Correct: Validate before operations
if (!this.isInitialized) {
  console.warn('⚠️ Service not initialized');
  return;
}

if (!this.eventService) {
  throw new Error('EventService not initialized');
}
```

### 3. Proper Error Handling

```javascript
// ✅ Correct: Comprehensive error handling
try {
  await this.triggerEvent(eventName, data, context);
} catch (error) {
  console.error(`❌ Error triggering event ${eventName}:`, error);
  // Don't throw - log and continue
}
```

## Key Files for Debugging

- **Test Scripts** ([apps/server/scripts/testNotificationSystem.js](mdc:apps/server/scripts/testNotificationSystem.js))
- **Cleanup Script** ([apps/server/scripts/cleanupDuplicateListeners.js](mdc:apps/server/scripts/cleanupDuplicateListeners.js))
- **System Status** ([todo/notification_system.md](mdc:todo/notification_system.md))
- **Backend Standards** ([docs/notification_standards.md](mdc:docs/notification_standards.md))
- **Frontend Standards** ([docs/frontend_notification_standards.md](mdc:docs/frontend_notification_standards.md))
- **Webhook System** ([todo/webhook_notificaciones.md](mdc:todo/webhook_notificaciones.md))
- **Seeders Adjustment** ([todo/seeders_adjustment.md](mdc:todo/seeders_adjustment.md))

## Estado Actual del Sistema (2024)

### ✅ Funcionalidades Validadas
- **Sistema de Notificaciones**: Completamente operativo sin duplicaciones
- **Interfaz de Administración**: Integrada en [Admin.jsx](mdc:apps/web/src/pages/Admin.jsx)
- **WebSockets**: Sistema de tiempo real funcionando
- **RBAC**: Sistema de permisos implementado
- **Seeders**: Configuración granular de listeners y plantillas

### 🔧 Problemas Resueltos
- **Duplicación de Notificaciones**: Solucionado con deduplicación en `notificationService.js`
- **Listeners Antiguos**: Limpiados con `cleanupOldListeners.js`
- **WebSocket Duplicación**: Identificado en `notificationHandler.js`
- **Condiciones de Evaluación**: Simplificadas para frontend-friendly

### 📋 Archivos Críticos Actualizados
- [apps/server/services/eventService.js](mdc:apps/server/services/eventService.js) - Evaluación de condiciones
- [apps/server/services/notificationService.js](mdc:apps/server/services/notificationService.js) - Deduplicación
- [apps/server/scripts/seedAdvancedListeners.js](mdc:apps/server/scripts/seedAdvancedListeners.js) - Listeners granulares
- [apps/server/scripts/seedAdvancedTemplates.js](mdc:apps/server/scripts/seedAdvancedTemplates.js) - Plantillas específicas

## Emergency Procedures

### 1. Stop Infinite Loops

```bash
# Detener el servidor inmediatamente
Ctrl+C

# Limpiar duplicados
cd apps/server && node scripts/cleanupDuplicateListeners.js

# Reiniciar servidor
npm start
```

### 2. Reset Database (Emergency Only)

```bash
# Truncar tablas problemáticas
TRUNCATE TABLE event_listeners;
TRUNCATE TABLE events;

# Re-ejecutar seeders
cd apps/server && node scripts/seedAll.js
```

### 3. Verify System State

```bash
# Ejecutar script de prueba completo
cd apps/server && node scripts/testNotificationSystem.js
```
