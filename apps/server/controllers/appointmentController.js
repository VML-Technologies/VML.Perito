import {
    InspectionModality,
    SedeModalityAvailability,
    Sede,
    City,
    Department,
    SedeType,
    Appointment,
    InspectionOrder,
    User,
    Role
} from '../models/index.js';
import { Op } from 'sequelize';
import EventRegistry from '../services/eventRegistry.js';
import automatedEventTriggers from '../services/automatedEventTriggers.js';
import socketManager from '../websocket/socketManager.js';

class AppointmentController {
    // Obtener modalidades disponibles por departamento y ciudad
    async getAvailableModalities(req, res) {
        try {
            const { departmentId, cityId } = req.query;

            if (!departmentId || !cityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Departamento y ciudad son requeridos'
                });
            }

            // Obtener modalidades disponibles en esa ciudad
            const availableModalities = await InspectionModality.findAll({
                include: [{
                    model: SedeModalityAvailability,
                    as: 'sedeAvailabilities',
                    required: true,
                    where: { active: true },
                    include: [{
                        model: Sede,
                        as: 'sede',
                        required: true,
                        where: {
                            city_id: cityId,
                            active: true
                        },
                        include: [{
                            model: City,
                            as: 'city',
                            required: true,
                            where: { department_id: departmentId }
                        }]
                    }]
                }],
                where: { active: true }
            });

            // Agrupar por modalidad y contar sedes disponibles
            const modalitiesWithCount = availableModalities.map(modality => ({
                id: modality.id,
                name: modality.name,
                code: modality.code,
                description: modality.description,
                sedesCount: modality.sedeAvailabilities.length
            }));

