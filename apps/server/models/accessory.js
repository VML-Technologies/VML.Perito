import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const Accessory = createModelWithSoftDeletes('Accessory', {
    inspection_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'ID de la inspección'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descripción del accesorio'
    },
    brand: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Marca del accesorio'
    },
    reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Referencia o modelo del accesorio'
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'UN',
        comment: 'Unidad de medida (UN, KG, M, etc.)'
    },
    value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor del accesorio'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Cantidad del accesorio'
    },
    total_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total (valor * cantidad)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre el accesorio'
    }
}, {
    tableName: 'accessories',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        {
            name: 'accessory_inspection_idx',
            fields: ['inspection_id']
        },
        {
            name: 'accessory_description_idx',
            fields: ['description']
        }
    ]
});

export default Accessory; 