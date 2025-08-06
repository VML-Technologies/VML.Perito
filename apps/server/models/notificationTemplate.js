import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const NotificationTemplate = createModelWithSoftDeletes('NotificationTemplate', {
    name: { 
        type: DataTypes.STRING(100), 
        allowNull: false,
        unique: true,
        comment: 'Nombre único de la plantilla'
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: true,
        comment: 'Descripción de la plantilla'
    },
    category: { 
        type: DataTypes.STRING(50), 
        allowNull: false,
        comment: 'Categoría de la plantilla (user, inspection_order, appointment, etc.)'
    },
    channels: { 
        type: DataTypes.JSON, 
        allowNull: false,
        comment: 'Configuración de plantillas por canal: {email: {...}, sms: {...}, whatsapp: {...}}'
    },
    variables: { 
        type: DataTypes.JSON, 
        allowNull: true,
        comment: 'Lista de variables disponibles para esta plantilla'
    },
    is_active: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true,
        comment: 'Indica si la plantilla está activa'
    },
    created_by: { 
        type: DataTypes.BIGINT, 
        allowNull: true,
        comment: 'ID del usuario que creó la plantilla'
    },
    version: { 
        type: DataTypes.INTEGER, 
        defaultValue: 1,
        comment: 'Versión de la plantilla'
    },
    metadata: { 
        type: DataTypes.JSON, 
        allowNull: true,
        comment: 'Metadatos adicionales de la plantilla'
    }
}, {
    tableName: 'notification_templates',
    timestamps: true,
    indexes: [
        {
            name: 'idx_notification_templates_category',
            fields: ['category']
        },
        {
            name: 'idx_notification_templates_active',
            fields: ['is_active']
        },
        {
            name: 'idx_notification_templates_created_by',
            fields: ['created_by']
        }
    ]
});

export default NotificationTemplate; 