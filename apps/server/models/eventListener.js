import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const EventListener = createModelWithSoftDeletes('EventListener', {
    event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'events',
            key: 'id'
        },
        comment: 'ID del evento que dispara la notificación'
    },
    notification_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'notification_types',
            key: 'id'
        },
        comment: 'ID del tipo de notificación a enviar'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Indica si el listener está activo'
    },
    conditions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Condiciones que deben cumplirse para enviar la notificación'
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Prioridad del listener (1 = más alta, 10 = más baja)'
    },
    delay_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Retraso en segundos antes de enviar la notificación'
    },
    channels: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Canales específicos para este listener (email, sms, etc.)'
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del usuario que creó el listener'
    },
    execution_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Número de veces que se ha ejecutado este listener'
    },
    last_executed: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última vez que se ejecutó este listener'
    }
}, {
    tableName: 'event_listeners',
    indexes: [
        {
            name: 'event_listener_event_idx',
            fields: ['event_id']
        },
        {
            name: 'event_listener_notification_type_idx',
            fields: ['notification_type_id']
        },
        {
            name: 'event_listener_active_idx',
            fields: ['is_active']
        },
        {
            name: 'event_listener_priority_idx',
            fields: ['priority']
        },
        {
            name: 'event_listener_created_by_idx',
            fields: ['created_by']
        }
    ]
});

export default EventListener; 