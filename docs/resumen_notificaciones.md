# Resumen Ejecutivo - Sistema de Notificaciones VML Perito

## 🎯 **Propósito**

Sistema de notificaciones multicanal para el flujo de inspecciones de asegurabilidad, que permite enviar comunicaciones automáticas a clientes y usuarios comerciales con arquitectura basada en eventos y sistema anti-duplicados.

## 📊 **Arquitectura**

### **Tablas Principales:**

- `notification_types` - Tipos de notificación (inspection_confirmation, etc.)
- `notification_channels` - Canales disponibles (email, sms, in_app, etc.)
- `notification_configs` - Configuración que relaciona tipos con canales
- `notifications` - Notificaciones enviadas con tracking
- `notification_queue` - Cola de procesamiento con reintentos
- `events` - Eventos del sistema
- `event_listeners` - Listeners que responden a eventos

### **Relaciones:**

```
notification_types (1) ←→ (N) notification_configs (N) ←→ (1) notification_channels
                                    ↓
                            notifications (1) ←→ (1) notification_queue
                                    ↓
                            events (1) ←→ (N) event_listeners
```

## 🔧 **Configuración Actual**

### **Canales Configurados:**

- **✅ Email (SMTP)** - NodeMailer con Gmail/Outlook (FUNCIONAL)
- **✅ SMS (Hablame)** - API de Hablame.co para Colombia (FUNCIONAL)
- **✅ In-App** - Notificaciones internas con WebSocket (FUNCIONAL)
- **⚠️ Push** - Notificaciones push móviles (CONFIGURADO, PENDIENTE HANDLER)
- **⚠️ WhatsApp** - WhatsApp Business API (PLANIFICADO)

### **Variables de Entorno:**

```bash
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@vmlperito.com
EMAIL_PASS=your_app_password

# SMS
HABLAME_KEY=your_hablame_api_key
SMS_FROM=VMLPerito

# WebSocket
WS_PORT=3001
```

## 📱 **Tipos de Notificación Implementados**

### **✅ Para Comerciales (Email + In-App + Push):**

1. **`order_created_commercial_email`** - Email al comercial que creó la orden
2. **`order_created_commercial_inapp`** - In-app al comercial
3. **`order_created_commercial_push`** - Push al comercial
4. **`order_assigned_commercial_inapp`** - In-app asignación al comercial
5. **`order_assigned_commercial_push`** - Push asignación al comercial
6. **`appointment_scheduled_commercial_inapp`** - In-app cita al comercial
7. **`appointment_scheduled_commercial_push`** - Push cita al comercial

### **✅ Para Coordinadores (Email + In-App + Push):**

1. **`order_created_coordinator_email`** - Email a coordinadores
2. **`order_created_coordinator_inapp`** - In-app a coordinadores
3. **`order_created_coordinator_push`** - Push a coordinadores
4. **`order_assigned_coordinator_inapp`** - In-app asignación a coordinadores
5. **`order_assigned_coordinator_push`** - Push asignación a coordinadores

### **✅ Para Clientes (Email + SMS):**

1. **`appointment_confirmation_client_email`** - Email confirmación al cliente
2. **`appointment_confirmation_client_sms`** - SMS confirmación al cliente
3. **`appointment_reminder_client_email`** - Email recordatorio al cliente
4. **`appointment_reminder_client_sms`** - SMS recordatorio al cliente

### **✅ Sistema:**

1. **`user_welcome`** - Bienvenida a nuevos usuarios

## 🔄 **Flujo de Envío Mejorado**

### **Arquitectura Basada en Eventos:**

```javascript
// Una acción dispara múltiples eventos automáticamente
await eventService.trigger('inspection_order.created', {
  inspection_order: inspectionOrder,
  user: req.user,
});

// Resultado: Se procesan todos los listeners configurados
// - Email al comercial
// - In-app al comercial
// - Email a coordinadores
// - In-app a coordinadores
// - Push a ambos roles
```

