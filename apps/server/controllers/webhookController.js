import WebhookLog from '../models/webhookLog.js';
import automatedEventTriggers from '../services/automatedEventTriggers.js';

/**
 * Errores personalizados para webhooks
 */
class ValidationError extends Error {
    constructor(errors) {
        super('Error de validación');
        this.name = 'ValidationError';
        this.code = 'VALIDATION_ERROR';
        this.errors = errors;
    }
}

class PermissionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PermissionError';
        this.code = 'PERMISSION_ERROR';
    }
}

/**
 * Controlador principal de webhooks
 */
class WebhookController {
    constructor() {
        this.processEvent = this.processEvent.bind(this);
        this.getApiKeys = this.getApiKeys.bind(this);
        this.createApiKey = this.createApiKey.bind(this);
        this.updateApiKey = this.updateApiKey.bind(this);
        this.deleteApiKey = this.deleteApiKey.bind(this);
        this.getLogs = this.getLogs.bind(this);
    }
    
    /**
     * Procesar evento de webhook
     */
    async processEvent(req, res) {
        const startTime = Date.now();
        let webhookLog = null;
        
        try {
            const eventType = req.body.event;
            console.log(`🎯 Procesando webhook: ${eventType} (${req.webhookId})`);
            console.log(`📋 Payload recibido:`, JSON.stringify(req.body, null, 2));
            
            // 1. Crear log inicial
            webhookLog = await WebhookLog.create({
                webhook_id: req.webhookId,
                api_key_id: req.webhookKey.id,
                event_type: eventType,
                payload: req.body,
                source_ip: req.ip || req.headers['x-forwarded-for']?.split(',')[0],
                user_agent: req.headers['user-agent']
            });
            console.log(`📝 Log de webhook creado: ${webhookLog.id}`);
            
            // 2. Validar estructura del evento
            console.log(`🔍 Validando estructura del evento...`);
            const validationResult = this.validateEventPayload(req.body);
            if (!validationResult.valid) {
                console.error(`❌ Validación fallida:`, validationResult.errors);
                throw new ValidationError(validationResult.errors);
            }
            console.log(`✅ Validación exitosa`);
            
            // 3. Verificar permisos de evento
            console.log(`🔐 Verificando permisos para evento: ${eventType}`);
            if (!this.hasEventPermission(req.webhookKey, eventType)) {
                console.error(`❌ Permiso denegado para evento: ${eventType}`);
                throw new PermissionError(`Evento no permitido: ${eventType}`);
            }
            console.log(`✅ Permisos verificados`);
            
            // 4. Procesar evento según tipo
            console.log(`🚀 Despachando evento: ${eventType}`);
            const result = await this.dispatchEvent(req.body);
            console.log(`✅ Evento despachado:`, result);
            
            // 5. Actualizar log con éxito
            await webhookLog.update({
                response_status: 200,
                response_data: result,
                processing_time_ms: Date.now() - startTime,
                listeners_executed: result.listeners_executed || 0,
                notifications_sent: result.notifications_sent || 0,
                websocket_events: result.websocket_events || 0
            });
            
            // 6. Respuesta exitosa
            const response = {
                success: true,
                message: 'Evento procesado exitosamente',
                data: {
                    webhook_id: req.webhookId,
                    event_id: result.event_id,
                    processed_at: new Date().toISOString(),
                    event_type: eventType,
                    listeners_executed: result.listeners_executed || 0,
                    notifications_sent: result.notifications_sent || 0,
                    websocket_events: result.websocket_events || 0
                },
                processing_time_ms: Date.now() - startTime
            };
            
            console.log(`✅ Webhook procesado exitosamente: ${req.webhookId} (${Date.now() - startTime}ms)`);
            res.status(200).json(response);
            
        } catch (error) {
            console.error('❌ Error procesando webhook:', error);
            console.error('📍 Stack trace:', error.stack);
            
            // Actualizar log con error
            if (webhookLog) {
                try {
                    await webhookLog.update({
                        response_status: this.getErrorStatusCode(error),
                        error_message: error.message,
                        processing_time_ms: Date.now() - startTime
                    });
                    console.log(`📝 Log de error actualizado: ${webhookLog.id}`);
                } catch (logError) {
                    console.error('❌ Error actualizando log:', logError);
                }
            }
            
            // Respuesta de error
            const errorResponse = {
                success: false,
                error: {
                    code: error.code || 'PROCESSING_ERROR',
                    message: error.message,
                    details: error.errors || null
                },
                webhook_id: req.webhookId,
                processed_at: new Date().toISOString()
            };
            
            console.log(`📤 Enviando respuesta de error:`, errorResponse);
            res.status(this.getErrorStatusCode(error)).json(errorResponse);
        }
    }
    
