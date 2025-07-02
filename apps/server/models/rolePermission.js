import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const RolePermission = createModelWithSoftDeletes('RolePermission', {
    role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    permission_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'permissions',
            key: 'id'
        }
    },
}, {
    tableName: 'role_permissions',
    indexes: [
        {
            unique: true,
            fields: ['role_id', 'permission_id']
        }
    ]
});

export default RolePermission; 