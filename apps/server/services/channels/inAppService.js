class InAppService {
    constructor() {
        this.webSocketSystem = null;
    }

    /**
     * Inicializar con sistema WebSocket
     */
    initialize(webSocketSystem) {
        this.webSocketSystem = webSocketSystem;
        console.log('📱 Servicio In-App inicializado');
    }

    /**
     * Enviar notificación In-App
     */
    async send(notification) {
        try {
            console.log(`📱 Enviando notificación In-App a usuario ${notification.recipient_user_id}`);

            let websocketDelivered = false;

            // Intentar envío via WebSocket si el usuario está conectado
            if (this.webSocketSystem && notification.recipient_user_id) {
                try {
                    const notificationData = {
                        id: notification.id,
                        type: 'in_app_notification',
                        title: notification.title,
                        content: notification.content,
                        priority: notification.priority,
                        metadata: notification.metadata,
                        timestamp: new Date().toISOString()
                    };

                    // Enviar via WebSocket
                    const sent = this.webSocketSystem.sendToUser(
                        notification.recipient_user_id,
                        'notification',
                        notificationData
                    );

                    if (sent) {
                        websocketDelivered = true;
                        console.log(`✅ Notificación enviada via WebSocket a usuario ${notification.recipient_user_id}`);
                    }
                } catch (wsError) {
                    console.warn(`⚠️ Error enviando via WebSocket: ${wsError.message}`);
                }
            }

            // La notificación siempre se considera "enviada" para In-App
            // ya que se almacena en BD para consulta posterior
            return {
                success: true,
                delivered: true, // In-App siempre se considera entregada
                websocket_delivered: websocketDelivered,
                external_id: `in_app_${notification.id}`,
                response: {
                    channel: 'in_app',
                    websocket_sent: websocketDelivered,
                    stored_in_db: true
                }
            };

        } catch (error) {
            console.error('❌ Error en servicio In-App:', error);
            throw error;
        }
    }

    /**
     * Verificar si un usuario está conectado via WebSocket
     */
    isUserConnected(userId) {
        if (!this.webSocketSystem) return false;
        return this.webSocketSystem.isUserConnected(userId);
    }

    /**
     * Obtener estadísticas de conectividad
     */
    getConnectedUsers() {
        if (!this.webSocketSystem) return [];
        return this.webSocketSystem.getConnectedUsers();
    }
}

export default InAppService; 