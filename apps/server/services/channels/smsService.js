import fs from 'fs';

class SMSService {
    constructor() {
        this.name = 'sms';
        this.active = true;
        this.config = null;
        this.apiKey = null;
        this.from = null;
        console.log('📱 Servicio SMS inicializado');
    }

    /**
     * Configurar proveedor SMS
     */
    configureProvider(provider, config) {
        this.provider = provider;
        this.config = config;

        if (provider == 'hablame') {
            this.apiKey = config.apiKey;
            this.from = config.from;
            console.log(`📱 Proveedor SMS Hablame configurado`);
        }
    }

    /**
     * Configurar desde variables de entorno
     */
    configureFromEnv() {
        const config = {
            apiKey: process.env.HABLAME_KEY,
            from: process.env.SMS_FROM
        };

        if (config.apiKey) {
            this.configureProvider('hablame', config);
            return true;
        } else {
            console.warn('⚠️ Configuración de SMS incompleta en variables de entorno');
            return false;
        }
    }

    /**
     * Enviar notificación SMS
     * @param {Object} notification - Objeto de notificación
     * @returns {Object} Resultado del envío
     */
    async send(notification) {
        try {
            console.log(`📱 Enviando SMS a: ${notification.recipient_phone}`);
            console.log(`📱 Contenido: ${notification.content}`);

            if (!this.apiKey) {
                console.warn('⚠️ API Key de SMS no configurada, simulando envío...');
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
                    certificate: true,
                    sendDate: "Now",
                    campaignName: 'MovMundial',
                    from: '899775',
                    flash: false,
                    messages: [{
                        to: '57' + phoneNumber,
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
                console.log(`✅ SMS enviado exitosamente: ${result.message_id}`);
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
            console.error(`❌ Error enviando SMS:`, error);
            throw error;
        }
    }

    /**
     * Simular envío para desarrollo
     */
    simulateSend(notification) {
        const channelData = notification.metadata?.channel_data?.sms || {};
        const message = channelData.message || notification.content;

        console.log(`📱 [SIMULACIÓN] SMS a: ${notification.recipient_phone}`);
        console.log(`📱 [SIMULACIÓN] Contenido: ${message}`);

        return {
            success: true,
            delivered: false,
            external_id: `sms_sim_${Date.now()}`,
            response: {
                channel: 'sms',
                provider: 'simulation',
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
            console.log(`📱 Procesando webhook SMS:`, webhookData);

            // TODO: Implementar procesamiento real del webhook
            const result = {
                success: true,
                delivered: webhookData.status == 'delivered',
                external_id: webhookData.message_id,
                response: webhookData
            };

            return result;

        } catch (error) {
            console.error(`❌ Error procesando webhook SMS:`, error);
            throw error;
        }
    }

    /**
     * Validar configuración del servicio
     * @returns {boolean} Si la configuración es válida
     */
    async validateConfig() {
        // TODO: Implementar validación real de configuración
        return true;
    }

    /**
     * Obtener información del servicio
     * @returns {Object} Información del servicio
     */
    getInfo() {
        return {
            name: this.name,
            active: this.active,
            type: 'sms',
            description: 'Servicio de notificaciones SMS'
        };
    }
}

export default new SMSService(); 