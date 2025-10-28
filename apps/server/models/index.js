import Department from './department.js';
import City from './city.js';
import Company from './company.js';
import Sede from './sede.js';
import User from './user.js';
import Role from './role.js';
import Permission from './permission.js';
import RolePermission from './rolePermission.js';
import UserRole from './userRole.js';
import ImageCapture from './imageCapture.js';

// Nuevos modelos
import InspectionOrderStatus from './inspectionOrderStatus.js';
import InspectionOrder from './inspectionOrder.js';
import CallStatus from './callStatus.js';
import CallLog from './callLog.js';
import Appointment from './appointment.js';
import NotificationChannel from './notificationChannel.js';
import NotificationType from './notificationType.js';
import NotificationConfig from './notificationConfig.js';
import Notification from './notification.js';
import NotificationQueue from './notificationQueue.js';
import SedeType from './sedeType.js';
import InspectionModality from './inspectionModality.js';
import SedeModalityAvailability from './sedeModalityAvailability.js';

// Nuevos modelos para sistema avanzado
import VehicleType from './vehicleType.js';
import SedeVehicleType from './sedeVehicleType.js';
import ScheduleTemplate from './scheduleTemplate.js';
import ScheduleExclusion from './scheduleExclusion.js';

// Nuevos modelos para sistema de eventos
import Event from './event.js';
import EventListener from './eventListener.js';

// Nuevos modelos para sistema de plantillas
import NotificationTemplate from './notificationTemplate.js';
import TemplateVersion from './templateVersion.js';

// Nuevos modelos para sistema de configuración de canales
import ChannelConfig from './channelConfig.js';

// Nuevos modelos para sistema de webhooks
import WebhookApiKey from './webhookApiKey.js';
import WebhookLog from './webhookLog.js';

// Nuevos modelos para consultas de placas
import PlateQuery from './plateQuery.js';

// Nuevos modelos para logs de SMS
import InspectionOrderSmsLog from './inspectionOrderSmsLog.js';

// Nuevos modelos para historial de contactos y comentarios
import InspectionOrderContactHistory from './inspectionOrderContactHistory.js';
import InspectionOrderCommentHistory from './inspectionOrderCommentHistory.js';

// Nuevos modelos para partes de inspección
import InspectionPart from './inspectionPart.js';
import InspectionCategory from './inspectionCategory.js';
import InspectionCategoryResponse from './inspectionCategoryResponse.js';
import MechanicalTest from './mechanicalTest.js';

// Nuevos modelos para estados de inspección
import InspectionState from './inspectionState.js';
import InspectionOrdersStatusInternal from './inspectionOrdersStatusInternal.js';
import AppointmentStatus from './appointmentStatus.js';

// Nuevos modelos para queue de inspecciones
import InspectionQueue from './inspectionQueue.js';

// Nuevos modelos para accesorios
import Accessory from './accessory.js';

// Nuevos modelos compartidos
import PeritajeOrder from './peritajeOrder.js';
import PeritajeAgendamiento from './peritajeAgendamiento.js';

// Definir relaciones existentes
// ===== RELACIONES PERITAJE COMPARTIDO =====
// PeritajeOrder -> PeritajeAgendamiento (1:N)
PeritajeOrder.hasMany(PeritajeAgendamiento, {
    foreignKey: 'peritaje_order_id',
    as: 'agendamientos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PeritajeAgendamiento.belongsTo(PeritajeOrder, {
    foreignKey: 'peritaje_order_id',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Department -> Cities (1:N)
Department.hasMany(City, {
    foreignKey: 'department_id',
    as: 'cities'
});
City.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department'
});

// City -> Companies (1:N)
City.hasMany(Company, {
    foreignKey: 'city_id',
    as: 'companies'
});
Company.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
});

// City -> Sedes (1:N)
City.hasMany(Sede, {
    foreignKey: 'city_id',
    as: 'sedes',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});
Sede.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

// Company -> Sedes (1:N)
Company.hasMany(Sede, {
    foreignKey: 'company_id',
    as: 'sedes',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});
Sede.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

// Sede -> Users (1:N)
Sede.hasMany(User, {
    foreignKey: 'sede_id',
    as: 'users',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
User.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

// Modelos compartidos
PeritajeOrder,
    PeritajeAgendamiento
// ===== RELACIONES RBAC =====

// User -> Roles (N:N a través de UserRole)
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles'
});
Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users'
});

