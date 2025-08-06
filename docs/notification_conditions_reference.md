# 📋 Referencia de Condiciones para Notificaciones

## 🎯 Sistema Simplificado de Condiciones

El sistema de condiciones ha sido simplificado para ser **frontend-friendly** y evitar duplicados. Cada condición es una clave-valor simple que se evalúa contra los datos del evento.

## 📝 Estructura de Condiciones

```javascript
{
  "user_role": "comercial_mundial",
  "is_commercial_creator": true,
  "order_status": "pending"
}
```

## 🔑 Condiciones Disponibles

### 👤 **Usuario**

| Clave        | Descripción       | Valores            |
| ------------ | ----------------- | ------------------ |
| `user_id`    | ID del usuario    | `number`           |
| `user_email` | Email del usuario | `string`           |
| `user_role`  | Rol del usuario   | `string` o `array` |
| `user_roles` | Roles del usuario | `array`            |

### 📋 **Orden de Inspección**

| Clave                      | Descripción              | Valores   |
| -------------------------- | ------------------------ | --------- |
| `order_id`                 | ID de la orden           | `number`  |
| `order_status`             | Estado de la orden       | `string`  |
| `order_vehicle_type`       | Tipo de vehículo         | `string`  |
| `order_sede_type`          | Tipo de sede             | `string`  |
| `order_priority`           | Prioridad de la orden    | `string`  |
| `order_has_appointment`    | Tiene cita programada    | `boolean` |
| `order_commercial_user_id` | ID del usuario comercial | `number`  |
| `order_customer_email`     | Email del cliente        | `string`  |
| `order_customer_name`      | Nombre del cliente       | `string`  |

### 📅 **Cita**

| Clave                  | Descripción      | Valores   |
| ---------------------- | ---------------- | --------- |
| `appointment_id`       | ID de la cita    | `number`  |
| `appointment_date`     | Fecha de la cita | `string`  |
| `appointment_time`     | Hora de la cita  | `string`  |
| `appointment_is_today` | Es hoy           | `boolean` |

### 👨‍💼 **Agente**

| Clave         | Descripción      | Valores  |
| ------------- | ---------------- | -------- |
| `agent_id`    | ID del agente    | `number` |
| `agent_email` | Email del agente | `string` |
| `agent_role`  | Rol del agente   | `string` |

### 🎯 **Contexto**

| Clave            | Descripción          | Valores  |
| ---------------- | -------------------- | -------- |
| `event_name`     | Nombre del evento    | `string` |
| `event_category` | Categoría del evento | `string` |

### ✅ **Valores Booleanos**

| Clave                   | Descripción                             | Valores   |
| ----------------------- | --------------------------------------- | --------- |
| `is_urgent`             | Es urgente                              | `boolean` |
| `is_commercial_creator` | Es el comercial que creó la orden       | `boolean` |
| `is_client`             | Es el cliente de la orden               | `boolean` |
| `not_same_day`          | No es el mismo día (para recordatorios) | `boolean` |

## 🔄 **Tipos de Comparación**

### **Valor Simple**

```javascript
{
  "user_role": "comercial_mundial"
}
```

### **Array (OR lógico)**

```javascript
{
  "user_role": ["comercial_mundial", "admin"]
}
```

### **Booleano**

```javascript
{
  "is_commercial_creator": true,
  "is_urgent": false
}
```

### **Múltiples Condiciones (AND lógico)**

```javascript
{
  "is_client": true,
  "not_same_day": true
}
```

## 🎨 **Ejemplos para Frontend**

### **1. Email al Comercial que Creó la Orden**

```javascript
{
  "event_name": "inspection_order.created",
  "notification_type_name": "order_created_commercial_email",
  "conditions": {
    "is_commercial_creator": true
  },
  "channels": ["email"],
  "priority": 1
}
```

### **2. Notificación a Coordinadores**

```javascript
{
  "event_name": "inspection_order.created",
  "notification_type_name": "order_created_coordinator_inapp",
  "conditions": {
    "user_role": "coordinador_contacto"
  },
  "channels": ["in_app"],
  "priority": 2
}
```

### **3. Recordatorio al Cliente (1 día antes)**

```javascript
{
  "event_name": "inspection_order.scheduled",
  "notification_type_name": "appointment_reminder_client_email",
  "conditions": {
    "is_client": true,
    "not_same_day": true
  },
  "channels": ["email"],
  "delay_seconds": 86400
}
```

### **4. Notificación por Tipo de Vehículo**

