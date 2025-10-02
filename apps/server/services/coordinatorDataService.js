import { InspectionQueue, InspectionOrder, Appointment, User, Sede, City, InspectionModality, Role } from '../models/index.js';
import { Op } from 'sequelize';

class CoordinatorDataService {
    constructor() {
        console.log('🚀 CoordinatorDataService inicializado');
    }

    /**
     * Obtener datos completos para el coordinador
     */
    async getCoordinatorData(filters = {}) {
        try {
            console.log('📊 Obteniendo datos del coordinador desde DB...');

            // 1. Inspecciones Virtuales (InspectionQueue)
            const virtualInspections = await this.getVirtualInspections(filters);

            // 2. Inspecciones en Sede (Appointment)
            const sedeAppointments = await this.getSedeAppointments();

            // 3. Estadísticas
            const stats = await this.getStats();

            return {
                queueData: {
                    data: virtualInspections,
                    pagination: {
                        current_page: 1,
                        total_pages: 1,
                        total_items: virtualInspections.length,
                        items_per_page: virtualInspections.length
                    }
                },
                sedeAppointments,
                stats,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error obteniendo datos del coordinador:', error);
            throw error;
        }
    }

    /**
     * Obtener inspecciones virtuales desde InspectionQueue
     */
    async getVirtualInspections(filters = {}) {
        const whereClause = {
            is_active: true,
            estado: filters.estado || 'en_cola'
        };

        // Agregar filtros de paginación si se requieren
        const limit = 100000; // Límite alto para coordinador
        const offset = filters.page ? (filters.page - 1) * limit : 0;

        const inspections = await InspectionQueue.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: InspectionOrder,
                    as: 'inspectionOrder',
                    attributes: [
                        'id', 'numero', 'placa', 'nombre_contacto',
                        'celular_contacto', 'correo_contacto', 'created_at', 'status'
                    ],
                    where: {
                        deleted_at: null,
                        status: {
                            [Op.not]: [5]
                        }
                    },
                    required: true,
                    include: [
                        {
                            model: Appointment,
                            as: 'appointments',
                            attributes: ['id', 'status', 'scheduled_date', 'scheduled_time', 'created_at'],
                            where: {
                                deleted_at: null,
                                //call_log_id: null
                            },
                            required: false // LEFT JOIN para incluir inspecciones sin appointment
                        }
                    ]
                },
                {
                    model: User,
                    as: 'inspector',
                    attributes: ['id', 'name', 'email'],
                    required: false, // LEFT JOIN para incluir inspecciones sin inspector asignado
                    include: [{
                        model: Role,
                        as: 'roles',
                        attributes: ['name'],
                        through: { attributes: [] }
                    }]
                }
            ],
            order: [
                ['prioridad', 'DESC'],
                ['tiempo_ingreso', 'ASC']
            ],
            limit,
            offset,
            distinct: true
        });

        // Formatear datos para el frontend (igual estructura que getSedeAppointments)
        return inspections.rows.map(item => {
            // Si existe appointment, usar su estado, sino usar el estado de la inspección virtual
            let hasAppointment = item.inspectionOrder.appointments && item.inspectionOrder.appointments.length > 0;
            const appointment = hasAppointment ? item.inspectionOrder.appointments[0] : null;
            let filteredAppointments = [];

            const appointmentCreatedAt = appointment?.created_at || null;
            const queueCreatedAt = item.created_at;

            if (appointmentCreatedAt < queueCreatedAt) {
                filteredAppointments = []
                hasAppointment = false;
            } else {
                filteredAppointments = item.inspectionOrder.appointments;
            }

            return {
                id: item.id,
                placa: item.placa,
                numero_orden: item.numero_orden,
                nombre_cliente: item.nombre_cliente,
                estado: hasAppointment ? appointment.status : item.estado, // Priorizar estado del appointment
                inspector: item.inspector,
                tiempo_ingreso: item.tiempo_ingreso,
                tiempo_inicio: item.tiempo_inicio,
                tiempo_fin: item.tiempo_fin,
                prioridad: item.prioridad,
                observaciones: item.observaciones,
                inspectionOrder: item.inspectionOrder,
                statusInspectionOrder: item.inspectionOrder.status,
                appointments: filteredAppointments, // Incluir appointments relacionados
                // Campos adicionales para compatibilidad con getSedeAppointments
                scheduled_date: appointment?.scheduled_date || null,
                scheduled_time: appointment?.scheduled_time || null,
                session_id: appointment?.session_id || null,
                assigned_at: appointment?.assigned_at || null,
                completed_at: appointment?.completed_at || null,
                call_log_id: appointment?.call_log_id || null,
                queue_created_at: item.created_at,
                appointment_created_at: appointment?.created_at || null
            };
        }).filter(el => {
            // const statusToRemove = ['completed', 'failed', 'ineffective_with_retry', 'ineffective_no_retry', 'call_finished', 'revision_supervisor']

            const statusToRemove = ['completed', 'failed', 'ineffective_no_retry', 'call_finished', 'revision_supervisor', 'assigned', 'sent']
            return !statusToRemove.includes(el.estado)
        })
    }

    /**
     * Obtener agendamientos en sede desde Appointment
     */
    async getSedeAppointments() {
        const appointments = await Appointment.findAll({
            where: {
                deleted_at: null,
                status: {
                    // [Op.not]: ['completed', 'failed', 'ineffective_with_retry', 'ineffective_no_retry', 'call_finished', 'revision_supervisor']

                    [Op.not]: ['completed', 'failed', 'ineffective_with_retry', 'ineffective_no_retry', 'call_finished', 'revision_supervisor', 'assigned', 'sent']
                },
                call_log_id: null
            },
            include: [
                {
                    model: InspectionOrder,
                    as: 'inspectionOrder',
                    attributes: [
                        'id', 'placa', 'nombre_contacto', 'celular_contacto',
                        'correo_contacto', 'created_at', 'status'
                    ],
                    where: {
                        deleted_at: null,
                        status: {
                            [Op.not]: [5, 6]
                        }
                    },
                    required: true
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: false, // LEFT JOIN para incluir appointments sin inspector asignado
                    include: [{
                        model: Role,
                        as: 'roles',
                        attributes: ['name'],
                        through: { attributes: [] }
                    }]
                },
                {
                    model: Sede,
                    as: 'sede',
                    attributes: ['id', 'name'],
                    include: [{
                        model: City,
                        as: 'city',
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: InspectionModality,
                    as: 'inspectionModality',
                    attributes: ['id', 'name']
                }
            ],
            order: [
                ['scheduled_date', 'ASC'],
                ['scheduled_time', 'ASC']
            ]
        });

        // Formatear datos para el frontend
        return appointments.map(appointment => {
            console.log(appointment.get('scheduled_date'))
            console.log(appointment.scheduled_date)
            // add 1 day to the scheduled_date
            appointment.scheduled_date = new Date(appointment.scheduled_date).setDate(new Date(appointment.scheduled_date).getDate() + 2)
            console.log(appointment.scheduled_date)
            return {
                id: appointment.id,
                status: appointment.status,
                scheduled_date: appointment.scheduled_date,
                scheduled_time: appointment.get('scheduled_time'),
                notes: appointment.notes,
                direccion_inspeccion: appointment.direccion_inspeccion,
                observaciones: appointment.observaciones,
                session_id: appointment.session_id,
                assigned_at: appointment.assigned_at,
                completed_at: appointment.completed_at,
                inspectionOrder: appointment.inspectionOrder,
                call_log_id: appointment.call_log_id,
                statusInspectionOrder: appointment.inspectionOrder.status,
                user: appointment.user,
                sede: appointment.sede,
                inspectionModality: appointment.inspectionModality,
                allData: appointment
            }
        });
    }

    /**
     * Obtener estadísticas de inspecciones virtuales
     */
    async getStats() {
        const stats = await InspectionQueue.findAll({
            where: {
                is_active: true
            },
            attributes: [
                'estado',
                [InspectionQueue.sequelize.fn('COUNT', InspectionQueue.sequelize.col('id')), 'count']
            ],
            group: ['estado'],
            raw: true
        });

        // Formatear estadísticas
        const formattedStats = {
            en_cola: 0,
            en_proceso: 0,
            completadas: 0,
            total: 0
        };

        stats.forEach(stat => {
            const count = parseInt(stat.count);
            formattedStats[stat.estado] = count;
            formattedStats.total += count;
        });

        return formattedStats;
    }

    /**
     * Actualizar estado de inspección virtual
     */
    async updateVirtualInspectionStatus(queueId, newStatus, inspectorId = null, observaciones = null) {
        try {
            console.log(`🔄 Actualizando estado de inspección virtual: ${queueId} -> ${newStatus}`);

            const updateData = {
                estado: newStatus,
                observaciones: observaciones || null
            };

            // Si se asigna inspector, actualizar campos relacionados
            if (inspectorId) {
                updateData.inspector_asignado_id = inspectorId;
                if (newStatus === 'en_proceso') {
                    updateData.tiempo_inicio = new Date();
                }
            }

            // Si se completa, actualizar tiempo de fin
            if (newStatus === 'completada') {
                updateData.tiempo_fin = new Date();
            }

            const updatedQueue = await InspectionQueue.findByPk(queueId);
            if (!updatedQueue) {
                throw new Error('Entrada de cola no encontrada');
            }

            await updatedQueue.update(updateData);

            // Obtener datos actualizados con relaciones
            const updatedData = await InspectionQueue.findByPk(queueId, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'celular_contacto']
                    },
                    {
                        model: User,
                        as: 'inspector',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            console.log('✅ Estado de inspección virtual actualizado correctamente');
            return {
                success: true,
                data: updatedData
            };
        } catch (error) {
            console.error('❌ Error actualizando estado de inspección virtual:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de agendamiento en sede
     */
    async updateSedeAppointmentStatus(appointmentId, newStatus) {
        try {
            console.log(`🏢 Actualizando estado de agendamiento en sede: ${appointmentId} -> ${newStatus}`);

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                throw new Error('Agendamiento no encontrado');
            }

            const updateData = { status: newStatus };

            // Actualizar timestamps según el estado
            switch (newStatus) {
                case 'assigned':
                    updateData.assigned_at = new Date();
                    break;
                case 'active':
                    updateData.sent_at = new Date();
                    break;
                case 'completed':
                    updateData.completed_at = new Date();
                    break;
                case 'failed':
                    updateData.failed_at = new Date();
                    break;
            }

            await appointment.update(updateData);

            console.log('✅ Estado de agendamiento en sede actualizado correctamente');
            return {
                success: true,
                data: appointment
            };
        } catch (error) {
            console.error('❌ Error actualizando estado de agendamiento en sede:', error);
            throw error;
        }
    }

    /**
     * Asignar inspector a agendamiento en sede
     */
    async assignInspectorToSedeAppointment(appointmentId, inspectorId) {
        try {
            console.log(`👨‍🔧 Asignando inspector a agendamiento en sede: ${appointmentId} -> ${inspectorId}`);

            const appointment = await Appointment.findByPk(appointmentId);
            if (!appointment) {
                throw new Error('Agendamiento no encontrado');
            }

            await appointment.update({
                user_id: inspectorId,
                status: 'active', // Cambiar a activo cuando se asigna inspector
                assigned_at: new Date(),
                sent_at: new Date()
            });

            console.log('✅ Inspector asignado a agendamiento en sede correctamente');
            return {
                success: true,
                data: appointment
            };
        } catch (error) {
            console.error('❌ Error asignando inspector a agendamiento en sede:', error);
            throw error;
        }
    }

    /**
     * Iniciar inspección virtual (asignar inspector, cambiar estado y crear appointment)
     */
    async startVirtualInspection(orderId, inspectorId, sedeId = null) {
        try {
            console.log(`🚀 Iniciando inspección virtual: ${orderId} -> ${inspectorId}`);

            // Buscar la entrada en la cola por inspection_order_id
            const queueEntry = await InspectionQueue.findOne({
                where: {
                    inspection_order_id: orderId,
                    is_active: true
                },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'celular_contacto']
                    }
                ]
            });

            if (!queueEntry) {
                throw new Error('Entrada de cola no encontrada para esta orden');
            }

            // Verificar si ya existe un appointment para esta orden
            const existingAppointment = await Appointment.findOne({
                where: {
                    inspection_order_id: orderId,
                    deleted_at: null
                }
            });

            let appointment = null;

            if (existingAppointment) {
                // Si ya existe, eliminarlo (soft delete) y crear uno nuevo
                console.log('📅 Appointment existente encontrado, eliminando y creando uno nuevo...');
                await existingAppointment.update({
                    deleted_at: new Date()
                });
                console.log(`🗑️ Appointment existente eliminado (ID: ${existingAppointment.id})`);
            }

            // Crear nuevo appointment
            console.log('📅 Creando nuevo appointment para inspección virtual...');

            // Obtener modalidad virtual por código
            const virtualModality = await InspectionModality.findOne({
                where: { code: 'VIRTUAL' }
            });

            if (!virtualModality) {
                throw new Error('Modalidad Virtual (code: VIRTUAL) no encontrada en el sistema');
            }

            // Usar sede por defecto si no se especifica (asumiendo sede CDA por defecto)
            const defaultSedeId = sedeId || 3; // Sede CDA por defecto
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            appointment = await Appointment.create({
                inspection_order_id: orderId,
                inspection_modality_id: virtualModality.id,
                sede_id: defaultSedeId,
                user_id: inspectorId,
                scheduled_date: new Date().toISOString().split('T')[0], // Fecha actual
                scheduled_time: new Date().toTimeString().split(' ')[0].substring(0, 5), // Hora actual
                status: 'assigned',
                assigned_at: new Date(),
                notes: 'Inspección virtual iniciada desde coordinador',
                session_id: sessionId
            });

            console.log(`✅ Nuevo appointment creado con ID: ${appointment.id}`);

            // Actualizar estado de la cola y asignar inspector
            await queueEntry.update({
                estado: 'en_proceso',
                inspector_asignado_id: inspectorId,
                tiempo_inicio: new Date(),
                observaciones: 'Inspección asignada y appointment creado'
            });

            // Obtener datos actualizados de la cola
            const updatedData = await InspectionQueue.findByPk(queueEntry.id, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'celular_contacto']
                    },
                    {
                        model: User,
                        as: 'inspector',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            console.log('✅ Inspección virtual iniciada y appointment creado correctamente');
            return {
                success: true,
                data: updatedData,
                appointment: appointment
            };
        } catch (error) {
            console.error('❌ Error iniciando inspección virtual:', error);
            throw error;
        }
    }
}

export default new CoordinatorDataService();
