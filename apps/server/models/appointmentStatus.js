import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const AppointmentStatus = createModelWithSoftDeletes('AppointmentStatus', {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre del estado de la cita'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción del estado de la cita'
    }
}, {
    tableName: 'appointment_statuses'
});

export default AppointmentStatus;
