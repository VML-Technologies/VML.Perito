import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrdersStatusInternal = createModelWithSoftDeletes('InspectionOrdersStatusInternal', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre del estado interno'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción del estado interno'
    }
}, {
    tableName: 'inspection_orders_status_internal'
});

export default InspectionOrdersStatusInternal;