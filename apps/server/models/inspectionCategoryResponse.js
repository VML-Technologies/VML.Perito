import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const InspectionCategoryResponse = createModelWithSoftDeletes('InspectionCategoryResponse', {
    category_id: {
        type: DataTypes.BIGINT, // Cambiar de INTEGER a BIGINT para consistencia
        allowNull: false,
        references: {
            model: 'inspection_categories',
            key: 'id'
        }
    },
    inspection_id: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'inspection_category_responses'
});

export default InspectionCategoryResponse;
