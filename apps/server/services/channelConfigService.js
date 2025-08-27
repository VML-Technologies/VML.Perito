import ChannelConfig from '../models/channelConfig.js';
import { Op } from 'sequelize';

class ChannelConfigService {
    constructor() {
        this.channels = new Map();
        // NO inicializar automáticamente - se hará manualmente después de crear las tablas
    }

    /**
     * Inicializar el servicio de configuración de canales
     */
    async initialize() {
        try {
            console.log('📡 Inicializando ChannelConfigService...');
            await this.loadChannelsFromDatabase();
            console.log('✅ ChannelConfigService inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando ChannelConfigService:', error);
            throw error;
        }
    }

    /**
     * Cargar configuraciones de canales desde la base de datos
     */
    async loadChannelsFromDatabase() {
        try {
            const configs = await ChannelConfig.findAll({
                where: { is_active: true },
                order: [['priority', 'ASC']]
            });

            this.channels.clear();
            configs.forEach(config => {
                this.channels.set(config.channel_name, config);
            });

            console.log(`📡 Configuraciones de canales cargadas: ${this.channels.size} canales activos`);
        } catch (error) {
            console.error('❌ Error cargando configuraciones de canales:', error);
        }
    }

    /**
     * Obtener configuración de un canal específico
     */
    async getChannelConfig(channelName) {
        try {
            const config = await ChannelConfig.findOne({
                where: {
                    channel_name: channelName,
                    is_active: true
                }
            });
            return config;
        } catch (error) {
            console.error(`❌ Error obteniendo configuración del canal ${channelName}:`, error);
            return null;
        }
    }

