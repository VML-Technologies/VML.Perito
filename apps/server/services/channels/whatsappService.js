class WhatsAppService {
    constructor() {
        this.provider = null; // Se configurará después (Twilio, Meta API, etc.)
        this.apiKey = null;
        this.phoneNumberId = null;
        console.log('📱 Servicio WhatsApp inicializado (pendiente configuración de proveedor)');
    }

    /**
     * Configurar proveedor de WhatsApp
     */
    configureProvider(provider, config) {
        this.provider = provider;
        this.apiKey = config.apiKey;
        this.phoneNumberId = config.phoneNumberId;
        this.baseUrl = config.baseUrl;
        console.log(`📱 Proveedor de WhatsApp configurado: ${provider}`);
    }

    /**
     * Enviar notificación por WhatsApp
     */
    async send(notification) {
        try {
            console.log(`📱 Enviando WhatsApp a: ${notification.recipient_phone}`);

            // Validar número de teléfono
            if (!this.validatePhoneNumber(notification.recipient_phone)) {
                throw new Error('Número de teléfono inválido');
            }

            // TODO: Implementar envío real cuando se defina proveedor
            if (!this.provider) {
                console.warn('⚠️ Proveedor de WhatsApp no configurado, simulando envío...');

                // Simular envío exitoso para desarrollo
                return {
                    success: true,
                    delivered: false, // No se puede confirmar entrega sin proveedor real
                    external_id: `whatsapp_sim_${Date.now()}`,
                    response: {
                        channel: 'whatsapp',
                        provider: 'simulation',
                        to: notification.recipient_phone,
                        message: notification.content,
                        simulated: true
                    }
                };
            }

            // Estructura para implementación futura
            const messageData = {
                to: this.formatPhoneNumber(notification.recipient_phone),
                type: 'text',
                text: {
                    body: this.formatMessage(notification)
                }
            };

            // Aquí iría la implementación real del proveedor
            const result = await this.sendWithProvider(messageData);

            return {
                success: true,
                delivered: result.status === 'sent',
                external_id: result.id,
                response: result
            };

        } catch (error) {
            console.error('❌ Error en servicio WhatsApp:', error);
            throw error;
        }
    }

    /**
     * Formatear mensaje para WhatsApp
     */
    formatMessage(notification) {
        let message = `*${notification.title}*\n\n`;
        message += notification.content;

        // Agregar footer si es necesario
        if (notification.priority === 'urgent') {
            message += '\n\n🚨 *URGENTE*';
        }

        message += '\n\n_VML Perito - Sistema de Notificaciones_';

        return message;
    }

    /**
     * Validar número de teléfono
     */
    validatePhoneNumber(phone) {
        if (!phone) return false;

        // Remover espacios y caracteres especiales
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

        // Validar formato básico (10 dígitos para Colombia)
        const phoneRegex = /^(\+57)?[0-9]{10}$/;
        return phoneRegex.test(cleanPhone);
    }

    /**
     * Formatear número de teléfono para WhatsApp API
     */
    formatPhoneNumber(phone) {
        let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

        // Agregar código de país si no lo tiene
        if (!cleanPhone.startsWith('+57') && !cleanPhone.startsWith('57')) {
            cleanPhone = '57' + cleanPhone;
        }

        // Remover el + si está presente
        cleanPhone = cleanPhone.replace('+', '');

        return cleanPhone;
    }

    /**
     * Enviar con proveedor configurado (implementación futura)
     */
    async sendWithProvider(messageData) {
        // Placeholder para implementación real
        throw new Error('Proveedor de WhatsApp no implementado');
    }

    /**
     * Verificar estado de entrega (webhook)
     */
    async handleDeliveryStatus(webhookData) {
        try {
            // TODO: Implementar manejo de webhooks de estado
            console.log('📱 Estado de entrega WhatsApp:', webhookData);

            return {
                messageId: webhookData.id,
                status: webhookData.status,
                timestamp: webhookData.timestamp
            };
        } catch (error) {
            console.error('❌ Error procesando estado WhatsApp:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de envío
     */
    async getStats(dateFrom, dateTo) {
        // TODO: Implementar estadísticas cuando se tenga proveedor
        return {
            sent: 0,
            delivered: 0,
            failed: 0,
            pending: 0,
            read: 0
        };
    }

    /**
     * Verificar si un número puede recibir WhatsApp
     */
    async validateWhatsAppNumber(phone) {
        try {
            // TODO: Implementar validación con proveedor
            console.log(`📱 Validando número WhatsApp: ${phone}`);
            return { valid: true, exists: true };
        } catch (error) {
            console.error('❌ Error validando número WhatsApp:', error);
            return { valid: false, exists: false };
        }
    }
}

export default WhatsAppService; 