```javascript
{
  "event_name": "inspection_order.created",
  "notification_type_name": "heavy_vehicle_notification",
  "conditions": {
    "order_vehicle_type": "Pesados"
  },
  "channels": ["email", "sms"]
}
```

### **5. Notificación por Estado de Orden**

```javascript
{
  "event_name": "inspection_order.status_changed",
  "notification_type_name": "order_completed_notification",
  "conditions": {
    "order_status": "completed"
  },
  "channels": ["email", "in_app"]
}
```

## 🚀 **Implementación en Frontend**

### **1. Formulario de Creación de Listener**

```javascript
const createListener = async (listenerData) => {
  const response = await fetch('/api/event-listeners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: listenerData.event,
      notification_type_name: listenerData.notificationType,
      conditions: listenerData.conditions,
      channels: listenerData.channels,
      priority: listenerData.priority,
      delay_seconds: listenerData.delay,
    }),
  });
  return response.json();
};
```

### **2. Selector de Condiciones**

```javascript
const conditionOptions = [
  {
    key: 'user_role',
    label: 'Rol de Usuario',
    type: 'select',
    options: ['comercial_mundial', 'coordinador_contacto', 'agente_contacto'],
  },
  { key: 'is_commercial_creator', label: 'Es Comercial Creador', type: 'boolean' },
  { key: 'is_client', label: 'Es Cliente', type: 'boolean' },
  {
    key: 'order_status',
    label: 'Estado de Orden',
    type: 'select',
    options: ['pending', 'assigned', 'completed'],
  },
  {
    key: 'order_vehicle_type',
    label: 'Tipo de Vehículo',
    type: 'select',
    options: ['Livianos', 'Pesados', 'Motos'],
  },
  { key: 'is_urgent', label: 'Es Urgente', type: 'boolean' },
  { key: 'not_same_day', label: 'No es el Mismo Día', type: 'boolean' },
];
```

### **3. Validación de Condiciones**

```javascript
const validateConditions = (conditions) => {
  const validKeys = [
    'user_id',
    'user_email',
    'user_role',
    'user_roles',
    'order_id',
    'order_status',
    'order_vehicle_type',
    'order_sede_type',
    'order_priority',
    'order_has_appointment',
    'order_commercial_user_id',
    'order_customer_email',
    'order_customer_name',
    'appointment_id',
    'appointment_date',
    'appointment_time',
    'appointment_is_today',
    'agent_id',
    'agent_email',
    'agent_role',
    'event_name',
    'event_category',
    'is_urgent',
    'is_commercial_creator',
    'is_client',
    'not_same_day',
  ];

  return Object.keys(conditions).every((key) => validKeys.includes(key));
};
```

## ⚠️ **Prevención de Duplicados**

### **1. Condiciones Específicas**

- Usar condiciones específicas para cada listener
- Evitar condiciones que siempre sean `true`

### **2. Roles Únicos**

- Cada listener debe tener un rol específico
- No usar múltiples listeners para el mismo rol/canal

### **3. Prioridades**

- Usar prioridades diferentes para listeners del mismo evento
- Prioridad 1 = más alta, Prioridad 10 = más baja

### **4. Canales Únicos**

- Cada listener debe tener canales específicos
- No duplicar canales para el mismo propósito

## 🔧 **Testing de Condiciones**

### **1. Verificar Condiciones**

```javascript
const testConditions = async (conditions, testData) => {
  const response = await fetch('/api/event-listeners/test-conditions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conditions, testData }),
  });
  return response.json();
};
```

### **2. Datos de Prueba**

```javascript
const testData = {
  user: {
    id: 1,
    email: 'comercial@test.com',
    role: 'comercial_mundial',
  },
  inspection_order: {
    id: 123,
    commercial_user_id: 1,
    correo_cliente: 'cliente@test.com',
    status: 'pending',
    vehicle_type: 'Livianos',
  },
};
```

## 📊 **Monitoreo y Debugging**

### **1. Logs de Condiciones**

```javascript
// En el backend, las condiciones se loggean automáticamente:
// 🔍 Evaluando condiciones: { is_commercial_creator: true }
// ✅ Todas las condiciones cumplidas
// ⏭️ Condición no cumplida: user_role (esperado: admin, actual: comercial_mundial)
```

### **2. Estadísticas de Listeners**

```javascript
const getListenerStats = async () => {
  const response = await fetch('/api/event-listeners/stats');
  return response.json();
};
```

---

**🎯 Resultado**: Sistema simple, sin duplicados, fácil de implementar desde frontend y extensible para futuras necesidades.
