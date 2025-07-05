import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Notification = createModelWithSoftDeletes('Notification', {
    notification_config_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'notification_config',
            key: 'id'
        }
    },
    appointment_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'appointments',
            key: 'id'
        }
    },
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'inspection_orders',
            key: 'id'
        }
    },
    recipient_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['user', 'client']]
        }
    },
    recipient_user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    recipient_email: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    recipient_phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    recipient_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'read', 'cancelled']]
        }
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora programada para envío'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos de reenvío realizados'
    },
    max_retries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Máximo número de intentos de reenvío'
    },
    external_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID externo del proveedor (WhatsApp, SMS, etc.)'
    },
    external_response: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Respuesta completa del proveedor externo'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Datos adicionales específicos del tipo de notificación'
    },
    push_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Token para notificaciones push'
    },
    websocket_delivered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si fue entregada via WebSocket'
    },
}, {
    tableName: 'notifications',
});

export default Notification; 