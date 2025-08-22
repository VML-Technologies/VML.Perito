import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';
import WebhookApiKey from './webhookApiKey.js';

const WebhookLog = createModelWithSoftDeletes('WebhookLog', {
    webhook_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'ID único del webhook'
    },
    api_key_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'webhook_api_keys',
            key: 'id'
        },
        comment: 'API key utilizada'
    },
    event_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tipo de evento procesado'
    },
    payload: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Payload completo del webhook'
    },
    response_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Código de estado de la respuesta'
    },
    response_data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Datos de respuesta'
    },
    processing_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tiempo de procesamiento en milisegundos'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si ocurrió'
    },
    source_ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP de origen'
    },
    user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'User agent del cliente'
    },
    listeners_executed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de listeners ejecutados'
    },
    notifications_sent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de notificaciones enviadas'
    },
    websocket_events: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de eventos WebSocket enviados'
    }
}, {
    tableName: 'webhook_logs',
    timestamps: true
});

// Relación con WebhookApiKey
WebhookLog.belongsTo(WebhookApiKey, { 
    foreignKey: 'api_key_id', 
    as: 'apiKey' 
});

export default WebhookLog;
