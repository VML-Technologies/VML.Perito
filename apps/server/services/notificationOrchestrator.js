import EventService from './eventService.js';
import TemplateService from './templateService.js';
import channelConfigService from './channelConfigService.js';
import notificationService from './notificationService.js';
import EventRegistry from './eventRegistry.js';

/**
 * Orquestador de Notificaciones
 * 
 * Este servicio integra todos los componentes del sistema de notificaciones:
 * - Eventos y listeners
 * - Plantillas de notificación
 * - Configuración de canales
 * - Envío de notificaciones
 */
class NotificationOrchestrator {
    constructor() {
        this.eventService = null;
        this.templateService = null;
        this.channelConfigService = null;
        this.notificationService = null;
        this.eventRegistry = null;

        // Cache para optimizar rendimiento
        this.templateCache = new Map();
        this.channelCache = new Map();

        // Estadísticas
        this.stats = {
            totalNotifications: 0,
            successfulDeliveries: 0,
            failedDeliveries: 0,
            eventsProcessed: 0,
            lastProcessed: null
        };
        // NO inicializar automáticamente - se hará manualmente después de crear las tablas
    }

    /**
     * Inicializar el orquestador de notificaciones
     */
    async initialize(eventService, templateService, channelConfigService, notificationService) {
        try {
            console.log('🎯 Inicializando NotificationOrchestrator...');
            
            this.eventService = eventService;
            this.templateService = templateService;
            this.channelConfigService = channelConfigService;
            this.notificationService = notificationService;
            this.eventRegistry = EventRegistry.getInstance();
            
            console.log('✅ NotificationOrchestrator inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando NotificationOrchestrator:', error);
            throw error;
        }
    }

    /**
     * Procesar evento y enviar notificaciones automáticamente
     */
    async processEvent(eventName, data, context = {}) {
        try {
            console.log(`🎯 Procesando evento: ${eventName}`, { data, context });

            // 1. Buscar listeners del evento
            const listeners = await this.eventService.getEventListeners(eventName);

            if (!listeners || listeners.length === 0) {
                console.log(`📭 No hay listeners para el evento: ${eventName}`);
                return { processed: 0, sent: 0 };
            }

            let processedCount = 0;
            let sentCount = 0;

            // 2. Procesar cada listener
            for (const listener of listeners) {
                if (!listener.is_active) continue;

                try {
                    // 3. Aplicar condiciones si existen
                    if (listener.conditions && !this.evaluateConditions(listener.conditions, data, context)) {
                        console.log(`❌ Listener ${listener.id} no cumple condiciones`);
                        continue;
                    }

                    // 4. Obtener plantilla
                    const template = await this.getTemplate(listener.notification_type_id);
                    if (!template || !template.is_active) {
                        console.log(`❌ Plantilla no encontrada o inactiva para listener ${listener.id}`);
                        continue;
                    }

                    // 5. Renderizar plantilla por canal
                    const renderedNotifications = await this.renderTemplateByChannels(template, data, listener.channels);

                    // 6. Enviar notificaciones
                    const results = await this.sendNotifications(renderedNotifications, context);

                    processedCount++;
                    sentCount += results.successful;

                    // 7. Actualizar estadísticas
                    this.updateStats(results);

                } catch (error) {
                    console.error(`❌ Error procesando listener ${listener.id}:`, error);
                }
            }

            this.stats.eventsProcessed++;
            this.stats.lastProcessed = new Date();

            console.log(`✅ Evento ${eventName} procesado: ${processedCount} listeners, ${sentCount} notificaciones enviadas`);

            return { processed: processedCount, sent: sentCount };

        } catch (error) {
            console.error(`❌ Error procesando evento ${eventName}:`, error);
            throw error;
        }
    }

    /**
     * Evaluar condiciones del listener
     */
    evaluateConditions(conditions, data, context) {
        try {
            // Implementar lógica de evaluación de condiciones
            // Por ahora, siempre retorna true
            return true;
        } catch (error) {
            console.error('Error evaluando condiciones:', error);
            return false;
        }
    }

    /**
     * Obtener plantilla con cache
     */
    async getTemplate(templateId) {
        const cacheKey = `template_${templateId}`;

        if (this.templateCache.has(cacheKey)) {
            return this.templateCache.get(cacheKey);
        }

        try {
            const template = await this.templateService.getTemplateById(templateId);
            if (template) {
                this.templateCache.set(cacheKey, template);
            }
            return template;
        } catch (error) {
            console.error('Error obteniendo plantilla:', error);
            return null;
        }
    }

