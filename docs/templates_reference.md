# 📧 Referencia de Plantillas de Notificación

## 🎯 Plantillas Específicas por Tipo de Notificación

Este documento describe todas las plantillas disponibles en el sistema, organizadas por tipo de notificación y canal.

## 📊 Resumen de Plantillas

| Tipo de Notificación                     | Email | SMS | In-App | Push | Descripción                          |
| ---------------------------------------- | ----- | --- | ------ | ---- | ------------------------------------ |
| `user_welcome`                           | ✅    | ❌  | ❌     | ❌   | Bienvenida a nuevos usuarios         |
| `order_created_commercial_email`         | ✅    | ❌  | ❌     | ❌   | Email al comercial que creó la orden |
| `order_created_coordinator_email`        | ✅    | ❌  | ❌     | ❌   | Email a coordinadores                |
| `order_created_commercial_inapp`         | ❌    | ❌  | ✅     | ❌   | In-app al comercial                  |
| `order_created_coordinator_inapp`        | ❌    | ❌  | ✅     | ❌   | In-app a coordinadores               |
| `order_created_commercial_push`          | ❌    | ❌  | ❌     | ✅   | Push al comercial                    |
| `order_created_coordinator_push`         | ❌    | ❌  | ❌     | ✅   | Push a coordinadores                 |
| `order_assigned_commercial_inapp`        | ❌    | ❌  | ✅     | ❌   | In-app asignación al comercial       |
| `order_assigned_coordinator_inapp`       | ❌    | ❌  | ✅     | ❌   | In-app asignación a coordinadores    |
| `order_assigned_commercial_push`         | ❌    | ❌  | ❌     | ✅   | Push asignación al comercial         |
| `order_assigned_coordinator_push`        | ❌    | ❌  | ❌     | ✅   | Push asignación a coordinadores      |
| `appointment_confirmation_client_email`  | ✅    | ❌  | ❌     | ❌   | Email confirmación al cliente        |
| `appointment_confirmation_client_sms`    | ❌    | ✅  | ❌     | ❌   | SMS confirmación al cliente          |
| `appointment_scheduled_commercial_inapp` | ❌    | ❌  | ✅     | ❌   | In-app cita al comercial             |
| `appointment_scheduled_commercial_push`  | ❌    | ❌  | ❌     | ✅   | Push cita al comercial               |
| `appointment_reminder_client_email`      | ✅    | ❌  | ❌     | ❌   | Email recordatorio al cliente        |
| `appointment_reminder_client_sms`        | ❌    | ✅  | ❌     | ❌   | SMS recordatorio al cliente          |

## 📧 Plantillas de Email

### **1. `user_welcome`**

**Asunto:** `¡Bienvenido a Movilidad Mundial, {{user.name}}!`

**Características:**

- Diseño moderno con gradiente
- Información de cuenta del usuario
- Botón de acceso al sistema
- Footer corporativo

**Variables:** `user.name`, `user.email`, `user.role`, `user.created_at`, `login_url`

---

### **2. `order_created_commercial_email`**

**Asunto:** `Orden de Inspección Creada - {{inspection_order.numero}}`

**Características:**

- Header verde con checkmark
- Tabla detallada de la orden
- Información del cliente y vehículo
- Botón para ver la orden

**Variables:** `user.name`, `inspection_order.numero`, `inspection_order.nombre_cliente`, `inspection_order.correo_cliente`, `inspection_order.marca`, `inspection_order.linea`, `inspection_order.modelo`, `inspection_order.placa`, `inspection_order.created_at`, `order_url`

---

### **3. `order_created_coordinator_email`**

**Asunto:** `Nueva Orden Requiere Asignación - {{inspection_order.numero}}`

**Características:**

- Header amarillo con icono de refresh
- Información completa de la orden
- Datos del comercial que la creó
- Botón para asignar agente

**Variables:** `user.name`, `user.email`, `inspection_order.numero`, `inspection_order.nombre_cliente`, `inspection_order.correo_cliente`, `inspection_order.celular_cliente`, `inspection_order.marca`, `inspection_order.linea`, `inspection_order.modelo`, `assignment_url`

---

### **4. `appointment_confirmation_client_email`**

