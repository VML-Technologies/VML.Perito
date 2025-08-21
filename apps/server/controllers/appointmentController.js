import {
    InspectionModality,
    SedeModalityAvailability,
    Sede,
    City,
    Department,
    SedeType,
    Appointment,
    VehicleType
} from '../models/index.js';
import { Op } from 'sequelize';
import EventRegistry from '../services/eventRegistry.js';
import automatedEventTriggers from '../services/automatedEventTriggers.js';

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
                // Campos principales
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
                user_id, // aceptar ambos

                // Campos adicionales del formulario
                fecha_inspeccion,
                hora_inspeccion,
                inspection_type_id,
                inspectionTypeId
            } = req.body;

            // Normalizar los campos para soportar ambos nombres
            const _callLogId = call_log_id || callLogId;
            const _inspectionOrderId = inspection_order_id || inspectionOrderId;
            const _inspectionModalityId = inspection_modality_id || inspectionModalityId;
            const _sedeId = sede_id || sedeId;
            const _scheduledDate = scheduled_date || scheduledDate || fecha_inspeccion;
            const _scheduledTime = scheduled_time || scheduledTime || hora_inspeccion;
            const _notes = observaciones || notes;
            const _userId = user_id || userId;
            const _inspectionTypeId = inspection_type_id || inspectionTypeId;

            // Manejar campos opcionales de manera apropiada
            const _inspectionAddress = direccion_inspeccion || inspectionAddress || null;

            // Validaciones básicas
            if (!_callLogId || !_inspectionOrderId || !_inspectionModalityId || !_userId || !_scheduledDate || !_scheduledTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos faltantes'
                });
            }

            // Validar que el inspection_type_id esté presente si se requiere
            // Nota: Este campo es opcional, solo validar si se envía
            if (_inspectionTypeId && _inspectionTypeId.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Si se proporciona el tipo de inspección, no puede estar vacío'
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

            // Preparar datos para crear el agendamiento
            const appointmentData = {
                call_log_id: _callLogId,
                inspection_order_id: _inspectionOrderId,
                inspection_modality_id: _inspectionModalityId,
                sede_id: _sedeId,
                scheduled_date: _scheduledDate,
                scheduled_time: _scheduledTime,
                user_id: _userId,
                status: 'pending'
            };

            // Agregar campos opcionales solo si tienen valor
            if (_inspectionTypeId && _inspectionTypeId.trim() !== '') {
                appointmentData.inspection_type_id = _inspectionTypeId;
            }

            if (_inspectionAddress && _inspectionAddress.trim() !== '') {
                appointmentData.inspection_address = _inspectionAddress;
            }

            if (_notes && _notes.trim() !== '') {
                appointmentData.notes = _notes;
            }

            // Log para debugging
            console.log('📋 Datos del agendamiento a crear:', {
                call_log_id: _callLogId,
                inspection_order_id: _inspectionOrderId,
                inspection_modality_id: _inspectionModalityId,
                inspection_type_id: _inspectionTypeId || 'No proporcionado',
                sede_id: _sedeId,
                scheduled_date: _scheduledDate,
                scheduled_time: _scheduledTime,
                inspection_address: _inspectionAddress || 'No proporcionado',
                notes: _notes || 'No proporcionado',
                user_id: _userId
            });

            // Crear el agendamiento
            const appointment = await Appointment.create(appointmentData);

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
                    },
                    {
                        model: VehicleType,
                        as: 'vehicleType'
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