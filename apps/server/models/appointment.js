import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Appointment = createModelWithSoftDeletes('Appointment', {
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'sedes',
            key: 'id'
        }
    },
    call_log_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'call_logs',
            key: 'id'
        }
    },
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        }
    },
    inspection_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_types',
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
    vehicle_type_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'vehicle_types',
            key: 'id'
        }
    },
    schedule_template_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'schedule_templates',
            key: 'id'
        }
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    scheduled_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    scheduled_time_end: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Hora de fin del intervalo asignado'
    },
    inspection_address: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Dirección específica para inspección a domicilio'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones adicionales del agendamiento'
    },
    status: {
        type: DataTypes.ENUM('PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA'),
        allowNull: false,
        defaultValue: 'PROGRAMADA'
    },
}, {
    tableName: 'appointments',
});

export default Appointment; 