import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrderContactHistory = createModelWithSoftDeletes('InspectionOrderContactHistory', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        },
        comment: 'ID de la orden de inspección'
    },
    nombre_contacto: {
        type: DataTypes.STRING(250),
        allowNull: false,
        comment: 'Nombre del contacto anterior'
    },
    celular_contacto: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Celular del contacto anterior (10 dígitos sin código de país)'
    },
    correo_contacto: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Correo del contacto anterior'
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del usuario que realizó el cambio'
    }
}, {
    tableName: 'inspection_order_contact_history',
    paranoid: true,
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
        {
            name: 'idx_contact_history_inspection_order',
            fields: ['inspection_order_id']
        },
        {
            name: 'idx_contact_history_user',
            fields: ['user_id']
        },
        {
            name: 'idx_contact_history_created_at',
            fields: ['created_at']
        }
    ]
});

export default InspectionOrderContactHistory;


