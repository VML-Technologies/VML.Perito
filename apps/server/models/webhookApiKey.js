import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';
import User from './user.js';

const WebhookApiKey = createModelWithSoftDeletes('WebhookApiKey', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre descriptivo de la aplicación'
    },
    api_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Token API único'
    },
    api_secret: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Secret para firma HMAC'
    },
    application_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre de la aplicación externa'
    },
    contact_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Email de contacto'
    },
    allowed_events: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array de eventos permitidos'
    },
    allowed_ips: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array de IPs permitidas (opcional)'
    },
    rate_limit_per_minute: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        comment: 'Límite de requests por minuto'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la API key está activa'
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de expiración (opcional)'
    },
    last_used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última vez que se usó'
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Usuario que creó la API key'
    }
}, {
    tableName: 'webhook_api_keys',
    timestamps: true
});

// Relación con User
WebhookApiKey.belongsTo(User, { 
    foreignKey: 'created_by', 
    as: 'creator' 
});

export default WebhookApiKey;