### **Sistema Anti-Duplicados:**

- ✅ **Deduplicación por usuario**: Un usuario no recibe la misma notificación múltiples veces
- ✅ **Deduplicación por tipo**: Cada tipo de notificación se procesa una sola vez
- ✅ **Deduplicación por canal**: Cada canal se procesa independientemente
- ✅ **Condiciones específicas**: Listeners con condiciones precisas

### **Procesamiento:**

1. Evento disparado por acción del usuario
2. Sistema busca listeners activos para el evento
3. Evalúa condiciones específicas de cada listener
4. Crea notificaciones individuales por canal
5. Procesa independientemente (cada una con su tracking)
6. Maneja errores y reintentos por separado

## 📋 **Variables de Plantilla**

### **✅ Desde `inspection_order`:**

- `{{inspection_order.nombre_cliente}}`
- `{{inspection_order.celular_cliente}}`
- `{{inspection_order.correo_cliente}}`
- `{{inspection_order.numero}}`
- `{{inspection_order.marca}}`, `{{inspection_order.linea}}`, `{{inspection_order.modelo}}`
- `{{inspection_order.placa}}`
- `{{inspection_order.commercial_user_id}}`

### **✅ Variables Adicionales:**

- `{{appointment.date}}`, `{{appointment.time}}`, `{{appointment.location}}`
- `{{agent.name}}`, `{{meeting.link}}`
- `{{inspection_result.status}}`, `{{inspection_result.details}}`
- `{{user.name}}`, `{{user.email}}`, `{{user.role}}`

## 🎯 **Casos de Uso Principales**

### **1. Creación de Orden de Inspección**

```javascript
// Trigger: Cuando comercial crea orden
await eventService.trigger('inspection_order.created', {
  inspection_order: inspectionOrder,
  user: req.user,
});
// Envía: Email + In-app + Push al comercial
// Envía: Email + In-app + Push a coordinadores
```

### **2. Asignación de Agente**

```javascript
// Trigger: Cuando coordinador asigna agente
await eventService.trigger('inspection_order.assigned', {
  inspection_order: inspectionOrder,
  agent: assignedAgent,
});
// Envía: In-app + Push al comercial
// Envía: In-app + Push a coordinadores
```

### **3. Agendamiento de Cita**

```javascript
// Trigger: Cuando se agenda cita
await eventService.trigger('inspection_order.scheduled', {
  inspection_order: inspectionOrder,
  appointment: appointmentData,
});
// Envía: Email + SMS al cliente
// Envía: In-app + Push al comercial
```

## 🔍 **Resolución de Destinatarios Mejorada**

### **✅ Para Comerciales:**

- Busca usuario con rol `comercial_mundial`
- Filtra por `commercial_user_id` de la orden
- Condición: `is_commercial_creator: true`

### **✅ Para Coordinadores:**

- Busca todos los usuarios con rol `coordinador_contacto`
- Sin condiciones específicas (siempre se envía)

### **✅ Para Clientes:**

- Datos extraídos directamente de `inspection_order`
- `nombre_cliente`, `celular_cliente`, `correo_cliente`

## 📈 **Monitoreo y Estados**

### **Estados de Notificación:**

- `pending` - En cola
- `scheduled` - Programada
- `sending` - Enviando
- `sent` - Enviado al proveedor
- `delivered` - Confirmado entregado
- `failed` - Falló el envío
- `read` - Leído (solo in-app)
- `cancelled` - Cancelada

### **Logs Ejemplo:**

```
📬 Evento disparado: inspection_order.created
✅ Listener procesado: order_created_commercial_email
✅ Listener procesado: order_created_coordinator_inapp
📧 Enviando email a: comercial@vmlperito.com
✅ Email enviado exitosamente: email_123456
🔔 Enviando in-app a: coordinador@vmlperito.com
✅ In-app enviado exitosamente: inapp_789012
```