// Role -> Permissions (N:N a través de RolePermission)
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions'
});
Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles'
});

// Relaciones directas para facilitar consultas
User.hasMany(UserRole, {
    foreignKey: 'user_id',
    as: 'userRoles'
});
UserRole.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Role.hasMany(UserRole, {
    foreignKey: 'role_id',
    as: 'userRoles'
});
UserRole.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role'
});

Role.hasMany(RolePermission, {
    foreignKey: 'role_id',
    as: 'rolePermissions'
});
RolePermission.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role'
});

Permission.hasMany(RolePermission, {
    foreignKey: 'permission_id',
    as: 'rolePermissions'
});
RolePermission.belongsTo(Permission, {
    foreignKey: 'permission_id',
    as: 'permission'
});

// ===== NUEVAS RELACIONES INSPECCIÓN =====

// User -> InspectionOrders (1:N)
User.hasMany(InspectionOrder, {
    foreignKey: 'user_id',
    as: 'inspectionOrders'
});
InspectionOrder.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// User -> InspectionOrders como agente asignado (1:N)
User.hasMany(InspectionOrder, {
    foreignKey: 'assigned_agent_id',
    as: 'assignedOrders'
});
InspectionOrder.belongsTo(User, {
    foreignKey: 'assigned_agent_id',
    as: 'AssignedAgent'
});

// Relación para el creador de la orden
InspectionOrder.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'Creator'
});

// InspectionOrderStatus -> InspectionOrders (1:N)
InspectionOrderStatus.hasMany(InspectionOrder, {
    foreignKey: 'status',
    as: 'inspectionOrders'
});
InspectionOrder.belongsTo(InspectionOrderStatus, {
    foreignKey: 'status',
    as: 'InspectionOrderStatus'
});

// Sede -> InspectionOrders (1:N)
Sede.hasMany(InspectionOrder, {
    foreignKey: 'sede_id',
    as: 'inspectionOrders',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
InspectionOrder.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'Sede',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

// InspectionOrder -> CallLogs (1:N)
InspectionOrder.hasMany(CallLog, {
    foreignKey: 'inspection_order_id',
    as: 'callLogs',
    onDelete: 'NO ACTION', // Cambiado de CASCADE a NO ACTION
    onUpdate: 'CASCADE'
});
CallLog.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder',
    onDelete: 'NO ACTION', // Cambiado de CASCADE a NO ACTION
    onUpdate: 'CASCADE'
});

// CallStatus -> CallLogs (1:N)
CallStatus.hasMany(CallLog, {
    foreignKey: 'status_id',
    as: 'callLogs',
    onDelete: 'NO ACTION', // Ya estaba en NO ACTION
    onUpdate: 'CASCADE'
});
CallLog.belongsTo(CallStatus, {
    foreignKey: 'status_id',
    as: 'status',
    onDelete: 'NO ACTION', // Ya estaba en NO ACTION
    onUpdate: 'CASCADE'
});

// User -> CallLogs como agente que realiza la llamada (1:N)
User.hasMany(CallLog, {
    foreignKey: 'agent_id',
    as: 'callLogs',
    onDelete: 'NO ACTION', // Cambiado de SET NULL a NO ACTION
    onUpdate: 'CASCADE'
});
CallLog.belongsTo(User, {
    foreignKey: 'agent_id',
    as: 'Agent',
    onDelete: 'NO ACTION', // Cambiado de SET NULL a NO ACTION
    onUpdate: 'CASCADE'
});

// InspectionModality -> Appointments (1:N)
InspectionModality.hasMany(Appointment, {
    foreignKey: 'inspection_modality_id',
    as: 'appointments',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});
Appointment.belongsTo(InspectionModality, {
    foreignKey: 'inspection_modality_id',
    as: 'inspectionModality',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

// Sede -> Appointments (1:N)
Sede.hasMany(Appointment, {
    foreignKey: 'sede_id',
    as: 'appointments',
    onDelete: 'NO ACTION', // Cambiado de SET NULL a NO ACTION porque sede_id es NOT NULL
    onUpdate: 'CASCADE'
});
Appointment.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede',
    onDelete: 'NO ACTION', // Cambiado de SET NULL a NO ACTION porque sede_id es NOT NULL
    onUpdate: 'CASCADE'
});

