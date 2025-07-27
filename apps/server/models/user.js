import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const User = createModelWithSoftDeletes('User', {
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    notification_channel_in_app_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notification_channel_sms_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notification_channel_email_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notification_channel_whatsapp_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    intermediary_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    temporary_password: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
}, {
    tableName: 'users',
});

export default User; 