## 🚀 **Comandos de Configuración**

### **Configurar Todo el Sistema:**

```bash
npm run seed:all
```

### **Verificar Configuración:**

```bash
npm run dev  # Ver logs en tiempo real
```

## 🔧 **Servicios Implementados**

### **✅ EmailService:**

- Integración con NodeMailer
- Soporte para SMTP (Gmail, Outlook, personalizado)
- Templates HTML + texto plano
- Validación de email
- Reintentos automáticos

### **✅ SMSService:**

- Integración con Hablame API
- Formateo automático de números colombianos (+57)
- Validación de formato
- Prioridad alta/normal
- Reintentos automáticos

### **✅ InAppService:**

- Integración con WebSockets
- Notificaciones en tiempo real
- Persistencia en base de datos
- Estados de lectura

### **✅ EventService:**

- Arquitectura basada en eventos
- Sistema de listeners configurable
- Condiciones simplificadas
- Anti-duplicados

## 📚 **Archivos Clave**

### **Configuración:**

- `apps/server/.env.example` - Variables de entorno
- `apps/server/scripts/seedAdvancedListeners.js` - Listeners específicos
- `apps/server/scripts/seedAdvancedTemplates.js` - Plantillas específicas

### **Servicios:**

- `apps/server/services/eventService.js` - Servicio de eventos
- `apps/server/services/notificationService.js` - Servicio principal
- `apps/server/services/channels/emailService.js` - Servicio de email
- `apps/server/services/channels/smsService.js` - Servicio de SMS
- `apps/server/websocket/notificationHandler.js` - WebSocket handler

### **Documentación:**

- `docs/Notificaciones.md` - Documentación técnica completa
- `docs/notificaciones_flujo.md` - Flujo detallado y relaciones
- `docs/templates_reference.md` - Referencia de plantillas
- `docs/notification_conditions_reference.md` - Sistema de condiciones

## 🎯 **Próximos Pasos**

### **✅ Completado:**

- ✅ Sistema de notificaciones multicanal
- ✅ Arquitectura basada en eventos
- ✅ Plantillas específicas por tipo (17 plantillas)
- ✅ Sistema de condiciones simplificado
- ✅ Anti-duplicados implementado
- ✅ WebSockets en tiempo real
- ✅ Email y SMS funcionales

### **🔄 En Desarrollo:**

- 🔄 Sistema de webhooks para integración externa
- 🔄 Dashboard de métricas y reportes

### **📋 Pendiente:**

- 📋 Integración WhatsApp Business API
- 📋 Notificaciones push móviles (handler)
- 📋 Sistema de archivos adjuntos
- 📋 Reportes avanzados

## 💡 **Puntos Clave**

1. **✅ Flexibilidad:** Cada tipo puede tener múltiples canales
2. **✅ Independencia:** Cada canal se procesa por separado
3. **✅ Trazabilidad:** Tracking individual por notificación
4. **✅ Escalabilidad:** Fácil agregar nuevos canales
5. **✅ Robustez:** Manejo de errores y reintentos automáticos
6. **✅ Configurabilidad:** Plantillas y configuraciones desde base de datos
7. **✅ Anti-duplicados:** Sistema robusto contra duplicaciones
8. **✅ Eventos:** Arquitectura basada en eventos para extensibilidad

## 🔐 **Credenciales de Prueba**

| Rol                   | Email                       | Contraseña       | Descripción                |
| --------------------- | --------------------------- | ---------------- | -------------------------- |
| **Admin**             | `admin@vmlperito.com`       | `admin123`       | Acceso completo al sistema |
| **Comercial Mundial** | `comercial@vmlperito.com`   | `comercial123`   | Creación de órdenes        |
| **Coordinador**       | `coordinador@vmlperito.com` | `coordinador123` | Gestión de agentes         |
| **Agente Contacto**   | `agente@vmlperito.com`      | `agente123`      | Gestión de llamadas        |

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Implementado y Funcional