**Asunto:** `Confirmación de Cita - {{appointment.scheduled_date}}`

**Características:**

- Header azul con icono de calendario
- Detalles completos de la cita
- Instrucciones importantes
- Información del vehículo

**Variables:** `inspection_order.nombre_cliente`, `inspection_order.numero`, `inspection_order.marca`, `inspection_order.linea`, `inspection_order.modelo`, `appointment.scheduled_date`, `appointment.scheduled_time`, `appointment.location`

---

### **5. `appointment_reminder_client_email`**

**Asunto:** `Recordatorio: Su cita es mañana - {{appointment.scheduled_date}}`

**Características:**

- Header amarillo con icono de reloj
- Recordatorio urgente
- Instrucciones importantes
- Información de contacto

**Variables:** `inspection_order.nombre_cliente`, `inspection_order.numero`, `appointment.scheduled_date`, `appointment.scheduled_time`, `appointment.location`

## 📱 Plantillas de SMS

### **1. `appointment_confirmation_client_sms`**

**Mensaje:** `Movilidad Mundial: Su cita está confirmada para {{appointment.scheduled_date}} a las {{appointment.scheduled_time}} en {{appointment.location}}. Orden: {{inspection_order.numero}}`

**Variables:** `appointment.scheduled_date`, `appointment.scheduled_time`, `appointment.location`, `inspection_order.numero`

---

### **2. `appointment_reminder_client_sms`**

**Mensaje:** `Movilidad Mundial: Recordatorio - Su cita es mañana {{appointment.scheduled_date}} a las {{appointment.scheduled_time}} en {{appointment.location}}. Orden: {{inspection_order.numero}}`

**Variables:** `appointment.scheduled_date`, `appointment.scheduled_time`, `appointment.location`, `inspection_order.numero`

## 🔔 Plantillas In-App

### **1. `order_created_commercial_inapp`**

```javascript
{
  title: '✅ Orden Creada',
  body: 'Orden {{inspection_order.numero}} creada para {{inspection_order.nombre_cliente}}',
  data: {
    order_id: '{{inspection_order.id}}',
    reference: '{{inspection_order.numero}}',
    customer_name: '{{inspection_order.nombre_cliente}}',
    action: 'view_order'
  }
}
```

### **2. `order_created_coordinator_inapp`**

```javascript
{
  title: '🔄 Nueva Orden',
  body: 'Orden {{inspection_order.numero}} requiere asignación',
  data: {
    order_id: '{{inspection_order.id}}',
    reference: '{{inspection_order.numero}}',
    customer_name: '{{inspection_order.nombre_cliente}}',
    action: 'assign_agent'
  }
}
```

### **3. `order_assigned_commercial_inapp`**

```javascript
{
  title: '👤 Agente Asignado',
  body: 'Orden {{inspection_order.numero}} asignada a {{agent.name}}',
  data: {
    order_id: '{{inspection_order.id}}',
    agent_id: '{{agent.id}}',
    action: 'view_order'
  }
}
```

### **4. `order_assigned_coordinator_inapp`**

```javascript
{
  title: '✅ Asignación Completada',
  body: 'Orden {{inspection_order.numero}} asignada a {{agent.name}}',
  data: {
    order_id: '{{inspection_order.id}}',
    agent_id: '{{agent.id}}',
    action: 'view_order'
  }
}
```

### **5. `appointment_scheduled_commercial_inapp`**

```javascript
{
  title: '📅 Cita Programada',
  body: 'Cita programada para {{inspection_order.nombre_cliente}} el {{appointment.scheduled_date}}',
  data: {
    order_id: '{{inspection_order.id}}',
    appointment_id: '{{appointment.id}}',
    action: 'view_appointment'
  }
}
```

## 📲 Plantillas Push

### **1. `order_created_commercial_push`**

```javascript
{
  title: '✅ Orden Creada',
  body: 'Orden {{inspection_order.numero}} creada exitosamente',
  data: {
    order_id: '{{inspection_order.id}}',
    action: 'view_order'
  }
}
```

### **2. `order_created_coordinator_push`**

