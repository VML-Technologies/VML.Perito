import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const InspectionPart = createModelWithSoftDeletes('InspectionPart', {
    categoria: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    parte: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    malo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    regular: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    bueno: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    minimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    opciones: {
        type: DataTypes.TEXT, // Cambiar de JSON a TEXT para SQL Server
        allowNull: true,
        comment: 'JSON string para opciones adicionales',
        get() {
            const rawValue = this.getDataValue('opciones');
            if (!rawValue) return null;
            
            try {
                return JSON.parse(rawValue);
            } catch (error) {
                console.warn('Error parseando opciones JSON:', error);
                return null;
            }
        },
        set(value) {
            if (value && typeof value === 'object') {
                this.setDataValue('opciones', JSON.stringify(value));
            } else {
                this.setDataValue('opciones', value);
            }
        }
    },
    categoria_id: {
        type: DataTypes.BIGINT, // Cambiar de INTEGER a BIGINT para consistencia
        allowNull: true,
        references: {
            model: 'inspection_categories',
            key: 'id'
        }
    }
}, {
    tableName: 'inspection_parts'
});

export default InspectionPart;