import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import notificationService from '../services/notificationService.js';
import { Notification, NotificationConfig, NotificationType, NotificationChannel } from '../models/index.js';

class NotificationController {
    constructor() {
        this.getUserNotifications = this.getUserNotifications.bind(this);
        this.markAsRead = this.markAsRead.bind(this);
        this.markAllAsRead = this.markAllAsRead.bind(this);
        this.getUnreadCount = this.getUnreadCount.bind(this);
        this.getStats = this.getStats.bind(this);
        this.createNotification = this.createNotification.bind(this);
        this.registerPushToken = this.registerPushToken.bind(this);
        this.handleDeliveryWebhook = this.handleDeliveryWebhook.bind(this);
        this.formatTimeAgo = this.formatTimeAgo.bind(this);
        
        // Métodos de administración
        this.getAdminConfig = this.getAdminConfig.bind(this);
        this.updateAdminConfig = this.updateAdminConfig.bind(this);
        this.getNotificationTypes = this.getNotificationTypes.bind(this);
        this.createNotificationType = this.createNotificationType.bind(this);
        this.updateNotificationType = this.updateNotificationType.bind(this);
        this.deleteNotificationType = this.deleteNotificationType.bind(this);
        this.getNotificationChannels = this.getNotificationChannels.bind(this);
        this.createNotificationChannel = this.createNotificationChannel.bind(this);
        this.updateNotificationChannel = this.updateNotificationChannel.bind(this);
        this.deleteNotificationChannel = this.deleteNotificationChannel.bind(this);
        this.getNotificationConfigs = this.getNotificationConfigs.bind(this);
        this.createNotificationConfig = this.createNotificationConfig.bind(this);
        this.updateNotificationConfig = this.updateNotificationConfig.bind(this);
        this.deleteNotificationConfig = this.deleteNotificationConfig.bind(this);
        this.getAdminStats = this.getAdminStats.bind(this);
        this.getNotificationLogs = this.getNotificationLogs.bind(this);
        this.testNotification = this.testNotification.bind(this);
    }

    /**
     * Obtener notificaciones del usuario actual
     */
    async getUserNotifications(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 20,
                unread_only = false
            } = req.query;

            const offset = (page - 1) * limit;

            const result = await notificationService.getUserNotifications(userId, {
                limit: parseInt(limit),
                offset: parseInt(offset),
                unreadOnly: unread_only === 'true'
            });

            // Formatear notificaciones para el frontend
            const formattedNotifications = result.rows.map(notification => ({
                id: notification.id,
                title: notification.title,
                description: notification.content,
                type: notification.config?.type?.name || 'general',
                priority: notification.priority,
                read: !!notification.read_at,
                time: this.formatTimeAgo(notification.created_at),
                timestamp: notification.created_at,
                metadata: notification.metadata
            }));

