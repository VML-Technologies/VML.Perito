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
import SedeType from './sedeType.js';
import InspectionModality from './inspectionModality.js';
import SedeModalityAvailability from './sedeModalityAvailability.js';

// Nuevos modelos para sistema avanzado
import VehicleType from './vehicleType.js';
import SedeVehicleType from './sedeVehicleType.js';
import ScheduleTemplate from './scheduleTemplate.js';

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
    as: 'sedes'
});
Sede.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'city'
});

// Company -> Sedes (1:N)
Company.hasMany(Sede, {
    foreignKey: 'company_id',
    as: 'sedes'
});
Sede.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
});

// Sede -> Users (1:N)
Sede.hasMany(User, {
    foreignKey: 'sede_id',
    as: 'users'
});
User.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
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
    as: 'inspectionOrders'
});
InspectionOrder.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'Sede'
});

// InspectionOrder -> CallLogs (1:N)
InspectionOrder.hasMany(CallLog, {
    foreignKey: 'inspection_order_id',
    as: 'callLogs'
});
CallLog.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// CallStatus -> CallLogs (1:N)
CallStatus.hasMany(CallLog, {
    foreignKey: 'status_id',
    as: 'callLogs'
});
CallLog.belongsTo(CallStatus, {
    foreignKey: 'status_id',
    as: 'status'
});

// User -> CallLogs como agente que realiza la llamada (1:N)
User.hasMany(CallLog, {
    foreignKey: 'agent_id',
    as: 'callLogs'
});
CallLog.belongsTo(User, {
    foreignKey: 'agent_id',
    as: 'Agent'
});

// InspectionModality -> Appointments (1:N)
InspectionModality.hasMany(Appointment, {
    foreignKey: 'inspection_modality_id',
    as: 'appointments'
});
Appointment.belongsTo(InspectionModality, {
    foreignKey: 'inspection_modality_id',
    as: 'inspectionModality'
});

// Sede -> Appointments (1:N)
Sede.hasMany(Appointment, {
    foreignKey: 'sede_id',
    as: 'appointments'
});
Appointment.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
});

// User -> Appointments (1:N)
User.hasMany(Appointment, {
    foreignKey: 'user_id',
    as: 'appointments'
});
Appointment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// InspectionOrder -> Appointments (1:N)
InspectionOrder.hasMany(Appointment, {
    foreignKey: 'inspection_order_id',
    as: 'appointments'
});
Appointment.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// Relación Appointment <-> CallLog
Appointment.belongsTo(CallLog, { as: 'callLog', foreignKey: 'call_log_id' });
CallLog.hasOne(Appointment, { as: 'appointment', foreignKey: 'call_log_id' });

// ===== NUEVAS RELACIONES MODALIDADES =====

// SedeType -> Sedes (1:N)
SedeType.hasMany(Sede, {
    foreignKey: 'sede_type_id',
    as: 'sedes'
});
Sede.belongsTo(SedeType, {
    foreignKey: 'sede_type_id',
    as: 'sedeType'
});

// SedeModalityAvailability relaciones
Sede.hasMany(SedeModalityAvailability, {
    foreignKey: 'sede_id',
    as: 'modalityAvailabilities'
});
SedeModalityAvailability.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
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
    as: 'sedeVehicleTypes'
});
SedeVehicleType.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
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
    as: 'scheduleTemplates'
});
ScheduleTemplate.belongsTo(Sede, {
    foreignKey: 'sede_id',
    as: 'sede'
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
    as: 'notifications'
});
Notification.belongsTo(NotificationConfig, {
    foreignKey: 'notification_config_id',
    as: 'config'
});

// Appointment -> Notifications (1:N)
Appointment.hasMany(Notification, {
    foreignKey: 'appointment_id',
    as: 'notifications'
});
Notification.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment'
});

// InspectionOrder -> Notifications (1:N)
InspectionOrder.hasMany(Notification, {
    foreignKey: 'inspection_order_id',
    as: 'notifications'
});
Notification.belongsTo(InspectionOrder, {
    foreignKey: 'inspection_order_id',
    as: 'inspectionOrder'
});

// User -> Notifications (1:N)
User.hasMany(Notification, {
    foreignKey: 'recipient_user_id',
    as: 'notifications'
});
Notification.belongsTo(User, {
    foreignKey: 'recipient_user_id',
    as: 'recipientUser'
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
    SedeType,
    InspectionModality,
    SedeModalityAvailability,
    // Sistema avanzado
    VehicleType,
    SedeVehicleType,
    ScheduleTemplate
}; 