---
description: Define la terminología específica del contact center de Movilidad Mundial, incluyendo roles de usuario (Comercial Mundial, Agente de Contact Center, Coordinador), tipos de sede (CDA, Comercial, Soporte), modalidades de inspección, tipos de vehículos, sedes reales configuradas con direcciones, sistema de notificaciones, eventos WebSocket en tiempo real, y credenciales de prueba para todos los roles del sistema.
alwaysApply: false
---

# Terminología de Contact Center

## Roles Actualizados

### Tipos de Sede

- **CDA**: Centro de Diagnóstico Automotor - Para inspecciones vehiculares
- **COMERCIAL**: Sede comercial y ventas - Para usuarios comerciales
- **SOPORTE**: Sede de soporte y contact center - Para agentes y coordinadores

### Roles de Usuario

- **Comercial Mundial**: Crea y gestiona órdenes de inspección
- **Agente de Contact Center**: Gestiona llamadas y agendamientos (antes "Agente de Contacto")
- **Coordinador de Contact Center**: Supervisa y asigna agentes (antes "Coordinador de Contacto")

## Sistema de Modalidades

### Modalidades de Inspección

- **En Sede**: Inspección realizada en las instalaciones de la sede
- **A Domicilio**: Inspección realizada en el domicilio del cliente
- **Virtual**: Inspección realizada de forma virtual/remota

### Tipos de Vehículos

- **Livianos**: Automóviles, camionetas pequeñas
- **Pesados**: Camiones, buses, tractomulas
- **Motos**: Motocicletas y ciclomotores

## Archivos Principales

### Backend

- **Modelos**: [index.js](mdc:apps/server/models/index.js) - Todas las relaciones del sistema
- **Controladores**:
  - [contactAgentController.js](mdc:apps/server/controllers/contactAgentController.js) - Agente de Contact Center
  - [coordinadorContactoController.js](mdc:apps/server/controllers/coordinadorContactoController.js) - Coordinador
  - [scheduleController.js](mdc:apps/server/controllers/scheduleController.js) - Sistema de horarios

### Frontend

- **Páginas**:
  - [AgenteContacto.jsx](mdc:apps/web/src/pages/AgenteContacto.jsx) - Panel del agente
  - [CoordinadorContacto.jsx](mdc:apps/web/src/pages/CoordinadorContacto.jsx) - Panel del coordinador
- **Componentes**: [app-sidebar.jsx](mdc:apps/web/src/components/app-sidebar.jsx) - Navegación

### Seeding

- **Script principal**: [seedAll.js](mdc:apps/server/scripts/seedAll.js) - Proceso completo (12 pasos)
- **Sedes reales**: [seedRealSedes.js](mdc:apps/server/scripts/seedRealSedes.js) - CDAs configurados
- **Modalidades**: [seedModalitySystem.js](mdc:apps/server/scripts/seedModalitySystem.js) - Sistema avanzado

## Flujo de Agendamiento

### Orden del Formulario

1. **Departamento** → Carga ciudades
2. **Ciudad** → Carga modalidades disponibles
3. **Modalidad** → Filtra tipos de inspección
4. **Tipo de Inspección** → Filtra sedes compatibles
5. **Sede** → Muestra horarios y tipos de vehículos
6. **Fecha y Hora** → Intervalos disponibles
7. **Tipo de Vehículo** → Validación final

### Validaciones

- Modalidad disponible en la sede
- Tipo de vehículo admitido
- Capacidad disponible en el horario
- Dirección obligatoria para modalidad "A Domicilio"

## Credenciales de Prueba

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

## Sedes Reales Configuradas

### Bogotá (Cundinamarca)

- **CDA 197**: AUTOPISTA NORTE No. 197 -75 (Livianos, Pesados, Motos)
- **CDA Distrital**: Carrera 36 # 19 – 21 (Livianos)
- **CDA PREVITAX**: CALLE 12 B No. 44 – 08 (Livianos)

### Cali (Valle del Cauca)

- **CDA Cali Norte**: CRA 1 N° 47 – 250 (Livianos, Pesados, Motos)
- **CDA Cali Sur**: CRA 41 N° 6-02 (Livianos, Motos)

### Sedes Administrativas

- **Sede Comercial Bogotá** - Para usuarios comerciales
- **Sede Soporte Bogotá** - Para contact center

## Sistema de Notificaciones

### Canales Disponibles

- **Email**: Notificaciones por correo electrónico
- **SMS**: Mensajes de texto
- **WhatsApp**: Mensajes de WhatsApp
- **In-App**: Notificaciones dentro de la aplicación
- **Push**: Notificaciones push del navegador

### Eventos Automatizados

- Asignación de órdenes a agentes
- Cambios de estado de órdenes
- Creación de agendamientos
- Registro de llamadas
- Eventos del sistema

## WebSocket y Tiempo Real

### Eventos en Tiempo Real

- **orderAssigned**: Nueva orden asignada a agente
- **orderRemoved**: Orden removida de agente
- **orderStatusChanged**: Cambio de estado de orden
- **newNotification**: Nueva notificación del sistema

### Integración Frontend

- Hook `useWebSocket()` para conexión automática
- Reconexión automática en caso de desconexión
- Indicador visual de estado de conexión
- Manejo de eventos con `useEffect`

Agente 2: agente2@vmlperito.com / 123456
Comercial: comercial@vmlperito.com / 123456
Admin: admin@vmlperito.com / 123456

```

```
