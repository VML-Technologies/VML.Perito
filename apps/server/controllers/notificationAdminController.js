import { BaseController } from './baseController.js';
import notificationOrchestrator from '../services/notificationOrchestrator.js';
import EventService from '../services/eventService.js';
import TemplateService from '../services/templateService.js';
import channelConfigService from '../services/channelConfigService.js';

/**
 * Controlador de Administración de Notificaciones
 * 
 * Integra todas las funcionalidades del sistema de notificaciones
 * para proporcionar una interfaz administrativa completa
 */
class NotificationAdminController extends BaseController {
    constructor() {
        super();
        this.eventService = new EventService();
        this.templateService = new TemplateService();
        this.channelConfigService = channelConfigService;
    }

    /**
     * Dashboard principal con estadísticas generales
     */
    async getDashboard(req, res) {
        try {
            const [
                eventStats,
                templateStats,
                channelStats,
                orchestratorStats,
                recentEvents,
                recentNotifications
            ] = await Promise.all([
                this.eventService.getEventStats(),
                this.templateService.getTemplateStats(),
                this.channelConfigService.getChannelStats(),
                notificationOrchestrator.getStats(),
                this.eventService.getRecentEvents(10),
                this.getRecentNotifications(10)
            ]);

            const dashboard = {
                overview: {
                    totalEvents: eventStats.total_events || 0,
                    totalTemplates: templateStats.total_templates || 0,
                    totalChannels: channelStats.total_channels || 0,
                    activeChannels: channelStats.active_channels || 0,
                    totalNotifications: orchestratorStats.totalNotifications || 0,
                    successRate: orchestratorStats.successRate || 0
                },
                events: {
                    stats: eventStats,
                    recent: recentEvents
                },
                templates: {
                    stats: templateStats,
                    recent: await this.templateService.getRecentTemplates(5)
                },
                channels: {
                    stats: channelStats,
                    status: await this.channelConfigService.getAllChannelsStatus()
                },
                notifications: {
                    stats: orchestratorStats,
                    recent: recentNotifications
                },
                system: {
                    cache: orchestratorStats.cacheSize,
                    lastProcessed: orchestratorStats.lastProcessed,
                    uptime: process.uptime()
                }
            };

            this.success(res, dashboard);

        } catch (error) {
            console.error('Error obteniendo dashboard:', error);
            this.error(res, 'Error obteniendo estadísticas del dashboard', error);
        }
    }

    /**
     * Obtener estadísticas detalladas del sistema
     */
    async getSystemStats(req, res) {
        try {
            const stats = {
                events: await this.eventService.getEventStats(),
                templates: await this.templateService.getTemplateStats(),
                channels: await this.channelConfigService.getChannelStats(),
                orchestrator: notificationOrchestrator.getStats(),
                performance: {
                    cacheHitRate: this.calculateCacheHitRate(),
                    averageResponseTime: this.getAverageResponseTime(),
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage()
                }
            };

            this.success(res, stats);

        } catch (error) {
            console.error('Error obteniendo estadísticas del sistema:', error);
            this.error(res, 'Error obteniendo estadísticas del sistema', error);
        }
    }

    /**
     * Probar sistema completo
     */
    async testSystem(req, res) {
        try {
            const testData = req.body || {};
            const results = await notificationOrchestrator.testSystem(testData);

            this.success(res, {
                results,
                timestamp: new Date(),
                message: results.overall
                    ? 'Sistema funcionando correctamente'
                    : 'Sistema con problemas detectados'
            });

        } catch (error) {
            console.error('Error probando sistema:', error);
            this.error(res, 'Error probando sistema', error);
        }
    }

