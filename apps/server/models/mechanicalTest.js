import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

const MechanicalTest = createModelWithSoftDeletes('MechanicalTest', {
    session_id: {
        type: DataTypes.STRING(100), // Mismo tipo que en Appointment
        allowNull: true, // Permitir NULL como en appointments
        comment: 'ID de sesión que referencia appointments.session_id'
    },
    data: {
        type: DataTypes.TEXT, // Cambiar de JSON a TEXT para SQL Server
        allowNull: false,
        comment: 'Datos completos de las pruebas mecanizadas (suspensión, alineación, frenos)'
    },
    observation_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Texto formateado de observaciones de las pruebas mecanizadas'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
        comment: 'Estado de las pruebas mecanizadas'
    }
}, {
    tableName: 'mechanical_tests'
});

export default MechanicalTest; 