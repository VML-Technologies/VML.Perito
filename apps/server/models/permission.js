import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Permission = createModelWithSoftDeletes('Permission', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    resource: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Recurso al que se aplica el permiso (users, departments, etc.)',
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Acción permitida (create, read, update, delete, etc.)',
    },
    endpoint: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Endpoint específico del permiso',
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Método HTTP (GET, POST, PUT, DELETE)',
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'permissions',
});

export default Permission; 