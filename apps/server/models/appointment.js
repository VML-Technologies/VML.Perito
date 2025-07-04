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
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    scheduled_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
}, {
    tableName: 'appointments',
});

export default Appointment; 