import { DataTypes, Op } from 'sequelize';
import { createModelWithSoftDeletes, createTimeFieldGetter } from './baseModel.js';

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
        allowNull: true,
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
        allowNull: false,
        get: createTimeFieldGetter('scheduled_time')
    },
    status: {
        type: DataTypes.ENUM('pending', 'assigned', 'sent', 'delivered', 'read', 'completed', 'failed', 'revision_supervisor', 'pendiente_calificacion', 'ineffective_no_retry', 'ineffective_with_retry', 'retry', 'call_finished'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la cita'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    direccion_inspeccion: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: 'Dirección para inspección a domicilio'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones del agendamiento'
    },
    session_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'ID único de sesión para la inspección'
    },
    // Campos de timestamp para cada estado
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se asignó un inspector'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se envió al inspector'
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se entregó al inspector'
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando el inspector leyó la asignación'
    },
    revision_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se envió a revisión de supervisor'
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se completó la inspección'
    },
    failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando falló la inspección'
    },
    call_finished_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando finalizó la llamada'
    },
    retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de reintentos realizados para esta cita'
    },
    previous_session_ids: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Historial de session_ids anteriores (JSON array)'
    },
    is_retry: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si esta cita es un reintento'
    },
    retry_reason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Razón del reintento'
    },
    retried_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha y hora del último reintento'
    },
    inspection_result: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Resultado de la inspección'
    },
    inspector_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comentario del inspector'
    },
    supervisor_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comentario del supervisor'
    },
    generated_pdf: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'PDF generado de la inspección'
    },
    result_by: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Usuario que registró el resultado'
    }
}, {
    tableName: 'appointments',
    paranoid: true,
    deletedAt: 'deleted_at',
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
    ],
    hooks: {
        // Al crear un agendamiento, marcar la orden como recuperación efectiva según su estado interno previo
        afterCreate: async (appointment, options) => {
            try {
                const { InspectionOrder } = await import('./index.js');

                // 1) Si estaba "En proceso de recuperacion" => "Recuperacion Efectiva - en tiempos"
                const [updatedInTime] = await InspectionOrder.update(
                    { status_internal: 'Recuperacion Efectiva - en tiempos' },
                    {
                        where: {
                            id: appointment.inspection_order_id,
                            deleted_at: null,
                            status_internal: 'En proceso de recuperacion'
                        },
                        transaction: options?.transaction
                    }
                );

                if (updatedInTime > 0) {
                    return; // Ya aplicado: no intentar la otra transición
                }

                // 2) Si estaba "Recuperacion fallida" => "Recuperacion Efectiva - fuera de de tiempos"
                await InspectionOrder.update(
                    { status_internal: 'Recuperacion Efectiva - fuera de de tiempos' },
                    {
                        where: {
                            id: appointment.inspection_order_id,
                            deleted_at: null,
                            status_internal: 'Recuperacion fallida'
                        },
                        transaction: options?.transaction
                    }
                );
            } catch (e) {
                console.error('Error actualizando status_internal por creación de agendamiento:', e);
            }
        }
    }
});

export default Appointment; 