// User -> Appointments (1:N)
User.hasMany(Appointment, {
    foreignKey: 'user_id',
    as: 'appointments',
    onDelete: 'SET NULL', // Revertido a SET NULL porque user_id es allowNull: true
    onUpdate: 'CASCADE'
});
Appointment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'SET NULL', // Revertido a SET NULL porque user_id es allowNull: true
    onUpdate: 'CASCADE'
});

// InspectionOrder -> Appointments (1:N)
InspectionOrder.hasMany(Appointment, {
    foreignKey: 'inspection_order_id',
    as: 'appointments',
    onDelete: 'NO ACTION', // Cambiado de CASCADE a NO ACTION
    onUpdate: 'CASCADE'
});
Appointment.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder',
    onDelete: 'NO ACTION', // Cambiado de CASCADE a NO ACTION
    onUpdate: 'CASCADE'
});

// RELACIÓN BIDIRECCIONAL: CallLog <-> Appointment
CallLog.hasOne(Appointment, {
    as: 'appointment',
    foreignKey: 'call_log_id',
    onDelete: 'NO ACTION', // Cambiado de SET NULL a NO ACTION
    onUpdate: 'CASCADE'
});
Appointment.belongsTo(CallLog, {
    foreignKey: 'call_log_id',
    as: 'callLog',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

// ===== NUEVAS RELACIONES MODALIDADES =====

// SedeType -> Sedes (1:N)
SedeType.hasMany(Sede, {
    foreignKey: 'sede_type_id',
    as: 'sedes',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});
Sede.belongsTo(SedeType, {
    foreignKey: 'sede_type_id',
    as: 'sedeType',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
});

// SedeModalityAvailability relaciones
Sede.hasMany(SedeModalityAvailability, {
    foreignKey: 'sede_id',
    as: 'modalityAvailabilities',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
SedeModalityAvailability.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

InspectionModality.hasMany(SedeModalityAvailability, {
    foreignKey: 'inspection_modality_id',
    as: 'sedeAvailabilities'
});
SedeModalityAvailability.belongsTo(InspectionModality, {
    foreignKey: 'inspection_modality_id',
    as: 'inspectionModality'
});

// ===== NUEVAS RELACIONES SISTEMA AVANZADO =====

// SedeVehicleType relaciones (N:N entre Sede y VehicleType)
Sede.belongsToMany(VehicleType, {
    through: SedeVehicleType,
    foreignKey: 'sede_id',
    otherKey: 'vehicle_type_id',
    as: 'vehicleTypes'
});
VehicleType.belongsToMany(Sede, {
    through: SedeVehicleType,
    foreignKey: 'vehicle_type_id',
    otherKey: 'sede_id',
    as: 'sedes'
});

// Relaciones directas para SedeVehicleType
Sede.hasMany(SedeVehicleType, {
    foreignKey: 'sede_id',
    as: 'sedeVehicleTypes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
SedeVehicleType.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

VehicleType.hasMany(SedeVehicleType, {
    foreignKey: 'vehicle_type_id',
    as: 'sedeVehicleTypes'
});
SedeVehicleType.belongsTo(VehicleType, {
    foreignKey: 'vehicle_type_id',
    as: 'vehicleType'
});

// ScheduleTemplate relaciones
Sede.hasMany(ScheduleTemplate, {
    foreignKey: 'sede_id',
    as: 'scheduleTemplates',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ScheduleTemplate.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

InspectionModality.hasMany(ScheduleTemplate, {
    foreignKey: 'inspection_modality_id',
    as: 'scheduleTemplates'
});
ScheduleTemplate.belongsTo(InspectionModality, {
    foreignKey: 'inspection_modality_id',
    as: 'inspectionModality'
});

// ScheduleTemplate -> ScheduleExclusion (1:N) - Períodos de exclusión en horarios
ScheduleTemplate.hasMany(ScheduleExclusion, {
    foreignKey: 'schedule_template_id',
    as: 'exclusions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ScheduleExclusion.belongsTo(ScheduleTemplate, {
    foreignKey: 'schedule_template_id',
    as: 'scheduleTemplate',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// ===== RELACIONES NOTIFICACIONES =====

// NotificationType -> NotificationConfig (1:N)
NotificationType.hasMany(NotificationConfig, {
    foreignKey: 'notification_type_id',
    as: 'configs'
});
NotificationConfig.belongsTo(NotificationType, {
    foreignKey: 'notification_type_id',
    as: 'type'
});

// NotificationChannel -> NotificationConfig (1:N)
NotificationChannel.hasMany(NotificationConfig, {
    foreignKey: 'notification_channel_id',
    as: 'configs'
});
NotificationConfig.belongsTo(NotificationChannel, {
    foreignKey: 'notification_channel_id',
    as: 'channel'
});

// NotificationConfig -> Notifications (1:N)
NotificationConfig.hasMany(Notification, {
    foreignKey: 'notification_config_id',
    as: 'notifications',
    onDelete: 'NO ACTION', // Mantiene NO ACTION porque notification_config_id es NOT NULL
    onUpdate: 'CASCADE'
});
Notification.belongsTo(NotificationConfig, {
    foreignKey: 'notification_config_id',
    as: 'config',
    onDelete: 'NO ACTION', // Mantiene NO ACTION porque notification_config_id es NOT NULL
    onUpdate: 'CASCADE'
});

// Appointment -> Notifications (1:N)
Appointment.hasMany(Notification, {
    foreignKey: 'appointment_id',
    as: 'notifications',
    onDelete: 'NO ACTION', // Cambiado a NO ACTION para evitar caminos múltiples
    onUpdate: 'CASCADE'
});
Notification.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
    onDelete: 'NO ACTION', // Cambiado a NO ACTION para evitar caminos múltiples
    onUpdate: 'CASCADE'
});

// InspectionOrder -> Notifications (1:N)
InspectionOrder.hasMany(Notification, {
    foreignKey: 'inspection_order_id',
    as: 'notifications',
    onDelete: 'NO ACTION', // Cambiado a NO ACTION para evitar caminos múltiples
    onUpdate: 'CASCADE'
});
Notification.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder',
    onDelete: 'NO ACTION', // Cambiado a NO ACTION para evitar caminos múltiples
    onUpdate: 'CASCADE'
});

// User -> Notifications (1:N)
User.hasMany(Notification, {
    foreignKey: 'recipient_user_id',
    as: 'notifications',
    onDelete: 'NO ACTION', // Cambiado a NO ACTION para evitar caminos múltiples
    onUpdate: 'CASCADE'
});
Notification.belongsTo(User, {
    foreignKey: 'recipient_user_id',
    as: 'recipientUser',
    onDelete: 'NO ACTION', // Cambiado a NO ACTION para evitar caminos múltiples
    onUpdate: 'CASCADE'
});

// Notification -> NotificationQueue (1:1)
Notification.hasOne(NotificationQueue, {
    foreignKey: 'notification_id',
    as: 'queue'
});
NotificationQueue.belongsTo(Notification, {
    foreignKey: 'notification_id',
    as: 'notification'
});

// ===== RELACIONES SISTEMA DE EVENTOS =====

// Event -> EventListener (1:N)
Event.hasMany(EventListener, {
    foreignKey: 'event_id',
    as: 'listeners'
});
EventListener.belongsTo(Event, {
    foreignKey: 'event_id',
    as: 'Event'
});

// NotificationType -> EventListener (1:N)
NotificationType.hasMany(EventListener, {
    foreignKey: 'notification_type_id',
    as: 'eventListeners'
});
EventListener.belongsTo(NotificationType, {
    foreignKey: 'notification_type_id',
    as: 'NotificationType'
});

// User -> Event (1:N) - Usuario que creó el evento
User.hasMany(Event, {
    foreignKey: 'created_by',
    as: 'createdEvents'
});
Event.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// User -> EventListener (1:N) - Usuario que creó el listener
User.hasMany(EventListener, {
    foreignKey: 'created_by',
    as: 'createdEventListeners'
});
EventListener.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ===== RELACIONES SISTEMA DE PLANTILLAS =====

// User -> NotificationTemplate (1:N) - Usuario que creó la plantilla
User.hasMany(NotificationTemplate, {
    foreignKey: 'created_by',
    as: 'createdTemplates'
});
NotificationTemplate.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'templateCreator'
});

// NotificationTemplate -> TemplateVersion (1:N) - Historial de versiones
NotificationTemplate.hasMany(TemplateVersion, {
    foreignKey: 'template_id',
    as: 'versions'
});
TemplateVersion.belongsTo(NotificationTemplate, {
    foreignKey: 'template_id',
    as: 'template'
});

// User -> TemplateVersion (1:N) - Usuario que creó la versión
User.hasMany(TemplateVersion, {
    foreignKey: 'created_by',
    as: 'createdTemplateVersions'
});
TemplateVersion.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'versionCreator'
});

// ===== RELACIONES SISTEMA DE CONFIGURACIÓN DE CANALES =====

// User -> ChannelConfig (1:N) - Usuario que creó la configuración
User.hasMany(ChannelConfig, {
    foreignKey: 'created_by',
    as: 'createdChannelConfigs'
});
ChannelConfig.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ===== RELACIONES SISTEMA DE WEBHOOKS =====

// User -> WebhookApiKey (1:N) - Usuario que creó la API key
User.hasMany(WebhookApiKey, {
    foreignKey: 'created_by',
    as: 'createdWebhookApiKeys'
});
WebhookApiKey.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'webhookCreator'
});