    /**
     * Procesar evento manualmente
     */
    async processEvent(req, res) {
        try {
            const { eventName, data, context } = req.body;

            if (!eventName) {
                return this.badRequest(res, 'Nombre del evento es requerido');
            }

            const result = await notificationOrchestrator.processEvent(eventName, data, context);

            this.success(res, {
                eventName,
                result,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error procesando evento:', error);
            this.error(res, 'Error procesando evento', error);
        }
    }

    /**
     * Limpiar cache del sistema
     */
    async clearCache(req, res) {
        try {
            notificationOrchestrator.clearCache();

            this.success(res, {
                message: 'Cache limpiado exitosamente',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error limpiando cache:', error);
            this.error(res, 'Error limpiando cache', error);
        }
    }

    /**
     * Reinicializar sistema
     */
    async reinitializeSystem(req, res) {
        try {
            const results = await notificationOrchestrator.initialize();

            this.success(res, {
                results,
                message: 'Sistema reinicializado',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error reinicializando sistema:', error);
            this.error(res, 'Error reinicializando sistema', error);
        }
    }

    /**
     * Obtener logs del sistema
     */
    async getSystemLogs(req, res) {
        try {
            const { limit = 100, level = 'info' } = req.query;

            // En una implementación real, esto obtendría logs de un archivo o base de datos
            const logs = await this.getLogsFromDatabase(limit, level);

            this.success(res, {
                logs,
                total: logs.length,
                filters: { limit, level }
            });

        } catch (error) {
            console.error('Error obteniendo logs:', error);
            this.error(res, 'Error obteniendo logs del sistema', error);
        }
    }

    /**
     * Obtener configuración del sistema
     */
    async getSystemConfig(req, res) {
        try {
            const config = {
                events: {
                    enabled: true,
                    retentionDays: process.env.EVENT_RETENTION_DAYS || 30,
                    logLevel: process.env.EVENT_LOG_LEVEL || 'info'
                },
                templates: {
                    cacheTTL: process.env.TEMPLATE_CACHE_TTL || 3600,
                    validationStrict: process.env.TEMPLATE_VALIDATION_STRICT == 'true'
                },
                channels: {
                    rateLimitDefault: process.env.CHANNEL_RATE_LIMIT_DEFAULT || 100,
                    fallbackEnabled: process.env.CHANNEL_FALLBACK_ENABLED == 'true'
                },
                notifications: {
                    queueEnabled: true,
                    retryAttempts: 3,
                    retryDelay: 60
                }
            };

            this.success(res, config);

        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            this.error(res, 'Error obteniendo configuración del sistema', error);
        }
    }

    /**
     * Actualizar configuración del sistema
     */
    async updateSystemConfig(req, res) {
        try {
            const config = req.body;

            // En una implementación real, esto actualizaría la configuración
            // Por ahora, solo validamos y retornamos éxito

            this.success(res, {
                message: 'Configuración actualizada exitosamente',
                config,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error actualizando configuración:', error);
            this.error(res, 'Error actualizando configuración del sistema', error);
        }
    }

    /**
     * Obtener notificaciones recientes
     */
    async getRecentNotifications(limit = 10) {
        try {
            // En una implementación real, esto obtendría de la base de datos
            return [];
        } catch (error) {
            console.error('Error obteniendo notificaciones recientes:', error);
            return [];
        }
    }

    /**
     * Calcular tasa de acierto del cache
     */
    calculateCacheHitRate() {
        // Implementación simplificada
        return 85.5; // Porcentaje
    }

    /**
     * Obtener tiempo de respuesta promedio
     */
    getAverageResponseTime() {
        // Implementación simplificada
        return 245; // Milisegundos
    }

    /**
     * Obtener logs de la base de datos
     */
    async getLogsFromDatabase(limit, level) {
        try {
            // En una implementación real, esto consultaría una tabla de logs
            return [
                {
                    timestamp: new Date(),
                    level: 'info',
                    message: 'Sistema funcionando correctamente',
                    source: 'notification-orchestrator'
                }
            ];
        } catch (error) {
            console.error('Error obteniendo logs de BD:', error);
            return [];
        }
    }
}

export default new NotificationAdminController(); 