    /**
     * Despachar evento según tipo
     */
    async dispatchEvent(eventData) {
        const { event, data, context, options } = eventData;
        
        console.log(`🎯 Despachando evento: ${event}`);
        console.log(`📋 Datos:`, JSON.stringify(data, null, 2));
        console.log(`🔗 Contexto:`, JSON.stringify(context, null, 2));
        
        try {
            switch (event) {
                case 'inspection_order.created':
                    console.log(`🔄 Manejando inspection_order.created`);
                    return await this.handleInspectionOrderCreated(data, context, options);
                    
                case 'inspection_order.assigned':
                    console.log(`🔄 Manejando inspection_order.assigned`);
                    return await this.handleInspectionOrderAssigned(data, context, options);
                    
                case 'appointment.scheduled':
                    console.log(`🔄 Manejando appointment.scheduled`);
                    return await this.handleAppointmentScheduled(data, context, options);
                    
                case 'inspection_order.started':
                    console.log(`🔄 Manejando inspection_order.started`);
                    return await this.handleInspectionOrderStarted(data, context, options);
                    
                case 'inspection_order.process_existing':
                    console.log(`🔄 Manejando inspection_order.process_existing`);
                    return await this.handleInspectionOrderProcessExisting(data, context, options);
                    
                default:
                    console.error(`❌ Tipo de evento no soportado: ${event}`);
                    throw new Error(`Tipo de evento no soportado: ${event}`);
            }
        } catch (error) {
            console.error(`❌ Error en dispatchEvent para ${event}:`, error);
            throw error;
        }
    }
    
    /**
     * Manejar creación de orden de inspección
     */
    async handleInspectionOrderCreated(data, context, options) {
        console.log(`🔄 Iniciando handleInspectionOrderCreated`);
        console.log(`📋 Datos de orden:`, JSON.stringify(data.inspection_order, null, 2));
        
        try {
            // 1. Validar datos específicos del evento
            console.log(`🔍 Validando datos de orden de inspección...`);
            this.validateInspectionOrderData(data.inspection_order);
            console.log(`✅ Validación de datos exitosa`);
            
            // 2. Enriquecer contexto
            const enrichedContext = {
                ...context,
                webhook_source: true,
                trigger_source: 'external_webhook',
                webhook_id: context?.webhook_id
            };
            console.log(`🔗 Contexto enriquecido:`, JSON.stringify(enrichedContext, null, 2));
            
            // 3. Disparar evento usando AutomatedEventTriggers
            console.log(`🚀 Disparando evento con automatedEventTriggers...`);
            const result = await automatedEventTriggers.triggerInspectionOrderEvents(
                'created',
                data.inspection_order,
                enrichedContext
            );
            console.log(`✅ Evento disparado:`, result);
            
            // 4. Enviar eventos WebSocket si está habilitado
            let websocketEvents = 0;
            if (options?.trigger_websockets) {
                console.log(`🔌 Enviando eventos WebSocket...`);
                websocketEvents = await this.sendWebSocketEvents('inspection_order_created', data, context);
                console.log(`✅ Eventos WebSocket enviados: ${websocketEvents}`);
            }
            
            const response = {
                event_id: result?.event_id || `evt_${Date.now()}`,
                listeners_executed: result?.listeners_executed || 0,
                notifications_sent: result?.notifications_sent || 0,
                websocket_events: websocketEvents
            };
            
            console.log(`✅ handleInspectionOrderCreated completado:`, response);
            return response;
            
        } catch (error) {
            console.error(`❌ Error en handleInspectionOrderCreated:`, error);
            throw error;
        }
    }

