import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const VehicleType = createModelWithSoftDeletes('VehicleType', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Código único: LIVIANO, PESADO, MOTO'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'vehicle_types',
});

export default VehicleType; 