# Estándares del Sistema de Notificaciones - VML Perito

## 📋 Resumen

Este documento define los estándares y convenciones para el sistema de notificaciones, asegurando consistencia en todos los servicios y componentes.

## 🏗️ Estructura Estandarizada

### **Modelo de Notificación (Notification)**

```javascript
{
    id: number,
    notification_config_id: number,
    inspection_order_id: number | null,
    appointment_id: number | null,
    recipient_type: 'user' | 'client',
    recipient_user_id: number | null,
    recipient_email: string | null,
    recipient_phone: string | null,
    recipient_name: string | null,
    title: string,           // ✅ CAMPO ESTÁNDAR
    content: string,         // ✅ CAMPO ESTÁNDAR
    status: 'pending' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'failed' | 'read' | 'cancelled',
    priority: 'low' | 'normal' | 'high' | 'urgent',
    scheduled_at: Date | null,
    sent_at: Date | null,
    delivered_at: Date | null,
    read_at: Date | null,
    failed_at: Date | null,
    retry_count: number,
    max_retries: number,
    metadata: {
        channel: string,
        original_data: object,
        config_id: number,
        channel_data: {
            email: object,
            sms: object,
            whatsapp: object,
            in_app: object,
            push: object
        }
    }
}
```

### **Estructura de Plantillas (NotificationTemplate)**

```javascript
{
    id: number,
    name: string,
    description: string,
    category: string,
    channels: {
        email: {
            subject: string,
            template: string,
            body: string,
            html: string,
            text: string,
            variables: string[]
        },
        sms: {
            template: string,
            message: string,
            variables: string[]
        },
        whatsapp: {
            template: string,
            message: string,
            title: string,
            variables: string[]
        },
        in_app: {
            title: string,
            template: string,
            message: string,
            variables: string[]
        },
        push: {
            title: string,
            template: string,
            message: string,
            body: string,
            variables: string[]
        }
    },
    variables: string[],
    is_active: boolean,
    created_by: number,
    version: number,
    metadata: object
}
```

## 🔧 Servicios de Canales

### **Campos Estandarizados por Canal**

#### **Email Service**

- ✅ `notification.recipient_email` - Email del destinatario
- ✅ `notification.title` - Título de la notificación
- ✅ `notification.content` - Contenido principal
- ✅ `notification.metadata.channel_data.email.subject` - Asunto específico del email
- ✅ `notification.metadata.channel_data.email.body` - Cuerpo específico del email
- ✅ `notification.metadata.channel_data.email.html` - Contenido HTML específico

#### **SMS Service**

- ✅ `notification.recipient_phone` - Teléfono del destinatario
- ✅ `notification.title` - Título de la notificación
- ✅ `notification.content` - Contenido principal
- ✅ `notification.metadata.channel_data.sms.message` - Mensaje específico del SMS

#### **WhatsApp Service**

- ✅ `notification.recipient_phone` - Teléfono del destinatario
- ✅ `notification.title` - Título de la notificación
- ✅ `notification.content` - Contenido principal
- ✅ `notification.metadata.channel_data.whatsapp.message` - Mensaje específico de WhatsApp
- ✅ `notification.metadata.channel_data.whatsapp.title` - Título específico de WhatsApp

#### **In-App Service**

- ✅ `notification.recipient_user_id` - ID del usuario destinatario
- ✅ `notification.title` - Título de la notificación
- ✅ `notification.content` - Contenido principal
- ✅ `notification.metadata.channel_data.in_app.title` - Título específico in-app
- ✅ `notification.metadata.channel_data.in_app.message` - Mensaje específico in-app

#### **Push Service**

- ✅ `notification.recipient_user_id` - ID del usuario destinatario
- ✅ `notification.push_token` - Token de push del dispositivo
- ✅ `notification.title` - Título de la notificación
- ✅ `notification.content` - Contenido principal
- ✅ `notification.metadata.channel_data.push.title` - Título específico push
- ✅ `notification.metadata.channel_data.push.message` - Mensaje específico push

## 📝 Convenciones de Nomenclatura

### **Campos Principales**

- `title` - Título principal de la notificación
- `content` - Contenido principal de la notificación
- `message` - Mensaje específico del canal (SMS, WhatsApp)
- `body` - Cuerpo del mensaje (Email)
- `subject` - Asunto (Email)
- `html` - Contenido HTML (Email)

### **Metadata**

- `channel_data` - Datos específicos por canal
- `original_data` - Datos originales del evento
- `config_id` - ID de la configuración de notificación

## 🔄 Flujo de Datos

### **1. Creación de Notificación**

```javascript
// NotificationService.createNotificationForRecipient()
{
    title: "Título procesado",
    content: "Contenido procesado",
    metadata: {
        channel_data: {
            email: { subject: "Asunto específico", body: "Cuerpo específico" },
            sms: { message: "Mensaje específico" }
        }
    }
}
```

### **2. Renderizado por Canal**

```javascript
// TemplateService.renderTemplateByChannel()
{
    email: { subject: "Asunto renderizado", body: "Cuerpo renderizado" },
    sms: { message: "Mensaje renderizado" }
}
```

### **3. Envío por Canal**

```javascript
// Canal específico extrae datos de metadata.channel_data
const channelData = notification.metadata?.channel_data?.email || {};
const subject = channelData.subject || notification.title;
const content = channelData.body || notification.content;
```

## ✅ Validaciones

### **Campos Requeridos**

- `title` - Siempre presente
- `content` - Siempre presente
- `recipient_*` - Al menos uno según el tipo de notificación

### **Campos Opcionales**

- `metadata.channel_data.*` - Específicos del canal
- `metadata.original_data` - Datos del evento original

## 🚀 Implementación

### **Servicios Actualizados**

- ✅ EmailService
- ✅ SMSService
- ✅ WhatsAppService
- ✅ InAppService
- ✅ PushService
- ✅ NotificationService
- ✅ TemplateService
- ✅ NotificationOrchestrator

### **Beneficios**

- 🔄 **Consistencia** - Todos los servicios usan la misma estructura
- 🔧 **Flexibilidad** - Datos específicos por canal en metadata
- 📊 **Trazabilidad** - Datos originales preservados
- 🛠️ **Mantenibilidad** - Estructura clara y documentada

---

**Última actualización**: Julio 2025
**Versión**: 1.0
**Estado**: ✅ Implementado y Validado
