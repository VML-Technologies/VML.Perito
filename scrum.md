# SCRUM - PeritoVML

## Épicas y Historias de Usuario (HU)

---

## Épica 1: Autenticación y Gestión de Usuarios

### HU 1.1 - Inicio de sesión

**Como** usuario registrado,
**quiero** ingresar mi usuario y contraseña,
**para** acceder a la plataforma de PeritoVML.

- Criterios de aceptación:
  - El sistema valida credenciales.
  - Si son correctas, redirige a la pantalla principal.
  - Si son incorrectas, muestra mensaje de error.

### HU 1.2 - Recuperar contraseña

**Como** usuario,
**quiero** poder recuperar mi contraseña,
**para** acceder al sistema en caso de olvido.

- Criterios de aceptación:
  - El sistema envía un correo/SMS con instrucciones para restablecer la contraseña.

### HU 1.3 - Gestión de perfil

**Como** usuario,
**quiero** poder ver y editar mi perfil,
**para** mantener mi información actualizada.

- Criterios de aceptación:
  - Permite cambiar contraseña y estado (disponible/fuera de línea).

### HU 1.4 - Gestión de roles y permisos

**Como** administrador,
**quiero** asignar roles a los usuarios,
**para** controlar el acceso a los diferentes módulos del sistema.

- Criterios de aceptación:
  - Solo los administradores pueden modificar roles.

---

## Épica 2: Gestión de Órdenes de Trabajo

### HU 2.1 - Crear orden de trabajo

**Como** asesor,
**quiero** crear una nueva orden de trabajo,
**para** iniciar el proceso de atención de un caso.

- Criterios de aceptación:
  - Formulario con datos del producto, personas y vehículo.
  - Validación de campos obligatorios.

### HU 2.2 - Buscar orden de trabajo

**Como** usuario,
**quiero** buscar órdenes de trabajo por placa,
**para** encontrar rápidamente la información relevante.

- Criterios de aceptación:
  - Búsqueda eficiente y resultados claros.

### HU 2.3 - Editar orden de trabajo

**Como** asesor,
**quiero** editar una orden de trabajo existente,
**para** corregir o actualizar información.

- Criterios de aceptación:
  - Solo órdenes en estado editable pueden ser modificadas.

### HU 2.4 - Control de estados de orden

**Como** usuario,
**quiero** ver y actualizar el estado de una orden de trabajo,
**para** conocer el avance del proceso.

- Criterios de aceptación:
  - Estados: Creada, En gestión, Finalizada con inspección.
  - Notificaciones automáticas según el cambio de estado.

---

## Épica 3: Agendamiento y Calendario

### HU 3.1 - Agendar cita

**Como** agente de contact center,
**quiero** agendar una cita para inspección o peritaje,
**para** coordinar la atención con el cliente.

- Criterios de aceptación:
  - Selección de fecha, hora y tipo de peritaje.
  - Notificación automática al cliente y al equipo.

### HU 3.2 - Ver calendario de agendamientos

**Como** usuario,
**quiero** consultar el calendario de agendamientos,
**para** visualizar mis citas programadas.

- Criterios de aceptación:
  - Vista clara y filtrable por estado.

### HU 3.3 - Actualizar estado de agendamiento

**Como** agente,
**quiero** actualizar el estado de un agendamiento,
**para** reflejar el avance (pendiente, en curso, cerrada, finalizada).

- Criterios de aceptación:
  - Cambios de estado reflejados en tiempo real.

---

## Épica 4: Gestión de Casos

### HU 4.1 - Crear caso

**Como** agente de contact center,
**quiero** crear un nuevo caso a partir de una llamada o solicitud,
**para** iniciar el proceso de investigación.

- Criterios de aceptación:
  - Formulario con datos clave (placa, tipo de caso, ubicación, etc.).
  - Validación de datos vía web service.

### HU 4.2 - Asignar investigador y abogado

**Como** coordinador,
**quiero** asignar un investigador y/o abogado a un caso,
**para** garantizar la atención adecuada.

- Criterios de aceptación:
  - Listado de disponibles y notificación de asignación.

### HU 4.3 - Editar y actualizar caso

**Como** usuario autorizado,
**quiero** editar y actualizar la información de un caso,
**para** mantener la trazabilidad y el seguimiento.

- Criterios de aceptación:
  - Registro de cambios y control de estados.

---

## Épica 5: Asistencia en Sitio y Comunicación

### HU 5.1 - Iniciar asistencia en sitio

**Como** investigador o abogado,
**quiero** iniciar la asistencia en sitio,
**para** registrar la llegada y comenzar la atención del caso.

- Criterios de aceptación:
  - Registro de llegada y notificación a los implicados.

### HU 5.2 - Chat grupal en asistencia en sitio

