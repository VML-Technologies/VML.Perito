import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Sede = createModelWithSoftDeletes('Sede', {
    company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    sede_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'sede_types',
            key: 'id'
        }
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
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitud para ubicación GPS'
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitud para ubicación GPS'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'sedes',
});

export default Sede; 