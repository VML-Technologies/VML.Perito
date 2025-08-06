import NotificationTemplate from '../models/notificationTemplate.js';
import TemplateVersion from '../models/templateVersion.js';

class TemplateService {
    constructor() {
        this.variablePattern = /\{\{([^}]+)\}\}/g;
    }

    /**
     * Obtener variables disponibles por categoría
     */
    getAvailableVariables() {
        return {
            user: {
                'user.id': 'ID del usuario',
                'user.name': 'Nombre completo del usuario',
                'user.email': 'Email del usuario',
                'user.first_name': 'Nombre del usuario',
                'user.last_name': 'Apellido del usuario',
                'user.role': 'Rol del usuario',
                'user.phone': 'Teléfono del usuario',
                'user.department': 'Departamento del usuario'
            },
            inspection_order: {
                'inspection_order.id': 'ID de la orden',
                'inspection_order.numero': 'Número de orden',
                'inspection_order.reference': 'Referencia de la orden',
                'inspection_order.customer_name': 'Nombre del cliente',
                'inspection_order.vehicle_type': 'Tipo de vehículo',
                'inspection_order.vehicle_plate': 'Placa del vehículo',
                'inspection_order.modality': 'Modalidad de inspección',
                'inspection_order.sede_name': 'Nombre de la sede',
                'inspection_order.status': 'Estado de la orden',
                'inspection_order.created_at': 'Fecha de creación',
                'inspection_order.scheduled_date': 'Fecha programada',
                'inspection_order.completed_at': 'Fecha de completado'
            },
            appointment: {
                'appointment.id': 'ID de la cita',
                'appointment.date': 'Fecha de la cita',
                'appointment.time': 'Hora de la cita',
                'appointment.duration': 'Duración estimada',
                'appointment.status': 'Estado de la cita',
                'appointment.notes': 'Notas adicionales'
            },
            company: {
                'company.name': 'Nombre de la empresa',
                'company.address': 'Dirección de la empresa',
                'company.phone': 'Teléfono de la empresa',
                'company.email': 'Email de la empresa'
            },
            sede: {
                'sede.name': 'Nombre de la sede',
                'sede.address': 'Dirección de la sede',
                'sede.phone': 'Teléfono de la sede',
                'sede.type': 'Tipo de sede (CDA, Comercial, etc.)'
            },
            agent: {
                'agent.id': 'ID del agente',
                'agent.email': 'Email del agente',
                'agent.first_name': 'Nombre del agente',
                'agent.last_name': 'Apellido del agente',
                'agent.phone': 'Teléfono del agente'
            },
            system: {
                'system.name': 'Nombre del sistema',
                'system.url': 'URL del sistema',
                'system.support_email': 'Email de soporte',
                'current_date': 'Fecha actual',
                'current_time': 'Hora actual',
                'reset_link': 'Enlace de restablecimiento',
                'reset_code': 'Código de restablecimiento'
            }
        };
    }

    /**
     * Validar sintaxis de una plantilla
     */
    validateTemplate(template, variables = []) {
        const errors = [];
        const warnings = [];

        // Extraer variables de la plantilla
        const templateVariables = this.extractVariables(template);

        // Verificar variables no definidas
        templateVariables.forEach(variable => {
            const isAvailable = this.isVariableAvailable(variable);
            if (!isAvailable) {
                errors.push(`Variable no disponible: ${variable}`);
            }
        });

        // Verificar variables definidas pero no usadas
        variables.forEach(variable => {
            if (!templateVariables.includes(variable)) {
                warnings.push(`Variable definida pero no usada: ${variable}`);
            }
        });

        // Verificar sintaxis básica
        if (template.includes('{{') && !template.includes('}}')) {
            errors.push('Sintaxis inválida: {{ sin }} correspondiente');
        }

        if (template.includes('}}') && !template.includes('{{')) {
            errors.push('Sintaxis inválida: }} sin {{ correspondiente');
        }



        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            variables: templateVariables
        };
    }

    /**
     * Extraer variables de una plantilla
     */
    extractVariables(template) {
        const variables = [];
        let match;

        while ((match = this.variablePattern.exec(template)) !== null) {
            variables.push(match[1].trim());
        }

        return [...new Set(variables)]; // Eliminar duplicados
    }

    /**
     * Verificar si una variable está disponible
     */
    isVariableAvailable(variable) {
        const availableVariables = this.getAvailableVariables();

        for (const category in availableVariables) {
            if (availableVariables[category][variable]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Renderizar plantilla con datos
     */
    renderTemplate(template, data) {
        let rendered = template;

        // Reemplazar variables con datos
        rendered = rendered.replace(this.variablePattern, (match, variable) => {
            const value = this.getNestedValue(data, variable);
            return value !== undefined ? value : match;
        });

        return rendered;
    }

    /**
     * Renderizar plantilla por canal específico
     */
    renderTemplateByChannel(template, data, channelName) {
        try {
            const channelConfig = template.channels?.[channelName];
            if (!channelConfig) {
                console.warn(`⚠️ No hay configuración para el canal: ${channelName}`);
                return null;
            }

            const renderedContent = {};

            // Renderizar campos específicos del canal
            if (channelConfig.template) {
                renderedContent.message = this.renderTemplate(channelConfig.template, data);
            }

            if (channelConfig.subject) {
                renderedContent.subject = this.renderTemplate(channelConfig.subject, data);
            }

            if (channelConfig.title) {
                renderedContent.title = this.renderTemplate(channelConfig.title, data);
            }

            if (channelConfig.body) {
                renderedContent.body = this.renderTemplate(channelConfig.body, data);
            }

            if (channelConfig.html) {
                renderedContent.html = this.renderTemplate(channelConfig.html, data);
            }

            if (channelConfig.text) {
                renderedContent.text = this.renderTemplate(channelConfig.text, data);
            }

            return renderedContent;

        } catch (error) {
            console.error(`❌ Error renderizando plantilla para canal ${channelName}:`, error);
            return null;
        }
    }

    /**
     * Obtener valor anidado de un objeto
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Crear plantilla
     */
    async createTemplate(templateData) {
        try {
            // Verificar si ya existe una plantilla con el mismo nombre
            const existingTemplate = await NotificationTemplate.findOne({
                where: { name: templateData.name }
            });

            if (existingTemplate) {
                throw new Error(`Ya existe una plantilla con el nombre "${templateData.name}". Por favor, use un nombre único.`);
            }

            // Validar plantillas por canal
            const validation = this.validateTemplatesByChannel(templateData.channels);

            if (!validation.isValid) {
                throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
            }

            const result = await NotificationTemplate.create(templateData);

            return result;
        } catch (error) {
            console.error('❌ Error en createTemplate:', error);
            throw error;
        }
    }

    /**
     * Validar plantillas por canal
     */
    validateTemplatesByChannel(channels) {
        const errors = [];
        const warnings = [];

        for (const [channelName, channelConfig] of Object.entries(channels)) {
            if (channelConfig.template) {
                const validation = this.validateTemplate(channelConfig.template, channelConfig.variables || []);
                errors.push(...validation.errors.map(error => `${channelName}: ${error}`));
                warnings.push(...validation.warnings.map(warning => `${channelName}: ${warning}`));
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Obtener plantilla por ID
     */
    async getTemplateById(id) {
        return await NotificationTemplate.findByPk(id);
    }

    /**
     * Obtener plantillas por categoría
     */
    async getTemplatesByCategory(category) {
        return await NotificationTemplate.findAll({
            where: { category, is_active: true },
            order: [['name', 'ASC']]
        });
    }

    /**
     * Obtener todas las plantillas
     */
    async getAllTemplates() {
        return await NotificationTemplate.findAll({
            where: { is_active: true },
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
    }

    /**
     * Actualizar plantilla
     */
    async updateTemplate(id, templateData) {
        const template = await this.getTemplateById(id);
        if (!template) {
            throw new Error('Plantilla no encontrada');
        }

        // Validar si se actualizan las plantillas por canal
        if (templateData.channels) {
            const validation = this.validateTemplatesByChannel(templateData.channels);
            if (!validation.isValid) {
                throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
            }
        }

        return await template.update(templateData);
    }

    /**
     * Eliminar plantilla (soft delete)
     */
    async deleteTemplate(id) {
        const template = await this.getTemplateById(id);
        if (!template) {
            throw new Error('Plantilla no encontrada');
        }

        return await template.destroy();
    }

    /**
     * Obtener estadísticas de plantillas
     */
    async getTemplateStats() {
        const total = await NotificationTemplate.count();
        const active = await NotificationTemplate.count({ where: { is_active: true } });
        const byCategory = await NotificationTemplate.findAll({
            attributes: [
                'category',
                [NotificationTemplate.sequelize.fn('COUNT', NotificationTemplate.sequelize.col('id')), 'count']
            ],
            where: { is_active: true },
            group: ['category'],
            order: [['category', 'ASC']]
        });

        return {
            total,
            active,
            inactive: total - active,
            byCategory: byCategory.map(item => ({
                category: item.category,
                count: parseInt(item.dataValues.count)
            }))
        };
    }

    /**
     * Crear nueva versión de plantilla
     */
    async createVersion(templateId, templateData, userId, changesSummary = '') {
        const template = await this.getTemplateById(templateId);
        if (!template) {
            throw new Error('Plantilla no encontrada');
        }

        // Obtener el siguiente número de versión
        const lastVersion = await TemplateVersion.findOne({
            where: { template_id: templateId },
            order: [['version_number', 'DESC']]
        });

        const versionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

        // Marcar versión anterior como no actual
        if (lastVersion) {
            await TemplateVersion.update(
                { is_current: false },
                { where: { template_id: templateId } }
            );
        }

        // Crear nueva versión
        const version = await TemplateVersion.create({
            template_id: templateId,
            version_number: versionNumber,
            name: templateData.name,
            description: templateData.description,
            channels: templateData.channels,
            variables: templateData.variables,
            changes_summary: changesSummary,
            created_by: userId,
            is_current: true
        });

        // Actualizar versión en la plantilla principal
        await template.update({ version: versionNumber });

        return version;
    }

    /**
     * Obtener historial de versiones de una plantilla
     */
    async getVersionHistory(templateId) {
        return await TemplateVersion.findAll({
            where: { template_id: templateId },
            order: [['version_number', 'DESC']],
            include: [
                {
                    model: require('../models/user.js').default,
                    as: 'creator',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ]
        });
    }

    /**
     * Restaurar versión anterior
     */
    async restoreVersion(templateId, versionNumber, userId) {
        const version = await TemplateVersion.findOne({
            where: {
                template_id: templateId,
                version_number: versionNumber
            }
        });

        if (!version) {
            throw new Error('Versión no encontrada');
        }

        // Crear nueva versión con el contenido restaurado
        return await this.createVersion(
            templateId,
            {
                name: version.name,
                description: version.description,
                channels: version.channels,
                variables: version.variables
            },
            userId,
            `Restaurado desde versión ${versionNumber}`
        );
    }
}

export default TemplateService; 