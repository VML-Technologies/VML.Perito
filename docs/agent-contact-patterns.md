---
description: Patrones específicos de agentes de contacto de VML.Perito, incluyendo arquitectura de roles de agentes, estructura de página AgenteContacto, integración WebSocket con eventos en tiempo real, controlador ContactAgentController, patrones de registro de llamadas, agendamiento de citas, manejo de formularios, componentes UI, indicador de estado de conexión, y permisos RBAC requeridos.
alwaysApply: false
---

# Contact Center Agent Patterns

## Agent Role Architecture

Contact center agents (`agente_contacto`) handle assigned inspection orders through:

- **Call Management**: Log call attempts and outcomes
- **Appointment Scheduling**: Schedule inspections when contact is successful
- **Real-time Updates**: Receive WebSocket notifications for order assignments

## Page Structure - AgenteContacto

Location: [apps/web/src/pages/AgenteContacto.jsx](mdc:apps/web/src/pages/AgenteContacto.jsx)

### Core Components

```javascript
// Search functionality for orders
// Orders table with assigned orders only
// Side panel (Sheet) for order management
// Dual tabs: Call Registration + Appointment Scheduling
```

### State Management Pattern

```javascript
const [orders, setOrders] = useState([]);
const [selectedOrder, setSelectedOrder] = useState(null);
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [callForm, setCallForm] = useState({
  call_status_id: '',
  observaciones: '',
  fecha_seguimiento: '',
});
const [appointmentForm, setAppointmentForm] = useState({
  fecha_inspeccion: '',
  hora_inspeccion: '',
  direccion_inspeccion: '',
  inspection_type_id: '',
  sede_id: '',
  observaciones: '',
});
```

## WebSocket Integration Pattern

### Event Listeners

```javascript
useEffect(() => {
  const handleOrderAssigned = (event) => {
    const { order, message, type } = event.detail;

    // Show appropriate notification
    const notificationMessage =
      type === 'reasignacion_orden'
        ? `¡Orden reasignada! ${order?.numero} - Actualizando lista...`
        : `¡Nueva orden asignada! ${order?.numero} - Actualizando lista...`;

    showToast(notificationMessage, 'success', 4000);
    loadOrders(); // Refresh orders list
  };

  const handleOrderRemoved = (event) => {
    const { order } = event.detail;
    showToast(`⚠️ Orden ${order?.numero} removida - Actualizando lista...`, 'warning', 4000);
    loadOrders(); // Refresh orders list
  };

  window.addEventListener('orderAssigned', handleOrderAssigned);
  window.addEventListener('orderRemoved', handleOrderRemoved);

  return () => {
    window.removeEventListener('orderAssigned', handleOrderAssigned);
    window.removeEventListener('orderRemoved', handleOrderRemoved);
  };
}, []);
```

## Backend Controller Pattern

Location: [apps/server/controllers/contactAgentController.js](mdc:apps/server/controllers/contactAgentController.js)

### Core Methods

```javascript
class ContactAgentController {
  async getOrders(req, res) {
    // Returns only orders assigned to current agent
    // Filter: assigned_agent_id = req.user.id
  }

  async createCallLog(req, res) {
    // Creates call log entry
    // Links to inspection order and agent
  }

  async createAppointment(req, res) {
    // Creates appointment after successful contact
    // Updates order status to 'Agendado'
  }
}
```

### Agent Orders Query Pattern

```javascript
const orders = await InspectionOrder.findAll({
  where: {
    assigned_agent_id: req.user.id,
    // Only show active orders
  },
  include: [
    {
      model: InspectionOrderStatus,
      as: 'InspectionOrderStatus',
      attributes: ['id', 'name', 'description'],
    },
  ],
  order: [['created_at', 'DESC']],
});
```

## Call Logging Pattern

### Call Log Creation

```javascript
const callLog = await CallLog.create({
  inspection_order_id: req.body.inspection_order_id,
  agent_id: req.user.id, // Current agent
  status_id: req.body.call_status_id,
  observaciones: req.body.observaciones,
  fecha_seguimiento: req.body.fecha_seguimiento,
  call_time: new Date(),
});
```

### Call Status Types

