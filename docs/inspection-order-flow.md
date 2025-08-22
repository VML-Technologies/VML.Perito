---
description: Flujo de trabajo de órdenes de inspección de Movilidad Mundial, incluyendo proceso de creación de órdenes (Comercial Mundial), gestión de contactos (Agente Contacto), progresión de estados, relaciones de base de datos, patrones de endpoints API, validación de formularios, manejo de estado, integración de notificaciones, eventos WebSocket, y seguridad con RBAC.
alwaysApply: false
---

# Inspection Order Workflow Rules

## Business Process Flow

### Order Creation (Comercial Mundial Role)

1. **Entry Point**: [apps/web/src/pages/ComercialMundial.jsx](mdc:apps/web/src/pages/ComercialMundial.jsx) → "Nueva Orden" button
2. **Modal**: [apps/web/src/components/CreateOrderModal.jsx](mdc:apps/web/src/components/CreateOrderModal.jsx) opens with form
3. **API**: POST to `API_ROUTES.INSPECTION_ORDERS.CREATE` → [apps/server/controllers/inspectionOrderController.js](mdc:apps/server/controllers/inspectionOrderController.js)
4. **Database**: Creates record in `inspection_orders` table with status "Creada"

### Contact Management (Agente Contacto Role)

1. **Entry Point**: [apps/web/src/pages/AgenteContacto.jsx](mdc:apps/web/src/pages/AgenteContacto.jsx)
2. **Order Selection**: Click "Contactar" opens side panel
3. **Two Actions Available**:
   - **Call Log**: Register call attempt with status
   - **Appointment**: Schedule inspection if call successful

### Order Status Progression

```
Creada → Contacto exitoso → Agendado → En progreso → Finalizada
     ↓
     No contesta / Ocupado / Número incorrecto / Solicita reagendar
     ↓
     (Back to contact attempts)
```

## Database Schema Key Relationships

### Core Models Referenced

- [apps/server/models/inspectionOrder.js](mdc:apps/server/models/inspectionOrder.js) - Main order entity
- [apps/server/models/inspectionOrderStatus.js](mdc:apps/server/models/inspectionOrderStatus.js) - Status tracking
- [apps/server/models/callLog.js](mdc:apps/server/models/callLog.js) - Call attempt history
- [apps/server/models/appointment.js](mdc:apps/server/models/appointment.js) - Scheduled inspections

### Relationships

```
InspectionOrder belongsTo InspectionOrderStatus
InspectionOrder belongsTo Sede
InspectionOrder hasMany CallLog
InspectionOrder hasMany Appointment
CallLog belongsTo CallStatus
Appointment belongsTo InspectionType
```

## API Endpoint Patterns

### Comercial Mundial Endpoints

- `GET /api/inspection-orders` - List orders with pagination
- `GET /api/inspection-orders/stats` - Dashboard statistics
- `GET /api/inspection-orders/search` - Search by placa/client
- `POST /api/inspection-orders` - Create new order

### Agente Contacto Endpoints

- `GET /api/contact-agent/orders` - Orders pending contact
- `POST /api/contact-agent/call-logs` - Register call attempt
- `POST /api/contact-agent/appointments` - Schedule inspection
- Geographic cascading: departments → cities → sedes

## Form Validation Rules

### Order Creation Validation (CreateOrderModal)

**Required Fields:**

- `cliente_nombre` - Client full name
- `cliente_telefono` - Contact phone
- `vehiculo_placa` - Vehicle license plate
- `sede_id` - Inspection location

**Format Validation:**

- Email: Standard email regex if provided
- Placa: Colombian format `ABC123` or `ABC12D`
- Year: Between 1900 and current year + 1

### Call Log Validation

**Required:**

- `call_status_id` - Result of call attempt
- `inspection_order_id` - Associated order

### Appointment Validation

**Required:**

- `fecha_inspeccion` - Inspection date
- `hora_inspeccion` - Inspection time
- `inspection_order_id` - Associated order

## State Management Patterns

### Page-Level State

```javascript
// Common pattern in both pages
const [loading, setLoading] = useState(true);
const [orders, setOrders] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
```

### Modal State Management

```javascript
// Form data state
const [formData, setFormData] = useState({...});
// Validation errors
const [errors, setErrors] = useState({});
// Geographic cascading
const [selectedDepartment, setSelectedDepartment] = useState('');
```

## Notification Integration

### Toast Message Patterns

- **Success**: "Orden creada exitosamente", "Llamada registrada"
- **Warning**: "Completa los campos obligatorios"
- **Error**: "Error al cargar datos", "Error de conexión"

### Integration Point

All components use `useNotificationContext()` from [apps/web/src/contexts/notification-context.jsx](mdc:apps/web/src/contexts/notification-context.jsx)

## WebSocket Events (Future Enhancement)

### Real-time Notifications

- Order status changes
- New assignments for agents
- System notifications

### Event Handlers

Located in [apps/server/websocket/notificationHandler.js](mdc:apps/server/websocket/notificationHandler.js)

## Security & Permissions

### Route Protection

- Comercial routes require `comercial_mundial` or `super_admin` role
- Agente routes require `agente_contacto` or `super_admin` role
- Protected by [apps/web/src/components/RoleBasedRoute.jsx](mdc:apps/web/src/components/RoleBasedRoute.jsx)

### API Security

- All endpoints require JWT token in Authorization header
- Permission middleware checks in [apps/server/middleware/rbac.js](mdc:apps/server/middleware/rbac.js)
- Specific permissions: `inspection_orders.*`, `contact_agent.*`
