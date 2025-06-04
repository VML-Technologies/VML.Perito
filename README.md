# PeritoVML

## Descripción General

PeritoVML es una aplicación diseñada para la gestión de casos de inspección, peritaje y asistencia en sitio, involucrando diferentes roles de usuario dentro del proceso de atención de siniestros y reclamaciones. El sistema permite la interacción coordinada entre asesores, inspectores, agentes de contact center, investigadores, abogados, dibujantes, peritos, coordinadores y administradores.

---

## **Flujo General de la Aplicación**

1. **Inicio de Sesión (LOGIN):**

   - Todos los usuarios deben autenticarse para acceder a la plataforma.

2. **Roles Principales:**

   - **Asesor Seguros Mundial:** Gestiona órdenes de trabajo y cotizaciones.
   - **Inspector:** Realiza inspecciones y reporta resultados.
   - **Agente Contact Center:** Agenda citas, crea casos y realiza seguimiento.
   - **Investigador:** Atiende asignaciones en sitio y solicita apoyo de peritos o dibujantes.
   - **Abogado:** Atiende asignaciones legales y actualiza información de casos.
   - **Dibujante:** Recibe asignaciones y carga planos.
   - **Perito:** Recibe asignaciones y carga informes de peritaje.
   - **Coordinadores y Administrador:** Supervisan y gestionan el flujo general.

3. **Procesos Principales:**
   - Gestión de órdenes de trabajo
   - Inspección y reporte
   - Agendamiento y seguimiento
   - Creación y actualización de casos
   - Asignación de roles a casos
   - Asistencia en sitio
   - Solicitud y carga de documentos (planos, informes, etc.)

---

## **Diagramas de Secuencia por Rol**

### **1. Asesor Seguros Mundial**

- Inicia sesión y accede a la lista de órdenes de trabajo.
- Puede cotizar y hacer seguimiento al estado del caso.

### **2. Inspector**

- Consulta su agenda de asignaciones.
- Inicia y realiza inspecciones, reportando resultados.

### **3. Agente Contact Center**

- Gestiona cotizaciones por agendar y realiza llamadas a clientes.
- Agenda citas y da seguimiento a los estados de agendamiento.
- Crea casos a partir de llamadas y asigna investigadores o abogados.

### **4. Investigador**

- Recibe notificaciones de asignación y se dirige al lugar del accidente.
- Marca llegada, solicita apoyo, captura información y actualiza el estado del caso.

### **5. Abogado**

- Recibe asignaciones, se dirige al sitio, captura información y actualiza el caso.

### **6. Dibujante**

- Recibe asignaciones, se comunica con el investigador y carga planos.

### **7. Perito**

- Recibe asignaciones, se comunica con el investigador y carga informes de peritaje (BAREMO).

---

## **Notas**

- Todos los flujos contemplan la recuperación de contraseña y validación de credenciales.
- El sistema está diseñado para que cada usuario solo vea y gestione la información relevante a su rol.
- La comunicación y actualización de estados es fundamental para el seguimiento de los casos.

---

## **Contacto**

Para más información o soporte, contactar al equipo de desarrollo de PeritoVML.

---

## **Flujos Detallados de los Módulos Principales**

### **1. LOGIN**

- El usuario ingresa sus credenciales.
- Si las credenciales son correctas, accede a la pantalla HOME.
- Si las credenciales son incorrectas, recibe una notificación de error y puede intentar nuevamente.
- Existe la opción de recuperar contraseña en caso de olvido.

### **2. HOME**

- Pantalla principal tras el inicio de sesión.
- Incluye barra de navegación y menú de accesos a los diferentes módulos.
- Acceso al perfil del usuario, donde puede:
  - Cambiar contraseña
  - Consultar y cambiar su estado (Disponible/Fuera de Línea)
  - Cerrar sesión

### **3. LISTA ORDEN DE TRABAJO**

- Permite buscar órdenes de trabajo por placa.
- Se pueden crear nuevas solicitudes.
- Para cada solicitud se puede:
  - Abrir y ver detalles de la orden de trabajo
  - Editar la solicitud
  - Agendar la orden de trabajo
  - Controlar el estado de la orden (Creada, En gestión, Finalizada con inspección)