// WebhookApiKey -> WebhookLog (1:N) - Logs de uso de la API key
WebhookApiKey.hasMany(WebhookLog, {
    foreignKey: 'api_key_id',
    as: 'logs'
});
WebhookLog.belongsTo(WebhookApiKey, {
    foreignKey: 'api_key_id',
    as: 'webhookApiKey'
});

// ===== RELACIONES SISTEMA DE CONSULTAS DE PLACAS =====

// InspectionOrder -> PlateQuery (1:N) - Consultas realizadas sobre una orden
InspectionOrder.hasMany(PlateQuery, {
    foreignKey: 'order_id',
    as: 'plateQueries'
});
PlateQuery.belongsTo(InspectionOrder, {
    foreignKey: 'order_id',
    as: 'order'
});

// ===== RELACIONES SISTEMA DE HISTORIAL DE CONTACTOS Y COMENTARIOS =====

// InspectionOrder -> InspectionOrderContactHistory (1:N) - Historial de cambios de contacto
InspectionOrder.hasMany(InspectionOrderContactHistory, {
    foreignKey: 'inspection_order_id',
    as: 'contactHistory'
});
InspectionOrderContactHistory.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// User -> InspectionOrderContactHistory (1:N) - Usuario que realizó el cambio
User.hasMany(InspectionOrderContactHistory, {
    foreignKey: 'user_id',
    as: 'contactHistoryChanges'
});
InspectionOrderContactHistory.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// InspectionOrder -> InspectionOrderCommentHistory (1:N) - Historial de comentarios
InspectionOrder.hasMany(InspectionOrderCommentHistory, {
    foreignKey: 'inspection_order_id',
    as: 'commentHistory'
});
InspectionOrderCommentHistory.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// User -> InspectionOrderCommentHistory (1:N) - Usuario que creó el comentario
User.hasMany(InspectionOrderCommentHistory, {
    foreignKey: 'user_id',
    as: 'commentHistory'
});
InspectionOrderCommentHistory.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

