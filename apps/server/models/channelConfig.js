import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const ChannelConfig = createModelWithSoftDeletes('ChannelConfig', {
    channel_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre del canal (email, sms, whatsapp, push, in_app)'
    },
    display_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre para mostrar del canal'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción del canal'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Indica si el canal está activo'
    },
    config: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Configuración específica del canal (credenciales, endpoints, etc.)'
    },
    template_config: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Configuración de plantillas específica del canal'
    },
    rate_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Límite de envíos por minuto'
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Prioridad del canal (1 = más alta)'
    },
    max_retries: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        comment: 'Número máximo de reintentos'
    },
    retry_delay: {
        type: DataTypes.INTEGER,
        defaultValue: 60,
        comment: 'Delay entre reintentos en segundos'
    },
    timeout: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
        comment: 'Timeout en segundos para envío'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del canal'
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'ID del usuario que creó la configuración'
    },
    last_tested: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última vez que se probó el canal'
    },
    test_status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending',
        comment: 'Estado de la última prueba'
    }
}, {
    tableName: 'channel_configs',
    timestamps: true,
    indexes: [
        {
            name: 'idx_channel_configs_name',
            fields: ['channel_name']
        },
        {
            name: 'idx_channel_configs_active',
            fields: ['is_active']
        },
        {
            name: 'idx_channel_configs_priority',
            fields: ['priority']
        }
    ]
});

export default ChannelConfig; 