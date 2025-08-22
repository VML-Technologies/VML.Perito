---
description: Regla principal del sistema Movilidad Mundial que define la arquitectura completa, incluyendo backend Express.js, frontend React, sistema RBAC, agendamiento avanzado, sistema de notificaciones, contact center management, WebSockets en tiempo real, y patrones de desarrollo. Contiene credenciales de prueba, estructura de archivos, roles y permisos, y guías para agregar nuevas funcionalidades.
alwaysApply: false
---

# Movilidad Mundial System Architecture Guide

## Project Overview

Movilidad Mundial is a monorepo application for managing vehicle inspection orders with role-based access control (RBAC). The system includes backend Express.js API and frontend React application with advanced scheduling, notification system, and contact center management.

## Project Structure

### Backend (`apps/server/`)

- **Entry Point**: [apps/server/index.js](mdc:apps/server/index.js) - Main server configuration with routes, WebSocket setup, and security middleware
- **Database Config**: [apps/server/config/database.js](mdc:apps/server/config/database.js) - Sequelize configuration for MySQL/SQLite/MSSQL
- **Security Config**: [apps/server/config/security.js](mdc:apps/server/config/security.js) - CORS, rate limiting, and security settings
- **Models**: [apps/server/models/index.js](mdc:apps/server/models/index.js) - Central model registry with relationships

#### Core Models

- **Users & RBAC**: [apps/server/models/user.js](mdc:apps/server/models/user.js), [apps/server/models/role.js](mdc:apps/server/models/role.js), [apps/server/models/permission.js](mdc:apps/server/models/permission.js)
- **Inspection System**: [apps/server/models/inspectionOrder.js](mdc:apps/server/models/inspectionOrder.js), [apps/server/models/callLog.js](mdc:apps/server/models/callLog.js), [apps/server/models/appointment.js](mdc:apps/server/models/appointment.js)
- **Scheduling System**: [apps/server/models/scheduleTemplate.js](mdc:apps/server/models/scheduleTemplate.js), [apps/server/models/vehicleType.js](mdc:apps/server/models/vehicleType.js), [apps/server/models/sedeVehicleType.js](mdc:apps/server/models/sedeVehicleType.js)
- **Geographic**: [apps/server/models/department.js](mdc:apps/server/models/department.js), [apps/server/models/city.js](mdc:apps/server/models/city.js), [apps/server/models/sede.js](mdc:apps/server/models/sede.js), [apps/server/models/sedeType.js](mdc:apps/server/models/sedeType.js)
- **Notification System**: [apps/server/models/notificationTemplate.js](mdc:apps/server/models/notificationTemplate.js), [apps/server/models/notificationConfig.js](mdc:apps/server/models/notificationConfig.js), [apps/server/models/event.js](mdc:apps/server/models/event.js)

#### Controllers

- **Inspection Orders**: [apps/server/controllers/inspectionOrderController.js](mdc:apps/server/controllers/inspectionOrderController.js) - CRUD, stats, search
- **Contact Agent**: [apps/server/controllers/contactAgentController.js](mdc:apps/server/controllers/contactAgentController.js) - Call logs, appointments, geographic data
- **Coordinator**: [apps/server/controllers/coordinadorContactoController.js](mdc:apps/server/controllers/coordinadorContactoController.js) - Agent assignment, order management
- **Scheduling**: [apps/server/controllers/scheduleController.js](mdc:apps/server/controllers/scheduleController.js) - Available schedules, time slots, appointments
- **RBAC**: [apps/server/controllers/roleController.js](mdc:apps/server/controllers/roleController.js), [apps/server/controllers/userController.js](mdc:apps/server/controllers/userController.js)
- **Notifications**: [apps/server/controllers/templateController.js](mdc:apps/server/controllers/templateController.js), [apps/server/controllers/eventController.js](mdc:apps/server/controllers/eventController.js)

#### Services

- **Event System**: [apps/server/services/eventService.js](mdc:apps/server/services/eventService.js) - Event management and triggers
- **Template Service**: [apps/server/services/templateService.js](mdc:apps/server/services/templateService.js) - Notification template management
- **Automated Events**: [apps/server/services/automatedEventTriggers.js](mdc:apps/server/services/automatedEventTriggers.js) - Automated notification triggers

#### Middleware

- **RBAC**: [apps/server/middleware/rbac.js](mdc:apps/server/middleware/rbac.js) - Permission checking middleware
- **Registry**: [apps/server/middleware/permissionRegistry.js](mdc:apps/server/middleware/permissionRegistry.js) - Permission definitions
- **Auth**: [apps/server/middleware/auth.js](mdc:apps/server/middleware/auth.js) - JWT authentication
- **Security**: [apps/server/utils/sqlSanitizer.js](mdc:apps/server/utils/sqlSanitizer.js) - SQL injection prevention

#### WebSockets

