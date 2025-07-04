import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const NotificationChannel = createModelWithSoftDeletes('NotificationChannel', {
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'notification_channels',
});

export default NotificationChannel; 