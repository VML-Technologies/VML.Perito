import socketManager from './socketManager.js';
import notificationHandler from './notificationHandler.js';
import realtimeHandler from './realtimeHandler.js';

class WebSocketSystem {
    constructor() {
        this.initialized = false;
        this.server = null;
        this.io = null;
    }

    /**
     * Inicializar todo el sistema de WebSockets
     */
    async initialize(server) {
        if (this.initialized) {
            console.log('⚠️  Sistema de WebSockets ya inicializado');
            return this.io;
        }

        try {
            console.log('🚀 Inicializando sistema de WebSockets...');

            // Inicializar Socket Manager
            this.io = socketManager.initialize(server);
            this.server = server;

            // Registrar eventos de notificaciones
            notificationHandler.registerSocketEvents();

            // Registrar eventos de tiempo real
            realtimeHandler.registerSocketEvents();

            // Registrar eventos personalizados adicionales
            this.registerCustomEvents();

            this.initialized = true;
            console.log('✅ Sistema de WebSockets completamente inicializado');

            return this.io;
        } catch (error) {
            console.error('❌ Error inicializando sistema de WebSockets:', error);
            throw error;
        }
    }

    /**
     * Registrar eventos personalizados adicionales
     */
    registerCustomEvents() {
        const customEvents = {
            // Evento para obtener estadísticas del sistema
            'get_system_stats': async (socket, data) => {
                if (socket.userPermissions.includes('system.read')) {
                    const stats = {
                        websocket: socketManager.getStats(),
                        realtime: realtimeHandler.getRealtimeStats(),
                        server: {
                            uptime: process.uptime(),
                            memory: process.memoryUsage(),
                            timestamp: new Date().toISOString()
                        }
                    };
                    socket.emit('system_stats', stats);
                } else {
                    socket.emit('error', { message: 'Sin permisos para ver estadísticas del sistema' });
                }
            },

            // Evento para enviar mensaje a administradores
            'send_admin_message': async (socket, data) => {
                const { message, priority = 'normal' } = data;

                if (socket.userPermissions.includes('admin.notify')) {
                    await notificationHandler.sendToRole('super_admin', {
                        type: 'system',
                        title: 'Mensaje de usuario',
                        message: `${socket.user.name}: ${message}`,
                        priority,
                        category: 'user_message',
                        data: {
                            fromUser: socket.user.name,
                            fromUserId: socket.userId,
                            originalMessage: message
                        }
                    });
                    socket.emit('admin_message_sent', { timestamp: new Date().toISOString() });
                } else {
                    socket.emit('error', { message: 'Sin permisos para enviar mensajes a administradores' });
                }
            },

            // Evento para broadcast de mantenimiento
            'broadcast_maintenance': async (socket, data) => {
                const { message, scheduledTime, duration } = data;

                if (socket.userRoles.includes('super_admin')) {
                    await notificationHandler.broadcast({
                        type: 'system',
                        title: 'Mantenimiento programado',
                        message,
                        priority: 'high',
                        category: 'maintenance',
                        data: {
                            scheduledTime,
                            duration,
                            announcedBy: socket.user.name
                        },
                        persistent: true
                    });
                    socket.emit('maintenance_broadcast_sent', { timestamp: new Date().toISOString() });
                } else {
                    socket.emit('error', { message: 'Solo administradores pueden enviar avisos de mantenimiento' });
                }
            },

            // Evento para test de conectividad
            'test_connection': async (socket, data) => {
                const testData = {
                    userId: socket.userId,
                    userName: socket.user.name,
                    timestamp: new Date().toISOString(),
                    echo: data
                };
                socket.emit('connection_test_result', testData);
            }
        };

        socketManager.registerEventHandlers(customEvents);
    }

    /**
     * Obtener instancia del Socket Manager
     */
    getSocketManager() {
        return socketManager;
    }

    /**
     * Obtener instancia del Notification Handler
     */
    getNotificationHandler() {
        return notificationHandler;
    }

    /**
     * Obtener instancia del Realtime Handler
     */
    getRealtimeHandler() {
        return realtimeHandler;
    }

    /**
     * Obtener instancia de Socket.IO
     */
    getIO() {
        return this.io;
    }

    /**
     * Verificar si el sistema está inicializado
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Cerrar el sistema de WebSockets
     */
    async close() {
        if (this.io) {
            this.io.close();
            this.initialized = false;
            console.log('🔌 Sistema de WebSockets cerrado');
        }
    }

    /**
     * Métodos de conveniencia para acceso rápido
     */

    // Enviar notificación
    async sendNotification(userId, notification) {
        return notificationHandler.sendToUser(userId, notification);
    }

    // Enviar mensaje directo a usuario
    sendToUser(userId, event, data) {
        return socketManager.sendToUser(userId, event, data);
    }

    // Enviar notificación a rol
    async sendNotificationToRole(roleName, notification) {
        return notificationHandler.sendToRole(roleName, notification);
    }

    // Broadcast notificación
    async broadcastNotification(notification) {
        return notificationHandler.broadcast(notification);
    }

    // Enviar actualización de datos
    async sendDataUpdate(userId, channel, data) {
        return realtimeHandler.sendDataUpdate(userId, channel, data);
    }

    // Broadcast actualización de datos
    async broadcastDataUpdate(channel, data) {
        return realtimeHandler.broadcastDataUpdate(channel, data);
    }

    // Obtener usuarios conectados
    getConnectedUsers() {
        return socketManager.getConnectedUsers();
    }

    // Verificar si usuario está conectado
    isUserConnected(userId) {
        return socketManager.isUserConnected(userId);
    }

    // Obtener estadísticas completas
    getFullStats() {
        return {
            websocket: socketManager.getStats(),
            realtime: realtimeHandler.getRealtimeStats(),
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }
        };
    }
}

export default new WebSocketSystem(); 