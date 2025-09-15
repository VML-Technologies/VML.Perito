import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionState = createModelWithSoftDeletes('InspectionState', {
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        },
        comment: 'ID de la orden de inspección relacionada'
    },
    appointment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'appointments',
            key: 'id'
        },
        comment: 'ID del agendamiento relacionado'
    },
    inspection_order_status: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders_statuses',
            key: 'id'
        },
        comment: 'Estado de la orden de inspección (1-5)'
    },
    inspection_order_status_internal: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders_status_internal',
            key: 'id'
        },
        comment: 'Estado interno de la orden de inspección'
    },
    appointment_status: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'appointment_statuses',
            key: 'id'
        },
        comment: 'Estado del agendamiento (pending, assigned, completed, etc.)'
    },
    system_calculated_state: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Estado calculado por el sistema (completed, not_insurable, partial, failed)'
    },
    system_calculated_state_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Razón calculada por el sistema'
    },
    user_decision_state: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Estado decidido por el usuario (completed, not_insurable, partial, failed)'
    },
    user_decision_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Razón de la decisión tomada por el usuario'
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del usuario que realizó la acción'
    },
    user_role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'user_roles',
            key: 'id'
        },
        comment: 'Rol del usuario que realizó la acción (supervisor, inspector, etc.)'
    },
    webhook_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si se envió notificación al webhook externo'
    },
    webhook_response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Respuesta del webhook externo'
    },
    webhook_provider: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'API externo utilizado (SegurosMundial, TaxisColectivo, etc.)'
    },
    state_change_type: {
        type: DataTypes.ENUM('system_auto', 'user_override', 'user_decision'),
        allowNull: false,
        comment: 'Tipo de cambio: automático del sistema, override del usuario, o decisión del usuario'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del cambio de estado'
    }
}, {
    tableName: 'inspection_states',
    indexes: [
        {
            fields: ['appointment_id']
        },
        {
            fields: ['inspection_order_id']
        },
        {
            fields: ['user_id']
        }
    ]
});

export default InspectionState;