# 📚 Documentación VML.Perito

## 🎯 Descripción General

Esta carpeta contiene toda la documentación técnica del sistema VML.Perito, organizada por categorías para facilitar la navegación y el mantenimiento.

## 📋 Índice de Documentación

### **🏗️ Arquitectura y Sistema Principal**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Sistema Principal**](./vml-perito-system.md) | Arquitectura completa y componentes principales | ✅ Actualizado |
| [**Patrones de Desarrollo**](./development-patterns.md) | Convenciones y mejores prácticas generales | ✅ Actualizado |
| [**Sistema de Notificaciones**](./notification-system.md) | Documentación completa del sistema de notificaciones | ✅ Actualizado |
| [**WebSockets**](./websockets-system.md) | Sistema de comunicación en tiempo real | ✅ Actualizado |

### **🔧 Configuración y Setup**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Base de Datos y Seeding**](./database-seeding.md) | Configuración inicial y datos de prueba | ✅ Actualizado |
| [**Sistema de Agendamiento**](./advanced-scheduling-system.md) | Configuración de horarios y sedes | ✅ Actualizado |
| [**Contact Center**](./contact-center-terminology.md) | Terminología y flujos del contact center | ✅ Actualizado |

### **📱 Frontend y UI**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Patrones de Componentes**](./ui-component-patterns.md) | Componentes React y shadcn/ui | ✅ Actualizado |
| [**Estándares Frontend**](./frontend-notification-standards.md) | Convenciones para el frontend | ✅ Actualizado |
| [**Texto en Español**](./spanish-ui-text.md) | Guías para textos de interfaz | ✅ Actualizado |

### **🎯 Flujos de Negocio**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Flujo de Órdenes**](./inspection-order-flow.md) | Proceso completo de inspecciones | ✅ Actualizado |
| [**Patrones de Agentes**](./agent-contact-patterns.md) | Patrones para agentes de contacto | ✅ Actualizado |
| [**Patrones de Coordinadores**](./coordinator-patterns.md) | Patrones para coordinadores | ✅ Actualizado |

### **⚙️ API y Backend**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Controladores API**](./api-controllers.md) | Patrones para endpoints | ✅ Actualizado |
| [**Formato de Respuestas**](./api-response-format.md) | Estándares de respuestas JSON | ✅ Actualizado |
| [**Sistema de Webhooks**](./webhook-system.md) | Integración con plataformas externas | ✅ Actualizado |

### **🔍 Debugging y Troubleshooting**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Debugging y Solución de Problemas**](./debugging-and-troubleshooting.md) | Guías para resolver problemas | ✅ Actualizado |
| [**Patrones Backend**](./backend-development-patterns.md) | Patrones específicos del backend | ✅ Actualizado |
| [**Patrones Frontend**](./frontend-development-patterns.md) | Patrones específicos del frontend | ✅ Actualizado |

### **📧 Sistema de Notificaciones (Específico)**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [**Notificaciones - Documentación Completa**](./Notificaciones.md) | Documentación técnica completa del sistema | ✅ Actualizado |
| [**Flujo de Notificaciones**](./notificaciones_flujo.md) | Flujo detallado y relaciones de BD | ✅ Actualizado |
| [**Resumen de Notificaciones**](./resumen_notificaciones.md) | Resumen ejecutivo del sistema | ✅ Actualizado |
| [**Estándares de Notificaciones**](./notification_standards.md) | Estándares y convenciones | ✅ Actualizado |
| [**Referencia de Condiciones**](./notification_conditions_reference.md) | Sistema de condiciones simplificado | ✅ Actualizado |
| [**Referencia de Plantillas**](./templates_reference.md) | Todas las plantillas disponibles | ✅ Actualizado |

## 🚀 Guía de Navegación

### **Para Desarrolladores Nuevos**

1. **Comenzar con**: [Sistema Principal](./vml-perito-system.md)
2. **Configurar entorno**: [Base de Datos y Seeding](./database-seeding.md)
3. **Entender flujos**: [Flujo de Órdenes](./inspection-order-flow.md)
4. **Aprender patrones**: [Patrones de Desarrollo](./development-patterns.md)

### **Para Frontend**

1. **Componentes**: [Patrones de Componentes](./ui-component-patterns.md)
2. **Estándares**: [Estándares Frontend](./frontend-notification-standards.md)
3. **Texto**: [Texto en Español](./spanish-ui-text.md)

### **Para Backend**

1. **API**: [Controladores API](./api-controllers.md)
2. **Patrones**: [Patrones Backend](./backend-development-patterns.md)
3. **Notificaciones**: [Sistema de Notificaciones](./notification-system.md)

### **Para Troubleshooting**

1. **Problemas generales**: [Debugging y Troubleshooting](./debugging-and-troubleshooting.md)
2. **Notificaciones**: [Resumen de Notificaciones](./resumen_notificaciones.md)
3. **WebSockets**: [WebSockets](./websockets-system.md)

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

### **Reglas de Desarrollo**
- [Reglas Cursor](../.cursor/rules/)
- [Convenciones de Nomenclatura](../.cursor/rules/naming-conventions.mdc)
- [Patrones de Desarrollo](../.cursor/rules/development-patterns.mdc)

## 📝 Contribución a la Documentación

### **Cuándo Actualizar**
- Al agregar nuevas funcionalidades
- Al cambiar patrones de desarrollo
- Al modificar configuraciones del sistema
- Al resolver problemas comunes

### **Cómo Actualizar**
1. Modificar el documento correspondiente
2. Actualizar la tabla de estado en este README
3. Verificar que los enlaces funcionen
4. Probar ejemplos de código

### **Estándares de Documentación**
- Usar emojis para mejor navegación
- Incluir ejemplos de código funcionales
- Mantener enlaces actualizados
- Usar español para textos de usuario
- Incluir capturas de pantalla cuando sea útil

---

**Última actualización**: Enero 2025  
**Responsable**: Equipo de Desarrollo VML.Perito  
**Estado**: ✅ Mantenido y Actualizado 