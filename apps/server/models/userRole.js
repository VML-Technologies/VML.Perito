import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const UserRole = createModelWithSoftDeletes('UserRole', {
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
}, {
    tableName: 'user_roles',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'role_id']
        }
    ]
});

export default UserRole; 