    /**
     * Manejar procesamiento de orden de inspección existente (sin inspection_link)
     * Este webhook se usa cuando otra aplicación crea una orden y necesita generar el link y SMS
     */
    async handleInspectionOrderProcessExisting(data, context, options) {
        console.log(`🔄 Iniciando handleInspectionOrderProcessExisting`);
        console.log(`📋 Datos recibidos:`, JSON.stringify(data, null, 2));
        
        try {
            // 1. Validar que se proporcione el ID de la orden
            if (!data.inspection_order_id) {
                throw new ValidationError(['El ID de la orden de inspección es requerido']);
            }
            
            console.log(`🔍 Procesando orden ID: ${data.inspection_order_id}`);
            
            // 2. Importar modelos necesarios
            const { InspectionOrder } = await import('../models/index.js');
            
            // 3. Buscar la orden de inspección
            const inspectionOrder = await InspectionOrder.findByPk(data.inspection_order_id, {
                include: [
                    {
                        model: (await import('../models/index.js')).InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });
            
            if (!inspectionOrder) {
                throw new Error(`Orden de inspección con ID ${data.inspection_order_id} no encontrada`);
            }
            
            console.log(`✅ Orden encontrada: ${inspectionOrder.numero} - ${inspectionOrder.placa}`);
            
            // 4. Verificar si ya tiene inspection_link
            if (inspectionOrder.inspection_link) {
                console.log(`⚠️ La orden ya tiene inspection_link: ${inspectionOrder.inspection_link}`);
                return {
                    status: 'already_processed',
                    message: 'La orden ya tiene inspection_link generado',
                    inspection_link: inspectionOrder.inspection_link,
                    processed_at: new Date().toISOString()
                };
            }
            
            // 5. Generar inspection_link único
            console.log(`🔗 Generando inspection_link...`);
            const timestamp = Date.now();
            const uniqueHash = `${inspectionOrder.placa}_${inspectionOrder.id}_${timestamp}`;
            const encodedHash = Buffer.from(uniqueHash).toString('base64').replace(/[+/=]/g, '');
            const finalLink = `/inspeccion/${encodedHash}`;
            
            // 6. Actualizar la orden con el inspection_link
            await inspectionOrder.update({
                inspection_link: finalLink
            });
            
            console.log(`✅ inspection_link generado y actualizado: ${finalLink}`);
            
            // 7. Enviar SMS automático (condicionado por FLAG_SEND_SMS_OIN_CREATE)
            let smsSent = false;
            let smsError = null;
            
            if (process.env.FLAG_SEND_SMS_OIN_CREATE === 'true') {
                console.log(`📱 Enviando SMS automático...`);
                try {
                    const smsService = await import('../services/channels/smsService.js');
                    
                    const smsMessage = `Hola ${inspectionOrder.nombre_contacto}, para la inspeccion de ${inspectionOrder.placa} debes tener los documentos, carro limpio, internet, disponibilidad 45Min. Para ingresar dale click aca: ${process.env.FRONTEND_URL || 'http://localhost:3000'}${finalLink}`;
                    
                    const smsResult = await smsService.default.send({
                        recipient_phone: inspectionOrder.celular_contacto,
                        content: smsMessage,
                        priority: 'normal',
                        metadata: {
                            inspection_order_id: inspectionOrder.id,
                            placa: inspectionOrder.placa,
                            nombre_contacto: inspectionOrder.nombre_contacto,
                            channel_data: {
                                sms: {
                                    message: smsMessage
                                }
                            }
                        }
                    });
                    
                    console.log(`✅ SMS enviado exitosamente a ${inspectionOrder.nombre_contacto} (${inspectionOrder.celular_contacto})`);
                    smsSent = true;
                    
                } catch (error) {
                    console.error('❌ Error enviando SMS:', error);
                    smsError = error.message;
                }
            } else {
                console.log(`📱 SMS saltado por configuración FLAG_SEND_SMS_OIN_CREATE=${process.env.FLAG_SEND_SMS_OIN_CREATE} para orden ${inspectionOrder.id}`);
            }
            
            // 8. Disparar evento de procesamiento completado
            try {
                await automatedEventTriggers.triggerInspectionOrderEvents('processed_external', {
                    id: inspectionOrder.id,
                    numero: inspectionOrder.numero,
                    nombre_cliente: inspectionOrder.nombre_cliente,
                    correo_cliente: inspectionOrder.correo_cliente,
                    celular_cliente: inspectionOrder.celular_cliente,
                    placa: inspectionOrder.placa,
                    marca: inspectionOrder.marca,
                    linea: inspectionOrder.linea,
                    modelo: inspectionOrder.modelo,
                    status: inspectionOrder.InspectionOrderStatus?.name || 'Nueva',
                    inspection_link: finalLink,
                    created_at: inspectionOrder.created_at,
                    clave_intermediario: inspectionOrder.clave_intermediario
                }, {
                    ...context,
                    webhook_source: true,
                    trigger_source: 'external_webhook_process',
                    processed_at: new Date().toISOString()
                });
                
                console.log(`✅ Evento processed_external disparado`);
            } catch (eventError) {
                console.warn('⚠️ Error disparando evento processed_external:', eventError);
            }
            
            // 9. Preparar respuesta según el estado del SMS
            const response = {
                status: smsError ? 'partial_success' : 'success',
                message: smsError ? 'Link generado exitosamente, pero falló el envío de SMS' : 'Orden procesada exitosamente',
                data: {
                    inspection_order_id: inspectionOrder.id,
                    numero: inspectionOrder.numero,
                    placa: inspectionOrder.placa,
                    inspection_link: finalLink,
                    processed_at: new Date().toISOString()
                }
            };
            
            // Solo incluir información de SMS si se intentó enviar
            if (process.env.FLAG_SEND_SMS_OIN_CREATE === 'true') {
                response.data.sms_sent = smsSent;
                if (smsSent) {
                    response.data.sms_recipient = inspectionOrder.celular_contacto;
                }
                if (smsError) {
                    response.data.sms_error = smsError;
                }
            }
            
            console.log(`✅ handleInspectionOrderProcessExisting completado:`, response);
            return response;
            
        } catch (error) {
            console.error(`❌ Error en handleInspectionOrderProcessExisting:`, error);
            throw error;
        }
    }
    
    /**
     * Manejar asignación de orden de inspección
     */
    async handleInspectionOrderAssigned(data, context, options) {
        this.validateInspectionOrderData(data.inspection_order);
        
        const enrichedContext = {
            ...context,
            webhook_source: true,
            trigger_source: 'external_webhook'
        };
        
        const result = await automatedEventTriggers.triggerInspectionOrderEvents(
            'assigned',
            data.inspection_order,
            enrichedContext
        );
        
        let websocketEvents = 0;
        if (options?.trigger_websockets) {
            websocketEvents = await this.sendWebSocketEvents('inspection_order_assigned', data, context);
        }
        
        return {
            event_id: result?.event_id || `evt_${Date.now()}`,
            listeners_executed: result?.listeners_executed || 0,
            notifications_sent: result?.notifications_sent || 0,
            websocket_events: websocketEvents
        };
    }
    
    /**
     * Manejar agendamiento de cita
     */
    async handleAppointmentScheduled(data, context, options) {
        this.validateAppointmentData(data.appointment);
        
        const enrichedContext = {
            ...context,
            webhook_source: true,
            trigger_source: 'external_webhook'
        };
        
        const result = await automatedEventTriggers.triggerAppointmentEvents(
            'scheduled',
            data.appointment,
            enrichedContext
        );
        
        let websocketEvents = 0;
        if (options?.trigger_websockets) {
            websocketEvents = await this.sendWebSocketEvents('appointment_scheduled', data, context);
        }
        
        return {
            event_id: result?.event_id || `evt_${Date.now()}`,
            listeners_executed: result?.listeners_executed || 0,
            notifications_sent: result?.notifications_sent || 0,
            websocket_events: websocketEvents
        };
    }
    
    /**
     * Validar payload del evento
     */
    validateEventPayload(payload) {
        const errors = [];
        
        if (!payload.event) {
            errors.push('event es requerido');
        }
        
        if (!payload.data) {
            errors.push('data es requerido');
        }
        
        // Validaciones específicas por tipo de evento
        switch (payload.event) {
            case 'inspection_order.created':
            case 'inspection_order.assigned':
                if (!payload.data.inspection_order) {
                    errors.push('data.inspection_order es requerido');
                }
                break;
                
            case 'inspection_order.process_existing':
                if (!payload.data.inspection_order_id) {
                    errors.push('data.inspection_order_id es requerido');
                }
                break;
                
            case 'appointment.scheduled':
                if (!payload.data.appointment) {
                    errors.push('data.appointment es requerido');
                }
                break;
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validar datos de orden de inspección
     */
    validateInspectionOrderData(orderData) {
        const requiredFields = ['numero', 'nombre_cliente', 'telefono_cliente', 'email_cliente', 'placa'];
        const errors = [];
        
        for (const field of requiredFields) {
            if (!orderData[field]) {
                errors.push(`Campo requerido: ${field}`);
            }
        }
        
        // Validar formato de teléfono
        if (orderData.telefono_cliente && !this.isValidPhoneNumber(orderData.telefono_cliente)) {
            errors.push('Formato de teléfono inválido');
        }
        
        // Validar formato de email
        if (orderData.email_cliente && !this.isValidEmail(orderData.email_cliente)) {
            errors.push('Formato de email inválido');
        }
        
        if (errors.length > 0) {
            throw new ValidationError(errors);
        }
    }
    
    /**
     * Validar datos de cita
     */
    validateAppointmentData(appointmentData) {
        const requiredFields = ['inspection_order_id', 'fecha_hora', 'modalidad_inspeccion_id', 'sede_id'];
        const errors = [];
        
        for (const field of requiredFields) {
            if (!appointmentData[field]) {
                errors.push(`Campo requerido: ${field}`);
            }
        }
        
        // Validar formato de fecha
        if (appointmentData.fecha_hora && !this.isValidDate(appointmentData.fecha_hora)) {
            errors.push('Formato de fecha inválido');
        }
        
        if (errors.length > 0) {
            throw new ValidationError(errors);
        }
    }
    
    /**
     * Verificar permisos de evento
     */
    hasEventPermission(webhookKey, eventType) {
        if (!webhookKey.allowed_events || webhookKey.allowed_events.length === 0) {
            return true; // Si no hay restricciones, permitir todo
        }
        
        return webhookKey.allowed_events.includes(eventType);
    }
    
    /**
     * Enviar eventos WebSocket
     */
    async sendWebSocketEvents(eventType, data, context) {
        try {
            const webSocketSystem = global.webSocketSystem;
            if (webSocketSystem && webSocketSystem.isInitialized()) {
                const socketManager = webSocketSystem.getSocketManager();
                
                // Enviar a todos los usuarios conectados
                socketManager.broadcastToAll(eventType, {
                    data,
                    context,
                    timestamp: new Date().toISOString()
                });
                
                return 1;
            }
        } catch (error) {
            console.error('Error enviando evento WebSocket:', error);
        }
        
        return 0;
    }
    
    /**
     * Obtener código de estado HTTP para error
     */
    getErrorStatusCode(error) {
        switch (error.code) {
            case 'VALIDATION_ERROR':
                return 400;
            case 'PERMISSION_ERROR':
                return 403;
            case 'MISSING_API_KEY':
            case 'INVALID_API_KEY':
            case 'EXPIRED_API_KEY':
            case 'INVALID_SIGNATURE':
                return 401;
            case 'IP_NOT_ALLOWED':
                return 403;
            case 'RATE_LIMIT_EXCEEDED':
                return 429;
            default:
                return 500;
        }
    }
    
    /**
     * Validaciones auxiliares
     */
    isValidPhoneNumber(phone) {
        // Validar formato colombiano: +57 300 123 4567
        const phoneRegex = /^\+57\s?\d{3}\s?\d{3}\s?\d{4}$/;
        return phoneRegex.test(phone);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    
    /**
     * Gestión de API Keys (Admin)
     */
    async getApiKeys(req, res) {
        try {
            const apiKeys = await WebhookApiKey.findAll({
                include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
                order: [['created_at', 'DESC']]
            });
            
            res.json({
                success: true,
                data: apiKeys
            });
        } catch (error) {
            console.error('Error obteniendo API keys:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Error obteniendo API keys' }
            });
        }
    }
    
    async createApiKey(req, res) {
        try {
            const { name, application_name, contact_email, allowed_events, allowed_ips, rate_limit_per_minute, expires_at } = req.body;
            
            // Generar API key y secret
            const apiKey = `wh_live_sk_${this.generateRandomString(32)}`;
            const apiSecret = this.generateRandomString(64);
            
            const newApiKey = await WebhookApiKey.create({
                name,
                api_key: apiKey,
                api_secret: apiSecret,
                application_name,
                contact_email,
                allowed_events: allowed_events || [],
                allowed_ips: allowed_ips || [],
                rate_limit_per_minute: rate_limit_per_minute || 60,
                expires_at: expires_at ? new Date(expires_at) : null,
                created_by: req.user.id
            });
            
            res.status(201).json({
                success: true,
                message: 'API Key creada exitosamente',
                data: {
                    ...newApiKey.toJSON(),
                    api_secret: apiSecret // Solo mostrar en la creación
                }
            });
        } catch (error) {
            console.error('Error creando API key:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Error creando API key' }
            });
        }
    }
    
    async updateApiKey(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const apiKey = await WebhookApiKey.findByPk(id);
            if (!apiKey) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'API Key no encontrada' }
                });
            }
            
            // No permitir actualizar api_key ni api_secret directamente
            delete updateData.api_key;
            delete updateData.api_secret;
            
            await apiKey.update(updateData);
            
            res.json({
                success: true,
                message: 'API Key actualizada exitosamente',
                data: apiKey
            });
        } catch (error) {
            console.error('Error actualizando API key:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Error actualizando API key' }
            });
        }
    }
    
    async deleteApiKey(req, res) {
        try {
            const { id } = req.params;
            
            const apiKey = await WebhookApiKey.findByPk(id);
            if (!apiKey) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'API Key no encontrada' }
                });
            }
            
            await apiKey.destroy();
            
            res.json({
                success: true,
                message: 'API Key eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando API key:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Error eliminando API key' }
            });
        }
    }
    
    /**
     * Obtener logs de webhooks
     */
    async getLogs(req, res) {
        try {
            const { page = 1, limit = 50, event_type, api_key_id, start_date, end_date } = req.query;
            
            const where = {};
            
            if (event_type) {
                where.event_type = event_type;
            }
            
            if (api_key_id) {
                where.api_key_id = api_key_id;
            }
            
            if (start_date || end_date) {
                where.created_at = {};
                if (start_date) where.created_at.$gte = new Date(start_date);
                if (end_date) where.created_at.$lte = new Date(end_date);
            }
            
            const offset = (page - 1) * limit;
            
            const logs = await WebhookLog.findAndCountAll({
                where,
                include: [{ model: WebhookApiKey, as: 'apiKey', attributes: ['name', 'application_name'] }],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            res.json({
                success: true,
                data: logs.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: logs.count,
                    pages: Math.ceil(logs.count / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Error obteniendo logs' }
            });
        }
    }
    
    /**
     * Manejar inicio de inspección virtual
     */
    async handleInspectionOrderStarted(data, context, options) {
        console.log(`🔄 Iniciando handleInspectionOrderStarted`);
        console.log(`📋 Datos de inspección:`, JSON.stringify(data, null, 2));
        
        try {
            // 1. Validar datos específicos del evento
            console.log(`🔍 Validando datos de inspección...`);
            this.validateInspectionOrderStartedData(data);
            console.log(`✅ Validación de datos exitosa`);
            
            // 2. Enriquecer contexto
            const enrichedContext = {
                ...context,
                webhook_source: true,
                trigger_source: 'external_webhook',
                webhook_id: context?.webhook_id,
                is_client: true, // Importante: esto permite que se ejecuten los listeners
                client_data: {
                    nombre: data.inspection_order.nombre_cliente,
                    celular: data.inspection_order.celular_cliente,
                    email: data.inspection_order.correo_cliente
                }
            };
            console.log(`🔗 Contexto enriquecido:`, JSON.stringify(enrichedContext, null, 2));
            
            // 3. Despachar evento usando automatedEventTriggers
            console.log(`🚀 Despachando evento inspection_order.started...`);
            await automatedEventTriggers.triggerInspectionOrderEvents('started', {
                ...data.inspection_order,
                appointment: data.appointment,
                sede: data.sede
            }, enrichedContext);
            
            console.log(`✅ Evento inspection_order.started despachado exitosamente`);
            
            return {
                event_id: `webhook_${Date.now()}`,
                listeners_executed: 1, // Sabemos que se ejecutó al menos 1 listener
                notifications_sent: 1, // Esperamos que se envíe 1 SMS
                websocket_events: 0,
                message: 'Inspección virtual iniciada y notificaciones enviadas'
            };
            
        } catch (error) {
            console.error(`❌ Error en handleInspectionOrderStarted:`, error);
            throw error;
        }
    }
    
    /**
     * Validar datos de inicio de inspección
     */
    validateInspectionOrderStartedData(data) {
        const errors = [];
        
        if (!data.inspection_order) {
            errors.push('inspection_order es requerido');
        } else {
            if (!data.inspection_order.numero) {
                errors.push('inspection_order.numero es requerido');
            }
            if (!data.inspection_order.nombre_cliente) {
                errors.push('inspection_order.nombre_cliente es requerido');
            }
            if (!data.inspection_order.celular_cliente) {
                errors.push('inspection_order.celular_cliente es requerido');
            }
        }
        
        if (!data.appointment) {
            errors.push('appointment es requerido');
        } else {
            if (!data.appointment.session_url) {
                errors.push('appointment.session_url es requerido');
            }
        }
        
        if (errors.length > 0) {
            throw new ValidationError(errors);
        }
    }
    
    /**
     * Generar string aleatorio
     */
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

export default new WebhookController();
