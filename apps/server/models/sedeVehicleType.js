import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const SedeVehicleType = createModelWithSoftDeletes('SedeVehicleType', {
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'sedes',
            key: 'id'
        }
    },
    vehicle_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'vehicle_types',
            key: 'id'
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'sede_vehicle_types',
    indexes: [
        {
            unique: true,
            name: 'sede_vehicle_type_unique',
            fields: ['sede_id', 'vehicle_type_id']
        }
    ]
});

export default SedeVehicleType; 