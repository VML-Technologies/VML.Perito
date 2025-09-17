# Plan: Modal de Iniciar Inspección - Coordinador VML

## Resumen
Implementar un modal en `CoordinadorVML.jsx` que permita al coordinador seleccionar un inspector y una sede CDA para iniciar una inspección virtual, crear un agendamiento y redirigir al usuario a la página de inspección.

## Componentes Involucrados

### Frontend
- `apps/web/src/pages/CoordinadorVML.jsx` - Página principal del coordinador
- `apps/web/src/components/ui/modal.jsx` - Componente modal (shadcn/ui)
- `apps/web/src/components/ui/select.jsx` - Componente select (shadcn/ui)
- `apps/web/src/hooks/use-inspection-queue-websocket.js` - Hook WebSocket para notificaciones

### Backend
- `apps/server/controllers/inspectionOrderController.js` - Controlador de órdenes
- `apps/server/controllers/appointmentController.js` - Controlador de agendamientos
- `apps/server/websocket/socketManager.js` - Gestor de WebSockets

## Estructura de Datos

### Roles de Inspector Identificados
- `inspector_vml_virtual` - Inspector VML Virtual
- `inspector_vml_cda` - Inspector VML CDA
- `inspector_aliado` - Inspector Aliado

### Modalidad de Inspección
- `VIRTUAL` - Código para inspección virtual

### Tipos de Sede
- `CDA` - Centros de Diagnóstico Automotor

## Flujo de Implementación

### 1. Frontend - Modal Component

#### 1.1 Crear componente modal
```jsx
// En CoordinadorVML.jsx
const [showStartInspectionModal, setShowStartInspectionModal] = useState(false);
const [selectedInspector, setSelectedInspector] = useState(null);
const [selectedSede, setSelectedSede] = useState(null);
const [inspectors, setInspectors] = useState([]);
const [sedes, setSedes] = useState([]);
const [loading, setLoading] = useState(false);
```

#### 1.2 Estados del modal
- `showStartInspectionModal`: Controla visibilidad del modal
- `selectedInspector`: Inspector seleccionado
- `selectedSede`: Sede CDA seleccionada
- `inspectors`: Lista de inspectores disponibles
- `sedes`: Lista de sedes CDA activas
- `loading`: Estado de carga durante confirmación

#### 1.3 Funciones necesarias
- `loadInspectors()`: Cargar usuarios con roles de inspector
- `loadSedes()`: Cargar sedes tipo CDA activas
- `handleStartInspection()`: Confirmar inicio de inspección
- `generateSessionId()`: Generar ID de sesión único

### 2. Backend - Nuevos Endpoints

#### 2.1 Endpoint para obtener inspectores
```
GET /api/users/inspectors
```
- Filtrar usuarios con roles: `inspector_vml_virtual`, `inspector_vml_cda`, `inspector_aliado`
- Retornar: `id`, `name`, `email`, `roles`

#### 2.2 Endpoint para obtener sedes CDA
```
GET /api/sedes/cda
```
- Filtrar sedes donde `sede_type.code = 'CDA'` y `active = true`
- Retornar: `id`, `name`, `address`, `city.name`

#### 2.3 Endpoint para iniciar inspección
```
POST /api/inspection-orders/:id/start-inspection
```
Body:
```json
{
  "inspector_id": 123,
  "sede_id": 456
}
```

### 3. Lógica de Creación de Agendamiento

#### 3.1 Generar session_id
```javascript
const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `session_${timestamp}_${random}`;
};
```

#### 3.2 Crear agendamiento
```javascript
const appointmentData = {
  sede_id: selectedSede.id,
  inspection_order_id: orderId,
  inspection_modality_id: virtualModalityId, // ID donde code = 'VIRTUAL'
  user_id: selectedInspector.id,
  scheduled_date: new Date().toISOString().split('T')[0],
  scheduled_time: new Date().toTimeString().split(' ')[0],
  session_id: generateSessionId(),
  status: 'pending'
};
```

### 4. WebSocket - Notificación al Usuario

