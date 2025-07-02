import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const City = createModelWithSoftDeletes('City', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    department_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
}, {
    tableName: 'cities',
});

export default City; 