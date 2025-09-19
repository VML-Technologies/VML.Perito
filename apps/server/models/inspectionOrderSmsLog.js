import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrderSmsLog = createModelWithSoftDeletes('InspectionOrderSmsLog', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la orden de inspección relacionada'
    },
    recipient_phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: 'Número de teléfono del destinatario'
    },
    recipient_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Nombre del destinatario del SMS'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido del mensaje SMS enviado'
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'error'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del envío del SMS'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Prioridad del SMS'
    },
    provider_response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Respuesta del proveedor de SMS (JSON)'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si el envío falló'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se envió el SMS'
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se confirmó la entrega'
    },
    sms_type: {
        type: DataTypes.ENUM('initial', 'resend', 'reminder', 'notification', 'webhook'),
        allowNull: false,
        defaultValue: 'initial',
        comment: 'Tipo de SMS enviado'
    },
    trigger_source: {
        type: DataTypes.ENUM('model_hook', 'controller', 'webhook', 'manual', 'automated'),
        allowNull: false,
        defaultValue: 'model_hook',
        comment: 'Fuente que disparó el envío del SMS'
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
        comment: 'ID del usuario que inició el envío (si aplica)'
    },
    webhook_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID del webhook que disparó el envío (si aplica)'
    },
    retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos de reenvío'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del envío (JSON)'
    }
}, {
    tableName: 'inspection_order_sms_logs',
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
        {
            name: 'idx_sms_logs_inspection_order',
            fields: ['inspection_order_id']
        },
        {
            name: 'idx_sms_logs_recipient_phone',
            fields: ['recipient_phone']
        },
        {
            name: 'idx_sms_logs_status',
            fields: ['status']
        },
        {
            name: 'idx_sms_logs_sent_at',
            fields: ['sent_at']
        },
        {
            name: 'idx_sms_logs_sms_type',
            fields: ['sms_type']
        },
        {
            name: 'idx_sms_logs_trigger_source',
            fields: ['trigger_source']
        }
    ]
});

export default InspectionOrderSmsLog;
