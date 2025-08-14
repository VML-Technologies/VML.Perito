import Department from './department.js';
import City from './city.js';
import Company from './company.js';
import Sede from './sede.js';
import User from './user.js';
import Role from './role.js';
import Permission from './permission.js';
import RolePermission from './rolePermission.js';
import UserRole from './userRole.js';

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

// Nuevos modelos para sistema de eventos
import Event from './event.js';
import EventListener from './eventListener.js';

// Nuevos modelos para sistema de plantillas
import NotificationTemplate from './notificationTemplate.js';
import TemplateVersion from './templateVersion.js';

// Nuevos modelos para sistema de configuración de canales
import ChannelConfig from './channelConfig.js';

// Definir relaciones existentes

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
    as: 'creator'
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
    as: 'creator'
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
    // Sistema de eventos
    Event,
    EventListener,
    // Sistema de plantillas
    NotificationTemplate,
    TemplateVersion,
    // Sistema de configuración de canales
    ChannelConfig
}; 