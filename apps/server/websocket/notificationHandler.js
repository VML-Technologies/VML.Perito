import socketManager from './socketManager.js';

class NotificationHandler {
    constructor() {
        this.notificationTypes = new Map();
        this.registerDefaultNotifications();
    }

    /**
     * Registrar tipos de notificaciones
     */
    registerNotificationType(type, config) {
        this.notificationTypes.set(type, {
            ...config,
            createdAt: new Date()
        });
        console.log(`📢 Tipo de notificación registrado: ${type}`);
    }

    /**
     * Enviar notificación a un usuario específico
     */
    async sendToUser(userId, notification) {
        const notificationData = this.formatNotification(notification);

        // Enviar por WebSocket si está conectado
        const sent = socketManager.sendToUser(userId, 'notification', notificationData);

        // Aquí podrías agregar lógica para guardar en BD si el usuario no está conectado
        if (!sent) {
            console.log(`📨 Usuario ${userId} no conectado, notificación guardada para entrega posterior`);
            // TODO: Implementar cola de notificaciones persistente
        }

        return sent;
    }

    /**
     * Enviar notificación a todos los usuarios con un rol específico
     */
    async sendToRole(roleName, notification) {
        const notificationData = this.formatNotification(notification);
        socketManager.sendToRole(roleName, 'notification', notificationData);
        console.log(`📢 Notificación enviada al rol: ${roleName}`);
    }

    /**
     * Enviar notificación broadcast a todos los usuarios conectados
     */
    async broadcast(notification) {
        const notificationData = this.formatNotification(notification);
        socketManager.broadcast('notification', notificationData);
        console.log(`📢 Notificación broadcast enviada`);
    }

    /**
     * Enviar notificación a una sala específica
     */
    async sendToRoom(roomName, notification) {
        const notificationData = this.formatNotification(notification);
        socketManager.sendToRoom(roomName, 'notification', notificationData);
        console.log(`📢 Notificación enviada a la sala: ${roomName}`);
    }

    /**
     * Formatear notificación con estructura estándar
     */
    formatNotification(notification) {
        const typeConfig = this.notificationTypes.get(notification.type);

        return {
            id: notification.id || this.generateNotificationId(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data || {},
            priority: notification.priority || 'normal', // low, normal, high, urgent
            category: notification.category || 'general',
            timestamp: new Date().toISOString(),
            expiresAt: notification.expiresAt || null,
            actions: notification.actions || [],
            icon: typeConfig?.icon || 'bell',
            color: typeConfig?.color || '#3b82f6',
            sound: typeConfig?.sound || false,
            persistent: notification.persistent || false
        };
    }

    /**
     * Generar ID único para notificación
     */
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Registrar eventos de notificaciones en el socket manager
     */
    registerSocketEvents() {
        const events = {
            // Marcar notificación como leída
            'notification_read': async (socket, data) => {
                const { notificationId } = data;
                console.log(`📖 Usuario ${socket.userId} marcó como leída la notificación: ${notificationId}`);

                // Aquí podrías actualizar el estado en BD
                socket.emit('notification_read_confirmed', { notificationId });
            },

            // Marcar todas las notificaciones como leídas
            'notifications_read_all': async (socket, data) => {
                console.log(`📖 Usuario ${socket.userId} marcó todas las notificaciones como leídas`);

                // Aquí podrías actualizar el estado en BD
                socket.emit('notifications_read_all_confirmed', { timestamp: new Date().toISOString() });
            },

            // Obtener notificaciones pendientes
            'get_pending_notifications': async (socket, data) => {
                // Aquí podrías consultar BD para notificaciones pendientes
                const pendingNotifications = []; // TODO: Implementar consulta a BD

                socket.emit('pending_notifications', pendingNotifications);
            },

            // Configurar preferencias de notificaciones
            'set_notification_preferences': async (socket, data) => {
                const { preferences } = data;
                console.log(`⚙️ Usuario ${socket.userId} actualizó preferencias de notificaciones`);

                // Aquí podrías guardar las preferencias en BD
                socket.emit('notification_preferences_updated', { preferences });
            }
        };

        socketManager.registerEventHandlers(events);
    }

    /**
     * Registrar tipos de notificaciones por defecto
     */
    registerDefaultNotifications() {
        // Notificaciones del sistema
        this.registerNotificationType('system', {
            icon: 'settings',
            color: '#6b7280',
            sound: false,
            description: 'Notificaciones del sistema'
        });

        // Notificaciones de usuario
        this.registerNotificationType('user', {
            icon: 'user',
            color: '#3b82f6',
            sound: true,
            description: 'Notificaciones relacionadas con usuarios'
        });

        // Notificaciones de seguridad
        this.registerNotificationType('security', {
            icon: 'shield',
            color: '#ef4444',
            sound: true,
            description: 'Notificaciones de seguridad'
        });

        // Notificaciones de documentos
        this.registerNotificationType('document', {
            icon: 'file-text',
            color: '#10b981',
            sound: false,
            description: 'Notificaciones de documentos'
        });

        // Notificaciones de roles y permisos
        this.registerNotificationType('rbac', {
            icon: 'key',
            color: '#f59e0b',
            sound: false,
            description: 'Notificaciones de roles y permisos'
        });
    }

    /**
     * Métodos de conveniencia para tipos específicos de notificaciones
     */

    // Notificación de bienvenida
    async sendWelcomeNotification(userId, userName) {
        return this.sendToUser(userId, {
            type: 'system',
            title: 'Bienvenido',
            message: `¡Hola ${userName}! Bienvenido al sistema.`,
            priority: 'normal',
            category: 'welcome'
        });
    }

    // Notificación de nuevo usuario
    async sendNewUserNotification(newUserName) {
        return this.sendToRole('super_admin', {
            type: 'user',
            title: 'Nuevo usuario registrado',
            message: `${newUserName} se ha registrado en el sistema.`,
            priority: 'normal',
            category: 'user_management'
        });
    }

    // Notificación de cambio de permisos
    async sendPermissionChangeNotification(userId, changes) {
        return this.sendToUser(userId, {
            type: 'rbac',
            title: 'Permisos actualizados',
            message: 'Tus permisos han sido actualizados.',
            data: { changes },
            priority: 'high',
            category: 'permissions'
        });
    }

    // Notificación de documento
    async sendDocumentNotification(userId, documentName, action) {
        return this.sendToUser(userId, {
            type: 'document',
            title: `Documento ${action}`,
            message: `El documento "${documentName}" ha sido ${action}.`,
            priority: 'normal',
            category: 'documents'
        });
    }

    // Notificación de seguridad
    async sendSecurityNotification(userId, event) {
        return this.sendToUser(userId, {
            type: 'security',
            title: 'Alerta de seguridad',
            message: event.message,
            data: event.data,
            priority: 'urgent',
            category: 'security',
            persistent: true
        });
    }
}

export default new NotificationHandler(); 