Common call statuses:

- **Contacto exitoso**: Successful contact
- **No contesta**: No answer
- **Ocupado**: Busy line
- **Número incorrecto**: Wrong number
- **Solicita reagendar**: Requests rescheduling

## Appointment Scheduling Pattern

### Appointment Creation

```javascript
const appointment = await Appointment.create({
  inspection_order_id: req.body.inspection_order_id,
  scheduled_date: req.body.fecha_inspeccion,
  scheduled_time: req.body.hora_inspeccion,
  address: req.body.direccion_inspeccion,
  inspection_type_id: req.body.inspection_type_id,
  sede_id: req.body.sede_id,
  observaciones: req.body.observaciones,
  status: 'Programada',
});

// Update order status to 'Agendado'
await InspectionOrder.update(
  { status: 3 }, // Agendado status
  { where: { id: req.body.inspection_order_id } }
);
```

## Form Handling Patterns

### Call Form Submission

```javascript
const handleCallSubmit = async (e) => {
  e.preventDefault();

  if (!selectedOrder || !callForm.call_status_id) {
    showToast('Selecciona un estado de llamada', 'warning');
    return;
  }

  try {
    const response = await fetch(API_ROUTES.CONTACT_AGENT.CALL_LOGS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspection_order_id: selectedOrder.id,
        ...callForm,
      }),
    });

    if (response.ok) {
      showToast('Llamada registrada exitosamente', 'success');
      await loadOrders();
      setIsPanelOpen(false);
    }
  } catch (error) {
    showToast('Error al registrar la llamada', 'error');
  }
};
```

### Appointment Form Submission

```javascript
const handleAppointmentSubmit = async (e) => {
  e.preventDefault();

  if (!appointmentForm.fecha_inspeccion || !appointmentForm.hora_inspeccion) {
    showToast('Completa los campos obligatorios', 'warning');
    return;
  }

  try {
    const response = await fetch(API_ROUTES.CONTACT_AGENT.APPOINTMENTS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspection_order_id: selectedOrder.id,
        ...appointmentForm,
      }),
    });

    if (response.ok) {
      showToast('Agendamiento creado exitosamente', 'success');
      await loadOrders();
      setIsPanelOpen(false);
    }
  } catch (error) {
    showToast('Error al crear el agendamiento', 'error');
  }
};
```

## UI Components Pattern

### Order Selection Handler

```javascript
const handleOrderSelect = (order) => {
  setSelectedOrder(order);
  setIsPanelOpen(true);

  // Reset forms when selecting new order
  setCallForm({
    call_status_id: '',
    observaciones: '',
    fecha_seguimiento: '',
  });
  setAppointmentForm({
    fecha_inspeccion: '',
    hora_inspeccion: '',
    direccion_inspeccion: '',
    inspection_type_id: '',
    sede_id: '',
    observaciones: '',
  });
};
```

### Status Badge Mapping

```javascript
const getStatusBadgeVariant = (status) => {
  const variants = {
    Creada: 'secondary',
    'Contacto exitoso': 'default',
    Agendado: 'default',
    'No contesta': 'destructive',
    Ocupado: 'outline',
    'Número incorrecto': 'destructive',
    'Solicita reagendar': 'outline',
    'En progreso': 'default',
    Finalizada: 'default',
    Cancelada: 'destructive',
  };
  return variants[status] || 'secondary';
};
```

## Connection Status Indicator

### WebSocket Status Display

```javascript
<div
  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}
>
  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
  <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
</div>
```

## Data Loading Pattern

### Cascading Selects (Department -> City -> Sede)

```javascript
useEffect(() => {
  if (selectedDepartment) {
    loadCities(selectedDepartment);
  } else {
    setCities([]);
  }
  setSelectedCity('');
  setSedes([]);
}, [selectedDepartment]);

useEffect(() => {
  if (selectedCity) {
    loadSedes(selectedCity);
  } else {
    setSedes([]);
  }
}, [selectedCity]);
```

## Permission Requirements

- **agente_contacto.read**: View assigned orders for contact center agents
- **agente_contacto.call**: Create call logs
- **agente_contacto.appointment**: Schedule appointments
