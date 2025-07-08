import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const SedeModalityAvailability = createModelWithSoftDeletes('SedeModalityAvailability', {
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'sedes',
            key: 'id'
        }
    },
    inspection_modality_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_modalities',
            key: 'id'
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    max_daily_capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Capacidad máxima diaria para esta modalidad'
    },
    working_hours_start: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora de inicio de atención'
    },
    working_hours_end: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora de fin de atención'
    },
    working_days: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '1,2,3,4,5',
        comment: 'Días de trabajo (1=Lunes, 7=Domingo)'
    },
}, {
    tableName: 'sede_modality_availability',
    indexes: [
        {
            unique: true,
            name: 'sede_modality_unique',
            fields: ['sede_id', 'inspection_modality_id']
        }
    ]
});

export default SedeModalityAvailability; 