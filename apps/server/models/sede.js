import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Sede = createModelWithSoftDeletes('Sede', {
    company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
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
    tableName: 'sedes',
});

export default Sede; 