    /**
     * Renderizar plantilla por canales
     */
    async renderTemplateByChannels(template, data, channels = null) {
        const renderedNotifications = [];

        // Si no se especifican canales, usar todos los configurados en la plantilla
        const targetChannels = channels || Object.keys(template.channels || {});

        for (const channelName of targetChannels) {
            try {
                const channelConfig = template.channels?.[channelName];
                if (!channelConfig) continue;

                // Verificar que el canal esté activo
                const channelStatus = await this.channelConfigService.getChannelStatus(channelName);
                if (!channelStatus?.is_active) {
                    console.log(`📭 Canal ${channelName} inactivo`);
                    continue;
                }

                // Renderizar contenido del canal usando el nuevo método
                const renderedContent = this.templateService.renderTemplateByChannel(template, data, channelName);

                if (renderedContent) {
                    renderedNotifications.push({
                        channel: channelName,
                        content: renderedContent,
                        template: template,
                        data: data
                    });
                }

            } catch (error) {
                console.error(`❌ Error renderizando canal ${channelName}:`, error);
            }
        }

        return renderedNotifications;
    }

    /**
     * Enviar notificaciones por múltiples canales
     */
    async sendNotifications(renderedNotifications, context = {}) {
        const results = {
            successful: 0,
            failed: 0,
            details: []
        };

        for (const notification of renderedNotifications) {
            try {
                // Preparar notificación con datos del canal
                const notificationData = {
                    channel: notification.channel,
                    title: notification.content.title || notification.template.name,
                    content: notification.content.message || notification.content.body || notification.content.text || '',
                    recipient: context.recipient,
                    metadata: {
                        template_id: notification.template.id,
                        event_data: notification.data,
                        context: context,
                        channel_data: {
                            [notification.channel]: notification.content
                        }
                    }
                };

                // Enviar notificación por el canal específico
                const result = await this.notificationService.sendNotification(notificationData);

                if (result.success) {
                    results.successful++;
                    results.details.push({
                        channel: notification.channel,
                        status: 'success',
                        message: result.message
                    });
                } else {
                    results.failed++;
                    results.details.push({
                        channel: notification.channel,
                        status: 'failed',
                        error: result.error
                    });
                }

            } catch (error) {
                console.error(`❌ Error enviando notificación por ${notification.channel}:`, error);
                results.failed++;
                results.details.push({
                    channel: notification.channel,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Actualizar estadísticas
     */
    updateStats(results) {
        this.stats.totalNotifications += results.successful + results.failed;
        this.stats.successfulDeliveries += results.successful;
        this.stats.failedDeliveries += results.failed;
    }

    /**
     * Obtener estadísticas del orquestador
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalNotifications > 0
                ? (this.stats.successfulDeliveries / this.stats.totalNotifications * 100).toFixed(2)
                : 0,
            cacheSize: {
                templates: this.templateCache.size,
                channels: this.channelCache.size
            }
        };
    }

    /**
     * Limpiar cache
     */
    clearCache() {
        this.templateCache.clear();
        this.channelCache.clear();
        console.log('🧹 Cache del orquestador limpiado');
    }

    /**
     * Probar sistema completo
     */
    async testSystem(testData = {}) {
        const testResults = {
            events: false,
            templates: false,
            channels: false,
            notifications: false,
            overall: false
        };

        try {
            // Probar eventos
            const events = await this.eventService.getAllEvents();
            testResults.events = events && events.length > 0;

            // Probar plantillas
            const templates = await this.templateService.getAllTemplates();
            testResults.templates = templates && templates.length > 0;

            // Probar canales
            const channels = await this.channelConfigService.getAllChannels();
            testResults.channels = channels && channels.length > 0;

            // Probar notificaciones
            testResults.notifications = this.notificationService.isConfigured();

            // Resultado general
            testResults.overall = testResults.events && testResults.templates &&
                testResults.channels && testResults.notifications;

            return testResults;

        } catch (error) {
            console.error('Error en prueba del sistema:', error);
            return testResults;
        }
    }

    /**
     * Inicializar el orquestador
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando NotificationOrchestrator...');

            // Cargar configuraciones iniciales
            await this.eventService.initialize();
            await this.channelConfigService.loadChannelsFromDatabase();

            // Probar sistema
            const testResults = await this.testSystem();

            if (testResults.overall) {
                console.log('✅ NotificationOrchestrator inicializado correctamente');
            } else {
                console.warn('⚠️ NotificationOrchestrator inicializado con advertencias:', testResults);
            }

            return testResults;

        } catch (error) {
            console.error('❌ Error inicializando NotificationOrchestrator:', error);
            throw error;
        }
    }
}

// Exportar singleton
const notificationOrchestrator = new NotificationOrchestrator();
export default notificationOrchestrator; 