InspectionCategory.hasMany(InspectionPart, {
    foreignKey: 'categoria_id',
    as: 'parts'
});
InspectionPart.belongsTo(InspectionCategory, {
    foreignKey: 'categoria_id',
    as: 'category'
});

// Relaciones para InspectionCategoryResponse
InspectionCategory.hasMany(InspectionCategoryResponse, {
    foreignKey: 'category_id',
    as: 'responses'
});
InspectionCategoryResponse.belongsTo(InspectionCategory, {
    foreignKey: 'category_id',
    as: 'category'
});

// ===== RELACIONES SISTEMA DE ESTADOS DE INSPECCIÓN =====

// InspectionOrder -> InspectionState (1:N)
InspectionOrder.hasMany(InspectionState, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionStates'
});
InspectionState.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// Appointment -> InspectionState (1:N)
Appointment.hasMany(InspectionState, {
    foreignKey: 'appointment_id',
    as: 'inspectionStates'
});
InspectionState.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment'
});

// InspectionOrderStatus -> InspectionState (1:N)
InspectionOrderStatus.hasMany(InspectionState, {
    foreignKey: 'inspection_order_status',
    as: 'inspectionStates'
});
InspectionState.belongsTo(InspectionOrderStatus, {
    foreignKey: 'inspection_order_status',
    as: 'inspectionOrderStatus'
});

// InspectionOrdersStatusInternal -> InspectionState (1:N)
InspectionOrdersStatusInternal.hasMany(InspectionState, {
    foreignKey: 'inspection_order_status_internal',
    as: 'inspectionStates'
});
InspectionState.belongsTo(InspectionOrdersStatusInternal, {
    foreignKey: 'inspection_order_status_internal',
    as: 'inspectionOrderStatusInternal'
});