- **Main**: [apps/server/websocket/index.js](mdc:apps/server/websocket/index.js) - Socket.IO setup with JWT auth
- **Notifications**: [apps/server/websocket/notificationHandler.js](mdc:apps/server/websocket/notificationHandler.js) - Real-time notifications
- **Real-time**: [apps/server/websocket/realtimeHandler.js](mdc:apps/server/websocket/realtimeHandler.js) - Live data updates

### Frontend (`apps/web/`)

- **Entry Point**: [apps/web/src/main.jsx](mdc:apps/web/src/main.jsx) - React app initialization
- **Router**: [apps/web/src/App.jsx](mdc:apps/web/src/App.jsx) - Main routing with role-based route protection
- **API Config**: [apps/web/src/config/api.js](mdc:apps/web/src/config/api.js) - Centralized API endpoint definitions

#### Core Pages

- **Comercial Mundial**: [apps/web/src/pages/ComercialMundial.jsx](mdc:apps/web/src/pages/ComercialMundial.jsx) - Order creation and management
- **Agente Contacto**: [apps/web/src/pages/AgenteContacto.jsx](mdc:apps/web/src/pages/AgenteContacto.jsx) - Call management and scheduling
- **Coordinador Contacto**: [apps/web/src/pages/CoordinadorContacto.jsx](mdc:apps/web/src/pages/CoordinadorContacto.jsx) - Agent assignment and supervision
- **Admin RBAC**: [apps/web/src/pages/Admin.jsx](mdc:apps/web/src/pages/Admin.jsx) - Role and permission management
- **Notification Templates**: [apps/web/src/pages/NotificationTemplates.jsx](mdc:apps/web/src/pages/NotificationTemplates.jsx) - Template management
- **Channel Configurations**: [apps/web/src/pages/ChannelConfigurations.jsx](mdc:apps/web/src/pages/ChannelConfigurations.jsx) - Notification channel setup

#### Key Components

- **Create Order Modal**: [apps/web/src/components/CreateOrderModal.jsx](mdc:apps/web/src/components/CreateOrderModal.jsx) - Order creation form with validation
- **Navigation**: [apps/web/src/components/app-sidebar.jsx](mdc:apps/web/src/components/app-sidebar.jsx) - Role-based navigation
- **Route Protection**: [apps/web/src/components/RoleBasedRoute.jsx](mdc:apps/web/src/components/RoleBasedRoute.jsx) - Route access control
- **Notification Editor**: [apps/web/src/components/NotificationTemplateEditor.jsx](mdc:apps/web/src/components/NotificationTemplateEditor.jsx) - WYSIWYG template editor
- **Scheduling Components**: [apps/web/src/components/CalendarioAgendamiento.jsx](mdc:apps/web/src/components/CalendarioAgendamiento.jsx), [apps/web/src/components/TimeSlotSelector.jsx](mdc:apps/web/src/components/TimeSlotSelector.jsx)

#### Contexts

- **Auth**: [apps/web/src/contexts/auth-context.jsx](mdc:apps/web/src/contexts/auth-context.jsx) - Authentication state
- **RBAC**: [apps/web/src/contexts/rbac-context.jsx](mdc:apps/web/src/contexts/rbac-context.jsx) - Role and permission state
- **Notifications**: [apps/web/src/contexts/notification-context.jsx](mdc:apps/web/src/contexts/notification-context.jsx) - Toast notifications

#### Hooks

- **WebSocket**: [apps/web/src/hooks/use-websocket.js](mdc:apps/web/src/hooks/use-websocket.js) - Real-time connection management
- **Permissions**: [apps/web/src/hooks/use-permissions.js](mdc:apps/web/src/hooks/use-permissions.js) - Permission checking
- **Orders**: [apps/web/src/hooks/use-orders.js](mdc:apps/web/src/hooks/use-orders.js) - Order management

## Database Seeding

### Seeders Location: `apps/server/scripts/`

- **Main Seeder**: [apps/server/scripts/seedAll.js](mdc:apps/server/scripts/seedAll.js) - Orchestrates all seeding (12 steps)
- **RBAC Setup**: [apps/server/scripts/seedRBAC.js](mdc:apps/server/scripts/seedRBAC.js) - Roles and permissions
- **Inspection Data**: [apps/server/scripts/seedInspectionData.js](mdc:apps/server/scripts/seedInspectionData.js) - Status, types, notifications
- **Modality System**: [apps/server/scripts/seedModalitySystem.js](mdc:apps/server/scripts/seedModalitySystem.js) - Vehicle types, sede types, modalities
- **Real Sedes**: [apps/server/scripts/seedRealSedes.js](mdc:apps/server/scripts/seedRealSedes.js) - Actual CDA locations with addresses
- **Users**: [apps/server/scripts/seedUsers.js](mdc:apps/server/scripts/seedUsers.js) - Test users with roles
- **Event System**: [apps/server/scripts/seedEventSystem.js](mdc:apps/server/scripts/seedEventSystem.js) - Notification events and triggers
- **Templates**: [apps/server/scripts/seedTemplates.js](mdc:apps/server/scripts/seedTemplates.js) - Notification templates
- **Channels**: [apps/server/scripts/seedChannels.js](mdc:apps/server/scripts/seedChannels.js) - Notification channels

