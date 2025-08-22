
# Patrones de Desarrollo Core - VML.Perito

## Patrones de Configuración

### Variables de Entorno en Scripts

**CRÍTICO**: Todos los scripts de seeding deben cargar variables de entorno con ruta explícita:

```javascript
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANTE: Ruta explícita al archivo .env
dotenv.config({ path: path.join(__dirname, '../.env') });
```

**Problema común**: Si usas solo `dotenv.config()` en scripts, puede fallar la conexión a base de datos.

## Patrones de Controladores

### BaseController Pattern

Todos los controladores heredan de [apps/server/controllers/baseController.js](mdc:apps/server/controllers/baseController.js):

```javascript
import { BaseController } from './baseController.js';
import MyModel from '../models/myModel.js';

class MyController extends BaseController {
  constructor() {
    super(MyModel);

    // IMPORTANTE: Bind de métodos para preservar contexto
    this.index = this.index.bind(this);
    this.store = this.store.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
    this.customMethod = this.customMethod.bind(this);
  }

  // Sobrescribir métodos base si es necesario
  async store(req, res) {
    try {
      // Lógica personalizada
      const entity = await this.model.create(req.body);
      
      res.status(201).json({
        success: true,
        data: entity,
        message: 'Entidad creada exitosamente'
      });
    } catch (error) {
      console.error('Error en store:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
```

## Patrones de Modelos Sequelize

### BaseModel Pattern

Todos los modelos heredan de [apps/server/models/baseModel.js](mdc:apps/server/models/baseModel.js):

```javascript
import { BaseModel } from './baseModel.js';

const MyModel = BaseModel.define('MyModel', {
  // Definir campos
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Configuración específica del modelo
  tableName: 'my_models',
  underscored: true,
  timestamps: true,
  paranoid: true
});

export default MyModel;
```

### Relaciones en models/index.js

```javascript
// Definir todas las relaciones en apps/server/models/index.js
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
});
```

## Patrones Frontend React

### Componentes con RBAC

```javascript
import PermissionGate from '../components/PermissionGate.jsx';
import { useRBAC } from '../contexts/rbac-context.jsx';

function MyComponent() {
  const { hasPermission } = useRBAC();

  return (
    <div>
      {/* Renderizado condicional */}
      {hasPermission('users.create') && <CreateUserButton />}

      {/* O usando PermissionGate */}
      <PermissionGate permission="users.read">
        <UsersList />
      </PermissionGate>
    </div>
  );
}
```

### Hooks Personalizados

```javascript
// Patrón para hooks personalizados
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context.jsx';

export function useCustomHook() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lógica del hook
  }, [token]);

  return { data, loading, error };
}
```

### WebSocket Integration

```javascript
import { useWebSocket } from '../hooks/use-websocket.js';

function MyComponent() {
  const { isConnected, sendMessage } = useWebSocket();

  useEffect(() => {
    // Escuchar eventos en tiempo real
    const handleEvent = (data) => {
      // Procesar evento
    };

    window.addEventListener('myEvent', handleEvent);
    return () => window.removeEventListener('myEvent', handleEvent);
  }, []);

  return (
    <div>
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? 'Conectado' : 'Desconectado'}
      </div>
    </div>
  );
}
```

## Patrones de WebSockets

### Integración en Controladores

```javascript
import webSocketSystem from '../websocket/index.js';

// Patrón para notificaciones automáticas
async function notifyUsers(eventName, data) {
  try {
    // Enviar notificación por WebSocket
    webSocketSystem.sendNotification({
      event: eventName,
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error enviando notificación WebSocket:', error);
  }
}
```

## Testing

### Scripts de Prueba

```javascript
// Patrón para scripts de prueba del backend
import http from 'http';

async function testEndpoint() {
  try {
    // 1. Hacer login
    const token = await login();

    // 2. Probar endpoint
    const result = await makeRequest('/api/endpoint', token);

    // 3. Verificar resultado
    console.log('✅ Test exitoso:', result);
  } catch (error) {
    console.error('❌ Test falló:', error);
  }
}
```

### Checklist de Testing

- [ ] Validación de datos en modelo Sequelize
- [ ] Verificación de permisos en frontend
- [ ] Manejo de errores sin exponer información sensible
- [ ] Logs de accesos y errores
- [ ] Tokens JWT con expiración apropiada

## Patrones de Agendamiento

### Horarios Flexibles

```javascript
// Patrón para manejo de horarios
const scheduleTemplate = {
  sede_id: 1,
  modality_id: 1,
  day_pattern: '1,2,3,4,5', // Lunes a viernes
  start_time: '07:00',
  end_time: '17:00',
  interval_minutes: 60,
  capacity_per_slot: 5,
};
```

### Validación de Capacidad

```javascript
// Verificar disponibilidad antes de agendar
const availableSlots = await ScheduleTemplate.getAvailableSlots({
  sede_id: sedeId,
  modality_id: modalityId,
  date: appointmentDate,
});

if (availableSlots.length === 0) {
  throw new Error('No hay horarios disponibles');
}
```

## Patrones de Contact Center

### Asignación de Agentes

```javascript
// Patrón para asignación dinámica
const assignAgent = async (orderId, agentId) => {
  const order = await InspectionOrder.findByPk(orderId);
  const previousAgentId = order.assigned_agent_id;

  await order.update({ assigned_agent_id: agentId });

  // Notificar cambios
  if (previousAgentId && previousAgentId !== agentId) {
    await notifyAgentRemoval(previousAgentId, order);
    await notifyAgentAssignment(agentId, order);
  }
};
```

### Registro de Llamadas

```javascript
// Patrón para logging de llamadas
const logCall = async (orderId, agentId, callData) => {
  const callLog = await CallLog.create({
    inspection_order_id: orderId,
    agent_id: agentId,
    status_id: callData.status_id,
    observaciones: callData.observaciones,
    fecha_seguimiento: callData.fecha_seguimiento,
    call_time: new Date(),
  });

  // Actualizar estado de orden si es necesario
  if (callData.status_id === 'contacto_exitoso') {
    await updateOrderStatus(orderId, 'en_gestion');
  }
};
```

## 📚 Referencias Relacionadas

- [**Patrones Backend**](./backend-development-patterns.md) - Patrones backend específicos
- [**Patrones Frontend**](./frontend-development-patterns.md) - Patrones frontend específicos
- [**Sistema Principal**](./vml-perito-system.md) - Arquitectura del sistema
- [**API Controllers**](./api-controllers.md) - Patrones de controladores
- [**Base de Datos**](./database-seeding.md) - Configuración y seeding

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado
