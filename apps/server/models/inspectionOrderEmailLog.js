import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrderEmailLog = createModelWithSoftDeletes('InspectionOrderEmailLog', {
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
    recipient_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Dirección de email del destinatario'
    },
    recipient_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Nombre del destinatario del email'
    },
    subject: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Asunto del email enviado'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Contenido del email en texto plano'
    },
    html_content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Contenido HTML del email'
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'error'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del envío del email'
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Prioridad del email'
    },
    provider_response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Respuesta del proveedor de email (JSON)'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si el envío falló'
    },
    message_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'ID del mensaje del proveedor de email'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se envió el email'
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se confirmó la entrega'
    },
    opened_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se abrió el email'
    },
    clicked_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se hizo click en un enlace'
    },
    email_type: {
        type: DataTypes.ENUM('initial', 'resend', 'reminder', 'notification', 'webhook'),
        allowNull: false,
        defaultValue: 'initial',
        comment: 'Tipo de email enviado'
    },
    trigger_source: {
        type: DataTypes.ENUM('model_hook', 'controller', 'webhook', 'manual', 'automated'),
        allowNull: false,
        defaultValue: 'model_hook',
        comment: 'Fuente que disparó el envío del email'
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
    tableName: 'inspection_order_email_logs',
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
        {
            name: 'idx_email_logs_inspection_order',
            fields: ['inspection_order_id']
        },
        {
            name: 'idx_email_logs_recipient_email',
            fields: ['recipient_email']
        },
        {
            name: 'idx_email_logs_status',
            fields: ['status']
        },
        {
            name: 'idx_email_logs_sent_at',
            fields: ['sent_at']
        },
        {
            name: 'idx_email_logs_email_type',
            fields: ['email_type']
        },
        {
            name: 'idx_email_logs_trigger_source',
            fields: ['trigger_source']
        },
        {
            name: 'idx_email_logs_message_id',
            fields: ['message_id']
        }
    ]
});

export default InspectionOrderEmailLog;
