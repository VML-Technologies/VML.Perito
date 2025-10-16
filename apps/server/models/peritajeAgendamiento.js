import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';


const PeritajeAgendamiento = createModelWithSoftDeletes('PeritajeAgendamiento', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    peritaje_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'peritaje_orders',
            key: 'id',
        },
    },
    fecha_agendada: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    direccion_peritaje: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    modalidad_peritaje: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'presencial',
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: true,
    },
}, {
    tableName: 'peritaje_agendamientos',
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at', // Nombre de la columna
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'peritaje_agendamientos_order_idx', fields: ['peritaje_order_id'] }
    ]
});

export default PeritajeAgendamiento;
