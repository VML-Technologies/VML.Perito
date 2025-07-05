import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const NotificationConfig = createModelWithSoftDeletes('NotificationConfig', {
    notification_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'notification_types',
            key: 'id'
        }
    },
    notification_channel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'notification_channels',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre descriptivo de la configuración'
    },
    template_title: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Plantilla del título con variables {{variable}}'
    },
    template_content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Plantilla del contenido con variables {{variable}}'
    },
    template_variables: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Variables disponibles para la plantilla: {key: description}'
    },
    target_roles: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array de roles que reciben esta notificación'
    },
    target_users: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array de IDs de usuarios específicos'
    },
    for_clients: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si la notificación es para clientes'
    },
    for_users: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si la notificación es para usuarios del sistema'
    },
    trigger_conditions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Condiciones que disparan la notificación'
    },
    schedule_type: {
        type: DataTypes.ENUM('immediate', 'delayed', 'recurring'),
        allowNull: false,
        defaultValue: 'immediate',
        comment: 'Tipo de programación de la notificación'
    },
    schedule_delay_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Minutos de retraso para notificaciones delayed'
    },
    schedule_cron: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Expresión cron para notificaciones recurring'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Prioridad de la notificación'
    },
    retry_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Número de intentos de reenvío en caso de fallo'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'notification_config',
});

export default NotificationConfig; 