**Como** implicado en el caso (investigador, abogado, perito, dibujante, usuario),
**quiero** comunicarme en un chat grupal,
**para** coordinar acciones y compartir información en tiempo real.

- Criterios de aceptación:
  - Soporte para mensajes de texto, fotos, videos, audios y documentos.
  - Mensajería en tiempo real (WebSockets).

### HU 5.3 - Adjuntar y compartir archivos

**Como** participante del chat,
**quiero** adjuntar y compartir archivos multimedia y documentos,
**para** evidenciar y documentar el proceso de asistencia en sitio.

- Criterios de aceptación:
  - Tipos soportados: imágenes, videos, audios, PDF, DOC, informes técnicos.
  - Almacenamiento seguro y acceso controlado.

### HU 5.4 - Solicitar intervención de perito o dibujante

**Como** investigador,
**quiero** solicitar la intervención de un perito o dibujante desde el chat,
**para** que participen y aporten información especializada.

- Criterios de aceptación:
  - Notificación automática y acceso inmediato al chat.

### HU 5.5 - Notificaciones automáticas (SMS/WhatsApp)

**Como** sistema,
**quiero** enviar notificaciones automáticas por SMS y WhatsApp,
**para** mantener informados a los participantes sobre eventos clave.

- Criterios de aceptación:
  - Integración con servicios de mensajería (Twilio, WhatsApp API).
  - Plantillas de mensajes y registro de envíos.

### HU 5.6 - Finalizar caso de asistencia en sitio

**Como** implicado,
**quiero** marcar la finalización del caso,
**para** cerrar el proceso y dejar registro de toda la documentación y comunicación.

- Criterios de aceptación:
  - Validación de que toda la información y archivos requeridos han sido cargados.

---

## Épica 6: Seguridad, Auditoría y Notificaciones

### HU 6.1 - Seguridad y control de acceso

**Como** administrador,
**quiero** que el sistema valide permisos y roles en cada acción,
**para** proteger la información y evitar accesos no autorizados.

- Criterios de aceptación:
  - Middleware de autenticación y autorización.

### HU 6.2 - Auditoría de acciones

**Como** administrador,
**quiero** registrar todas las acciones relevantes de los usuarios,
**para** tener trazabilidad y control sobre el uso del sistema.

- Criterios de aceptación:
  - Registro de logs de acciones críticas.

### HU 6.3 - Notificaciones internas

**Como** usuario,
**quiero** recibir notificaciones dentro de la plataforma,
**para** estar informado de eventos importantes sin depender solo de SMS o WhatsApp.

- Criterios de aceptación:
  - Centro de notificaciones en la interfaz.

---

# Tareas por Historia de Usuario (HU)

## Épica 1: Autenticación y Gestión de Usuarios

### HU 1.1 - Inicio de sesión

- Crear endpoint de login en backend (Express).
- Implementar validación de credenciales con Sequelize.
- Crear formulario de login en React.
- Manejar estados de carga y error en frontend.
- Redirigir a HOME tras login exitoso.
- Pruebas unitarias y de integración.

### HU 1.2 - Recuperar contraseña

- Crear endpoint para solicitud de recuperación.
- Implementar envío de correo/SMS con token de recuperación.
- Crear formulario de recuperación en React.
- Validar token y permitir cambio de contraseña.
- Pruebas de flujo de recuperación.

### HU 1.3 - Gestión de perfil

- Crear endpoints para consultar y actualizar perfil.
- Implementar formulario de edición de perfil en React.
- Permitir cambio de contraseña y estado.
- Validar datos y mostrar feedback.
- Pruebas de actualización de perfil.

### HU 1.4 - Gestión de roles y permisos

- Crear modelo de roles y permisos en base de datos.
- Implementar endpoints para asignación y consulta de roles.
- Crear interfaz de administración de roles.
- Proteger rutas y acciones según permisos.
- Pruebas de acceso y seguridad.

---

## Épica 2: Gestión de Órdenes de Trabajo

### HU 2.1 - Crear orden de trabajo

- Crear modelo y migración de órdenes.
- Endpoint para crear orden (Express + Sequelize).
- Formulario de creación en React.
- Validar campos obligatorios.
- Pruebas de creación y validación.

### HU 2.2 - Buscar orden de trabajo

- Endpoint de búsqueda por placa.
- Componente de búsqueda en React.
- Mostrar resultados y detalles.
- Pruebas de búsqueda.

### HU 2.3 - Editar orden de trabajo

- Endpoint para editar orden.
- Formulario de edición en React.
- Validar estado editable.
- Pruebas de edición.

### HU 2.4 - Control de estados de orden

- Definir estados en modelo.
- Endpoint para actualizar estado.
- Notificaciones automáticas (correo, SMS, WhatsApp).
- Mostrar historial de cambios.
- Pruebas de flujo de estados.

