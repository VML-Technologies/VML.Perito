import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionType = createModelWithSoftDeletes('InspectionType', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
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
    tableName: 'inspection_types',
});

export default InspectionType; 