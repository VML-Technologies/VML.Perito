import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrderStatus = createModelWithSoftDeletes('InspectionOrderStatus', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'inspection_orders_statuses',
});

export default InspectionOrderStatus; 