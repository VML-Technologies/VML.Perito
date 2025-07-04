import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const NotificationType = createModelWithSoftDeletes('NotificationType', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'notification_types',
});

export default NotificationType; 