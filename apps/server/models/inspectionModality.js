import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionModality = createModelWithSoftDeletes('InspectionModality', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Código único: SEDE, DOMICILIO, VIRTUAL'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'inspection_modalities',
});

export default InspectionModality; 