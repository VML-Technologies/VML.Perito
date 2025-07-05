import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const NotificationQueue = createModelWithSoftDeletes('NotificationQueue', {
    notification_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'notifications',
            key: 'id'
        },
        comment: 'Referencia a la notificación'
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha y hora programada para procesamiento'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos de procesamiento'
    },
    max_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
    },
    next_attempt_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Próximo intento programado'
    },
    processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de procesamiento exitoso'
    },
    failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha del último fallo'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje del último error'
    },
    worker_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID del worker que está procesando'
    },
    locked_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de bloqueo para procesamiento'
    },
    lock_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expiración del bloqueo'
    }
}, {
    tableName: 'notification_queue',
    indexes: [
        {
            fields: ['scheduled_at', 'status', 'priority'],
            name: 'idx_queue_processing'
        },
        {
            fields: ['status', 'next_attempt_at'],
            name: 'idx_queue_retry'
        },
        {
            fields: ['locked_at', 'lock_expires_at'],
            name: 'idx_queue_locks'
        }
    ]
});

export default NotificationQueue; 