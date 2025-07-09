import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const Appointment = createModelWithSoftDeletes('Appointment', {
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'sedes',
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
    inspection_modality_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_modalities',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // NUEVO CAMPO PARA RELACIONAR CON CALL LOG
    call_log_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'call_logs',
            key: 'id'
        },
        comment: 'ID del registro de llamada asociado a este agendamiento'
    },
    scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    scheduled_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'assigned', 'sent', 'delivered', 'read', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la cita (pending, assigned, sent, delivered, read, completed, failed)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    session_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'ID único de sesión para la inspección'
    },
}, {
    tableName: 'appointments',
    indexes: [
        {
            name: 'appointment_sede_modality_idx',
            fields: ['sede_id', 'inspection_modality_id']
        },
        {
            name: 'appointment_inspection_order_idx',
            fields: ['inspection_order_id']
        },
        {
            name: 'appointment_session_id_idx',
            fields: ['session_id']
        }
    ]
});

export default Appointment; 