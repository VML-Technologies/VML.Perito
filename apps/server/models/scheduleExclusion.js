import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const ScheduleExclusion = createModelWithSoftDeletes('ScheduleExclusion', {
    schedule_template_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'schedule_templates',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Nombre descriptivo del período de exclusión (ej: "Hora de almuerzo", "Descanso")'
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora de inicio del período de exclusión',
        get: createTimeFieldGetter('start_time')
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora de fin del período de exclusión',
        get: createTimeFieldGetter('end_time')
    },
    days_pattern: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Patrón de días específicos para la exclusión. Si es null, aplica a todos los días del template. Formato: "1,2,3,4,5" (1=Lun, 7=Dom)'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la exclusión está activa'
    },
    exclusion_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'CUSTOM',
        comment: 'Tipo de exclusión para categorización: BREAK, LUNCH, MAINTENANCE, CUSTOM',
        validate: {
            isIn: {
                args: [['BREAK', 'LUNCH', 'MAINTENANCE', 'CUSTOM']],
                msg: 'El tipo de exclusión debe ser uno de: BREAK, LUNCH, MAINTENANCE, CUSTOM'
            }
        }
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad de la exclusión (mayor número = mayor prioridad)'
    }
}, {
    tableName: 'schedule_exclusions',
    indexes: [
        {
            name: 'schedule_exclusion_template_idx',
            fields: ['schedule_template_id']
        },
        {
            name: 'schedule_exclusion_times_idx',
            fields: ['start_time', 'end_time']
        }
    ]
});

export default ScheduleExclusion;
