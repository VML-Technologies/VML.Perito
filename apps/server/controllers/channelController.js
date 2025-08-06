import { BaseController } from './baseController.js';
import channelConfigService from '../services/channelConfigService.js';

class ChannelController extends BaseController {
    constructor() {
        super();
    }

    /**
     * Obtener todas las configuraciones de canales
     */
    async index(req, res) {
        try {
            const channels = await channelConfigService.getAllChannelConfigs();
            
            res.json({
                success: true,
                data: channels,
                message: 'Configuraciones de canales obtenidas exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error obteniendo configuraciones de canales');
        }
    }

    /**
     * Obtener configuración de un canal específico
     */
    async show(req, res) {
        try {
            const { channelName } = req.params;
            const config = await channelConfigService.getChannelConfig(channelName);
            
            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: `Canal ${channelName} no encontrado`
                });
            }
            
            res.json({
                success: true,
                data: config,
                message: 'Configuración de canal obtenida exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error obteniendo configuración de canal');
        }
    }

    /**
     * Crear nueva configuración de canal
     */
    async store(req, res) {
        try {
            const channelData = {
                ...req.body,
                created_by: req.user?.id
            };

            const config = await channelConfigService.upsertChannelConfig(channelData);
            
            res.status(201).json({
                success: true,
                data: config,
                message: 'Configuración de canal creada exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error creando configuración de canal');
        }
    }

    /**
     * Actualizar configuración de canal
     */
    async update(req, res) {
        try {
            const { channelName } = req.params;
            const updateData = req.body;

            const config = await channelConfigService.updateChannelConfig(channelName, updateData);
            
            res.json({
                success: true,
                data: config,
                message: 'Configuración de canal actualizada exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error actualizando configuración de canal');
        }
    }

    /**
     * Eliminar configuración de canal
     */
    async destroy(req, res) {
        try {
            const { channelName } = req.params;
            
            await channelConfigService.deleteChannelConfig(channelName);
            
            res.json({
                success: true,
                message: 'Configuración de canal eliminada exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error eliminando configuración de canal');
        }
    }

    /**
     * Probar configuración de canal
     */
    async testChannel(req, res) {
        try {
            const { channelName } = req.params;
            const testData = req.body;

            const result = await channelConfigService.testChannelConfig(channelName, testData);
            
            res.json({
                success: true,
                data: result,
                message: result.success ? 'Canal probado exitosamente' : 'Error probando canal'
            });
        } catch (error) {
            this.handleError(res, error, 'Error probando canal');
        }
    }

    /**
     * Obtener estadísticas de canales
     */
    async getStats(req, res) {
        try {
            const stats = await channelConfigService.getChannelStats();
            
            res.json({
                success: true,
                data: stats,
                message: 'Estadísticas de canales obtenidas exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error obteniendo estadísticas de canales');
        }
    }

    /**
     * Obtener configuración de canales desde memoria
     */
    async getFromMemory(req, res) {
        try {
            const channels = channelConfigService.getAllChannelsFromMemory();
            
            res.json({
                success: true,
                data: channels,
                message: 'Configuraciones de canales obtenidas desde memoria'
            });
        } catch (error) {
            this.handleError(res, error, 'Error obteniendo configuraciones desde memoria');
        }
    }

    /**
     * Recargar configuraciones de canales desde base de datos
     */
    async reload(req, res) {
        try {
            await channelConfigService.loadChannelsFromDatabase();
            
            res.json({
                success: true,
                message: 'Configuraciones de canales recargadas exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error recargando configuraciones de canales');
        }
    }

    /**
     * Obtener esquemas de configuración por canal
     */
    async getSchemas(req, res) {
        try {
            const schemas = {
                email: {
                    display_name: 'Email',
                    description: 'Canal de correo electrónico usando SMTP',
                    config_schema: {
                        host: { type: 'string', required: true, description: 'Servidor SMTP' },
                        port: { type: 'number', required: true, description: 'Puerto SMTP' },
                        secure: { type: 'boolean', required: false, description: 'Usar SSL/TLS' },
                        user: { type: 'string', required: true, description: 'Usuario SMTP' },
                        pass: { type: 'string', required: true, description: 'Contraseña SMTP' },
                        from: { type: 'string', required: true, description: 'Email remitente' },
                        test_email: { type: 'string', required: false, description: 'Email para pruebas' }
                    },
                    template_fields: ['subject', 'body', 'html']
                },
                sms: {
                    display_name: 'SMS',
                    description: 'Canal de mensajes de texto usando Hablame.co',
                    config_schema: {
                        api_key: { type: 'string', required: true, description: 'API Key de Hablame.co' },
                        from: { type: 'string', required: true, description: 'Número remitente' },
                        test_phone: { type: 'string', required: false, description: 'Teléfono para pruebas' }
                    },
                    template_fields: ['message']
                },
                whatsapp: {
                    display_name: 'WhatsApp',
                    description: 'Canal de WhatsApp Business API',
                    config_schema: {
                        api_key: { type: 'string', required: true, description: 'API Key de WhatsApp' },
                        phone_number_id: { type: 'string', required: true, description: 'ID del número de teléfono' },
                        business_account_id: { type: 'string', required: true, description: 'ID de la cuenta de negocio' },
                        test_phone: { type: 'string', required: false, description: 'Teléfono para pruebas' }
                    },
                    template_fields: ['message']
                },
                in_app: {
                    display_name: 'In-App',
                    description: 'Notificaciones internas de la aplicación',
                    config_schema: {
                        websocket_url: { type: 'string', required: true, description: 'URL del WebSocket' },
                        broadcast_enabled: { type: 'boolean', required: false, description: 'Habilitar broadcast' }
                    },
                    template_fields: ['title', 'message', 'data']
                },
                push: {
                    display_name: 'Push',
                    description: 'Notificaciones push del navegador',
                    config_schema: {
                        vapid_public_key: { type: 'string', required: true, description: 'VAPID Public Key' },
                        vapid_private_key: { type: 'string', required: true, description: 'VAPID Private Key' },
                        vapid_subject: { type: 'string', required: true, description: 'VAPID Subject' }
                    },
                    template_fields: ['title', 'body', 'icon', 'data']
                }
            };
            
            res.json({
                success: true,
                data: schemas,
                message: 'Esquemas de configuración obtenidos exitosamente'
            });
        } catch (error) {
            this.handleError(res, error, 'Error obteniendo esquemas de configuración');
        }
    }

    /**
     * Validar configuración de canal
     */
    async validateConfig(req, res) {
        try {
            const { channelName, config } = req.body;
            
            if (!channelName || !config) {
                return res.status(400).json({
                    success: false,
                    message: 'channelName y config son requeridos'
                });
            }

            const schemas = {
                email: ['host', 'port', 'user', 'pass', 'from'],
                sms: ['api_key', 'from'],
                whatsapp: ['api_key', 'phone_number_id', 'business_account_id'],
                in_app: ['websocket_url'],
                push: ['vapid_public_key', 'vapid_private_key', 'vapid_subject']
            };

            const requiredFields = schemas[channelName];
            if (!requiredFields) {
                return res.status(400).json({
                    success: false,
                    message: `Canal ${channelName} no soportado`
                });
            }

            const missingFields = requiredFields.filter(field => !config[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
                    data: { missingFields }
                });
            }

            res.json({
                success: true,
                message: 'Configuración válida',
                data: { valid: true }
            });
        } catch (error) {
            this.handleError(res, error, 'Error validando configuración');
        }
    }
}

export default new ChannelController(); 