import { Notification, NotificationConfig, NotificationChannel, NotificationType, NotificationQueue } from '../models/index.js';
import { User, Role, UserRole } from '../models/index.js';
import { Op } from 'sequelize';
import cron from 'node-cron';

// Importar servicios de canales
import EmailService from './channels/emailService.js';
import WhatsAppService from './channels/whatsappService.js';
import SMSService from './channels/smsService.js';
import InAppService from './channels/inAppService.js';
import PushService from './channels/pushService.js';

class NotificationService {
    constructor() {
        this.channels = {
            email: EmailService,
            whatsapp: WhatsAppService,
            sms: SMSService,
            in_app: InAppService,
            push: PushService
        };

        this.isProcessing = false;
        this.processingInterval = null;

        // Inicializar procesamiento automático
        this.startQueueProcessor();
    }

    /**
     * Crear y enviar notificación basada en tipo y evento
     * @param {string} notificationType - Tipo de notificación
     * @param {Object} data - Datos para la notificación
     * @param {Object} options - Opciones adicionales
     */
    async createNotification(notificationType, data, options = {}) {
        try {
            console.log(`📬 Creando notificación tipo: ${notificationType}`);

            // Obtener configuraciones para este tipo de notificación
            const configs = await NotificationConfig.findAll({
                where: { active: true },
                include: [
                    {
                        model: NotificationType,
                        as: 'type',
                        where: { name: notificationType }
                    },
                    {
                        model: NotificationChannel,
                        as: 'channel',
                        where: { active: true }
                    }
                ]
            });

            if (!configs.length) {
                console.warn(`⚠️ No hay configuraciones activas para: ${notificationType}`);
                return;
            }

            // Procesar cada configuración
            for (const config of configs) {
                await this.processNotificationConfig(config, data, options);
            }

        } catch (error) {
            console.error('❌ Error creando notificación:', error);
            throw error;
        }
    }

    /**
     * Procesar una configuración específica de notificación
     */
    async processNotificationConfig(config, data, options) {
        try {
            // Determinar destinatarios
            const recipients = await this.getRecipients(config, data, options);

            if (!recipients.length) {
                console.warn(`⚠️ No hay destinatarios para configuración: ${config.name}`);
                return;
            }

            // Crear notificaciones para cada destinatario
            for (const recipient of recipients) {
                await this.createNotificationForRecipient(config, data, recipient, options);
            }

        } catch (error) {
            console.error('❌ Error procesando configuración:', error);
        }
    }

    /**
     * Crear notificación para un destinatario específico
     */
    async createNotificationForRecipient(config, data, recipient, options) {
        try {
            // Procesar plantillas
            const title = this.processTemplate(config.template_title, data);
            const content = this.processTemplate(config.template_content, data);

            // Determinar cuándo enviar
            const scheduledAt = this.calculateScheduledTime(config, options);

            // Crear registro de notificación
            const notification = await Notification.create({
                notification_config_id: config.id,
                inspection_order_id: data.inspection_order_id || null,
                appointment_id: data.appointment_id || null,
                recipient_type: recipient.type,
                recipient_user_id: recipient.user_id || null,
                recipient_email: recipient.email || null,
                recipient_phone: recipient.phone || null,
                recipient_name: recipient.name || null,
                title,
                content,
                priority: config.priority,
                scheduled_at: scheduledAt,
                status: scheduledAt > new Date() ? 'scheduled' : 'pending',
                max_retries: config.retry_attempts,
                metadata: {
                    channel: config.channel.name,
                    original_data: data,
                    config_id: config.id
                }
            });

            // Si es inmediata, enviar ahora
            if (config.schedule_type === 'immediate') {
                await this.sendNotification(notification);
            } else {
                // Agregar a cola de procesamiento
                await this.addToQueue(notification, scheduledAt);
            }

            console.log(`✅ Notificación creada: ${notification.id} para ${recipient.name}`);

        } catch (error) {
            console.error('❌ Error creando notificación individual:', error);
        }
    }

    /**
     * Obtener destinatarios basado en configuración
     */
    async getRecipients(config, data, options) {
        const recipients = [];

        try {
            // Destinatarios por roles
            if (config.target_roles && config.target_roles.length > 0) {
                const users = await User.findAll({
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            where: { name: { [Op.in]: config.target_roles } },
                            through: { attributes: [] }
                        }
                    ],
                    where: { is_active: true }
                });

                for (const user of users) {
                    recipients.push({
                        type: 'user',
                        user_id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || null
                    });
                }
            }

            // Destinatarios específicos por ID
            if (config.target_users && config.target_users.length > 0) {
                const users = await User.findAll({
                    where: {
                        id: { [Op.in]: config.target_users },
                        is_active: true
                    }
                });

                for (const user of users) {
                    recipients.push({
                        type: 'user',
                        user_id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || null
                    });
                }
            }

            // Destinatario específico pasado en options
            if (options.recipient_user_id) {
                const user = await User.findByPk(options.recipient_user_id);
                if (user) {
                    recipients.push({
                        type: 'user',
                        user_id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || null
                    });
                }
            }

            // Destinatarios clientes (desde datos de la orden)
            if (config.for_clients && data.client) {
                recipients.push({
                    type: 'client',
                    name: data.client.name,
                    email: data.client.email,
                    phone: data.client.phone
                });
            }

