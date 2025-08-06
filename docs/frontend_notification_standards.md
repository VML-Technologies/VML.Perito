# Estándares Frontend - Sistema de Notificaciones

## 📋 Resumen

Este documento define los estándares y convenciones para el frontend del sistema de notificaciones, asegurando consistencia con el backend.

## 🏗️ Estructura Estandarizada Frontend

### **Estructura de Plantillas en el Editor**

```javascript
{
  name: string,
  description: string,
  category: string,
  channels: {
    email: {
      subject: string,      // Asunto del email
      template: string,     // Plantilla principal
      body: string,         // Cuerpo específico
      html: string,         // Contenido HTML
      text: string          // Texto plano
    },
    sms: {
      template: string,     // Plantilla principal
      message: string       // Mensaje específico
    },
    whatsapp: {
      template: string,     // Plantilla principal
      message: string,      // Mensaje específico
      title: string         // Título específico
    },
    in_app: {
      title: string,        // Título específico
      template: string,     // Plantilla principal
      message: string       // Mensaje específico
    },
    push: {
      title: string,        // Título específico
      template: string,     // Plantilla principal
      message: string,      // Mensaje específico
      body: string          // Cuerpo específico
    }
  }
}
```

## 🔧 Componentes Actualizados

### **NotificationTemplateEditor**

#### **Campos por Canal:**

- **Email**: `subject`, `template`, `body`, `html`, `text`
- **SMS**: `template`, `message`
- **WhatsApp**: `template`, `message`, `title`
- **In-App**: `title`, `template`, `message`
- **Push**: `title`, `template`, `message`, `body`

#### **Funciones Principales:**

- `handleEditorChange()` - Maneja cambios en editores
- `handleFieldChange()` - Maneja cambios en campos específicos
- `getChannelConfig()` - Configuración de campos por canal

### **ChannelPreview**

#### **Estructura de Preview:**

- **Email**: Muestra asunto y plantilla principal
- **SMS**: Muestra plantilla principal con contador de caracteres
- **WhatsApp**: Muestra título (opcional) y plantilla principal
- **In-App**: Muestra título (opcional) y plantilla principal
- **Push**: Muestra título (opcional) y plantilla principal

### **NotificationTemplates (Página Principal)**

#### **Funciones de Mapeo:**

1. **`mapEditorDataToAPI()`** - Convierte datos del editor al formato de la API
2. **`mapTemplateForPreview()`** - Convierte datos de la API al formato del editor
3. **`extractVariables()`** - Extrae variables de las plantillas

## 📝 Convenciones de Nomenclatura Frontend

### **Campos Principales**

- `template` - Plantilla principal (siempre presente)
- `subject` - Asunto (Email)
- `title` - Título (WhatsApp, In-App, Push)
- `message` - Mensaje específico del canal
- `body` - Cuerpo del mensaje (Email, Push)
- `html` - Contenido HTML (Email)
- `text` - Texto plano (Email)

### **Funciones de Mapeo**

- `mapEditorDataToAPI()` - Frontend → Backend
- `mapTemplateForPreview()` - Backend → Frontend
- `extractVariables()` - Extracción de variables

## 🔄 Flujo de Datos Frontend

### **1. Creación de Plantilla**

```javascript
// Usuario crea plantilla en el editor
const templateData = {
  name: 'Mi Plantilla',
  channels: {
    email: {
      subject: '{{user.name}}, tu cita está confirmada',
      template: 'Hola {{user.name}}, tu cita está programada para {{appointment.date}}',
    },
  },
};

// Se mapea para enviar a la API
const apiData = mapEditorDataToAPI(templateData);
```

### **2. Edición de Plantilla**

```javascript
// Se recibe de la API
const apiTemplate = {
  channels: {
    email: {
      subject: 'Asunto',
      template: 'Plantilla principal',
    },
  },
};

// Se mapea para el editor
const editorTemplate = mapTemplateForPreview(apiTemplate);
```

### **3. Preview de Plantilla**

```javascript
// Se renderiza con datos de ejemplo
const renderedContent = renderTemplate(template.channels.email.template, sampleData);
```

## ✅ Validaciones Frontend

### **Campos Requeridos**

- `name` - Nombre de la plantilla
- `template` - Plantilla principal (al menos un canal)

### **Campos Opcionales**

- `subject` - Asunto específico
- `title` - Título específico
- `message` - Mensaje específico
- `body` - Cuerpo específico

## 🚀 Implementación Frontend

### **Componentes Actualizados**

- ✅ NotificationTemplateEditor
- ✅ ChannelPreview
- ✅ NotificationTemplates (página principal)
- ✅ TemplatePreview
- ✅ VariableSelector

### **Funciones de Mapeo**

- ✅ `mapEditorDataToAPI()` - Estructura estandarizada
- ✅ `mapTemplateForPreview()` - Estructura estandarizada
- ✅ `extractVariables()` - Extracción mejorada

### **Campos por Canal**

- ✅ **Email**: 5 campos (subject, template, body, html, text)
- ✅ **SMS**: 2 campos (template, message)
- ✅ **WhatsApp**: 3 campos (template, message, title)
- ✅ **In-App**: 3 campos (title, template, message)
- ✅ **Push**: 4 campos (title, template, message, body)

## 🔗 Integración Backend-Frontend

### **Consistencia de Datos**

- Frontend y backend usan la misma estructura de campos
- Mapeo bidireccional entre formatos
- Validaciones consistentes

### **Campos Estandarizados**

- `template` - Campo principal en todos los canales
- Campos específicos por canal en metadata
- Estructura JSON consistente

---

**Última actualización**: Julio 2025
**Versión**: 1.0
**Estado**: ✅ Implementado y Validado
