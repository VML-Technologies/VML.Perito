import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const CallLog = createModelWithSoftDeletes('CallLog', {
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        }
    },
    call_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'call_statuses',
            key: 'id'
        }
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'call_logs',
});

export default CallLog; 