    /**
     * Obtener todas las configuraciones de canales
     */
    async getAllChannelConfigs() {
        try {
            return await ChannelConfig.findAll({
                order: [['priority', 'ASC'], ['channel_name', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error obteniendo configuraciones de canales:', error);
            return [];
        }
    }

    /**
     * Crear o actualizar configuración de canal
     */
    async upsertChannelConfig(channelData) {
        try {
            const [config, created] = await ChannelConfig.findOrCreate({
                where: { channel_name: channelData.channel_name },
                defaults: channelData
            });

            if (!created) {
                await config.update(channelData);
            }

            // Recargar configuraciones en memoria
            await this.loadChannelsFromDatabase();

            return config;
        } catch (error) {
            console.error('❌ Error upsertando configuración de canal:', error);
            throw error;
        }
    }

    /**
     * Actualizar configuración de canal
     */
    async updateChannelConfig(channelName, updateData) {
        try {
            const config = await ChannelConfig.findOne({
                where: { channel_name: channelName }
            });

            if (!config) {
                throw new Error(`Canal ${channelName} no encontrado`);
            }

            await config.update(updateData);

            // Recargar configuraciones en memoria
            await this.loadChannelsFromDatabase();

            return config;
        } catch (error) {
            console.error(`❌ Error actualizando configuración del canal ${channelName}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar configuración de canal (soft delete)
     */
    async deleteChannelConfig(channelName) {
        try {
            const config = await ChannelConfig.findOne({
                where: { channel_name: channelName }
            });

            if (!config) {
                throw new Error(`Canal ${channelName} no encontrado`);
            }

            await config.destroy();

            // Recargar configuraciones en memoria
            await this.loadChannelsFromDatabase();

            return true;
        } catch (error) {
            console.error(`❌ Error eliminando configuración del canal ${channelName}:`, error);
            throw error;
        }
    }

    /**
     * Probar configuración de canal
     */
    async testChannelConfig(channelName, testData = {}) {
        try {
            const config = await this.getChannelConfig(channelName);
            if (!config) {
                throw new Error(`Canal ${channelName} no encontrado o inactivo`);
            }

            let testResult = { success: false, message: '', details: {} };

            // Probar según el tipo de canal
            switch (channelName) {
                case 'email':
                    testResult = await this.testEmailChannel(config, testData);
                    break;
                case 'sms':
                    testResult = await this.testSMSChannel(config, testData);
                    break;
                case 'whatsapp':
                    testResult = await this.testWhatsAppChannel(config, testData);
                    break;
                case 'in_app':
                    testResult = await this.testInAppChannel(config, testData);
                    break;
                case 'push':
                    testResult = await this.testPushChannel(config, testData);
                    break;
                default:
                    throw new Error(`Canal ${channelName} no soportado para pruebas`);
            }

            // Actualizar estado de prueba
            await config.update({
                last_tested: new Date(),
                test_status: testResult.success ? 'success' : 'failed'
            });

            return testResult;
        } catch (error) {
            console.error(`❌ Error probando canal ${channelName}:`, error);

            // Actualizar estado de prueba como fallido
            const config = await this.getChannelConfig(channelName);
            if (config) {
                await config.update({
                    last_tested: new Date(),
                    test_status: 'failed'
                });
            }

            return {
                success: false,
                message: error.message,
                details: { error: error.toString() }
            };
        }
    }

    /**
     * Probar canal de email
     */
    async testEmailChannel(config, testData) {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const emailService = await import('./channels/emailService.js');

            // Configurar con los datos de prueba
            emailService.default.configureFromEnv();

            // Enviar email de prueba
            const testEmail = {
                recipient_email: testData.to || config.config.test_email || 'test@example.com',
                title: 'Prueba de Configuración - Movilidad Mundial',
                content: 'Este es un email de prueba para verificar la configuración del canal de email.',
                priority: 'normal',
                metadata: {
                    channel_data: {
                        email: {
                            subject: 'Prueba de Configuración - Movilidad Mundial',
                            html: '<h1>Prueba de Configuración</h1><p>Este es un email de prueba para verificar la configuración del canal de email.</p>'
                        }
                    }
                }
            };

            const result = await emailService.default.send(testEmail);

            return {
                success: true,
                message: 'Canal de email probado exitosamente',
                details: { messageId: result.messageId }
            };
        } catch (error) {
            return {
                success: false,
                message: `Error probando canal de email: ${error.message}`,
                details: { error: error.toString() }
            };
        }
    }

    /**
     * Probar canal de SMS
     */
    async testSMSChannel(config, testData) {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const smsService = await import('./channels/smsService.js');

            // Configurar con los datos de prueba
            smsService.default.configureFromEnv();

            // Enviar SMS de prueba
            const testSMS = {
                recipient_phone: testData.to || config.config.test_phone || '+573001234567',
                content: 'Prueba de configuración SMS - Movilidad Mundial',
                priority: 'normal',
                metadata: {
                    channel_data: {
                        sms: {
                            message: 'Prueba de configuración SMS - Movilidad Mundial'
                        }
                    }
                }
            };

            const result = await smsService.default.send(testSMS);

            return {
                success: true,
                message: 'Canal de SMS probado exitosamente',
                details: { messageId: result.messageId }
            };
        } catch (error) {
            return {
                success: false,
                message: `Error probando canal de SMS: ${error.message}`,
                details: { error: error.toString() }
            };
        }
    }

    /**
     * Probar canal de WhatsApp
     */
    async testWhatsAppChannel(config, testData) {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const whatsappService = await import('./channels/whatsappService.js');

            // Configurar con los datos de prueba
            whatsappService.default.configureFromEnv();

            // Enviar mensaje de prueba
            const testMessage = {
                recipient_phone: testData.to || config.config.test_phone || '+573001234567',
                content: 'Prueba de configuración WhatsApp - Movilidad Mundial',
                title: 'Prueba de Configuración',
                priority: 'normal',
                metadata: {
                    channel_data: {
                        whatsapp: {
                            message: 'Prueba de configuración WhatsApp - Movilidad Mundial'
                        }
                    }
                }
            };

            const result = await whatsappService.default.send(testMessage);

            return {
                success: true,
                message: 'Canal de WhatsApp probado exitosamente',
                details: { messageId: result.messageId }
            };
        } catch (error) {
            return {
                success: false,
                message: `Error probando canal de WhatsApp: ${error.message}`,
                details: { error: error.toString() }
            };
        }
    }

    /**
     * Probar canal In-App
     */
    async testInAppChannel(config, testData) {
        try {
            // Para In-App, solo verificamos la configuración
            if (!config.config.websocket_url) {
                throw new Error('URL de WebSocket no configurada');
            }

            return {
                success: true,
                message: 'Canal In-App configurado correctamente',
                details: { websocket_url: config.config.websocket_url }
            };
        } catch (error) {
            return {
                success: false,
                message: `Error probando canal In-App: ${error.message}`,
                details: { error: error.toString() }
            };
        }
    }

    /**
     * Probar canal Push
     */
    async testPushChannel(config, testData) {
        try {
            // Para Push, verificamos las VAPID keys
            if (!config.config.vapid_public_key || !config.config.vapid_private_key) {
                throw new Error('VAPID keys no configuradas');
            }

            return {
                success: true,
                message: 'Canal Push configurado correctamente',
                details: { vapid_public_key: config.config.vapid_public_key }
            };
        } catch (error) {
            return {
                success: false,
                message: `Error probando canal Push: ${error.message}`,
                details: { error: error.toString() }
            };
        }
    }

    /**
     * Obtener estadísticas de canales
     */
    async getChannelStats() {
        try {
            const stats = await ChannelConfig.findAll({
                attributes: [
                    'channel_name',
                    'is_active',
                    'test_status',
                    'last_tested',
                    'priority',
                    'rate_limit'
                ],
                order: [['priority', 'ASC']]
            });

            const summary = {
                total: stats.length,
                active: stats.filter(s => s.is_active).length,
                inactive: stats.filter(s => !s.is_active).length,
                tested: stats.filter(s => s.test_status !== 'pending').length,
                successful: stats.filter(s => s.test_status == 'success').length,
                failed: stats.filter(s => s.test_status == 'failed').length,
                channels: stats
            };

            return summary;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de canales:', error);
            return null;
        }
    }

    /**
     * Obtener configuración de canal desde memoria
     */
    getChannelFromMemory(channelName) {
        return this.channels.get(channelName);
    }

    /**
     * Obtener todos los canales desde memoria
     */
    getAllChannelsFromMemory() {
        return Array.from(this.channels.values());
    }
}

// Exportar singleton
export default new ChannelConfigService(); 