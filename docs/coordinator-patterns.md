---
description: Patrones específicos de coordinadores de contact center de Movilidad Mundial, incluyendo arquitectura basada en roles RBAC, controlador CoordinadorContactoController, patrones de asignación de agentes con notificaciones duales, página frontend del coordinador, manejo de estado, patrones de base de datos, rutas API, permisos RBAC, componentes UI/UX, y manejo de errores.
alwaysApply: false
---

# Coordinator Contact Center Patterns

## Role-Based Architecture

The coordinator system follows RBAC patterns with specific roles:

- **coordinador_contacto**: Main coordinator role for contact center
- **agente_contacto**: Contact center agents who handle orders
- **comercial_mundial**: Creates inspection orders

## Controller Pattern - CoordinadorContactoController

Location: [apps/server/controllers/coordinadorContactoController.js](mdc:apps/server/controllers/coordinadorContactoController.js)

### Core Methods Structure

```javascript
class CoordinadorContactoController {
  async getOrders(req, res) {
    // Paginated orders with filters and sorting
    // Includes: search, status, agent, date filters
  }

  async getStats(req, res) {
    // Dashboard statistics
    // Returns: total, pendientes, en_gestion, agendadas, completadas, sin_asignar
  }

  async getAgents(req, res) {
    // Active agents with agente_contacto role
  }

  async assignAgent(req, res) {
    // Handles assignment, reassignment, and removal
    // Sends dual notifications for reassignment
  }
}
```

## Order Assignment Patterns

### Assignment Logic

```javascript
// Detect previous agent
const previousAgentId = order.assigned_agent_id;

// Update assignment
await order.update({ assigned_agent_id: agent_id || null });

// Dual notification for reassignment
if (previousAgentId && previousAgentId !== agent_id) {
  // Notify previous agent (removal)
  await notifyAgentRemoval(previousAgentId, order);

  // Notify new agent (assignment)
  await notifyAgentAssignment(agent_id, order);
}
```

### Notification Creation Pattern

```javascript
async createAssignmentNotification(agentId, inspectionOrderId, type) {
    const titles = {
        'asignacion': 'Nueva Orden Asignada',
        'reasignacion': 'Orden Reasignada',
        'remocion': 'Orden Removida'
    };

    const content = generateNotificationContent(type, order);

    await Notification.create({
        notification_config_id: config.id,
        inspection_order_id: inspectionOrderId,
        recipient_user_id: agentId,
        title: titles[type],
        content: content,
        status: 'pending'
    });
}
```

## Frontend Coordinator Page

Location: [apps/web/src/pages/CoordinadorContacto.jsx](mdc:apps/web/src/pages/CoordinadorContacto.jsx)

### Page Structure

```javascript
// Statistics dashboard (6 cards)
// Advanced filters (search, status, agent, dates)
// Paginated orders table with sorting
// Agent assignment dropdowns
// Order details panel (Sheet)
```

### State Management Pattern

```javascript
const [orders, setOrders] = useState([]);
const [stats, setStats] = useState({});
const [agents, setAgents] = useState([]);
const [filters, setFilters] = useState({
  search: '',
  status: '',
  assigned_agent_id: '',
  date_from: '',
  date_to: '',
});
```

### Assignment Handler Pattern

```javascript
const handleAssignAgent = async (orderId, agentId) => {
  try {
    const response = await fetch(API_ROUTES.COORDINATOR.ASSIGN, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspection_order_id: orderId,
        agent_id: agentId,
      }),
    });

    if (response.ok) {
      showToast('Agente asignado exitosamente', 'success');
      await loadOrders(); // Refresh data
    }
  } catch (error) {
    showToast('Error al asignar agente', 'error');
  }
};
```

## Database Patterns

### Order Assignment Fields

```sql
-- InspectionOrder table
assigned_agent_id BIGINT NULL -- References users.id
user_id BIGINT NOT NULL       -- Order creator
status INT NOT NULL           -- Order status
```

### Agent Query Pattern

```javascript
// Get active contact center agents
const agents = await User.findAll({
  include: [
    {
      model: Role,
      as: 'roles',
      where: { name: 'agente_contacto' },
      through: { attributes: [] },
    },
  ],
  where: { is_active: true },
});
```

## API Routes Pattern

Configuration: [apps/web/src/config/api.js](mdc:apps/web/src/config/api.js)

```javascript
COORDINATOR: {
    ORDERS: '/api/coordinador-contacto/orders',
    STATS: '/api/coordinador-contacto/stats',
    AGENTS: '/api/coordinador-contacto/agents',
    ASSIGN: '/api/coordinador-contacto/assign',
    ORDER_DETAILS: (id) => `/api/coordinador-contacto/orders/${id}`
}
```

## Permission Requirements

### RBAC Permissions

- `coordinador_contacto.read` - View orders and dashboard
- `coordinador_contacto.assign` - Assign contact center agents to orders
- `coordinador_contacto.stats` - View statistics

### Route Protection

```javascript
// Middleware check
router.use(rbacMiddleware.checkPermission('coordinador_contacto.read'));
router.post('/assign', rbacMiddleware.checkPermission('coordinador_contacto.assign'));
```

## UI/UX Patterns

### Statistics Cards

```javascript
// 6 cards layout with icons and colors
const statsCards = [
  { title: 'Total Órdenes', value: stats.total, icon: FileText, color: 'blue' },
  { title: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'yellow' },
  { title: 'En Gestión', value: stats.en_gestion, icon: Phone, color: 'green' },
  // ... more cards
];
```

### Filter Component Pattern

```javascript
// Collapsible filter section
<Collapsible>
  <CollapsibleTrigger>
    <Filter className="h-4 w-4" />
    Filtros Avanzados
  </CollapsibleTrigger>
  <CollapsibleContent>{/* Filter inputs */}</CollapsibleContent>
</Collapsible>
```

## Error Handling

### Backend Error Pattern

```javascript
try {
  // Operation
} catch (error) {
  console.error('Error context:', error);
  res.status(500).json({
    success: false,
    message: 'User-friendly message',
    error: error.message,
  });
}
```

### Frontend Error Pattern

```javascript
try {
  // API call
} catch (error) {
  console.error('Error context:', error);
  showToast('Error message in Spanish', 'error');
}
```
