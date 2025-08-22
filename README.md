# Movilidad Mundial - Sistema de Inspecciones de Asegurabilidad

## 🎯 Descripción General

Movilidad Mundial es un sistema integral para la gestión de inspecciones de asegurabilidad vehicular, que incluye agendamiento avanzado, gestión de contact center, sistema de notificaciones multicanal, y administración completa de usuarios y permisos.

## 🏗️ Arquitectura del Sistema

### **Stack Tecnológico**

- **Backend**: Node.js + Express.js + Sequelize ORM
- **Frontend**: React + Vite + shadcn/ui
- **Base de Datos**: MySQL/PostgreSQL
- **WebSockets**: Socket.IO para notificaciones en tiempo real
- **Autenticación**: JWT + RBAC (Role-Based Access Control)

### **Estructura del Proyecto**

```
Movilidad Mundial/
├── apps/
│   ├── server/          # Backend API
│   └── web/             # Frontend React
├── docs/                # Documentación técnica
├── .cursor/rules/       # Reglas de desarrollo
└── todo/                # Planes y tareas pendientes
```

## 🚀 Características Principales

### **✅ Sistema de Agendamiento Avanzado**

- Horarios flexibles con intervalos configurables
- Tipos de vehículos (Livianos, Pesados, Motos)
- Sedes reales con direcciones actuales
- Modalidades de inspección (En Sede, A Domicilio, Virtual)
- Validación de capacidad en tiempo real

### **✅ Sistema de Notificaciones Multicanal**

- **Email**: SMTP con plantillas HTML personalizables
- **SMS**: Integración con Hablame API (Colombia)
- **In-App**: Notificaciones en tiempo real via WebSocket
- **Push**: Notificaciones push móviles
- **WhatsApp**: Integración con WhatsApp Business API

### **✅ Gestión de Contact Center**

- **Agentes de Contacto**: Gestión de llamadas y seguimientos
- **Coordinadores**: Asignación y supervisión de agentes
- **Comercial Mundial**: Creación y gestión de órdenes
- **Sistema de Roles RBAC**: Permisos granulares

### **✅ Sistema de Eventos y Webhooks**

- Arquitectura basada en eventos
- Webhooks para integración con plataformas externas
- Sistema de condiciones simplificado y frontend-friendly
- Plantillas de notificación específicas por tipo

## 📚 Documentación

### **📋 Índice Principal**
- [**Documentación Completa**](docs/README.md) - Navegación y guías organizadas

### **🚀 Para Empezar**
- [**Sistema Principal**](docs/vml-perito-system.md) - Arquitectura completa
- [**Configuración Inicial**](docs/database-seeding.md) - Setup del proyecto
- [**Patrones de Desarrollo**](docs/development-patterns.md) - Convenciones

### **🔧 Desarrollo**
- [**Controladores API**](docs/api-controllers.md) - Patrones para endpoints
- [**Formato de Respuestas**](docs/api-response-format.md) - Estándares JSON
- [**Sistema de Notificaciones**](docs/Notificaciones.md) - Documentación completa
- [**WebSockets**](docs/websockets-system.md) - Comunicación en tiempo real

### **📱 Frontend**
- [**Patrones de Componentes**](docs/ui-component-patterns.md) - Componentes React
- [**Texto en Español**](docs/spanish-ui-text.md) - Guías de texto

### **🎯 Flujos de Negocio**
- [**Flujo de Órdenes**](docs/inspection-order-flow.md) - Proceso completo
- [**Patrones de Agentes**](docs/agent-contact-patterns.md) - Agentes de contacto
- [**Patrones de Coordinadores**](docs/coordinator-patterns.md) - Coordinadores
- [**Contact Center**](docs/contact-center-terminology.md) - Terminología

### **🔗 Integración Externa**
- [**Webhook: inspection_order.started**](docs/webhook-inspection-order-started.md) - Implementación específica
- [**Sistema de Webhooks**](docs/webhook-system.md) - Documentación general
- [**Scripts de Testing**](apps/server/scripts/generateHmac.js) - Generador HMAC

### **🔍 Troubleshooting**
- [**Debugging y Solución de Problemas**](docs/debugging-and-troubleshooting.md) - Guías
- [**Patrones Backend**](docs/backend-development-patterns.md) - Backend
- [**Patrones Frontend**](docs/frontend-development-patterns.md) - Frontend

## 🛠️ Instalación y Configuración

### **Prerrequisitos**

- Node.js 18+
- MySQL 8.0+ o PostgreSQL 13+
- npm o yarn

### **Configuración Inicial**

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd Movilidad Mundial

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# 4. Configurar base de datos
npm run db:setup

