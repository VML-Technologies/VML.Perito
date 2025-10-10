import fs from 'fs';
import HablameProvider from './SMSProviders/hablame.js';
import TwilioProvider from './SMSProviders/twilio.js';

class SMSService {
    constructor() {
        this.name = 'sms';
        this.active = true;
        this.config = null;
        this.provider = null;
        this.providerInstance = null;
        console.log('📱 Servicio SMS inicializado');
    }

    /**
     * Cargar proveedor SMS dinámicamente
     */
    async loadProvider() {
        try {
            const providerName = process.env.SMS_PROVIDER || 'hablame';
            
            const providers = {
                'hablame': HablameProvider,
                'twilio': TwilioProvider
            };
            
            if (providers[providerName]) {
                this.providerInstance = providers[providerName];
                this.provider = providerName;
                console.log(`📱 Proveedor SMS cargado: ${providerName}`);
                return true;
            } else {
                throw new Error(`Proveedor SMS no soportado: ${providerName}`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando proveedor SMS:', error);
            return false;
        }
    }

    /**
     * Configurar proveedor SMS (método legacy mantenido para compatibilidad)
     */
    configureProvider(provider, config) {
        this.provider = provider;
        this.config = config;
        console.log(`📱 Configuración SMS legacy aplicada: ${provider}`);
    }

    /**
     * Configurar desde variables de entorno
     */
    async configureFromEnv() {
        try {
            // Cargar el proveedor primero
            const providerLoaded = await this.loadProvider();
            if (!providerLoaded) {
                console.warn('⚠️ No se pudo cargar el proveedor SMS');
                return false;
            }

            // Configurar según el proveedor
            if (this.provider === 'hablame') {
                const config = {
                    apiKey: process.env.HABLAME_KEY,
                    from: process.env.SMS_FROM
                };

                if (config.apiKey) {
                    this.providerInstance.configure(config);
                    return true;
                } else {
                    console.warn('⚠️ Configuración de Hablame incompleta en variables de entorno');
                    return false;
                }
            } else if (this.provider === 'twilio') {
                const config = {
                    accountSid: process.env.TWILIO_ACCOUNT_SID,
                    authToken: process.env.TWILIO_AUTH_TOKEN,
                    phoneNumber: process.env.TWILIO_PHONE_NUMBER
                };

                if (config.accountSid && config.authToken && config.phoneNumber) {
                    this.providerInstance.configure(config);
                    return true;
                } else {
                    console.warn('⚠️ Configuración de Twilio incompleta en variables de entorno');
                    return false;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Error configurando SMS desde variables de entorno:', error);
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

            // Si no hay proveedor cargado, intentar cargarlo
            if (!this.providerInstance) {
                console.warn('⚠️ Proveedor SMS no cargado, intentando cargar...');
                const loaded = await this.loadProvider();
                if (!loaded) {
                    console.warn('⚠️ No se pudo cargar proveedor SMS, simulando envío...');
                    return this.simulateSend(notification);
                }
            }

            // Delegar al proveedor activo
            return await this.providerInstance.send(notification);

        } catch (error) {
            console.error(`❌ Error enviando SMS:`, error);
            throw error;
        }
    }

    /**
     * Simular envío para desarrollo
     */
    simulateSend(notification) {
        // Si hay un proveedor cargado, usar su simulación
        if (this.providerInstance) {
            return this.providerInstance.simulateSend(notification);
        }

        // Fallback a simulación genérica
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
     * Formatear número de teléfono
     */
    formatPhoneNumber(phone) {
        if (this.providerInstance) {
            return this.providerInstance.formatPhoneNumber(phone);
        }
        
        // Fallback genérico si no hay proveedor
        if (!phone) {
            throw new Error('Número de teléfono es requerido');
        }

        // Remover espacios, guiones y paréntesis
        let formatted = phone.replace(/[\s\-\(\)]/g, '');

        // Si no empieza con 57, agregarlo (formato colombiano por defecto)
        if (!formatted.startsWith('57')) {
            formatted = '57' + formatted;
        }

        return formatted;
    }

    /**
     * Mapear prioridad (método legacy mantenido para compatibilidad)
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
        if (this.providerInstance) {
            return this.providerInstance.validatePhoneNumber(phone);
        }
        
        // Fallback genérico si no hay proveedor
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

            // Si hay un proveedor cargado, delegar a él
            if (this.providerInstance) {
                return await this.providerInstance.handleDeliveryStatus(webhookData);
            }

            // Fallback genérico si no hay proveedor
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
        if (this.providerInstance) {
            return await this.providerInstance.validateConfig();
        }
        
        // Fallback si no hay proveedor
        return false;
    }

    /**
     * Obtener información del servicio
     * @returns {Object} Información del servicio
     */
    getInfo() {
        const baseInfo = {
            name: this.name,
            active: this.active,
            type: 'sms',
            description: 'Servicio de notificaciones SMS'
        };

        // Agregar información del proveedor si está disponible
        if (this.providerInstance) {
            baseInfo.provider = this.providerInstance.getInfo();
            baseInfo.current_provider = this.provider;
        }

        return baseInfo;
    }
}

export default new SMSService(); 