---

## Épica 3: Agendamiento y Calendario

### HU 3.1 - Agendar cita

- Modelo y migración de agendamientos.
- Endpoint para crear agendamiento.
- Formulario de agendamiento en React.
- Validar disponibilidad.
- Notificaciones automáticas.
- Pruebas de agendamiento.

### HU 3.2 - Ver calendario de agendamientos

- Endpoint para obtener agendamientos por usuario.
- Componente de calendario en React.
- Filtros por estado.
- Pruebas de visualización.

### HU 3.3 - Actualizar estado de agendamiento

- Endpoint para actualizar estado.
- Botones/acciones en frontend.
- Actualización en tiempo real (opcional).
- Pruebas de actualización.

---

## Épica 4: Gestión de Casos

### HU 4.1 - Crear caso

- Modelo y migración de casos.
- Endpoint para crear caso.
- Formulario en React.
- Validación con web service externo.
- Pruebas de creación.

### HU 4.2 - Asignar investigador y abogado

- Endpoint para asignación.
- Listado de disponibles en React.
- Notificación de asignación.
- Pruebas de asignación.

### HU 4.3 - Editar y actualizar caso

- Endpoint para editar caso.
- Formulario de edición en React.
- Registro de cambios.
- Pruebas de edición.

---

## Épica 5: Asistencia en Sitio y Comunicación

### HU 5.1 - Iniciar asistencia en sitio

- Endpoint para iniciar asistencia.
- Registro de llegada en frontend.
- Notificación a implicados.
- Pruebas de inicio.

### HU 5.2 - Chat grupal en asistencia en sitio

- Modelo de chat y mensajes en MongoDB.
- Implementar WebSocket/Socket.io en backend y frontend.
- Componente de chat en React.
- Pruebas de mensajería en tiempo real.

### HU 5.3 - Adjuntar y compartir archivos

- Endpoint para subir archivos (backend).
- Integrar almacenamiento externo (S3, Azure, etc.).
- Componente de adjuntos en React.
- Pruebas de subida y descarga.

### HU 5.4 - Solicitar intervención de perito o dibujante

- Acción en chat para solicitar intervención.
- Notificación automática.
- Pruebas de flujo.

### HU 5.5 - Notificaciones automáticas (SMS/WhatsApp)

- Integrar Twilio/WhatsApp API.
- Configurar plantillas de mensajes.
- Endpoint para disparar notificaciones.
- Pruebas de envío y recepción.

### HU 5.6 - Finalizar caso de asistencia en sitio

- Endpoint para finalizar caso.
- Validar carga de información.
- Actualizar estado y notificar.
- Pruebas de cierre.

---

## Épica 6: Seguridad, Auditoría y Notificaciones

### HU 6.1 - Seguridad y control de acceso

- Middleware de autenticación y autorización.
- Pruebas de acceso a rutas protegidas.

### HU 6.2 - Auditoría de acciones

- Modelo de logs/auditoría.
- Registrar acciones críticas.
- Endpoint para consultar logs.
- Pruebas de auditoría.

### HU 6.3 - Notificaciones internas

- Modelo de notificaciones.
- Endpoint para crear y consultar notificaciones.
- Componente de centro de notificaciones en React.
- Pruebas de notificaciones.

---

## Épica 7: Administración y Configuración

### HU 7.1 - Gestión de catálogos y parámetros

**Como** administrador,
**quiero** gestionar catálogos (tipos de caso, estados, etc.),
**para** mantener la flexibilidad del sistema.

- Tareas:
  - Modelo y endpoints para catálogos.
  - Interfaz de administración en React.
  - Pruebas de gestión.

### HU 7.2 - Gestión de usuarios (alta, baja, modificación)

**Como** administrador,
**quiero** dar de alta, baja o modificar usuarios,
**para** mantener el control de acceso.

- Tareas:
  - Endpoints CRUD de usuarios.
  - Interfaz de gestión en React.
  - Pruebas de gestión.

---

## Épica 8: Reportes y Analítica

### HU 8.1 - Generar reportes de casos y órdenes

**Como** usuario autorizado,
**quiero** generar reportes filtrados de casos y órdenes,
**para** analizar la operación.

- Tareas:
  - Endpoints para generación de reportes.
  - Exportar a PDF/Excel.
  - Interfaz de reportes en React.
  - Pruebas de generación y descarga.

### HU 8.2 - Dashboard de indicadores

**Como** coordinador o administrador,
**quiero** ver un dashboard con indicadores clave,
**para** monitorear el desempeño del sistema.

- Tareas:
  - Endpoints de métricas.
  - Gráficas y visualizaciones en React.
  - Pruebas de visualización.

---
