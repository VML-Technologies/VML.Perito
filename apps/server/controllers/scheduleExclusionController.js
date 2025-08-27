import { ScheduleExclusion, ScheduleTemplate, Sede, InspectionModality } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Controlador para gestionar exclusiones de horarios (tiempos muertos)
 */
class ScheduleExclusionController {
    
    // Obtener todas las exclusiones de un template específico
    async getExclusionsByTemplate(req, res) {
        try {
            const { templateId } = req.params;

            const exclusions = await ScheduleExclusion.findAll({
                where: {
                    schedule_template_id: templateId
                },
                include: [
                    {
                        model: ScheduleTemplate,
                        as: 'scheduleTemplate',
                        include: [
                            {
                                model: Sede,
                                as: 'sede',
                                attributes: ['id', 'name']
                            },
                            {
                                model: InspectionModality,
                                as: 'inspectionModality',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                order: [['priority', 'DESC'], ['start_time', 'ASC']]
            });

            res.json({
                success: true,
                data: exclusions
            });

        } catch (error) {
            console.error('Error obteniendo exclusiones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear una nueva exclusión
    async createExclusion(req, res) {
        try {
            const {
                schedule_template_id,
                name,
                start_time,
                end_time,
                days_pattern,
                exclusion_type,
                priority
            } = req.body;

            // Validaciones básicas
            if (!schedule_template_id || !name || !start_time || !end_time) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos: schedule_template_id, name, start_time, end_time'
                });
            }

            // Verificar que el template existe
            const template = await ScheduleTemplate.findByPk(schedule_template_id);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla de horario no encontrada'
                });
            }

            // Validar que la hora de inicio sea menor que la de fin
            const startMinutes = this.timeToMinutes(start_time);
            const endMinutes = this.timeToMinutes(end_time);
            
            if (startMinutes >= endMinutes) {
                return res.status(400).json({
                    success: false,
                    message: 'La hora de inicio debe ser menor que la hora de fin'
                });
            }

            // Crear la exclusión
            const exclusion = await ScheduleExclusion.create({
                schedule_template_id,
                name,
                start_time,
                end_time,
                days_pattern,
                active: true,
                exclusion_type: exclusion_type || 'CUSTOM',
                priority: priority || 0
            });

            // Obtener la exclusión completa con relaciones
            const fullExclusion = await ScheduleExclusion.findByPk(exclusion.id, {
                include: [
                    {
                        model: ScheduleTemplate,
                        as: 'scheduleTemplate',
                        include: [
                            {
                                model: Sede,
                                as: 'sede',
                                attributes: ['id', 'name']
                            },
                            {
                                model: InspectionModality,
                                as: 'inspectionModality',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.status(201).json({
                success: true,
                data: fullExclusion,
                message: 'Exclusión de horario creada exitosamente'
            });

        } catch (error) {
            console.error('Error creando exclusión:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar una exclusión existente
    async updateExclusion(req, res) {
        try {
            const { exclusionId } = req.params;
            const {
                name,
                start_time,
                end_time,
                days_pattern,
                exclusion_type,
                priority,
                active
            } = req.body;

            const exclusion = await ScheduleExclusion.findByPk(exclusionId);
            if (!exclusion) {
                return res.status(404).json({
                    success: false,
                    message: 'Exclusión no encontrada'
                });
            }

            // Validar tiempos si se proporcionan
            if (start_time && end_time) {
                const startMinutes = this.timeToMinutes(start_time);
                const endMinutes = this.timeToMinutes(end_time);
                
                if (startMinutes >= endMinutes) {
                    return res.status(400).json({
                        success: false,
                        message: 'La hora de inicio debe ser menor que la hora de fin'
                    });
                }
            }

            // Actualizar campos que se proporcionan
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (start_time !== undefined) updateData.start_time = start_time;
            if (end_time !== undefined) updateData.end_time = end_time;
            if (days_pattern !== undefined) updateData.days_pattern = days_pattern;
            if (exclusion_type !== undefined) updateData.exclusion_type = exclusion_type;
            if (priority !== undefined) updateData.priority = priority;
            if (active !== undefined) updateData.active = active;

            await exclusion.update(updateData);

            // Obtener la exclusión actualizada con relaciones
            const updatedExclusion = await ScheduleExclusion.findByPk(exclusionId, {
                include: [
                    {
                        model: ScheduleTemplate,
                        as: 'scheduleTemplate',
                        include: [
                            {
                                model: Sede,
                                as: 'sede',
                                attributes: ['id', 'name']
                            },
                            {
                                model: InspectionModality,
                                as: 'inspectionModality',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.json({
                success: true,
                data: updatedExclusion,
                message: 'Exclusión actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando exclusión:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar una exclusión (soft delete)
    async deleteExclusion(req, res) {
        try {
            const { exclusionId } = req.params;

            const exclusion = await ScheduleExclusion.findByPk(exclusionId);
            if (!exclusion) {
                return res.status(404).json({
                    success: false,
                    message: 'Exclusión no encontrada'
                });
            }

            await exclusion.destroy();

            res.json({
                success: true,
                message: 'Exclusión eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando exclusión:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Función auxiliar para convertir tiempo a minutos
    timeToMinutes(timeString) {
        if (!timeString) {
            return 0;
        }

        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) {
                return 0;
            }
            return hours * 60 + minutes;
        } catch (error) {
            return 0;
        }
    }
}

export default new ScheduleExclusionController();
