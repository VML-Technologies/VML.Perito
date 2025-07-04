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
            isIn: [['pending', 'sent', 'delivered', 'failed', 'read']]
        }
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
    external_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'notifications',
});

export default Notification; 