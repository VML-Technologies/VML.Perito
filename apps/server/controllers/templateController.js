import TemplateService from '../services/templateService.js';

class TemplateController {
    constructor() {
        this.templateService = new TemplateService();

        // Bind methods to preserve context
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.stats = this.stats.bind(this);
        this.variables = this.variables.bind(this);
        this.validate = this.validate.bind(this);
        this.render = this.render.bind(this);
        this.byCategory = this.byCategory.bind(this);
        this.duplicate = this.duplicate.bind(this);
    }

    /**
     * Obtener todas las plantillas
     */
    async index(req, res) {
        try {
            const { category } = req.query;
            let templates;

            if (category) {
                templates = await this.templateService.getTemplatesByCategory(category);
            } else {
                templates = await this.templateService.getAllTemplates();
            }

            res.json({
                success: true,
                data: templates,
                message: 'Plantillas obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener plantillas',
                error: error.message
            });
        }
    }

    /**
     * Obtener plantilla por ID
     */
    async show(req, res) {
        try {
            const { id } = req.params;
            const template = await this.templateService.getTemplateById(id);

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            res.json({
                success: true,
                data: template,
                message: 'Plantilla obtenida exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener plantilla',
                error: error.message
            });
        }
    }

    /**
     * Crear nueva plantilla
     */
    async store(req, res) {
        try {
            // Verificar plantillas existentes
            const existingTemplates = await this.templateService.getAllTemplates();

            const templateData = {
                ...req.body,
                created_by: req.user?.id
            };

            const template = await this.templateService.createTemplate(templateData);

            res.status(201).json({
                success: true,
                data: template,
                message: 'Plantilla creada exitosamente'
            });
        } catch (error) {
            console.error('❌ Error en controlador store:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear plantilla',
                error: error.message
            });
        }
    }

    /**
     * Actualizar plantilla
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const templateData = req.body;

            const template = await this.templateService.updateTemplate(id, templateData);

            res.json({
                success: true,
                data: template,
                message: 'Plantilla actualizada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar plantilla',
                error: error.message
            });
        }
    }

    /**
     * Eliminar plantilla
     */
    async destroy(req, res) {
        try {
            const { id } = req.params;
            await this.templateService.deleteTemplate(id);

            res.json({
                success: true,
                message: 'Plantilla eliminada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar plantilla',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de plantillas
     */
    async stats(req, res) {
        try {
            const stats = await this.templateService.getTemplateStats();

            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    /**
     * Obtener variables disponibles
     */
    async variables(req, res) {
        try {
            const variables = this.templateService.getAvailableVariables();

            res.json({
                success: true,
                data: variables,
                message: 'Variables obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener variables',
                error: error.message
            });
        }
    }

    /**
     * Validar plantilla
     */
    async validate(req, res) {
        try {
            const { template, variables = [] } = req.body;

            if (!template) {
                return res.status(400).json({
                    success: false,
                    message: 'Plantilla es requerida'
                });
            }

            const validation = this.templateService.validateTemplate(template, variables);

            res.json({
                success: true,
                data: validation,
                message: validation.isValid ? 'Plantilla válida' : 'Plantilla con errores'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al validar plantilla',
                error: error.message
            });
        }
    }

    /**
     * Renderizar plantilla con datos de prueba
     */
    async render(req, res) {
        try {
            const { template, data = {} } = req.body;

            if (!template) {
                return res.status(400).json({
                    success: false,
                    message: 'Plantilla es requerida'
                });
            }

            const rendered = this.templateService.renderTemplate(template, data);

            res.json({
                success: true,
                data: {
                    original: template,
                    rendered: rendered,
                    data: data
                },
                message: 'Plantilla renderizada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al renderizar plantilla',
                error: error.message
            });
        }
    }

    /**
     * Obtener plantillas por categoría
     */
    async byCategory(req, res) {
        try {
            const { category } = req.params;
            const templates = await this.templateService.getTemplatesByCategory(category);

            res.json({
                success: true,
                data: templates,
                message: `Plantillas de categoría ${category} obtenidas exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener plantillas por categoría',
                error: error.message
            });
        }
    }

    /**
     * Duplicar plantilla
     */
    async duplicate(req, res) {
        try {
            const { id } = req.params;
            const originalTemplate = await this.templateService.getTemplateById(id);

            if (!originalTemplate) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla original no encontrada'
                });
            }

            const templateData = {
                ...originalTemplate.toJSON(),
                id: undefined, // Remover ID para crear nuevo registro
                name: `${originalTemplate.name} (Copia)`,
                created_by: req.user?.id
            };

            const newTemplate = await this.templateService.createTemplate(templateData);

            res.status(201).json({
                success: true,
                data: newTemplate,
                message: 'Plantilla duplicada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al duplicar plantilla',
                error: error.message
            });
        }
    }
}

export default new TemplateController(); 