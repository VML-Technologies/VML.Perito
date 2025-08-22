# 📚 Documentación Movilidad Mundial

## 🎯 Descripción General

Esta carpeta contiene toda la documentación técnica del sistema Movilidad Mundial, organizada de manera simple y fácil de navegar.

## 📋 Índice Principal

### **🚀 Para Empezar**
- [**README Principal**](../README.md) - Visión general del proyecto
- [**Sistema Principal**](./vml-perito-system.md) - Arquitectura completa
- [**Configuración Inicial**](./database-seeding.md) - Setup del proyecto

### **🔧 Desarrollo**
- [**Patrones de Desarrollo**](./development-patterns.md) - Convenciones y mejores prácticas
- [**Controladores API**](./api-controllers.md) - Patrones para endpoints
- [**Formato de Respuestas**](./api-response-format.md) - Estándares JSON

### **📱 Frontend**
- [**Patrones de Componentes**](./ui-component-patterns.md) - Componentes React y shadcn/ui
- [**Texto en Español**](./spanish-ui-text.md) - Guías para textos de interfaz

### **🎯 Flujos de Negocio**
- [**Flujo de Órdenes**](./inspection-order-flow.md) - Proceso completo de inspecciones
- [**Patrones de Agentes**](./agent-contact-patterns.md) - Patrones para agentes de contacto
- [**Patrones de Coordinadores**](./coordinator-patterns.md) - Patrones para coordinadores
- [**Contact Center**](./contact-center-terminology.md) - Terminología y flujos

### **⚙️ API y Backend**
- [**Sistema de Webhooks**](./webhook-system.md) - Integración con plataformas externas
- [**Webhook: inspection_order.started**](./webhook-inspection-order-started.md) - Implementación específica
- [**WebSockets**](./websockets-system.md) - Sistema de comunicación en tiempo real

### **📧 Sistema de Notificaciones**
- [**Notificaciones - Completo**](./Notificaciones.md) - Documentación técnica completa
- [**Plantillas**](./templates_reference.md) - Todas las plantillas disponibles

### **🔍 Debugging y Troubleshooting**
- [**Debugging y Solución de Problemas**](./debugging-and-troubleshooting.md) - Guías para resolver problemas
- [**Patrones Backend**](./backend-development-patterns.md) - Patrones específicos del backend
- [**Patrones Frontend**](./frontend-development-patterns.md) - Patrones específicos del frontend

## 🚀 Guía de Navegación

### **Para Desarrolladores Nuevos**
1. [**README Principal**](../README.md) - Visión general
2. [**Sistema Principal**](./vml-perito-system.md) - Arquitectura
3. [**Configuración Inicial**](./database-seeding.md) - Setup
4. [**Patrones de Desarrollo**](./development-patterns.md) - Convenciones

### **Para Frontend**
1. [**Patrones de Componentes**](./ui-component-patterns.md) - Componentes
2. [**Texto en Español**](./spanish-ui-text.md) - Textos

### **Para Backend**
1. [**Controladores API**](./api-controllers.md) - Endpoints
2. [**Sistema de Notificaciones**](./Notificaciones.md) - Notificaciones
3. [**WebSockets**](./websockets-system.md) - Tiempo real

### **Para Integración Externa**
1. [**Webhook: inspection_order.started**](./webhook-inspection-order-started.md) - Específico
2. [**Sistema de Webhooks**](./webhook-system.md) - General
3. [**Scripts de Testing**](../apps/server/scripts/generateHmac.js) - Testing

### **Para Troubleshooting**
1. [**Debugging y Troubleshooting**](./debugging-and-troubleshooting.md) - Problemas
2. [**Logs del Sistema**](../apps/server/logs/) - Logs

## 🔗 Enlaces Rápidos

### **Configuración Rápida**
- [Variables de Entorno](../apps/server/.env.example)
- [Scripts de Seeding](../apps/server/scripts/seedAll.js)
- [Configuración de Base de Datos](../apps/server/config/database.js)

### **Archivos Clave del Sistema**
- [Servidor Principal](../apps/server/index.js)
- [Frontend Principal](../apps/web/src/App.jsx)
- [Sistema de Notificaciones](../apps/server/services/notificationService.js)
- [WebSockets](../apps/server/websocket/index.js)
- [Webhook Controller](../apps/server/controllers/webhookController.js)
- [Generador HMAC](../apps/server/scripts/generateHmac.js)

### **Reglas de Desarrollo**
- [Reglas Cursor](../.cursor/rules/)
- [Convenciones de Nomenclatura](../.cursor/rules/naming-conventions.mdc)
- [Patrones de Desarrollo](../.cursor/rules/development-patterns.mdc)

## 📊 Estado de la Documentación

### **✅ Documentos Actualizados (Enero 2025)**
- Todos los documentos reflejan el estado actual del sistema
- Información de credenciales de prueba actualizada
- Enlaces a archivos y componentes verificados
- Ejemplos de código funcionales

### **🔄 Documentos en Mantenimiento**
- Se actualizan automáticamente con cambios en el código
- Se revisan mensualmente para consistencia
- Se validan contra el estado actual del sistema

## 📝 Contribución a la Documentación

### **Cuándo Actualizar**
- Al agregar nuevas funcionalidades
- Al cambiar patrones de desarrollo
- Al modificar configuraciones del sistema
- Al resolver problemas comunes

### **Cómo Actualizar**
1. Modificar el documento correspondiente
2. Verificar que los enlaces funcionen
3. Probar ejemplos de código

### **Estándares de Documentación**
- Usar emojis para mejor navegación
- Incluir ejemplos de código funcionales
- Mantener enlaces actualizados
- Usar español para textos de usuario
- Incluir capturas de pantalla cuando sea útil

---

**Última actualización**: Enero 2025  
**Responsable**: Equipo de Desarrollo Movilidad Mundial  
**Estado**: ✅ Mantenido y Actualizado 