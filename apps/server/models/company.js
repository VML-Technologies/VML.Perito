import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Company = createModelWithSoftDeletes('Company', {
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    nit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    city_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'companies',
});

export default Company; 