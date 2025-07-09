import NotificationService from '../services/notificationService.js';
import { Notification, NotificationConfig } from '../models/index.js';
import { Op } from 'sequelize';

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

            const result = await NotificationService.getUserNotifications(userId, {
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

            const notification = await NotificationService.markAsRead(id, userId);

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

            await NotificationService.markAllAsRead(userId);

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
            await NotificationService.createNotification(notification_type, {
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
            const result = await NotificationService.channels.push.registerPushToken(
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
                    result = await NotificationService.channels.whatsapp.handleDeliveryStatus(webhookData);
                    break;
                case 'sms':
                    result = await NotificationService.channels.sms.handleDeliveryStatus(webhookData);
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
}

export default new NotificationController(); 