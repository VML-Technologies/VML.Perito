class TwilioProvider {
    constructor() {
        this.name = 'twilio';
        this.accountSid = null;
        this.authToken = null;
        this.phoneNumber = null;
        console.log('📱 Proveedor SMS Twilio inicializado');
    }

    /**
     * Configurar proveedor Twilio
     */
    configure(config) {
        this.accountSid = config.accountSid;
        this.authToken = config.authToken;
        this.phoneNumber = config.phoneNumber;
        console.log(`📱 Proveedor SMS Twilio configurado`);
    }

    /**
     * Enviar notificación SMS usando Twilio
     * @param {Object} notification - Objeto de notificación
     * @returns {Object} Resultado del envío
     */
    async send(notification) {
        try {
            console.log(`📱 [Twilio] Enviando SMS a: ${notification.recipient_phone}`);
            console.log(`📱 [Twilio] Contenido: ${notification.content}`);

            if (!this.accountSid || !this.authToken || !this.phoneNumber) {
                console.warn('⚠️ Configuración de Twilio incompleta, simulando envío...');
                return this.simulateSend(notification);
            }

            // Extraer datos del canal específico si están disponibles
            const channelData = notification.metadata?.channel_data?.sms || {};
            const message = channelData.message || notification.content;

            const phoneNumber = this.formatPhoneNumber(notification.recipient_phone);

            // Crear la URL para la API de Twilio
            const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

            // Codificar las credenciales para autenticación básica
            const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

            const options = {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: this.phoneNumber,
                    To: phoneNumber,
                    Body: message
                })
            };

            const response = await fetch(url, options);
            const result = await response.json();

            if (response.ok && result.sid) {
                console.log(`✅ [Twilio] SMS enviado exitosamente: ${result.sid}`);
                return {
                    success: true,
                    delivered: result.status === 'sent' || result.status === 'delivered',
                    external_id: result.sid,
                    response: result,
                    websocket_delivered: false
                };
            } else {
                throw new Error(`Error en API Twilio: ${result.message || result.error_message || 'Error desconocido'}`);
            }

        } catch (error) {
            console.error(`❌ [Twilio] Error enviando SMS:`, error);
            throw error;
        }
    }

    /**
     * Simular envío para desarrollo
     */
    simulateSend(notification) {
        const channelData = notification.metadata?.channel_data?.sms || {};
        const message = channelData.message || notification.content;

        console.log(`📱 [Twilio] [SIMULACIÓN] SMS a: ${notification.recipient_phone}`);
        console.log(`📱 [Twilio] [SIMULACIÓN] Contenido: ${message}`);

        return {
            success: true,
            delivered: false,
            external_id: `twilio_sim_${Date.now()}`,
            response: {
                channel: 'sms',
                provider: 'twilio_simulation',
                to: notification.recipient_phone,
                message: message,
                simulated: true
            },
            websocket_delivered: false
        };
    }

    /**
     * Formatear número de teléfono para Twilio (formato E.164)
     */
    formatPhoneNumber(phone) {
        if (!phone) {
            throw new Error('Número de teléfono es requerido');
        }

        // Remover espacios, guiones y paréntesis
        let formatted = phone.replace(/[\s\-\(\)]/g, '');

        // Si empieza con +, mantenerlo
        if (formatted.startsWith('+')) {
            return formatted;
        }

        // Si empieza con 57 (Colombia), agregar +
        if (formatted.startsWith('57')) {
            return '+' + formatted;
        }

        // Si es un número local colombiano (10 dígitos), agregar +57
        if (formatted.length === 10) {
            return '+57' + formatted;
        }

        // Si tiene menos de 10 dígitos, asumir que es local y agregar +57
        if (formatted.length < 10) {
            return '+57' + formatted;
        }

        // Para otros casos, agregar + al inicio
        return '+' + formatted;
    }

    /**
     * Validar número de teléfono para Twilio
     */
    validatePhoneNumber(phone) {
        // Validación para formato E.164
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        const formatted = this.formatPhoneNumber(phone);
        return phoneRegex.test(formatted);
    }

    /**
     * Manejar estado de entrega (webhook)
     * @param {Object} webhookData - Datos del webhook
     * @returns {Object} Resultado del procesamiento
     */
    async handleDeliveryStatus(webhookData) {
        try {
            console.log(`📱 [Twilio] Procesando webhook SMS:`, webhookData);

            // Mapear estados de Twilio
            const statusMap = {
                'sent': false,
                'delivered': true,
                'undelivered': false,
                'failed': false
            };

            const result = {
                success: true,
                delivered: statusMap[webhookData.MessageStatus] || false,
                external_id: webhookData.MessageSid,
                response: webhookData
            };

            return result;

        } catch (error) {
            console.error(`❌ [Twilio] Error procesando webhook SMS:`, error);
            throw error;
        }
    }

    /**
     * Validar configuración del proveedor
     * @returns {boolean} Si la configuración es válida
     */
    async validateConfig() {
        return !!(this.accountSid && this.authToken && this.phoneNumber);
    }

    /**
     * Obtener información del proveedor
     * @returns {Object} Información del proveedor
     */
    getInfo() {
        return {
            name: this.name,
            type: 'sms_provider',
            description: 'Proveedor SMS Twilio',
            configured: !!(this.accountSid && this.authToken && this.phoneNumber)
        };
    }

    /**
     * Obtener nombre del proveedor
     */
    getProviderName() {
        return this.name;
    }
}

export default new TwilioProvider();
