# Sistema de Notificaciones - Movilidad Mundial

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelos de Datos](#modelos-de-datos)
4. [Servicios de Canales](#servicios-de-canales)
5. [Configuración de Notificaciones](#configuración-de-notificaciones)
6. [Uso del Sistema](#uso-del-sistema)
7. [Cola de Procesamiento](#cola-de-procesamiento)
8. [Plantillas y Variables](#plantillas-y-variables)
9. [Estados de Notificación](#estados-de-notificación)
10. [API y Endpoints](#api-y-endpoints)
11. [Configuración y Despliegue](#configuración-y-despliegue)
12. [Monitoreo y Logs](#monitoreo-y-logs)
13. [Integración con Webhooks](#integración-con-webhooks)

## Descripción General

El sistema de notificaciones de Movilidad Mundial es una solución integral que permite enviar notificaciones a través de múltiples canales (Email, WhatsApp, SMS, Push, In-App) de manera configurable, escalable y confiable.

### Características Principales

- **Multi-canal**: Soporte para Email, WhatsApp, SMS, Push e In-App
- **Configuración Flexible**: Plantillas personalizables con variables dinámicas
- **Programación**: Envío inmediato, diferido o recurrente
- **Cola de Procesamiento**: Sistema de colas para manejo de alta concurrencia
- **Reintentos Automáticos**: Reintentos exponenciales en caso de fallo
- **Seguimiento**: Tracking completo del estado de entrega
- **Priorización**: Sistema de prioridades (low, normal, high, urgent)

## Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│ Notification     │───▶│ Channel         │
│   Layer         │    │ Service          │    │ Services        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Database       │    │   External      │
                       │   Models         │    │   Providers     │
                       └──────────────────┘    └─────────────────┘
```

### Componentes Principales

1. **NotificationService**: Servicio principal que orquesta todo el proceso
2. **Channel Services**: Servicios específicos para cada canal de comunicación
3. **Database Models**: Modelos para almacenar configuraciones y notificaciones
4. **Queue Processor**: Procesador automático de cola de notificaciones

## Modelos de Datos

### Notification

Almacena las notificaciones individuales enviadas.

```javascript
{
    id: BIGINT,
    notification_config_id: BIGINT,    // Configuración asociada
    appointment_id: BIGINT,            // Cita relacionada (opcional)
    inspection_order_id: BIGINT,       // Orden de inspección (opcional)
    recipient_type: STRING,            // 'user' | 'client'
    recipient_user_id: BIGINT,         // ID del usuario (si aplica)
    recipient_email: STRING,           // Email del destinatario
    recipient_phone: STRING,           // Teléfono del destinatario
    recipient_name: STRING,            // Nombre del destinatario
    title: TEXT,                       // Título de la notificación
    content: TEXT,                     // Contenido de la notificación
    status: STRING,                    // Estado actual
    priority: ENUM,                    // Prioridad
    scheduled_at: DATE,                // Fecha programada
    sent_at: DATE,                     // Fecha de envío
    delivered_at: DATE,                // Fecha de entrega
    read_at: DATE,                     // Fecha de lectura
    failed_at: DATE,                   // Fecha de fallo
    retry_count: INTEGER,              // Número de reintentos
    max_retries: INTEGER,              // Máximo de reintentos
    external_id: STRING,               // ID del proveedor externo
    external_response: JSON,           // Respuesta del proveedor
    error_message: TEXT,               // Mensaje de error
    metadata: JSON,                    // Datos adicionales
    push_token: STRING,                // Token para push
    websocket_delivered: BOOLEAN       // Si fue entregada por WebSocket
}
```

### NotificationConfig

Configuración de cómo y cuándo enviar notificaciones.

```javascript
{
    id: BIGINT,
    notification_type_id: BIGINT,      // Tipo de notificación
    notification_channel_id: BIGINT,   // Canal de envío
    name: STRING,                      // Nombre descriptivo
    template_title: TEXT,              // Plantilla del título
    template_content: TEXT,            // Plantilla del contenido
    template_variables: JSON,          // Variables disponibles
    target_roles: JSON,                // Roles objetivo
    target_users: JSON,                // Usuarios específicos
    for_clients: BOOLEAN,              // Si es para clientes
    for_users: BOOLEAN,                // Si es para usuarios
    trigger_conditions: JSON,          // Condiciones de disparo
    schedule_type: ENUM,               // 'immediate' | 'delayed' | 'recurring'
    schedule_delay_minutes: INTEGER,   // Minutos de retraso
    schedule_cron: STRING,             // Expresión cron
    priority: ENUM,                    // Prioridad
    retry_attempts: INTEGER,           // Intentos de reintento
    active: BOOLEAN                    // Si está activa
}
```

### NotificationType

Tipos de notificaciones disponibles.

```javascript
{
    id: BIGINT,
    name: STRING,                      // Nombre único
    description: TEXT                  // Descripción
}
```

### NotificationChannel

Canales de comunicación disponibles.

```javascript
{
    id: BIGINT,
    name: STRING,                      // Nombre del canal
    description: TEXT,                 // Descripción
    active: BOOLEAN                    // Si está activo
}
```

### NotificationQueue

Cola de procesamiento de notificaciones.

```javascript
{
    id: BIGINT,
    notification_id: BIGINT,           // Notificación asociada
    scheduled_at: DATE,                // Fecha programada
    priority: ENUM,                    // Prioridad
    status: STRING,                    // Estado en la cola
    attempts: INTEGER,                 // Intentos realizados
    processed_at: DATE,                // Fecha de procesamiento
    failed_at: DATE,                   // Fecha de fallo
    error_message: TEXT                // Mensaje de error
}
```

## Servicios de Canales

### EmailService

Servicio para envío de notificaciones por email.

**Características:**

- Soporte para múltiples proveedores (NodeMailer, SendGrid, etc.)
- Generación automática de contenido HTML
- Validación de direcciones de email
- Mapeo de prioridades

**Métodos principales:**

- `send(notification)`: Envía la notificación
- `configureProvider(provider, config)`: Configura el proveedor
- `generateHtmlContent(notification)`: Genera HTML
- `validateEmail(email)`: Valida dirección de email

### WhatsAppService

Servicio para envío de notificaciones por WhatsApp.

**Características:**

- Soporte para WhatsApp Business API
- Validación de números de teléfono
- Formateo automático de mensajes
- Manejo de webhooks de estado

**Métodos principales:**

- `send(notification)`: Envía la notificación
- `configureProvider(provider, config)`: Configura el proveedor
- `formatMessage(notification)`: Formatea el mensaje
- `validatePhoneNumber(phone)`: Valida número de teléfono
- `handleDeliveryStatus(webhookData)`: Maneja estados de entrega

### SMSService

Servicio para envío de notificaciones por SMS.

### InAppService

Servicio para notificaciones dentro de la aplicación.

### PushService

Servicio para notificaciones push móviles.

## Configuración de Notificaciones

### Crear una Configuración

```javascript
// Ejemplo de configuración para recordatorio de cita
const config = {
  name: 'Recordatorio de Cita',
  notification_type_id: 1, // Tipo: "appointment_reminder"
  notification_channel_id: 1, // Canal: "email"
  template_title: 'Recordatorio: Cita {{appointment.date}}',
  template_content:
    'Hola {{client.name}}, tienes una cita programada para {{appointment.date}} a las {{appointment.time}}.',
  target_roles: ['client'],
  for_clients: true,
  schedule_type: 'delayed',
  schedule_delay_minutes: 60, // 1 hora antes
  priority: 'normal',
  retry_attempts: 3,
  active: true,
};
```

### Variables de Plantilla

Las plantillas soportan variables dinámicas usando la sintaxis `{{variable}}`:

```javascript
// Variables disponibles en el contexto
{
    client: {
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "3001234567"
    },
    appointment: {
        date: "2024-01-15",
        time: "14:00",
        location: "Sede Norte"
    },
    inspection_order: {
        id: "IO-2024-001",
        status: "pending"
    }
}
```

## Uso del Sistema

### Enviar una Notificación

```javascript
import notificationService from '../services/notificationService.js';

// Enviar notificación inmediata
await notificationService.createNotification(
  'appointment_reminder', // Tipo de notificación
  {
    client: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '3001234567',
    },
    appointment: {
      date: '2024-01-15',
      time: '14:00',
      location: 'Sede Norte',
    },
  },
  {
    recipient_user_id: 123, // Usuario específico (opcional)
    scheduled_at: new Date('2024-01-15T13:00:00Z'), // Programar (opcional)
  }
);
```

### Obtener Notificaciones de Usuario

```javascript
// Obtener notificaciones de un usuario
const notifications = await notificationService.getUserNotifications(userId, {
  limit: 20,
  offset: 0,
  unreadOnly: true,
});

// Marcar como leída
await notificationService.markAsRead(notificationId, userId);

// Marcar todas como leídas
await notificationService.markAllAsRead(userId);
```

## Cola de Procesamiento

### Procesamiento Automático

El sistema incluye un procesador automático que:

1. **Ejecuta cada minuto** usando cron
2. **Procesa hasta 10 notificaciones** por ciclo
3. **Prioriza por prioridad** y fecha programada
4. **Maneja reintentos** automáticamente

### Estados de la Cola

- `pending`: Pendiente de procesamiento
- `processing`: En proceso
- `completed`: Completado exitosamente
- `failed`: Falló el procesamiento

### Reintentos

El sistema implementa reintentos exponenciales:

```javascript
const retryDelay = Math.pow(2, notification.retry_count) * 60 * 1000;
// 1er intento: 2 minutos
// 2do intento: 4 minutos
// 3er intento: 8 minutos
```

## Plantillas y Variables

### Sintaxis de Variables

```javascript
// Variables simples
{
  {
    client.name;
  }
}
{
  {
    appointment.date;
  }
}

// Variables anidadas
{
  {
    client.address.city;
  }
}
{
  {
    inspection_order.vehicle.plate;
  }
}

// Variables con valor por defecto
{
  {
    client.phone || 'No disponible';
  }
}
```

### Procesamiento de Plantillas

```javascript
// Ejemplo de procesamiento
const template = 'Hola {{client.name}}, tu cita es el {{appointment.date}}';
const data = {
  client: { name: 'Juan' },
  appointment: { date: '2024-01-15' },
};

// Resultado: "Hola Juan, tu cita es el 2024-01-15"
```

## Estados de Notificación

### Flujo de Estados

```
pending → scheduled → sending → sent → delivered
   ↓         ↓          ↓        ↓        ↓
failed ← retry ←───────┘        read
```

### Descripción de Estados

- **pending**: Creada pero no procesada
- **scheduled**: Programada para envío futuro
- **sending**: En proceso de envío
- **sent**: Enviada al proveedor
- **delivered**: Confirmada entrega
- **failed**: Falló el envío
- **read**: Leída por el usuario
- **cancelled**: Cancelada

## API y Endpoints

### Endpoints Principales

```javascript
// Crear notificación
POST /api/notifications
{
    "type": "appointment_reminder",
    "data": { ... },
    "options": { ... }
}

// Obtener notificaciones de usuario
GET /api/notifications/user/:userId
GET /api/notifications/user/:userId?unreadOnly=true

// Marcar como leída
PUT /api/notifications/:id/read

// Marcar todas como leídas
PUT /api/notifications/user/:userId/read-all

// Configuraciones
GET /api/notification-configs
POST /api/notification-configs
PUT /api/notification-configs/:id
DELETE /api/notification-configs/:id
```

## Configuración y Despliegue

### Variables de Entorno

```bash
# Configuración de canales
EMAIL_PROVIDER=nodemailer
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@vmlperito.com
EMAIL_PASS=password

WHATSAPP_PROVIDER=twilio
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

SMS_PROVIDER=twilio
SMS_API_KEY=your_api_key
SMS_PHONE_NUMBER=+573001234567

# Configuración de base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vmlperito
DB_USER=postgres
DB_PASS=password
```

### Inicialización

```javascript
// Configurar proveedores de canales
import emailService from './services/channels/emailService.js';
import whatsappService from './services/channels/whatsappService.js';

emailService.configureProvider('nodemailer', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
});

whatsappService.configureProvider('twilio', {
  apiKey: process.env.WHATSAPP_API_KEY,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
});
```

## Monitoreo y Logs

### Logs del Sistema

El sistema genera logs detallados con emojis para fácil identificación:

```
📬 Creando notificación tipo: appointment_reminder
✅ Notificación creada: 123 para Juan Pérez
📧 Enviando email a: juan@example.com
✅ Notificación enviada: 123 via email
🔄 Procesador de cola de notificaciones iniciado
❌ Error enviando notificación 124: Connection timeout
```

### Métricas Importantes

- **Tasa de entrega**: Porcentaje de notificaciones entregadas
- **Tiempo de entrega**: Tiempo promedio desde creación hasta entrega
- **Tasa de fallo**: Porcentaje de notificaciones que fallan
- **Reintentos**: Número promedio de reintentos por notificación

### Alertas Recomendadas

- Notificaciones fallidas consecutivas > 10
- Tiempo de procesamiento de cola > 5 minutos
- Tasa de entrega < 90%
- Errores de proveedor externo

---

## Notas de Implementación

### Estado Actual

- ✅ **Core del sistema**: Implementado y funcional
- ✅ **Modelos de datos**: Completos y optimizados
- ✅ **Servicios de canales**: Email y SMS funcionales
- ✅ **Sistema de eventos**: Arquitectura basada en eventos implementada
- ✅ **Plantillas específicas**: 17 plantillas implementadas
- ✅ **Sistema de condiciones**: Simplificado y frontend-friendly
- ✅ **WebSockets**: Integración completa para notificaciones en tiempo real
- ✅ **Deduplicación**: Sistema anti-duplicados implementado
- ⚠️ **Proveedores externos**: Email y SMS configurados, WhatsApp pendiente
- ⚠️ **Webhooks**: Planificado para integración externa
- ⚠️ **Dashboard**: Interfaz de administración básica implementada

### Próximos Pasos

1. **✅ Completado**: Sistema de notificaciones multicanal
2. **✅ Completado**: Arquitectura basada en eventos
3. **✅ Completado**: Plantillas específicas por tipo
4. **🔄 En desarrollo**: Sistema de webhooks para integración externa
5. **📋 Pendiente**: Dashboard de métricas y reportes avanzados
6. **📋 Pendiente**: Integración WhatsApp Business API
7. **📋 Pendiente**: Notificaciones push móviles
8. **📋 Pendiente**: Sistema de archivos adjuntos

### Consideraciones de Seguridad

- ✅ Validación de todas las entradas de usuario
- ✅ Sanitización de contenido de plantillas
- ✅ Rate limiting por usuario implementado
- ✅ Logging de auditoría para notificaciones sensibles
- ✅ Encriptación de tokens y credenciales de proveedores
- ✅ Sistema RBAC para control de acceso

### Credenciales de Prueba

El sistema incluye credenciales de prueba para todos los roles:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **Admin** | `admin@vmlperito.com` | `admin123` | Acceso completo |
| **Comercial Mundial** | `comercial@vmlperito.com` | `comercial123` | Creación de órdenes |
| **Coordinador** | `coordinador@vmlperito.com` | `coordinador123` | Gestión de agentes |
| **Agente Contacto** | `agente@vmlperito.com` | `agente123` | Gestión de llamadas |

## Tabla de Notificaciones por Evento

### 📋 Notificaciones al Crear Orden de Inspección

| **Evento** | **Tipo de Notificación** | **Destinatario** | **Canal** | **Descripción** | **Plantilla** |
|------------|--------------------------|------------------|-----------|-----------------|---------------|
| `inspection_order.created` | `order_created_commercial_email` | Usuario Comercial | Email | Notificación al comercial que creó la orden | "Orden de Inspección Creada - {{inspection_order.numero}}" |
| `inspection_order.created` | `order_created_coordinator_email` | Coordinadores | Email | Notificación a coordinadores sobre nueva orden | "Nueva Orden de Inspección - {{inspection_order.numero}}" |
| `inspection_order.created` | `order_created_commercial_inapp` | Usuario Comercial | In-App | Notificación interna al comercial | "Orden {{inspection_order.numero}} creada exitosamente" |
| `inspection_order.created` | `order_created_coordinator_inapp` | Coordinadores | In-App | Notificación interna a coordinadores | "Nueva orden {{inspection_order.numero}} disponible" |
| `inspection_order.created` | `order_created_commercial_push` | Usuario Comercial | Push | Notificación push al comercial | "Orden creada: {{inspection_order.numero}}" |
| `inspection_order.created` | `order_created_coordinator_push` | Coordinadores | Push | Notificación push a coordinadores | "Nueva orden: {{inspection_order.numero}}" |

### 📅 Notificaciones al Realizar Agendamiento

| **Evento** | **Tipo de Notificación** | **Destinatario** | **Canal** | **Descripción** | **Plantilla** |
|------------|--------------------------|------------------|-----------|-----------------|---------------|
| `appointment.scheduled` | `appointment_confirmation_client_email` | Cliente | Email | Confirmación de cita al cliente | "Confirmación de Cita - {{appointment.date}}" |
| `appointment.scheduled` | `appointment_confirmation_client_sms` | Cliente | SMS | Confirmación SMS al cliente | "Su cita está confirmada para {{appointment.date}} {{appointment.time}}" |
| `appointment.scheduled` | `appointment_scheduled_commercial_inapp` | Usuario Comercial | In-App | Notificación al comercial sobre cita programada | "Cita programada para orden {{inspection_order.numero}}" |
| `appointment.scheduled` | `appointment_scheduled_commercial_push` | Usuario Comercial | Push | Notificación push sobre cita programada | "Cita programada: {{inspection_order.numero}}" |
| `appointment.scheduled` | `appointment_reminder_client_email` | Cliente | Email | Recordatorio de cita (1 hora antes) | "Recordatorio: Su cita es hoy a las {{appointment.time}}" |
| `appointment.scheduled` | `appointment_reminder_client_sms` | Cliente | SMS | Recordatorio SMS (1 hora antes) | "Recordatorio: Su cita es hoy a las {{appointment.time}}" |

### 🚀 Notificaciones al Iniciar Inspección Virtual

| **Evento** | **Tipo de Notificación** | **Destinatario** | **Canal** | **Descripción** | **Plantilla** |
|------------|--------------------------|------------------|-----------|-----------------|---------------|
| `inspection_order.started` | `inspection_started_client_sms` | Cliente | SMS | SMS al cliente cuando inicia la inspección virtual | "¡Hola! SEGUROS MUNDIAL te informa que te estamos esperando para la inspección virtual, únete a la sesión con el siguiente enlace: {{appointment.session_url}}" |

### 🔧 Configuración de Condiciones

#### Para Órdenes de Inspección:
```javascript
// Condiciones para notificaciones comerciales
{
    "is_commercial_creator": true,  // Solo al comercial que creó la orden
    "user_role": "comercial_mundial"
}

// Condiciones para coordinadores
{
    "user_role": "coordinador_contacto"
}
```

#### Para Agendamientos:
```javascript
// Condiciones para clientes
{
    "for_clients": true  // Enviar al cliente de la orden
}

// Condiciones para comerciales
{
    "user_role": "comercial_mundial",
    "is_commercial_creator": true  // Solo al comercial de la orden
}
```

### 📊 Variables Disponibles

#### Para Órdenes de Inspección:
- `{{inspection_order.numero}}` - Número de la orden
- `{{inspection_order.nombre_cliente}}` - Nombre del cliente
- `{{inspection_order.correo_cliente}}` - Email del cliente
- `{{inspection_order.celular_cliente}}` - Teléfono del cliente
- `{{inspection_order.placa}}` - Placa del vehículo
- `{{inspection_order.marca}}` - Marca del vehículo
- `{{inspection_order.linea}}` - Línea del vehículo
- `{{inspection_order.modelo}}` - Modelo del vehículo
- `{{inspection_order.tipo_vehiculo}}` - Tipo de vehículo
- `{{inspection_order.sede_name}}` - Nombre de la sede

#### Para Agendamientos:
- `{{appointment.date}}` - Fecha de la cita
- `{{appointment.time}}` - Hora de la cita
- `{{appointment.sede_name}}` - Nombre de la sede
- `{{appointment.modality}}` - Modalidad de inspección
- `{{inspection_order.numero}}` - Número de la orden
- `{{inspection_order.nombre_cliente}}` - Nombre del cliente
- `{{inspection_order.correo_cliente}}` - Email del cliente
- `{{inspection_order.celular_cliente}}` - Teléfono del cliente

#### Para Inspección Virtual Iniciada:
- `{{inspection_order.numero}}` - Número de la orden
- `{{inspection_order.nombre_cliente}}` - Nombre del cliente
- `{{inspection_order.celular_cliente}}` - Teléfono del cliente
- `{{appointment.session_id}}` - ID de la sesión virtual
- `{{appointment.scheduled_date}}` - Fecha programada
- `{{appointment.scheduled_time}}` - Hora programada
- `{{appointment.session_url}}` - URL de la sesión virtual
- `{{sede.name}}` - Nombre de la sede

### 🎯 Flujo de Ejecución

1. **Creación de Orden**:
   - Se dispara evento `inspection_order.created`
   - Sistema busca listeners configurados
   - Evalúa condiciones para cada listener
   - Envía notificaciones por canales configurados

2. **Agendamiento**:
   - Se dispara evento `appointment.scheduled`
   - Sistema busca listeners configurados
   - Evalúa condiciones para cada listener
   - Envía confirmaciones inmediatas
   - Programa recordatorios para 1 hora antes

3. **Inicio de Inspección Virtual**:
   - Se dispara evento `inspection_order.started`
   - Sistema busca listeners configurados
   - Evalúa condiciones para cada listener
   - Envía SMS inmediato al cliente con enlace de sesión

### 📱 Canales de Entrega

| **Canal** | **Estado** | **Configuración** | **Notas** |
|-----------|------------|-------------------|-----------|
| **Email** | ✅ Activo | SMTP configurado | Usa variables de entorno |
| **SMS** | ✅ Activo | Hablame.co API | Solo números colombianos |
| **In-App** | ✅ Activo | WebSocket | Notificaciones en tiempo real |
| **Push** | ⚠️ Pendiente | FCM no configurado | Requiere configuración |
| **WhatsApp** | ⚠️ Pendiente | API no configurada | Requiere proveedor |

## Integración con Webhooks

### 🎯 Webhook: inspection_order.started

El sistema de notificaciones se integra con webhooks externos para activar notificaciones automáticas cuando una inspección virtual inicia.

#### **Configuración Automática**

Cuando se recibe el webhook `inspection_order.started`:

1. **Validación**: Se valida la autenticación HMAC y el payload
2. **Procesamiento**: Se procesa el evento y se enriquece el contexto
3. **Activación**: Se activa automáticamente el listener `inspection_started_client_sms`
4. **Notificación**: Se envía SMS inmediato al cliente con el enlace de la sesión

#### **Plantilla SMS Automática**

```
¡Hola! SEGUROS MUNDIAL te informa que te estamos esperando para la inspección virtual, únete a la sesión con el siguiente enlace: {{inspection_order.appointment.session_url}}
```

#### **Variables del Webhook**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{inspection_order.numero}}` | Número de la orden | `INS-2024-001` |
| `{{inspection_order.nombre_cliente}}` | Nombre del cliente | `Juan Pérez` |
| `{{inspection_order.celular_cliente}}` | Teléfono del cliente | `3043425127` |
| `{{inspection_order.appointment.session_url}}` | **URL de la sesión virtual** | `https://meet.google.com/abc-defg-hij` |
| `{{sede.name}}` | Nombre de la sede | `CDA Distrital` |

#### **Testing del Webhook**

```bash
# Generar comando curl con firma HMAC
cd apps/server/scripts
node generateHmac.js
```

#### **Respuesta Exitosa**

```json
{
  "success": true,
  "data": {
    "event_id": "webhook_1755835195898",
    "listeners_executed": 1,
    "notifications_sent": 1,
    "message": "Inspección virtual iniciada y notificaciones enviadas"
  }
}
```

### 📚 Documentación Relacionada

- [**Webhook: inspection_order.started**](./webhook-inspection-order-started.md) - Documentación completa del webhook
- [**Sistema de Webhooks**](./webhook-system.md) - Documentación general de webhooks
- [**Plantillas**](./templates_reference.md) - Referencia de plantillas