- Notificaciones automáticas por correo, SMS, WhatsApp y dentro de PeritoVML según el estado.

### **4. ORDEN DE TRABAJO**

- Ingreso de datos del producto, personas y vehículo.
- Si la información es correcta, la solicitud se completa.
- Si falta información, se solicita completar antes de finalizar.

### **5. LISTADO DE AGENDAMIENTO**

- Permite buscar agendamientos por placa y ver el calendario de citas.
- Filtro de estados: Pendiente, En curso, Cerrada, Finalizada.
- Para cada estado se pueden realizar acciones específicas:
  - Pendiente: nuevas solicitudes
  - En curso: inicio de inspección
  - Cerrada: llamada finalizada, pendiente checklist
  - Finalizada: proceso de inspección terminado y actualización de estado de la orden de trabajo

### **6. LISTA DE CASOS**

- Búsqueda de casos por placa.
- Creación de nuevas solicitudes.
- Asignación de investigador y abogado desde listados disponibles.
- Edición de solicitudes y asistencia con tecnología (envío de mensajes).
- Control de estados: Pendiente, En curso, Finalizado.

### **7. ASISTENCIA EN SITIO**

- El investigador o abogado marca llegada al sitio.
- Comunicación y carga de evidencias (chat, fotos, videos, audios, documentos).
- Solicitud de perito o dibujante si es necesario.
- El perito y dibujante pueden cargar sus informes y planos.
- Finalización del caso tras completar toda la documentación y evidencias.

### **8. CREACIÓN DE CASO**

- Ingreso de datos clave: placa, relación del vehículo, identificación, tipo de caso, empresa, departamento, ciudad, dirección del siniestro.
- Validación de datos vía web service (TecniCar HUB transacciones).
- Si los datos son correctos, se guarda el caso; si no, se puede cancelar o corregir.

### **9. FORMULARIO DE AGENDAMIENTO**

- Dos flujos principales: Reclamación del vehículo e Inspección inicial.
- Ingreso de datos del producto, personas y vehículo.
- Selección del tipo de peritaje (a domicilio, en sede, asistido virtual).
- Selección de ciudad y sede según corresponda.
- Consulta de calendario de disponibilidad.
- Al completar la solicitud, se notifica al usuario, jefe de inspectores e inspector por los canales definidos (WhatsApp, SMS, correo, PeritoVML).

---

## **Checklist para Implementación Tecnológica**

A continuación, se presenta un checklist recomendado para cumplir a cabalidad con la arquitectura y los flujos definidos en este documento, utilizando Node.js (Express) para el backend, React para el frontend y la gestión de datos según el tipo de información:

### **1. Configuración General del Proyecto**

- [ ] Inicializar repositorio y estructura de carpetas para backend y frontend.
- [ ] Configurar control de versiones (Git).
- [ ] Definir variables de entorno para conexiones a bases de datos y servicios externos.

### **2. Backend (Node.js + Express)**

- [ ] Crear servidor Express básico y estructura modular (rutas, controladores, servicios, middlewares).
- [ ] Implementar autenticación y autorización (JWT, roles, recuperación de contraseña).
- [ ] Documentar la API (Swagger o similar).

#### **2.1. Base de Datos Relacional (MySQL/SQLServer + Sequelize)**

- [ ] Definir modelos y relaciones para:
  - Usuarios
  - Órdenes de trabajo
  - Agendamientos
- [ ] Implementar migraciones y seeders.
- [ ] Crear endpoints REST para CRUD de usuarios, órdenes y agendamientos.

#### **2.2. Base de Datos No Relacional (MongoDB + Mongoose)**

- [ ] Definir esquemas para:
  - Asistencia en sitio (evidencias, chat, multimedia, documentos, etc.)
- [ ] Crear endpoints REST para gestión de asistencia en sitio.

### **3. Frontend (React)**