            return recipients;

        } catch (error) {
            console.error('❌ Error obteniendo destinatarios:', error);
            return [];
        }
    }

    /**
     * Procesar plantillas reemplazando variables
     */
    processTemplate(template, data) {
        let processed = template;

        // Reemplazar variables {{variable}}
        const variables = template.match(/\{\{([^}]+)\}\}/g);

        if (variables) {
            for (const variable of variables) {
                const key = variable.replace(/[{}]/g, '');
                const value = this.getNestedValue(data, key) || '';
                processed = processed.replace(variable, value);
            }
        }

        return processed;
    }

    /**
     * Obtener valor anidado de objeto usando notación de punto
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Calcular tiempo programado para envío
     */
    calculateScheduledTime(config, options) {
        const now = new Date();

        if (config.schedule_type === 'immediate') {
            return now;
        }

        if (config.schedule_type === 'delayed' && config.schedule_delay_minutes) {
            return new Date(now.getTime() + (config.schedule_delay_minutes * 60 * 1000));
        }

        if (options.scheduled_at) {
            return new Date(options.scheduled_at);
        }

        return now;
    }

    /**
     * Enviar notificación usando el canal apropiado
     */
    async sendNotification(notification) {
        try {
            const channelName = notification.metadata?.channel;
            const channel = this.channels[channelName];

            if (!channel) {
                throw new Error(`Canal no soportado: ${channelName}`);
            }

            // Actualizar estado
            await notification.update({
                status: 'sending',
                retry_count: notification.retry_count + 1
            });

            // Enviar usando el canal específico
            const result = await channel.send(notification);

            // Actualizar con resultado exitoso
            await notification.update({
                status: result.delivered ? 'delivered' : 'sent',
                sent_at: new Date(),
                delivered_at: result.delivered ? new Date() : null,
                external_id: result.external_id,
                external_response: result.response,
                websocket_delivered: result.websocket_delivered || false
            });

            console.log(`✅ Notificación enviada: ${notification.id} via ${channelName}`);
            return result;

        } catch (error) {
            console.error(`❌ Error enviando notificación ${notification.id}:`, error);

            // Actualizar con error
            await notification.update({
                status: 'failed',
                failed_at: new Date(),
                error_message: error.message
            });

            // Programar reintento si corresponde
            if (notification.retry_count < notification.max_retries) {
                await this.scheduleRetry(notification);
            }

            throw error;
        }
    }

    /**
     * Agregar notificación a cola de procesamiento
     */
    async addToQueue(notification, scheduledAt) {
        await NotificationQueue.create({
            notification_id: notification.id,
            scheduled_at: scheduledAt,
            priority: notification.priority
        });
    }

    /**
     * Programar reintento de notificación fallida
     */
    async scheduleRetry(notification) {
        const retryDelay = Math.pow(2, notification.retry_count) * 60 * 1000; // Exponential backoff
        const nextAttempt = new Date(Date.now() + retryDelay);

        await NotificationQueue.create({
            notification_id: notification.id,
            scheduled_at: nextAttempt,
            priority: notification.priority,
            attempts: notification.retry_count
        });
    }

    /**
     * Iniciar procesador de cola automático
     */
    startQueueProcessor() {
        // Procesar cada minuto
        this.processingInterval = cron.schedule('* * * * *', async () => {
            if (!this.isProcessing) {
                await this.processQueue();
            }
        });

        console.log('🔄 Procesador de cola de notificaciones iniciado');
    }

    /**
     * Procesar cola de notificaciones pendientes
     */
    async processQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            const now = new Date();

            // Obtener notificaciones pendientes
            const queueItems = await NotificationQueue.findAll({
                where: {
                    status: 'pending',
                    scheduled_at: { [Op.lte]: now }
                },
                include: [
                    {
                        model: Notification,
                        as: 'notification'
                    }
                ],
                order: [['priority', 'DESC'], ['scheduled_at', 'ASC']],
                limit: 10 // Procesar máximo 10 por vez
            });

            for (const queueItem of queueItems) {
                try {
                    await queueItem.update({ status: 'processing' });
                    await this.sendNotification(queueItem.notification);
                    await queueItem.update({
                        status: 'completed',
                        processed_at: new Date()
                    });
                } catch (error) {
                    await queueItem.update({
                        status: 'failed',
                        failed_at: new Date(),
                        error_message: error.message,
                        attempts: queueItem.attempts + 1
                    });
                }
            }

        } catch (error) {
            console.error('❌ Error procesando cola:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Obtener notificaciones para un usuario
     */
    async getUserNotifications(userId, options = {}) {
        const { limit = 20, offset = 0, unreadOnly = false } = options;

        const whereConditions = {
            recipient_user_id: userId,
            recipient_type: 'user'
        };

        if (unreadOnly) {
            whereConditions.read_at = null;
        }

        return await Notification.findAndCountAll({
            where: whereConditions,
            order: [['created_at', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: NotificationConfig,
                    as: 'config',
                    include: [
                        {
                            model: NotificationType,
                            as: 'type'
                        },
                        {
                            model: NotificationChannel,
                            as: 'channel',
                            where: { name: 'in_app' } // Solo notificaciones in_app
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Marcar notificación como leída
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            where: {
                id: notificationId,
                recipient_user_id: userId
            }
        });

        if (notification && !notification.read_at) {
            await notification.update({
                status: 'read',
                read_at: new Date()
            });
        }

        return notification;
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    async markAllAsRead(userId) {
        await Notification.update(
            {
                status: 'read',
                read_at: new Date()
            },
            {
                where: {
                    recipient_user_id: userId,
                    read_at: null
                }
            }
        );
    }
}

export default new NotificationService(); 