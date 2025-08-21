import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const PlateQuery = createModelWithSoftDeletes('PlateQuery', {
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
    placa: {
        type: DataTypes.STRING(6),
        allowNull: false,
        comment: 'Placa consultada'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'Dirección IP del cliente que realizó la consulta'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User agent del navegador'
    },
    found_order: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si se encontró una orden de inspección activa'
    },
    order_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'inspection_orders',
            key: 'id'
        },
        comment: 'ID de la orden encontrada (si existe)'
    },
    response_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tiempo de respuesta en milisegundos'
    }
}, {
    tableName: 'plate_queries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default PlateQuery;