#### 4.1 Evento de inicio de inspección
```javascript
// En socketManager.js
socketManager.emitToQueue(hash, 'inspectionStarted', {
  session_id: appointment.session_id,
  inspector: selectedInspector,
  sede: selectedSede,
  redirect_url: `${process.env.FRONTEND_URL}/inspection/${appointment.session_id}`
});
```

#### 4.2 Hook WebSocket en InspeccionEspera.jsx
```javascript
// Escuchar evento de inicio de inspección
socket.on('inspectionStarted', (data) => {
  window.location.href = data.redirect_url;
});
```

### 5. Variables de Entorno

#### 5.1 Backend (.env)
```
FRONTEND_URL=http://192.168.78.106:5173
```

#### 5.2 Verificar uso actual
- Ya está configurado en varios archivos del backend
- Se usa en `passwordResetService.js`, `socketManager.js`, `pushService.js`, etc.

## Estructura del Modal

### 5.1 Diseño del modal
```jsx
<Modal open={showStartInspectionModal} onOpenChange={setShowStartInspectionModal}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Iniciar Inspección</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <div className="space-y-4">
        {/* Selector de Inspector */}
        <div>
          <Label>Inspector Asignado</Label>
          <Select onValueChange={setSelectedInspector}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar inspector" />
            </SelectTrigger>
            <SelectContent>
              {inspectors.map(inspector => (
                <SelectItem key={inspector.id} value={inspector.id}>
                  {inspector.name} - {inspector.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Selector de Sede */}
        <div>
          <Label>Sede</Label>
          <Select onValueChange={setSelectedSede}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sede CDA" />
            </SelectTrigger>
            <SelectContent>
              {sedes.map(sede => (
                <SelectItem key={sede.id} value={sede.id}>
                  {sede.name} - {sede.city?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline" onClick={() => setShowStartInspectionModal(false)}>
        Cancelar
      </Button>
      <Button 
        onClick={handleStartInspection}
        disabled={!selectedInspector || !selectedSede || loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Confirmar
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## Validaciones

### 6.1 Frontend
- Inspector seleccionado requerido
- Sede seleccionada requerida
- Estado de carga durante confirmación
- Manejo de errores en la respuesta

### 6.2 Backend
- Verificar que el inspector tenga rol válido
- Verificar que la sede sea tipo CDA y esté activa
- Verificar que la orden esté en estado válido
- Validar que no exista agendamiento previo

## Estados de la Orden

### 6.3 Actualización de estado
- Cambiar estado de la orden a "En Proceso"
- Actualizar `assigned_agent_id` con el inspector seleccionado
- Actualizar `fecha_inicio_inspeccion` con timestamp actual

## Consideraciones Técnicas

### 7.1 Seguridad
- Verificar permisos del coordinador
- Validar que solo coordinadores puedan iniciar inspecciones
- Sanitizar inputs del modal

### 7.2 Performance
- Cargar inspectores y sedes al abrir modal
- Cachear datos si es necesario
- Optimizar consultas de base de datos

### 7.3 UX/UI
- Indicadores de carga
- Mensajes de error claros
- Confirmación antes de iniciar
- Feedback visual del proceso

## Archivos a Modificar

### 7.4 Frontend
- `apps/web/src/pages/CoordinadorVML.jsx` - Agregar modal y lógica
- `apps/web/src/hooks/use-inspection-queue-websocket.js` - Agregar evento de inicio

### 7.5 Backend
- `apps/server/controllers/inspectionOrderController.js` - Endpoint de inicio
- `apps/server/controllers/userController.js` - Endpoint de inspectores
- `apps/server/controllers/sedeController.js` - Endpoint de sedes CDA
- `apps/server/websocket/socketManager.js` - Evento de notificación

## Próximos Pasos

1. Implementar endpoints del backend
2. Crear componente modal en frontend
3. Integrar WebSocket para notificaciones
4. Probar flujo completo
5. Agregar validaciones y manejo de errores
6. Optimizar y refinar UX

## Notas Adicionales

- El session_id debe ser único en toda la aplicación
- Considerar timezone para fechas y horas
- Implementar logging para auditoría
- Considerar notificaciones push/email al inspector
- Planificar manejo de errores de red
