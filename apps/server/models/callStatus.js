import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const CallStatus = createModelWithSoftDeletes('CallStatus', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    creates_schedule: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'call_statuses',
});

export default CallStatus; 