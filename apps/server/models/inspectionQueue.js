import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InspectionQueue = sequelize.define('InspectionQueue', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        }
    },
    placa: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    numero_orden: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    nombre_cliente: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    hash_acceso: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    estado: {
        type: DataTypes.ENUM('en_cola', 'en_proceso', 'completada', 'cancelada'),
        defaultValue: 'en_cola',
        allowNull: false
    },
    inspector_asignado_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    tiempo_ingreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    tiempo_inicio: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tiempo_fin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    prioridad: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'inspection_queue',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at',
    indexes: [
        {
            fields: ['estado']
        },
        {
            fields: ['inspector_asignado_id']
        },
        {
            fields: ['hash_acceso']
        },
        {
            fields: ['tiempo_ingreso']
        }
    ]
});

export default InspectionQueue;

