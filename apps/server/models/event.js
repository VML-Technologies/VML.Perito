import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Event = createModelWithSoftDeletes('Event', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre único del evento (ej: user.created, inspection_order.assigned)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del evento'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Categoría del evento (user, inspection_order, appointment, system)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Indica si el evento está activo y puede ser disparado'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del evento (variables disponibles, configuración, etc.)'
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del usuario que creó el evento'
    },
    last_triggered: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última vez que se disparó el evento'
    },
    trigger_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Número total de veces que se ha disparado el evento'
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Versión del evento para control de cambios'
    }
}, {
    tableName: 'events',
    indexes: [
        {
            name: 'event_name_idx',
            fields: ['name']
        },
        {
            name: 'event_category_idx',
            fields: ['category']
        },
        {
            name: 'event_active_idx',
            fields: ['is_active']
        },
        {
            name: 'event_created_by_idx',
            fields: ['created_by']
        }
    ]
});

export default Event; 