// AppointmentStatus -> InspectionState (1:N)
AppointmentStatus.hasMany(InspectionState, {
    foreignKey: 'appointment_status',
    as: 'inspectionStates'
});
InspectionState.belongsTo(AppointmentStatus, {
    foreignKey: 'appointment_status',
    as: 'appointmentStatus'
});

// User -> InspectionState (1:N)
User.hasMany(InspectionState, {
    foreignKey: 'user_id',
    as: 'inspectionStates'
});
InspectionState.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// ===== RELACIONES PARA INSPECTION QUEUE =====

// InspectionOrder -> InspectionQueue (1:N) - Una orden puede estar en la cola
InspectionOrder.hasMany(InspectionQueue, {
    foreignKey: 'inspection_order_id',
    as: 'queueEntries'
});
InspectionQueue.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// ===== RELACIONES PARA SMS LOGS =====

// InspectionOrder -> InspectionOrderSmsLog (1:N) - Una orden puede tener múltiples logs de SMS
InspectionOrder.hasMany(InspectionOrderSmsLog, {
    foreignKey: 'inspection_order_id',
    as: 'smsLogs'
});
InspectionOrderSmsLog.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// User -> InspectionOrderSmsLog (1:N) - Un usuario puede haber iniciado múltiples SMS
User.hasMany(InspectionOrderSmsLog, {
    foreignKey: 'user_id',
    as: 'smsLogs'
});
InspectionOrderSmsLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// User -> InspectionQueue (1:N) - Inspector asignado a la cola
User.hasMany(InspectionQueue, {
    foreignKey: 'inspector_asignado_id',
    as: 'assignedInspections'
});
InspectionQueue.belongsTo(User, {
    foreignKey: 'inspector_asignado_id',
    as: 'inspector'
});

// Appointment -> InspectionQueue (1:N) - Un appointment puede tener múltiples entradas en la cola
Appointment.hasMany(InspectionQueue, {
    foreignKey: 'appointment_id',
    as: 'queueEntries',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
InspectionQueue.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

// Appointment -> ImageCapture (1:N)
Appointment.hasMany(ImageCapture, {
    foreignKey: 'appointment_id',
    as: 'imageCaptures',
});
ImageCapture.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
});

// ===== RELACIONES PARA ACCESORIOS =====

// Appointment -> Accessory (1:N) - Un appointment puede tener múltiples accesorios
// Relación especial: Accessory.inspection_id hace referencia a Appointment.session_id
Appointment.hasMany(Accessory, {
    foreignKey: 'inspection_id',
    sourceKey: 'session_id',
    as: 'accessories',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Accessory.belongsTo(Appointment, {
    foreignKey: 'inspection_id',
    targetKey: 'session_id',
    as: 'appointment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

export {
    Department,
    City,
    Company,
    Sede,
    User,
    Role,
    Permission,
    RolePermission,
    UserRole,
    ImageCapture,
    // Nuevos modelos
    InspectionOrderStatus,
    InspectionOrder,
    CallStatus,
    CallLog,
    Appointment,
    NotificationChannel,
    NotificationType,
    NotificationConfig,
    Notification,
    NotificationQueue,
    SedeType,
    InspectionModality,
    SedeModalityAvailability,
    // Sistema avanzado
    VehicleType,
    SedeVehicleType,
    ScheduleTemplate,
    ScheduleExclusion,
    // Sistema de eventos
    Event,
    EventListener,
    // Sistema de plantillas
    NotificationTemplate,
    TemplateVersion,
    // Sistema de configuración de canales
    ChannelConfig,
    // Sistema de webhooks
    WebhookApiKey,
    WebhookLog,
    // Sistema de consultas de placas
    PlateQuery,
    // Sistema de logs de SMS
    InspectionOrderSmsLog,
    // Sistema de historial de contactos y comentarios
    InspectionOrderContactHistory,
    InspectionOrderCommentHistory,
    // Sistema de partes de inspección
    InspectionPart,
    InspectionCategory,
    InspectionCategoryResponse,
    MechanicalTest,
    // Sistema de queue de inspecciones
    InspectionQueue,
    // Sistema de estados de inspección
    InspectionState,
    InspectionOrdersStatusInternal,
    AppointmentStatus,
    // Sistema de accesorios
    Accessory
}; 