# 5. Ejecutar seeders
npm run seed:all

# 6. Iniciar desarrollo
npm run dev
```

### **Variables de Entorno Críticas**

```bash
# Base de Datos
DATABASE_URL=mysql://user:password@localhost:3306/vmlperito

# JWT
JWT_SECRET=your_jwt_secret_here

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@vmlperito.com
EMAIL_PASS=your_app_password

# SMS (Hablame API)
HABLAME_KEY=your_hablame_api_key
SMS_FROM=VMLPerito

# WebSocket
WS_PORT=3001
```

## 🎮 Uso del Sistema

### **Credenciales de Prueba**

| Rol                   | Email                       | Contraseña       | Descripción                |
| --------------------- | --------------------------- | ---------------- | -------------------------- |
| **Admin**             | `admin@vmlperito.com`       | `admin123`       | Acceso completo al sistema |
| **Comercial Mundial** | `comercial@vmlperito.com`   | `comercial123`   | Creación de órdenes        |
| **Coordinador**       | `coordinador@vmlperito.com` | `coordinador123` | Gestión de agentes         |
| **Agente Contacto**   | `agente@vmlperito.com`      | `agente123`      | Gestión de llamadas        |

### **Flujos Principales**

1. **Creación de Orden**: Comercial Mundial crea orden de inspección
2. **Asignación**: Coordinador asigna agente a la orden
3. **Contacto**: Agente realiza llamadas y seguimientos
4. **Agendamiento**: Cliente agenda cita de inspección
5. **Notificaciones**: Sistema envía confirmaciones automáticas
6. **Inspección**: Se realiza la inspección (presencial o virtual)

## 📊 Estado del Proyecto

### **✅ Implementado y Funcional**

- ✅ Sistema de autenticación RBAC
- ✅ Gestión de usuarios y roles
- ✅ Sistema de notificaciones multicanal
- ✅ Agendamiento avanzado
- ✅ Contact center management
- ✅ WebSockets en tiempo real
- ✅ API REST completa
- ✅ Frontend React con shadcn/ui

### **🔄 En Desarrollo**

- 🔄 Sistema de webhooks para integración externa
- 🔄 Dashboard de métricas y reportes
- 🔄 Optimizaciones de performance

### **📋 Pendiente**

- 📋 Integración WhatsApp Business API
- 📋 Notificaciones push móviles
- 📋 Sistema de archivos adjuntos
- 📋 Reportes avanzados

## 🧪 Testing

### **Scripts de Prueba**

```bash
# Probar sistema de notificaciones
npm run test:notifications

# Probar sistema de eventos
npm run test:events

# Probar WebSockets
npm run test:websockets

# Probar API endpoints
npm run test:api
```

### **Datos de Prueba**

El sistema incluye datos de prueba completos:

- 5 sedes reales con direcciones
- 3 tipos de vehículos
- 3 modalidades de inspección
- Usuarios con todos los roles
- Plantillas de notificación completas

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar desarrollo
npm run build            # Build de producción
npm run preview          # Preview de build

# Base de datos
npm run db:setup         # Configurar base de datos
npm run db:seed          # Ejecutar seeders
npm run db:reset         # Resetear base de datos

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch

# Webhooks
cd apps/server/scripts && node generateHmac.js  # Generar firma HMAC para testing
cd apps/server/scripts && node fixTemplatePath.js  # Corregir plantillas de notificación

# Linting
npm run lint             # Lint del código
npm run lint:fix         # Auto-fix de linting
```

## 🤝 Contribución

### **Reglas de Desarrollo**

- Seguir las [convenciones de nomenclatura](docs/naming-conventions.md)
- Usar los [patrones de desarrollo](docs/development-patterns.md)
- Implementar [manejo de errores](docs/error-handling-patterns.md)
- Optimizar [performance](docs/performance-optimization.md)

### **Proceso de Desarrollo**

1. Crear rama desde `main`
2. Implementar cambios siguiendo las reglas
3. Ejecutar tests y linting
4. Crear Pull Request con descripción detallada
5. Revisión y merge

## 📞 Soporte

### **Documentación Técnica**

- [**Troubleshooting**](docs/debugging-and-troubleshooting.md) - Solución de problemas comunes
- [**FAQ**](docs/faq.md) - Preguntas frecuentes
- [**Changelog**](docs/changelog.md) - Historial de cambios

### **Contacto**

- **Email**: soporte@vmlperito.com
- **Documentación**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/vmlperito/issues)

## 📄 Licencia

Este proyecto es propiedad de Movilidad Mundial. Todos los derechos reservados.

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