## Role System

### Defined Roles

- **super_admin**: Full system access
- **admin**: Administrative access
- **comercial_mundial**: Create and manage inspection orders
- **agente_contacto**: Manage calls and schedule appointments
- **coordinador_contacto**: Assign agents and supervise contact center
- **manager**: Management level access
- **user**: Basic user access

### Permission Patterns

- **Resource-based**: `{resource}.{action}` (e.g., `inspection_orders.create`)
- **Specific permissions**: `contact_agent.create_call`, `contact_agent.create_appointment`
- **Role-specific**: `coordinador_contacto.assign`, `coordinador_contacto.stats`

## Advanced Features

### Scheduling System

- **Flexible Time Slots**: Configurable intervals (30, 60, 90 minutes)
- **Vehicle Type Support**: Livianos, Pesados, Motos
- **Capacity Management**: Per-slot capacity tracking
- **Real CDAs**: Actual inspection center locations with real addresses
- **Modality Support**: En Sede, A Domicilio, Virtual inspections

### Notification System

- **Template Management**: WYSIWYG editor with variable support
- **Multi-channel**: Email, SMS, WhatsApp, In-App, Push notifications
- **Event-driven**: Automated triggers based on system events
- **Real-time**: WebSocket-based instant notifications

### Contact Center Management

- **Agent Assignment**: Dynamic order assignment and reassignment
- **Call Logging**: Comprehensive call attempt tracking
- **Appointment Scheduling**: Integrated scheduling with capacity validation
- **Real-time Updates**: Live order status and assignment updates

## Development Guidelines

### Adding New Features

1. **Backend**: Create model → controller → routes → add to [apps/server/index.js](mdc:apps/server/index.js)
2. **Frontend**: Create page/component → add route to [apps/web/src/App.jsx](mdc:apps/web/src/App.jsx) → update [apps/web/src/components/app-sidebar.jsx](mdc:apps/web/src/components/app-sidebar.jsx)
3. **API Integration**: Add endpoints to [apps/web/src/config/api.js](mdc:apps/web/src/config/api.js)

### RBAC Integration

- Use `requirePermission()` middleware in routes
- Check permissions in frontend with `useRBAC()` hook
- Add new permissions to [apps/server/scripts/seedRBAC.js](mdc:apps/server/scripts/seedRBAC.js)

### Notifications

- Use `useNotifications()` hook for toast messages
- Prefer toast notifications over browser alerts
- WebSocket notifications handled in [apps/server/websocket/notificationHandler.js](mdc:apps/server/websocket/notificationHandler.js)

## Key Credentials

Creadas por [apps/server/scripts/seedAll.js](mdc:apps/server/scripts/seedAll.js):

```
👨‍💼 ADMINISTRADOR (Todos los permisos):
   Email: admin@vmlperito.com
   Contraseña: 123456

👩‍💼 COMERCIAL MUNDIAL (Crear órdenes de inspección):
   Email: comercial@vmlperito.com
   Contraseña: 123456

👩‍💼 COORDINADORA DE CONTACTO (Asignar agentes):
   Email: coordinadora@vmlperito.com
   Contraseña: 123456

👨‍💼 AGENTE DE CONTACT CENTER (Gestionar llamadas):
   Email: agente1@vmlperito.com
   Contraseña: 123456

👩‍💼 SUPERVISORA (Multi-rol):
   Email: supervisora@vmlperito.com
   Contraseña: 123456
```

## Common Patterns

### API Calls

```javascript
const token = localStorage.getItem('authToken');
const response = await fetch(API_ROUTES.ENDPOINT, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Form Validation

- Use state for errors object
- Clear errors on input change
- Show validation messages with AlertCircle icon

### Component Structure

- Use shadcn/ui components (Card, Button, Input, etc.)
- Implement loading states with spinners
- Use lucide-react icons consistently

### WebSocket Integration

```javascript
const { isConnected, sendMessage } = useWebSocket();
// Real-time updates for orders, notifications, and assignments
```

## System Capabilities

### Current Features

- ✅ Complete RBAC system with 7 roles and granular permissions
- ✅ Advanced scheduling with real CDA locations
- ✅ Multi-channel notification system with templates
- ✅ Contact center management with agent assignment
- ✅ Real-time WebSocket updates
- ✅ Comprehensive order lifecycle management
- ✅ Geographic hierarchy (Department → City → Sede)
- ✅ Vehicle type and modality support
- ✅ Call logging and appointment scheduling
- ✅ Template-based notification system
- ✅ Event-driven automated notifications

### Component Structure

- Use shadcn/ui components (Card, Button, Input, etc.)
- Implement loading states with spinners
- Use lucide-react icons consistently
