import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const ScheduleTemplate = createModelWithSoftDeletes('ScheduleTemplate', {
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
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Nombre descriptivo del horario (ej: "Lunes a Viernes Mañana")'
    },
    days_pattern: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Patrón de días: "1,2,3,4,5" o "1,3,5" o "6" etc. (1=Lun, 7=Dom)'
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora de inicio del bloque',
        get: createTimeFieldGetter('start_time')
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora de fin del bloque',
        get: createTimeFieldGetter('end_time')
    },
    interval_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
        comment: 'Duración de cada intervalo en minutos'
    },
    capacity_per_interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: 'Cupos disponibles por intervalo'
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad para ordenar horarios (mayor número = mayor prioridad)'
    },
}, {
    tableName: 'schedule_templates',
    indexes: [
        {
            name: 'schedule_sede_modality_idx',
            fields: ['sede_id', 'inspection_modality_id']
        }
    ]
});

export default ScheduleTemplate; 