            res.json({
                success: true,
                data: {
                    notifications: formattedNotifications,
                    pagination: {
                        total: result.count,
                        page: parseInt(page),
                        pages: Math.ceil(result.count / parseInt(limit)),
                        limit: parseInt(limit),
                        unread_count: await this.getUnreadCount(userId)
                    }
                }
            });

        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener notificaciones',
                error: error.message
            });
        }
    }

    /**
     * Marcar notificación como leída
     */
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const notification = await notificationService.markAsRead(id, userId);

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notificación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Notificación marcada como leída',
                data: notification
            });

        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            res.status(500).json({
                success: false,
                message: 'Error al marcar notificación como leída',
                error: error.message
            });
        }
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;

            await notificationService.markAllAsRead(userId);

            res.json({
                success: true,
                message: 'Todas las notificaciones marcadas como leídas'
            });

        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al marcar todas las notificaciones como leídas',
                error: error.message
            });
        }
    }

    /**
     * Obtener conteo de notificaciones no leídas
     */
    async getUnreadCount(userId) {
        try {
            const count = await Notification.count({
                where: {
                    recipient_user_id: userId,
                    read_at: null
                }
            });
            return count;
        } catch (error) {
            console.error('Error obteniendo conteo no leídas:', error);
            return 0;
        }
    }

    /**
     * Obtener estadísticas de notificaciones
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const { date_from, date_to } = req.query;

            const whereConditions = { recipient_user_id: userId };

            if (date_from || date_to) {
                whereConditions.created_at = {};
                if (date_from) {
                    whereConditions.created_at[Op.gte] = new Date(date_from);
                }
                if (date_to) {
                    whereConditions.created_at[Op.lte] = new Date(date_to);
                }
            }

            const [total, unread, read] = await Promise.all([
                Notification.count({ where: whereConditions }),
                Notification.count({
                    where: { ...whereConditions, read_at: null }
                }),
                Notification.count({
                    where: { ...whereConditions, read_at: { [Op.not]: null } }
                })
            ]);

            res.json({
                success: true,
                data: {
                    total,
                    unread,
                    read,
                    read_percentage: total > 0 ? Math.round((read / total) * 100) : 0
                }
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    /**
     * Crear notificación manual (admin)
     */
    async createNotification(req, res) {
        try {
            const {
                notification_type,
                recipient_user_id,
                title,
                content,
                priority = 'normal',
                scheduled_at
            } = req.body;

            // Validaciones básicas
            if (!notification_type || !title || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de notificación, título y contenido son requeridos'
                });
            }

            // Crear notificación usando el servicio
            await notificationService.createNotification(notification_type, {
                custom_title: title,
                custom_content: content,
                custom_priority: priority
            }, {
                recipient_user_id,
                scheduled_at
            });

            res.json({
                success: true,
                message: 'Notificación creada exitosamente'
            });

        } catch (error) {
            console.error('Error creando notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear notificación',
                error: error.message
            });
        }
    }

    /**
     * Registrar token de push
     */
    async registerPushToken(req, res) {
        try {
            const { token, device_info } = req.body;
            const userId = req.user.id;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token de push es requerido'
                });
            }

            // TODO: Almacenar token en base de datos
            // Por ahora solo validamos y registramos en el servicio
            const result = await notificationService.channels.push.registerPushToken(
                userId,
                token,
                device_info
            );

            res.json({
                success: true,
                message: 'Token de push registrado exitosamente',
                data: result
            });

        } catch (error) {
            console.error('Error registrando token push:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar token de push',
                error: error.message
            });
        }
    }

    /**
     * Formatear tiempo relativo (hace X tiempo)
     */
    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        if (diffInSeconds < 60) {
            return 'Hace unos segundos';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        }

        return new Date(date).toLocaleDateString('es-ES');
    }

    /**
     * Webhook para estados de entrega (WhatsApp, SMS, etc.)
     */
    async handleDeliveryWebhook(req, res) {
        try {
            const { channel } = req.params;
            const webhookData = req.body;

            console.log(`📨 Webhook recibido para canal ${channel}:`, webhookData);

            // Procesar según el canal
            let result;
            switch (channel) {
                case 'whatsapp':
                    result = await notificationService.channels.whatsapp.handleDeliveryStatus(webhookData);
                    break;
                case 'sms':
                    result = await notificationService.channels.sms.handleDeliveryStatus(webhookData);
                    break;
                default:
                    console.warn(`Canal no soportado para webhook: ${channel}`);
                    return res.status(400).json({
                        success: false,
                        message: 'Canal no soportado'
                    });
            }

            // TODO: Actualizar estado en base de datos

            res.json({
                success: true,
                message: 'Webhook procesado exitosamente',
                data: result
            });

        } catch (error) {
            console.error('Error procesando webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error procesando webhook',
                error: error.message
            });
        }
    }

    // ===== MÉTODOS DE ADMINISTRACIÓN =====

    /**
     * Obtener configuración general del sistema de notificaciones
     */
    async getAdminConfig(req, res) {
        try {
            const config = {
                email: {
                    enabled: !!process.env.EMAIL_HOST,
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: process.env.EMAIL_SECURE === 'true',
                    from: process.env.EMAIL_FROM,
                    fromName: process.env.EMAIL_FROM_NAME
                },
                sms: {
                    enabled: !!process.env.HABLAME_KEY,
                    provider: 'hablame',
                    from: process.env.SMS_FROM
                },
                whatsapp: {
                    enabled: false, // TODO: Implementar
                    provider: null
                },
                push: {
                    enabled: false, // TODO: Implementar
                    provider: null
                }
            };

            res.json({
                success: true,
                data: config
            });

        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener configuración',
                error: error.message
            });
        }
    }

    /**
     * Actualizar configuración general del sistema de notificaciones
     */
    async updateAdminConfig(req, res) {
        try {
            const { email, sms, whatsapp, push } = req.body;

            // TODO: Implementar actualización de configuración
            // Por ahora solo validamos y retornamos éxito

            res.json({
                success: true,
                message: 'Configuración actualizada correctamente',
                data: { email, sms, whatsapp, push }
            });

        } catch (error) {
            console.error('Error actualizando configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar configuración',
                error: error.message
            });
        }
    }

    /**
     * Obtener tipos de notificación
     */
    async getNotificationTypes(req, res) {
        try {
            const { NotificationType } = await import('../models/index.js');
            
            const types = await NotificationType.findAll({
                order: [['name', 'ASC']]
            });

            res.json({
                success: true,
                data: types
            });

        } catch (error) {
            console.error('Error obteniendo tipos de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tipos de notificación',
                error: error.message
            });
        }
    }

    /**
     * Crear tipo de notificación
     */
    async createNotificationType(req, res) {
        try {
            const { NotificationType } = await import('../models/index.js');
            const { name, description, template_title, template_content, variables } = req.body;

            const type = await NotificationType.create({
                name,
                description,
                template_title,
                template_content,
                variables: variables || []
            });

            res.json({
                success: true,
                message: 'Tipo de notificación creado correctamente',
                data: type
            });

        } catch (error) {
            console.error('Error creando tipo de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear tipo de notificación',
                error: error.message
            });
        }
    }

    /**
     * Actualizar tipo de notificación
     */
    async updateNotificationType(req, res) {
        try {
            const { NotificationType } = await import('../models/index.js');
            const { id } = req.params;
            const updateData = req.body;

            const type = await NotificationType.findByPk(id);
            if (!type) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de notificación no encontrado'
                });
            }

            await type.update(updateData);

            res.json({
                success: true,
                message: 'Tipo de notificación actualizado correctamente',
                data: type
            });

        } catch (error) {
            console.error('Error actualizando tipo de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar tipo de notificación',
                error: error.message
            });
        }
    }

    /**
     * Eliminar tipo de notificación
     */
    async deleteNotificationType(req, res) {
        try {
            const { NotificationType } = await import('../models/index.js');
            const { id } = req.params;

            const type = await NotificationType.findByPk(id);
            if (!type) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de notificación no encontrado'
                });
            }

            await type.destroy();

            res.json({
                success: true,
                message: 'Tipo de notificación eliminado correctamente'
            });

        } catch (error) {
            console.error('Error eliminando tipo de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar tipo de notificación',
                error: error.message
            });
        }
    }

    /**
     * Obtener canales de notificación
     */
    async getNotificationChannels(req, res) {
        try {
            const { NotificationChannel } = await import('../models/index.js');
            
            const channels = await NotificationChannel.findAll({
                order: [['name', 'ASC']]
            });

            res.json({
                success: true,
                data: channels
            });

        } catch (error) {
            console.error('Error obteniendo canales de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener canales de notificación',
                error: error.message
            });
        }
    }

    /**
     * Crear canal de notificación
     */
    async createNotificationChannel(req, res) {
        try {
            const { NotificationChannel } = await import('../models/index.js');
            const { name, description, provider, config } = req.body;

            const channel = await NotificationChannel.create({
                name,
                description,
                provider,
                config: config || {}
            });

            res.json({
                success: true,
                message: 'Canal de notificación creado correctamente',
                data: channel
            });

        } catch (error) {
            console.error('Error creando canal de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear canal de notificación',
                error: error.message
            });
        }
    }

    /**
     * Actualizar canal de notificación
     */
    async updateNotificationChannel(req, res) {
        try {
            const { NotificationChannel } = await import('../models/index.js');
            const { id } = req.params;
            const updateData = req.body;

            const channel = await NotificationChannel.findByPk(id);
            if (!channel) {
                return res.status(404).json({
                    success: false,
                    message: 'Canal de notificación no encontrado'
                });
            }

            await channel.update(updateData);

            res.json({
                success: true,
                message: 'Canal de notificación actualizado correctamente',
                data: channel
            });

        } catch (error) {
            console.error('Error actualizando canal de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar canal de notificación',
                error: error.message
            });
        }
    }

    /**
     * Eliminar canal de notificación
     */
    async deleteNotificationChannel(req, res) {
        try {
            const { NotificationChannel } = await import('../models/index.js');
            const { id } = req.params;

            const channel = await NotificationChannel.findByPk(id);
            if (!channel) {
                return res.status(404).json({
                    success: false,
                    message: 'Canal de notificación no encontrado'
                });
            }

            await channel.destroy();

            res.json({
                success: true,
                message: 'Canal de notificación eliminado correctamente'
            });

        } catch (error) {
            console.error('Error eliminando canal de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar canal de notificación',
                error: error.message
            });
        }
    }

    /**
     * Obtener configuraciones de notificación
     */
    async getNotificationConfigs(req, res) {
        try {
            const { NotificationConfig, NotificationType, NotificationChannel } = await import('../models/index.js');
            
            const configs = await NotificationConfig.findAll({
                include: [
                    {
                        model: NotificationType,
                        as: 'type',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: NotificationChannel,
                        as: 'channel',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                order: [['notification_type_id', 'ASC'], ['notification_channel_id', 'ASC']]
            });

            res.json({
                success: true,
                data: configs
            });

        } catch (error) {
            console.error('Error obteniendo configuraciones de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener configuraciones de notificación',
                error: error.message
            });
        }
    }

    /**
     * Crear configuración de notificación
     */
    async createNotificationConfig(req, res) {
        try {
            const { NotificationConfig } = await import('../models/index.js');
            const { 
                notification_type_id, 
                notification_channel_id, 
                name,
                template_title,
                template_content,
                template_variables,
                target_roles,
                target_users,
                for_clients,
                for_users,
                trigger_conditions,
                schedule_type,
                schedule_delay_minutes,
                schedule_cron,
                priority,
                retry_attempts,
                active
            } = req.body;

            const config = await NotificationConfig.create({
                notification_type_id,
                notification_channel_id,
                name: name || `Configuración ${notification_type_id}-${notification_channel_id}`,
                template_title: template_title || 'Notificación del sistema',
                template_content: template_content || 'Has recibido una notificación del sistema',
                template_variables: template_variables || {},
                target_roles: target_roles || [],
                target_users: target_users || [],
                for_clients: for_clients || false,
                for_users: for_users || true,
                trigger_conditions: trigger_conditions || {},
                schedule_type: schedule_type || 'immediate',
                schedule_delay_minutes: schedule_delay_minutes || null,
                schedule_cron: schedule_cron || null,
                priority: priority || 'normal',
                retry_attempts: retry_attempts || 3,
                active: active !== false
            });

            res.json({
                success: true,
                message: 'Configuración de notificación creada correctamente',
                data: config
            });

        } catch (error) {
            console.error('Error creando configuración de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear configuración de notificación',
                error: error.message
            });
        }
    }

    /**
     * Actualizar configuración de notificación
     */
    async updateNotificationConfig(req, res) {
        try {
            const { NotificationConfig } = await import('../models/index.js');
            const { id } = req.params;
            const updateData = req.body;

            const config = await NotificationConfig.findByPk(id);
            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuración de notificación no encontrada'
                });
            }

            await config.update(updateData);

            res.json({
                success: true,
                message: 'Configuración de notificación actualizada correctamente',
                data: config
            });

        } catch (error) {
            console.error('Error actualizando configuración de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar configuración de notificación',
                error: error.message
            });
        }
    }

    /**
     * Eliminar configuración de notificación
     */
    async deleteNotificationConfig(req, res) {
        try {
            const { NotificationConfig } = await import('../models/index.js');
            const { id } = req.params;

            const config = await NotificationConfig.findByPk(id);
            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuración de notificación no encontrada'
                });
            }

            await config.destroy();

            res.json({
                success: true,
                message: 'Configuración de notificación eliminada correctamente'
            });

        } catch (error) {
            console.error('Error eliminando configuración de notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar configuración de notificación',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de administración
     */
    async getAdminStats(req, res) {
        try {
            const { Notification, NotificationConfig } = await import('../models/index.js');
            const { Op } = await import('sequelize');

            // Estadísticas generales
            const totalNotifications = await Notification.count();
            const todayNotifications = await Notification.count({
                where: {
                    created_at: {
                        [Op.gte]: new Date().setHours(0, 0, 0, 0)
                    }
                }
            });

            // Estadísticas por canal
            const channelStats = await Notification.findAll({
                attributes: [
                    'channel',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN delivered = 1 THEN 1 END')), 'delivered'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN failed = 1 THEN 1 END')), 'failed']
                ],
                group: ['channel']
            });

            // Configuraciones activas
            const activeConfigs = await NotificationConfig.count({
                where: { enabled: true }
            });

            res.json({
                success: true,
                data: {
                    total: totalNotifications,
                    today: todayNotifications,
                    channels: channelStats,
                    active_configs: activeConfigs
                }
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    /**
     * Obtener logs de notificaciones
     */
    async getNotificationLogs(req, res) {
        try {
            const { Notification } = await import('../models/index.js');
            const { page = 1, limit = 50, channel, status } = req.query;

            const where = {};
            if (channel) where.channel = channel;
            if (status) where.status = status;

            const offset = (page - 1) * limit;

            const logs = await Notification.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: {
                    logs: logs.rows,
                    pagination: {
                        total: logs.count,
                        page: parseInt(page),
                        pages: Math.ceil(logs.count / parseInt(limit)),
                        limit: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Error obteniendo logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs',
                error: error.message
            });
        }
    }

    /**
     * Probar notificación
     */
    async testNotification(req, res) {
        try {
            const { type, channel, recipient, data } = req.body;

            const result = await notificationService.createNotification(type, {
                ...data,
                test_recipient: recipient
            });

            res.json({
                success: true,
                message: 'Notificación de prueba enviada correctamente',
                data: result
            });

        } catch (error) {
            console.error('Error enviando notificación de prueba:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar notificación de prueba',
                error: error.message
            });
        }
    }
}

export default new NotificationController(); 