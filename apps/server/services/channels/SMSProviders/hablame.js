class HablameProvider {
    constructor() {
        this.name = 'hablame';
        this.apiKey = null;
        this.from = null;
        console.log('📱 Proveedor SMS Hablame inicializado');
    }

    /**
     * Configurar proveedor Hablame
     */
    configure(config) {
        this.apiKey = config.apiKey;
        this.from = config.from;
        console.log(`📱 Proveedor SMS Hablame configurado`);
    }

    /**
     * Enviar notificación SMS usando Hablame
     * @param {Object} notification - Objeto de notificación
     * @returns {Object} Resultado del envío
     */
    async send(notification) {
        try {
            console.log(`📱 [Hablame] Enviando SMS a: ${notification.recipient_phone}`);
            console.log(`📱 [Hablame] Contenido: ${notification.content}`);

            if (!this.apiKey) {
                console.warn('⚠️ API Key de Hablame no configurada, simulando envío...');
                return this.simulateSend(notification);
            }

            // Extraer datos del canal específico si están disponibles
            const channelData = notification.metadata?.channel_data?.sms || {};
            const message = channelData.message || notification.content;

            const phoneNumber = this.formatPhoneNumber(notification.recipient_phone);

            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'X-Hablame-Key': this.apiKey
                },
                body: JSON.stringify({
                    priority: true,
                    certificate: false,
                    sendDate: "Now",
                    campaignName: 'MovMundial',
                    from: '899775',
                    flash: false,
                    messages: [{
                        to: phoneNumber,
                        text: message,
                        costCenter: 0,
                        reference01: 'Agendamiento',
                        reference02: 'Agendamiento',
                        reference03: 'Agendamiento'
                    }]
                })
            };

            const response = await fetch('https://www.hablame.co/api/sms/v5/send', options);
            const result = await response.json();

            if (response && result.statusMessage == 'OK') {
                console.log(`✅ [Hablame] SMS enviado exitosamente: ${result.message_id}`);
                return {
                    success: true,
                    delivered: true,
                    external_id: result.message_id,
                    response: result,
                    websocket_delivered: false
                };
            } else {
                throw new Error(`Error en API Hablame: ${result.message || 'Error desconocido'}`);
            }

        } catch (error) {
            console.error(`❌ [Hablame] Error enviando SMS:`, error);
            throw error;
        }
    }

    /**
     * Simular envío para desarrollo
     */
    simulateSend(notification) {
        const channelData = notification.metadata?.channel_data?.sms || {};
        const message = channelData.message || notification.content;

        console.log(`📱 [Hablame] [SIMULACIÓN] SMS a: ${notification.recipient_phone}`);
        console.log(`📱 [Hablame] [SIMULACIÓN] Contenido: ${message}`);

        return {
            success: true,
            delivered: false,
            external_id: `hablame_sim_${Date.now()}`,
            response: {
                channel: 'sms',
                provider: 'hablame_simulation',
                to: notification.recipient_phone,
                message: message,
                simulated: true
            },
            websocket_delivered: false
        };
    }

    /**
     * Formatear número de teléfono para Hablame
     */
    formatPhoneNumber(phone) {
        if (!phone) {
            throw new Error('Número de teléfono es requerido');
        }

        // Remover espacios, guiones y paréntesis
        let formatted = phone.replace(/[\s\-\(\)]/g, '');

        // Si no empieza con 57, agregarlo
        if (!formatted.startsWith('57')) {
            formatted = '57' + formatted;
        }

        return formatted;
    }

    /**
     * Mapear prioridad a configuración de Hablame
     */
    mapPriority(priority) {
        const priorityMap = {
            'urgent': true,
            'high': true,
            'normal': false,
            'low': false
        };
        return priorityMap[priority] || false;
    }

    /**
     * Validar número de teléfono
     */
    validatePhoneNumber(phone) {
        // Validación básica para números colombianos
        const phoneRegex = /^(\+?57)?[0-9]{10}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
    }

    /**
     * Manejar estado de entrega (webhook)
     * @param {Object} webhookData - Datos del webhook
     * @returns {Object} Resultado del procesamiento
     */
    async handleDeliveryStatus(webhookData) {
        try {
            console.log(`📱 [Hablame] Procesando webhook SMS:`, webhookData);

            // TODO: Implementar procesamiento real del webhook
            const result = {
                success: true,
                delivered: webhookData.status == 'delivered',
                external_id: webhookData.message_id,
                response: webhookData
            };

            return result;

        } catch (error) {
            console.error(`❌ [Hablame] Error procesando webhook SMS:`, error);
            throw error;
        }
    }

    /**
     * Validar configuración del proveedor
     * @returns {boolean} Si la configuración es válida
     */
    async validateConfig() {
        return !!(this.apiKey && this.from);
    }

    /**
     * Obtener información del proveedor
     * @returns {Object} Información del proveedor
     */
    getInfo() {
        return {
            name: this.name,
            type: 'sms_provider',
            description: 'Proveedor SMS Hablame',
            configured: !!(this.apiKey && this.from)
        };
    }

    /**
     * Obtener nombre del proveedor
     */
    getProviderName() {
        return this.name;
    }
}

export default new HablameProvider();
