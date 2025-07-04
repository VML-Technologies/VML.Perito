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
    template_title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    template_content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    for_clients: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    for_users: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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