import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const InspectionCategory = createModelWithSoftDeletes('InspectionCategory', {
    categoria: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'inspection_categories'
});

export default InspectionCategory;