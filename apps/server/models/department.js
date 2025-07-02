import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Department = createModelWithSoftDeletes('Department', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'departments',
});

export default Department; 