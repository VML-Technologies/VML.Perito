import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const SedeType = createModelWithSoftDeletes('SedeType', {
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
        comment: 'Código único: CDA, COMERCIAL, SOPORTE'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'sede_types',
});

export default SedeType; 