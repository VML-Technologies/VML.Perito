import {
    ScheduleTemplate,
    Sede,
    InspectionModality,
    InspectionType,
    Appointment,
    VehicleType,
    SedeVehicleType
} from '../models/index.js';
import { Op } from 'sequelize';

class ScheduleController {
    
    // Obtener horarios disponibles para una sede, modalidad y tipo
    async getAvailableSchedules(req, res) {
        try {
            const { sedeId, modalityId, inspectionTypeId, date } = req.query;

            if (!sedeId || !modalityId || !inspectionTypeId || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Sede, modalidad, tipo de inspección y fecha son requeridos'
                });
            }

            // Obtener día de la semana (1=Lunes, 7=Domingo)
            const selectedDate = new Date(date);
            const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

            // Buscar plantillas de horarios que apliquen para este día
            const scheduleTemplates = await ScheduleTemplate.findAll({
                where: {
                    sede_id: sedeId,
                    inspection_modality_id: modalityId,
                    inspection_type_id: inspectionTypeId,
                    active: true,
                    days_pattern: {
                        [Op.like]: `%${dayOfWeek}%`
                    }
                },
                include: [
                    {
                        model: Sede,
                        as: 'sede',
                        attributes: ['id', 'name', 'address']
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: InspectionType,
                        as: 'inspectionType',
                        attributes: ['id', 'name']
                    }
                ],
                order: [['priority', 'DESC'], ['start_time', 'ASC']]
            });

            // Generar intervalos disponibles para cada plantilla
            const availableSlots = [];

            for (const template of scheduleTemplates) {
                const slots = await this.generateTimeSlots(template, date);
                availableSlots.push({
                    template: {
                        id: template.id,
                        name: template.name,
                        start_time: template.start_time,
                        end_time: template.end_time,
                        interval_minutes: template.interval_minutes,
                        capacity_per_interval: template.capacity_per_interval
                    },
                    slots: slots
                });
            }

            res.json({
                success: true,
                data: availableSlots
            });

        } catch (error) {
            console.error('Error obteniendo horarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Generar slots de tiempo para una plantilla específica
    async generateTimeSlots(template, date) {
        const slots = [];
        
        // Convertir horas a minutos para facilitar cálculos
        const startMinutes = this.timeToMinutes(template.start_time);
        const endMinutes = this.timeToMinutes(template.end_time);
        const intervalMinutes = template.interval_minutes;

        // Obtener citas existentes para esta fecha y plantilla
        const existingAppointments = await Appointment.findAll({
            where: {
                sede_id: template.sede_id,
                inspection_modality_id: template.inspection_modality_id,
                inspection_type_id: template.inspection_type_id,
                scheduled_date: date,
                status: {
                    [Op.not]: 'CANCELADA'
                }
            }
        });

        // Generar intervalos
        for (let current = startMinutes; current < endMinutes; current += intervalMinutes) {
            const slotStart = this.minutesToTime(current);
            const slotEnd = this.minutesToTime(current + intervalMinutes);

            // Contar citas existentes en este intervalo
            const overlappingAppointments = existingAppointments.filter(apt => {
                const aptStart = this.timeToMinutes(apt.scheduled_time);
                return aptStart >= current && aptStart < (current + intervalMinutes);
            });

            const availableCapacity = template.capacity_per_interval - overlappingAppointments.length;

            if (availableCapacity > 0) {
                slots.push({
                    start_time: slotStart,
                    end_time: slotEnd,
                    available_capacity: availableCapacity,
                    total_capacity: template.capacity_per_interval,
                    occupied: overlappingAppointments.length
                });
            }
        }

        return slots;
    }

    // Obtener tipos de vehículos admitidos por sede
    async getSedeVehicleTypes(req, res) {
        try {
            const { sedeId } = req.params;

            const sedeVehicleTypes = await SedeVehicleType.findAll({
                where: {
                    sede_id: sedeId,
                    active: true
                },
                include: [
                    {
                        model: VehicleType,
                        as: 'vehicleType',
                        where: { active: true }
                    }
                ]
            });

            const vehicleTypes = sedeVehicleTypes.map(svt => svt.vehicleType);

            res.json({
                success: true,
                data: vehicleTypes
            });

        } catch (error) {
            console.error('Error obteniendo tipos de vehículos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear agendamiento con horario específico
    async createScheduledAppointment(req, res) {
        try {
            const {
                callLogId,
                inspectionOrderId,
                inspectionTypeId,
                inspectionModalityId,
                vehicleTypeId,
                sedeId,
                scheduleTemplateId,
                scheduledDate,
                scheduledTime,
                inspectionAddress,
                notes
            } = req.body;

            // Validaciones básicas
            if (!callLogId || !inspectionOrderId || !inspectionTypeId || !inspectionModalityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos faltantes'
                });
            }

            // Validar disponibilidad del slot
            if (scheduleTemplateId && scheduledTime) {
                const template = await ScheduleTemplate.findByPk(scheduleTemplateId);
                if (!template) {
                    return res.status(404).json({
                        success: false,
                        message: 'Plantilla de horario no encontrada'
                    });
                }

                // Verificar capacidad disponible
                const slots = await this.generateTimeSlots(template, scheduledDate);
                const requestedSlot = slots.find(slot => slot.start_time === scheduledTime);
                
                if (!requestedSlot || requestedSlot.available_capacity <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'El horario seleccionado no está disponible'
                    });
                }
            }

            // Calcular hora de fin
            let scheduledTimeEnd = null;
            if (scheduleTemplateId && scheduledTime) {
                const template = await ScheduleTemplate.findByPk(scheduleTemplateId);
                const startMinutes = this.timeToMinutes(scheduledTime);
                const endMinutes = startMinutes + template.interval_minutes;
                scheduledTimeEnd = this.minutesToTime(endMinutes);
            }

            // Crear el agendamiento
            const appointment = await Appointment.create({
                call_log_id: callLogId,
                inspection_order_id: inspectionOrderId,
                inspection_type_id: inspectionTypeId,
                inspection_modality_id: inspectionModalityId,
                vehicle_type_id: vehicleTypeId,
                sede_id: sedeId,
                schedule_template_id: scheduleTemplateId,
                scheduled_date: scheduledDate,
                scheduled_time: scheduledTime,
                scheduled_time_end: scheduledTimeEnd,
                inspection_address: inspectionAddress,
                notes: notes,
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
                        model: InspectionType,
                        as: 'inspectionType'
                    },
                    {
                        model: VehicleType,
                        as: 'vehicleType'
                    },
                    {
                        model: Sede,
                        as: 'sede'
                    },
                    {
                        model: ScheduleTemplate,
                        as: 'scheduleTemplate'
                    }
                ]
            });

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

    // Funciones auxiliares
    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    }
}

export default new ScheduleController(); 