```javascript
{
  title: '🔄 Nueva Orden',
  body: 'Orden {{inspection_order.numero}} requiere asignación',
  data: {
    order_id: '{{inspection_order.id}}',
    action: 'assign_agent'
  }
}
```

### **3. `order_assigned_commercial_push`**

```javascript
{
  title: '👤 Agente Asignado',
  body: 'Orden {{inspection_order.numero}} asignada',
  data: {
    order_id: '{{inspection_order.id}}',
    action: 'view_order'
  }
}
```

### **4. `order_assigned_coordinator_push`**

```javascript
{
  title: '✅ Asignación Completada',
  body: 'Orden {{inspection_order.numero}} asignada a {{agent.name}}',
  data: {
    order_id: '{{inspection_order.id}}',
    action: 'view_order'
  }
}
```

### **5. `appointment_scheduled_commercial_push`**

```javascript
{
  title: '📅 Cita Programada',
  body: 'Cita confirmada para {{inspection_order.nombre_cliente}}',
  data: {
    order_id: '{{inspection_order.id}}',
    action: 'view_appointment'
  }
}
```

## 🎨 Características de Diseño

### **Colores por Tipo:**

- **✅ Éxito/Confirmación:** Verde (`#28a745`)
- **🔄 Pendiente/Asignación:** Amarillo (`#ffc107`)
- **📅 Citas:** Azul (`#17a2b8`)
- **⏰ Recordatorios:** Amarillo (`#ffc107`)
- **👤 Agentes:** Azul claro (`#17a2b8`)

### **Iconos:**

- **✅ Orden Creada:** Checkmark
- **🔄 Nueva Orden:** Refresh/Reload
- **👤 Asignación:** Persona
- **📅 Citas:** Calendario
- **⏰ Recordatorios:** Reloj

### **Acciones:**

- **`view_order`:** Ver detalles de la orden
- **`assign_agent`:** Asignar agente
- **`view_appointment`:** Ver detalles de la cita

## 🔧 Variables Comunes

### **Usuario:**

- `user.name` - Nombre del usuario
- `user.email` - Email del usuario
- `user.role` - Rol del usuario
- `user.created_at` - Fecha de creación

### **Orden de Inspección:**

- `inspection_order.id` - ID de la orden
- `inspection_order.numero` - Número de referencia
- `inspection_order.nombre_cliente` - Nombre del cliente
- `inspection_order.correo_cliente` - Email del cliente
- `inspection_order.celular_cliente` - Teléfono del cliente
- `inspection_order.marca` - Marca del vehículo
- `inspection_order.linea` - Línea del vehículo
- `inspection_order.modelo` - Modelo del vehículo
- `inspection_order.placa` - Placa del vehículo
- `inspection_order.created_at` - Fecha de creación

### **Cita:**

- `appointment.id` - ID de la cita
- `appointment.scheduled_date` - Fecha programada
- `appointment.scheduled_time` - Hora programada
- `appointment.location` - Ubicación/Sede

### **Agente:**

- `agent.id` - ID del agente
- `agent.name` - Nombre del agente

### **URLs:**

- `login_url` - URL de acceso al sistema
- `order_url` - URL para ver la orden
- `assignment_url` - URL para asignar agente

## 📋 Mejores Prácticas

### **1. Consistencia:**

- Usar los mismos colores para el mismo tipo de notificación
- Mantener iconos consistentes
- Usar el mismo tono de voz

### **2. Claridad:**

- Mensajes concisos y directos
- Información relevante en el orden correcto
- Llamadas a la acción claras

### **3. Personalización:**

- Usar el nombre del destinatario cuando sea posible
- Incluir información específica de la orden/cita
- Adaptar el contenido al rol del usuario

### **4. Accesibilidad:**

- Contraste adecuado en emails
- Texto legible en SMS
- Iconos descriptivos

## 📚 Referencias Relacionadas

- [**Sistema de Notificaciones**](./Notificaciones.md) - Documentación completa del sistema
- [**Webhook: inspection_order.started**](./webhook-inspection-order-started.md) - Integración con webhooks
- [**Texto en Español**](./spanish-ui-text.md) - Guías de textos

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado  
**🎯 Resultado:** Sistema completo de plantillas específicas, bien diseñadas y consistentes para todos los tipos de notificación.
