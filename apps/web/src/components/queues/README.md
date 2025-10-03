# Sistema de Colas de Inspección

Este directorio contiene los componentes modulares para el sistema de colas de inspección de Movilidad Mundial.

## Componentes

### Landing.jsx
- **Propósito**: Página inicial donde el usuario inicia el proceso de inspección
- **Funcionalidad**: 
  - Muestra información de la orden de inspección
  - Verifica horarios de atención
  - Permite agregar a la cola con el botón "Iniciar Inspección"
  - Muestra appointment existente si ya hay uno activo
- **Props**:
  - `inspectionOrder`: Datos de la orden de inspección
  - `existingAppointment`: Appointment existente (opcional)
  - `isWithinBusinessHours`: Boolean si está en horario de atención
  - `startingInspection`: Boolean si está iniciando la inspección
  - `onStartInspection`: Callback para iniciar inspección
  - `onGoToExistingInspection`: Callback para ir a inspección existente

### Wait.jsx
- **Propósito**: Página de espera con actualizaciones en tiempo real
- **Funcionalidad**:
  - Muestra estado de espera en cola
  - Contador de tiempo de espera en vivo
  - Información del vehículo y orden
  - Recomendaciones para el usuario
- **Props**:
  - `queueStatus`: Estado actual de la cola
  - `waitingTime`: Tiempo de espera en segundos
  - `onGoBack`: Callback para volver
  - `formatWaitingTime`: Función para formatear tiempo

### InspectorAssigned.jsx
- **Propósito**: Página cuando se asigna un inspector
- **Funcionalidad**:
  - Muestra que se ha asignado un inspector
  - Contador de tiempo hasta el appointment
  - Botón para ir a la inspección cuando es hora
  - Preparación para la inspección
- **Props**:
  - `existingAppointment`: Datos del appointment
  - `timeUntilAppointment`: Tiempo hasta appointment en minutos
  - `onGoToInspection`: Callback para ir a inspección
  - `onGoBack`: Callback para volver
  - `formatTimeUntilAppointment`: Función para formatear tiempo

## Flujo del Sistema

1. **Usuario entra** → `Landing` (página inicial)
2. **Usuario hace clic "Iniciar Inspección"** → Se agrega a la cola
3. **Usuario espera** → `Wait` (página de espera con updates)
4. **Inspector se asigna** → `InspectorAssigned` (página de inspector asignado)
5. **Es hora de la inspección** → Redirección automática a la inspección

## Ventajas de la Arquitectura Modular

- ✅ **Separación de responsabilidades** clara
- ✅ **UX mejorada** - cada componente tiene un propósito específico
- ✅ **Código más mantenible** y fácil de debuggear
- ✅ **Performance optimizada** - cada componente solo carga lo que necesita
- ✅ **Evita race conditions** - manejo centralizado de estado
- ✅ **Reutilización** - componentes pueden usarse en otros contextos
- ✅ **Testing** - más fácil de testear individualmente

## Uso

```jsx
import { Landing, Wait, InspectorAssigned } from '@/components/queues';

// En el componente padre
const [currentView, setCurrentView] = useState('landing');

switch (currentView) {
  case 'wait':
    return <Wait {...waitProps} />;
  case 'inspectorAssigned':
    return <InspectorAssigned {...inspectorProps} />;
  default:
    return <Landing {...landingProps} />;
}
```

## Ruta de Fallback

Se ha implementado una ruta de fallback para usuarios que puedan estar "pegados" en la ruta antigua:

- **Ruta**: `/espera/inspeccion/:hash`
- **Comportamiento**: Redirige automáticamente al nuevo sistema unificado
- **Mensaje**: Muestra una notificación informativa al usuario
- **Compatibilidad**: Mantiene la funcionalidad completa del sistema

### Configuración en App.jsx

```jsx
// Ruta principal (nueva)
<Route
  path="/inspeccion/:hash"
  element={<Inspeccion />}
/>

// Ruta de fallback (compatibilidad)
<Route
  path="/espera/inspeccion/:hash"
  element={<Inspeccion />}
/>
```

### Detección Automática

El componente `Inspeccion.jsx` detecta automáticamente si está siendo accedido desde la ruta de fallback y muestra un mensaje informativo al usuario, manteniendo toda la funcionalidad del sistema unificado.
