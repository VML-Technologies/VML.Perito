import { InspectionModality } from '../models/index.js';
import { Op } from 'sequelize';

class InspectionModalityController {
    constructor() {
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    /**
     * Listar todas las modalidades de inspección
     */
    async index(req, res) {
        try {
            const modalities = await InspectionModality.findAll({
                order: [['name', 'ASC']]
            });

            res.json({
                success: true,
                data: modalities
            });
        } catch (error) {
            console.error('❌ Error listando modalidades de inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener una modalidad específica
     */
    async show(req, res) {
        try {
            const { id } = req.params;

            const modality = await InspectionModality.findByPk(id);

            if (!modality) {
                return res.status(404).json({
                    success: false,
                    message: 'Modalidad de inspección no encontrada'
                });
            }

            res.json({
                success: true,
                data: modality
            });
        } catch (error) {
            console.error('❌ Error obteniendo modalidad de inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear una nueva modalidad de inspección
     */
    async store(req, res) {
        try {
            const { name, code, description } = req.body;

            if (!name || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y código son requeridos'
                });
            }

            // Verificar si ya existe una modalidad con el mismo código
            const existingModality = await InspectionModality.findOne({
                where: { code: code.toUpperCase() }
            });

            if (existingModality) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una modalidad con este código'
                });
            }

            const modality = await InspectionModality.create({
                name,
                code: code.toUpperCase(),
                description: description || null
            });

            res.status(201).json({
                success: true,
                message: 'Modalidad de inspección creada exitosamente',
                data: modality
            });
        } catch (error) {
            console.error('❌ Error creando modalidad de inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar una modalidad de inspección
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, code, description } = req.body;

            const modality = await InspectionModality.findByPk(id);

            if (!modality) {
                return res.status(404).json({
                    success: false,
                    message: 'Modalidad de inspección no encontrada'
                });
            }

            // Si se está cambiando el código, verificar que no exista otro con el mismo código
            if (code && code !== modality.code) {
                const existingModality = await InspectionModality.findOne({
                    where: { 
                        code: code.toUpperCase(),
                        id: { [Op.ne]: id }
                    }
                });

                if (existingModality) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe otra modalidad con este código'
                    });
                }
            }

            await modality.update({
                name: name || modality.name,
                code: code ? code.toUpperCase() : modality.code,
                description: description !== undefined ? description : modality.description
            });

            res.json({
                success: true,
                message: 'Modalidad de inspección actualizada exitosamente',
                data: modality
            });
        } catch (error) {
            console.error('❌ Error actualizando modalidad de inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar una modalidad de inspección
     */
    async destroy(req, res) {
        try {
            const { id } = req.params;

            const modality = await InspectionModality.findByPk(id);

            if (!modality) {
                return res.status(404).json({
                    success: false,
                    message: 'Modalidad de inspección no encontrada'
                });
            }

            // Verificar si hay agendamientos usando esta modalidad
            const { Appointment } = await import('../models/index.js');
            const appointmentsCount = await Appointment.count({
                where: { inspection_modality_id: id }
            });

            if (appointmentsCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede eliminar la modalidad porque está siendo usada en ${appointmentsCount} agendamiento(s)`
                });
            }

            await modality.destroy();

            res.json({
                success: true,
                message: 'Modalidad de inspección eliminada exitosamente'
            });
        } catch (error) {
            console.error('❌ Error eliminando modalidad de inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default InspectionModalityController;