- [ ] Crear estructura base de la aplicación (componentes, rutas, contexto de autenticación).
- [ ] Implementar pantallas y flujos:
  - Login y recuperación de contraseña
  - Home y navegación principal
  - Gestión de usuarios (según rol)
  - Listado y detalle de órdenes de trabajo
  - Agendamientos y calendario
  - Listado y detalle de casos
  - Asistencia en sitio (carga de evidencias, chat, multimedia)
- [ ] Validaciones de formularios y feedback al usuario.
- [ ] Consumo de la API backend.

### **4. Integraciones y Notificaciones**

- [ ] Configurar envío de notificaciones (correo, SMS, WhatsApp, notificaciones internas).
- [ ] Integrar servicios externos necesarios (por ejemplo, TecniCar HUB transacciones).

### **5. Seguridad y Buenas Prácticas**

- [ ] Validar y sanitizar entradas de usuario.
- [ ] Manejar errores y logs de manera centralizada.
- [ ] Proteger rutas sensibles y datos personales.
- [ ] Configurar CORS y políticas de seguridad.

### **6. Pruebas y Despliegue**

- [ ] Implementar pruebas unitarias y de integración (backend y frontend).
- [ ] Configurar scripts de despliegue y CI/CD.
- [ ] Documentar el proceso de despliegue y uso.

### **7. Mantenimiento y Escalabilidad**

- [ ] Monitorear el rendimiento de la aplicación y bases de datos.
- [ ] Planificar backups y recuperación ante desastres.
- [ ] Revisar y actualizar dependencias periódicamente.

---

**Notas:**

- Utilizar Sequelize como ORM para la base de datos relacional (MySQL o SQLServer).
- Utilizar Mongoose como ODM para la base de datos no relacional (MongoDB).
- Separar claramente los módulos y responsabilidades según el tipo de dato y flujo de negocio.
- Mantener la documentación técnica y funcional actualizada.

---

## **Detalle de Asistencia en Sitio**

La funcionalidad de **Asistencia en Sitio** está centrada en la comunicación y colaboración en tiempo real entre todos los implicados en el caso:

### **Participantes del Chat**

- Investigador
- Abogado
- Dibujante
- Perito
- Usuario (cliente/afectado)

### **Flujo General**

1. El investigador o abogado puede iniciar la asistencia en sitio.
2. Se marca la llegada al sitio (por parte del investigador).
3. Se habilita un chat grupal donde todos los implicados pueden interactuar.
4. En cualquier momento, se pueden solicitar la intervención de un perito o dibujante.
5. Todos los participantes pueden adjuntar archivos y evidencias.
6. El perito puede cargar el informe de peritaje (Baremo).
7. El caso se finaliza cuando se completa toda la documentación y comunicación necesaria.

### **Tipos de Archivos Adjuntables**

- Mensajes de texto (chat)
- Fotografías (imágenes)
- Videos
- Audios (grabaciones de voz)
- Documentos (PDF, DOC, etc.)
- Informes técnicos (Baremo, planos, etc.)

### **Integración con Notificaciones SMS y WhatsApp**

- El sistema debe enviar notificaciones automáticas a los participantes relevantes en cada etapa del proceso de asistencia en sitio.
- Las notificaciones pueden incluir:
  - Aviso de inicio de asistencia en sitio
  - Solicitud de intervención de perito o dibujante
  - Recordatorios de carga de evidencias
  - Confirmación de finalización del caso
- Para la integración:
  - Utilizar servicios de terceros como Twilio, Nexmo o similares para el envío de SMS.
  - Para WhatsApp, emplear la API oficial de WhatsApp Business o integradores como Twilio WhatsApp API.
  - Configurar plantillas de mensajes y asegurar el cumplimiento de normativas de privacidad y consentimiento del usuario.

### **Notas Técnicas**

- Toda la información y archivos de la asistencia en sitio deben almacenarse en la base de datos no relacional (MongoDB), utilizando Mongoose para la gestión de esquemas.
- El chat debe soportar mensajes en tiempo real (puede implementarse con WebSockets o servicios como Socket.io).
- Los archivos adjuntos deben almacenarse de forma segura, preferiblemente en un sistema de almacenamiento externo (ejemplo: AWS S3, Azure Blob Storage) y referenciados desde la base de datos.

---