            res.json({
                success: true,
                data: modalitiesWithCount
            });

        } catch (error) {
            console.error('Error obteniendo modalidades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener modalidades de inspección disponibles por ciudad
    async getInspectionModalitiesByCity(req, res) {
        try {
            const { cityId } = req.query;

            if (!cityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Ciudad es requerida'
                });
            }

            const inspectionModalities = await InspectionModality.findAll({
                include: [{
                    model: SedeModalityAvailability,
                    as: 'sedeAvailabilities',
                    required: true,
                    where: {
                        active: true
                    },
                    include: [{
                        model: Sede,
                        as: 'sede',
                        required: true,
                        where: {
                            city_id: cityId,
                            active: true
                        }
                    }]
                }],
                where: { active: true }
            });

            res.json({
                success: true,
                data: inspectionModalities
            });

        } catch (error) {
            console.error('Error obteniendo modalidades de inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener sedes disponibles por modalidad y tipo de inspección
    async getAvailableSedes(req, res) {
        try {
            const { modalityId, cityId } = req.query;

            if (!modalityId || !cityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Modalidad, tipo de inspección y ciudad son requeridos'
                });
            }

            const sedes = await Sede.findAll({
                include: [
                    {
                        model: SedeModalityAvailability,
                        as: 'modalityAvailabilities',
                        required: true,
                        where: {
                            inspection_modality_id: modalityId,
                            active: true
                        },
                        include: [{
                            model: InspectionModality,
                            as: 'inspectionModality'
                        }]
                    },
                    {
                        model: City,
                        as: 'city',
                        include: [{
                            model: Department,
                            as: 'department'
                        }]
                    },
                    {
                        model: SedeType,
                        as: 'sedeType'
                    }
                ],
                where: {
                    city_id: cityId,
                    active: true
                }
            });

            // Formatear respuesta con información de disponibilidad
            const sedesWithAvailability = sedes.map(sede => ({
                id: sede.id,
                name: sede.name,
                address: sede.address,
                phone: sede.phone,
                email: sede.email,
                city: sede.city.name,
                department: sede.city.department.name,
                sedeType: sede.sedeType.name,
                availability: sede.modalityAvailabilities[0] ? {
                    maxDailyCapacity: sede.modalityAvailabilities[0].max_daily_capacity,
                    workingHoursStart: sede.modalityAvailabilities[0].working_hours_start,
                    workingHoursEnd: sede.modalityAvailabilities[0].working_hours_end,
                    workingDays: sede.modalityAvailabilities[0].working_days
                } : null
            }));

            res.json({
                success: true,
                data: sedesWithAvailability
            });

        } catch (error) {
            console.error('Error obteniendo sedes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear agendamiento con modalidad
    async createAppointment(req, res) {
        try {
            const {
                callLogId,
                call_log_id, // aceptar ambos
                inspectionOrderId,
                inspection_order_id, // aceptar ambos
                inspectionModalityId,
                inspection_modality_id, // aceptar ambos
                sedeId,
                sede_id, // aceptar ambos
                scheduledDate,
                scheduled_date, // aceptar ambos
                scheduledTime,
                scheduled_time, // aceptar ambos
                inspectionAddress,
                direccion_inspeccion, // aceptar ambos
                notes,
                observaciones, // aceptar ambos
                userId,
                user_id // aceptar ambos
            } = req.body;

            // Normalizar los campos para soportar ambos nombres
            const _callLogId = call_log_id || callLogId;
            const _inspectionOrderId = inspection_order_id || inspectionOrderId;
            const _inspectionModalityId = inspection_modality_id || inspectionModalityId;
            const _sedeId = sede_id || sedeId;
            const _scheduledDate = scheduled_date || scheduledDate;
            const _scheduledTime = scheduled_time || scheduledTime;
            const _inspectionAddress = direccion_inspeccion || inspectionAddress;
            const _notes = observaciones || notes;
            const _userId = user_id || userId;

            // Validaciones básicas
            if (!_callLogId || !_inspectionOrderId || !_inspectionModalityId || !_userId || !_scheduledDate || !_scheduledTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos faltantes'
                });
            }

            // Validar que la modalidad esté disponible en la sede
            if (_sedeId) {
                const availability = await SedeModalityAvailability.findOne({
                    where: {
                        sede_id: _sedeId,
                        inspection_modality_id: _inspectionModalityId,
                        active: true
                    }
                });

                if (!availability) {
                    return res.status(400).json({
                        success: false,
                        message: 'La modalidad seleccionada no está disponible en esta sede'
                    });
                }
            }

            // Crear el agendamiento
            const appointment = await Appointment.create({
                call_log_id: _callLogId,
                inspection_order_id: _inspectionOrderId,
                inspection_modality_id: _inspectionModalityId,
                sede_id: _sedeId,
                scheduled_date: _scheduledDate,
                scheduled_time: _scheduledTime,
                direccion_inspeccion: _inspectionAddress,
                observaciones: _notes,
                status: 'PROGRAMADA'
            });

            // Obtener el agendamiento completo con relaciones
            const fullAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    {
                        model: InspectionModality,
                        as: 'inspectionModality'
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [{
                            model: City,
                            as: 'city'
                        }]
                    }
                ]
            });

            // Disparar evento de cita creada
            try {
                await automatedEventTriggers.triggerAppointmentEvents('created', {
                    id: fullAppointment.id,
                    date: fullAppointment.scheduled_date,
                    time: fullAppointment.scheduled_time,
                    status: fullAppointment.status,
                    sede: fullAppointment.sede?.name || 'Sede no especificada',
                    modality: fullAppointment.inspectionModality?.name || 'Modalidad no especificada',
                    customer: fullAppointment.inspectionOrder?.nombre_cliente || 'Cliente',
                    customer_email: fullAppointment.inspectionOrder?.email_cliente || 'email@ejemplo.com'
                }, {
                    created_by: req.user?.id,
                    ip_address: req.ip,
                    call_log_id: _callLogId,
                    inspection_order_id: _inspectionOrderId
                });
            } catch (eventError) {
                console.error('Error disparando evento appointment.created:', eventError);
            }

            res.status(201).json({
                success: true,
                data: fullAppointment,
                message: 'Agendamiento creado exitosamente'
            });

        } catch (error) {
            console.error('Error creando agendamiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener horarios disponibles para una fecha específica
    async getAvailableTimeSlots(req, res) {
        try {
            const { sedeId, modalityId, date } = req.query;

            if (!sedeId || !modalityId || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Sede, modalidad y fecha son requeridos'
                });
            }

            // Obtener configuración de horarios de la sede
            const availability = await SedeModalityAvailability.findOne({
                where: {
                    sede_id: sedeId,
                    inspection_modality_id: modalityId,
                    active: true
                }
            });

            if (!availability) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay disponibilidad para esta modalidad en la sede'
                });
            }

            // Obtener citas existentes para esa fecha
            const existingAppointments = await Appointment.findAll({
                where: {
                    sede_id: sedeId,
                    inspection_modality_id: modalityId,
                    scheduled_date: date,
                    status: {
                        [Op.not]: 'CANCELADA'
                    }
                }
            });

            // Generar slots de tiempo disponibles
            const timeSlots = generateTimeSlots(
                availability.working_hours_start,
                availability.working_hours_end,
                existingAppointments,
                availability.max_daily_capacity
            );

            res.json({
                success: true,
                data: {
                    availableSlots: timeSlots,
                    maxCapacity: availability.max_daily_capacity,
                    currentBookings: existingAppointments.length
                }
            });

        } catch (error) {
            console.error('Error obteniendo horarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener agendamientos
    async getAppointments(req, res) {
        try {
            const { page = 1, limit = 10, status = '', inspection_order_id = '', sede_id = '' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const whereConditions = {
                deleted_at: null // Solo appointments activos
            };

            if (status) {
                whereConditions.status = status;
            }

            if (inspection_order_id) {
                whereConditions.inspection_order_id = inspection_order_id;
            }

            if (sede_id) {
                whereConditions.sede_id = sede_id;
            }

            const appointments = await Appointment.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder'
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [{
                            model: City,
                            as: 'city'
                        }]
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality'
                    }
                ],
                limit: parseInt(limit),
                offset: offset,
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: appointments.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: appointments.count,
                    pages: Math.ceil(appointments.count / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error obteniendo agendamientos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener agendamientos en sede para coordinador (solo con status 1,2,3)
    async getSedeAppointmentsForCoordinator(req, res) {
        try {
            console.log('🏢 Obteniendo agendamientos en sede para coordinador...');
            
                const appointments = await Appointment.findAll({
                where: {
                    deleted_at: null // Solo appointments activos
                },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        where: {
                            status: [1, 2, 3] // Solo órdenes con status 1, 2, 3
                        },
                        required: true
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [{
                            model: City,
                            as: 'city'
                        }]
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality',
                        where: {
                            code: 'SEDE' // Solo modalidad SEDE
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
                            attributes: ['id', 'name', 'description'],
                            through: { attributes: [] } // Excluir tabla intermedia
                        }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            console.log(`📊 Encontrados ${appointments.length} agendamientos en sede para coordinador`);

            res.json({
                success: true,
                data: appointments
            });

        } catch (error) {
            console.error('❌ Error obteniendo agendamientos en sede para coordinador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener agendamientos en sede para Inspector Aliado (filtrado por sede del usuario)
    async getSedeAppointmentsForInspectorAliado(req, res) {
        try {
            console.log('🏢 Obteniendo agendamientos en sede para Inspector Aliado...');
            
            const { sede_id } = req.query;
            
            if (!sede_id) {
                return res.status(400).json({
                    success: false,
                    message: 'sede_id es requerido'
                });
            }
            
            const appointments = await Appointment.findAll({
                where: {
                    deleted_at: null, // Solo appointments activos
                    sede_id: sede_id // Filtrar por sede del usuario
                },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        where: {
                            status: [1, 2, 3, 4] // Solo órdenes con status 1, 2, 3, 4
                        },
                        required: true
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [{
                            model: City,
                            as: 'city'
                        }]
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality',
                        where: {
                            code: 'SEDE' // Solo modalidad SEDE
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
                            attributes: ['id', 'name', 'description'],
                            through: { attributes: [] } // Excluir tabla intermedia
                        }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            console.log(`📊 Encontrados ${appointments.length} agendamientos en sede para Inspector Aliado (sede: ${sede_id})`);

            res.json({
                success: true,
                data: appointments
            });

        } catch (error) {
            console.error('❌ Error obteniendo agendamientos en sede para Inspector Aliado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener agendamiento por ID
    async getAppointment(req, res) {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findByPk(id, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder'
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [{
                            model: City,
                            as: 'city'
                        }]
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality'
                    }
                ]
            });

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Agendamiento no encontrado'
                });
            }

            res.json({
                success: true,
                data: appointment
            });

        } catch (error) {
            console.error('Error obteniendo agendamiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar agendamiento
    async updateAppointment(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const appointment = await Appointment.findByPk(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Agendamiento no encontrado'
                });
            }

            await appointment.update(updateData);

            const updatedAppointment = await Appointment.findByPk(id, {
                include: [
                    { model: InspectionOrder, as: 'inspectionOrder' },
                    { model: Sede, as: 'sede', include: [{ model: City, as: 'city' }] },
                    { model: InspectionModality, as: 'inspectionModality' }
                ]
            });

            res.json({
                success: true,
                data: updatedAppointment,
                message: 'Agendamiento actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando agendamiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Método para asignar inspector a un agendamiento
    async assignInspector(req, res) {
        try {
            const { id } = req.params;
            const { inspector_id, status } = req.body;

            if (!inspector_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del inspector es requerido'
                });
            }

            const appointment = await Appointment.findByPk(id);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Agendamiento no encontrado'
                });
            }

            // Actualizar el appointment con el inspector asignado y el nuevo estado
            const updateData = {
                user_id: inspector_id, // Campo user_id = inspector asignado
                ...(status && { status })
            };

            await appointment.update(updateData);

            // Obtener el appointment actualizado con sus relaciones
            const updatedAppointment = await Appointment.findByPk(id, {
                include: [
                    { model: InspectionOrder, as: 'inspectionOrder' },
                    { model: Sede, as: 'sede', include: [{ model: City, as: 'city' }] },
                    { model: InspectionModality, as: 'inspectionModality' }
                ]
            });

            // Emitir evento WebSocket para actualizar CoordinadorVML
            try {
                // Obtener todos los agendamientos SEDE para enviar al coordinador
                const allSedeAppointments = await Appointment.findAll({
                    where: {
                        inspection_modality_id: appointment.inspection_modality_id
                    },
                    include: [
                        { model: InspectionOrder, as: 'inspectionOrder' },
                        { model: Sede, as: 'sede', include: [{ model: City, as: 'city' }] },
                        { model: InspectionModality, as: 'inspectionModality' }
                    ],
                    order: [['created_at', 'DESC']]
                });

                // Emitir evento a la sala del coordinador
                socketManager.sendToRoom('coordinador_vml', 'sedeAppointmentCreated', {
                    appointment: updatedAppointment,
                    allSedeAppointments: allSedeAppointments
                });

                console.log('📡 WebSocket: Evento sedeAppointmentCreated emitido al coordinador');
            } catch (wsError) {
                console.error('Error emitiendo WebSocket:', wsError);
            }

            res.json({
                success: true,
                data: updatedAppointment,
                message: 'Inspector asignado exitosamente'
            });

        } catch (error) {
            console.error('Error asignando inspector:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // ===== ENDPOINT PARA VALIDAR STATUS DE APPOINTMENT POR SESSION_ID =====
    
    // Validar status de appointment por session_id (para app externa)
    async validateAppointmentStatus(req, res) {
        try {
            const { session_id } = req.body;
            
            if (!session_id) {
                return res.status(400).json({
                    success: false,
                    message: 'session_id es requerido'
                });
            }
            
            // Buscar appointment por session_id
            const appointment = await Appointment.findOne({
                where: { session_id: session_id },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder'
                    },
                    {
                        model: Sede,
                        as: 'sede'
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality'
                    }
                ]
            });
            
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment no encontrado para el session_id proporcionado'
                });
            }
            
            // Estados que requieren redirect
            const redirectStates = [
                'ineffective_no_retry',
                'revision_supervisor', 
                'call_finished',
                'failed',
                'ineffective_with_retry',
                'completed'
            ];
            
            // Determinar acción basada en el status
            const action = redirectStates.includes(appointment.status) ? 'redirect' : 'keep';
            
            return res.status(200).json({
                success: true,
                appointmentId: appointment.id,
                action: action,
                status: appointment.status
            });
            
        } catch (error) {
            console.error('Error validando status de appointment:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // ===== ENDPOINT DEDICADO PARA INSPECTOR ALIADO =====
    
    // Crear agendamiento para Inspector Aliado (simplificado)
    async createInspectorAliadoAppointment(req, res) {
        try {
            const {
                sede_id,
                inspection_order_id,
                user_id,
                scheduled_date,
                scheduled_time,
                session_id,
                status = 'pending'
            } = req.body;

            // Validaciones básicas
            if (!sede_id || !inspection_order_id || !user_id || !scheduled_date || !scheduled_time) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos faltantes: sede_id, inspection_order_id, user_id, scheduled_date, scheduled_time'
                });
            }

            // Buscar automáticamente la modalidad SEDE
            const sedeModality = await InspectionModality.findOne({
                where: { code: 'SEDE', active: true }
            });
            
            if (!sedeModality) {
                return res.status(500).json({
                    success: false,
                    message: 'Modalidad SEDE no encontrada en el sistema'
                });
            }

            // Validar que la modalidad esté disponible en la sede
            const availability = await SedeModalityAvailability.findOne({
                where: {
                    sede_id: sede_id,
                    inspection_modality_id: sedeModality.id,
                    active: true
                }
            });

            if (!availability) { 
                // return res.status(400).json({
                //     success: false,
                //     message: 'La modalidad SEDE no está disponible en esta sede'
                // });
            }

            // Crear el agendamiento con valores fijos para Inspector Aliado
            const appointment = await Appointment.create({
                sede_id: sede_id,
                inspection_order_id: inspection_order_id,
                inspection_modality_id: sedeModality.id,
                user_id: user_id,
                scheduled_date: scheduled_date,
                scheduled_time: scheduled_time,
                session_id: session_id,
                status: status,
                // Campos opcionales con valores por defecto
                call_log_id: null,
                direccion_inspeccion: null,
                observaciones: null
            });

            // Obtener el agendamiento completo con relaciones
            const fullAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder'
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [{
                            model: City,
                            as: 'city'
                        }]
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality'
                    }
                ]
            });

            // Disparar evento de cita creada
            try {
                await automatedEventTriggers.triggerAppointmentEvents('created', {
                    id: fullAppointment.id,
                    date: fullAppointment.scheduled_date,
                    time: fullAppointment.scheduled_time,
                    status: fullAppointment.status,
                    sede: fullAppointment.sede?.name || 'Sede no especificada',
                    modality: fullAppointment.inspectionModality?.name || 'Modalidad no especificada',
                    customer: fullAppointment.inspectionOrder?.nombre_contacto || 'Cliente',
                    customer_email: fullAppointment.inspectionOrder?.email_contacto || 'email@ejemplo.com'
                }, {
                    created_by: req.user?.id,
                    ip_address: req.ip,
                    inspection_order_id: inspection_order_id
                });
            } catch (eventError) {
                console.error('Error disparando evento appointment.created:', eventError);
            }

            // Emitir evento WebSocket para actualizar CoordinadorVML
            try {
                // Obtener todos los agendamientos SEDE para enviar al coordinador
                const allSedeAppointments = await Appointment.findAll({
                    where: {
                        inspection_modality_id: sedeModality.id
                    },
                    include: [
                        {
                            model: InspectionOrder,
                            as: 'inspectionOrder'
                        },
                        {
                            model: Sede,
                            as: 'sede',
                            include: [{
                                model: City,
                                as: 'city'
                            }]
                        },
                        {
                            model: InspectionModality,
                            as: 'inspectionModality'
                        }
                    ],
                    order: [['created_at', 'DESC']]
                });

                // Emitir evento a la sala del coordinador
                socketManager.sendToRoom('coordinador_vml', 'sedeAppointmentCreated', {
                    appointment: fullAppointment,
                    allSedeAppointments: allSedeAppointments
                });

                console.log('📡 WebSocket: Evento sedeAppointmentCreated emitido al coordinador');
            } catch (wsError) {
                console.error('Error emitiendo WebSocket:', wsError);
            }

            res.status(201).json({
                success: true,
                data: fullAppointment,
                message: 'Agendamiento creado exitosamente para Inspector Aliado'
            });

        } catch (error) {
            console.error('Error creando agendamiento para Inspector Aliado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

// Función auxiliar para generar slots de tiempo
function generateTimeSlots(startTime, endTime, existingAppointments, maxCapacity) {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    const current = new Date(start);
    while (current < end) {
        const timeString = current.toTimeString().substring(0, 5);
        const conflictingAppointments = existingAppointments.filter(
            apt => apt.scheduled_time == timeString
        );

        if (conflictingAppointments.length < maxCapacity) {
            slots.push({
                time: timeString,
                available: true,
                capacity: maxCapacity - conflictingAppointments.length
            });
        }

        current.setHours(current.getHours() + 1);
    }

    return slots;
}

export default new AppointmentController(); 