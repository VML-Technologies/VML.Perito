import InspectionOrderSmsLog from '../models/inspectionOrderSmsLog.js';

/**
 * Servicio para logging de SMS
 * Centraliza el registro de todos los envíos de SMS en el sistema
 */
class SmsLoggingService {
    constructor() {
        this.logSmsSent = this.logSmsSent.bind(this);
        this.logSmsFailed = this.logSmsFailed.bind(this);
        this.logSmsDelivered = this.logSmsDelivered.bind(this);
    }

    /**
     * Loggear SMS enviado exitosamente
     * @param {Object} smsData - Datos del SMS enviado
     * @returns {Promise<Object>} Log creado
     */
    async logSmsSent(smsData) {
        try {
            const {
                inspection_order_id,
                recipient_phone,
                recipient_name,
                content,
                priority = 'normal',
                sms_type = 'initial',
                trigger_source = 'manual',
                user_id = null,
                webhook_id = null,
                provider_response = null,
                metadata = null
            } = smsData;

            // Validar datos requeridos
            if (!inspection_order_id || !recipient_phone || !content) {
                throw new Error('inspection_order_id, recipient_phone y content son requeridos');
            }

            const smsLog = await InspectionOrderSmsLog.create({
                inspection_order_id,
                recipient_phone,
                recipient_name,
                content,
                status: 'sent',
                priority,
                sms_type,
                trigger_source,
                user_id,
                webhook_id,
                provider_response: provider_response || null,
                sent_at: new Date(),
                metadata: metadata || null
            });

            console.log(`📱 SMS log creado: ${smsLog.id} para orden ${inspection_order_id} (${trigger_source})`);
            return smsLog;
        } catch (error) {
            console.error('❌ Error loggeando SMS enviado:', error);
            throw error;
        }
    }

    /**
     * Loggear SMS fallido
     * @param {Object} smsData - Datos del SMS fallido
     * @returns {Promise<Object>} Log creado
     */
    async logSmsFailed(smsData) {
        try {
            const {
                inspection_order_id,
                recipient_phone,
                recipient_name,
                content,
                priority = 'normal',
                sms_type = 'initial',
                trigger_source = 'manual',
                user_id = null,
                webhook_id = null,
                error_message = null,
                provider_response = null,
                metadata = null
            } = smsData;

            // Validar datos requeridos
            if (!inspection_order_id || !recipient_phone || !content) {
                throw new Error('inspection_order_id, recipient_phone y content son requeridos');
            }

            const smsLog = await InspectionOrderSmsLog.create({
                inspection_order_id,
                recipient_phone,
                recipient_name,
                content,
                status: 'failed',
                priority,
                sms_type,
                trigger_source,
                user_id,
                webhook_id,
                error_message,
                provider_response: provider_response || null,
                metadata: metadata || null
            });

            console.log(`📱 SMS fallido loggeado: ${smsLog.id} para orden ${inspection_order_id} (${trigger_source})`);
            return smsLog;
        } catch (error) {
            console.error('❌ Error loggeando SMS fallido:', error);
            throw error;
        }
    }

    /**
     * Actualizar SMS como entregado
     * @param {number} smsLogId - ID del log de SMS
     * @param {Object} deliveryData - Datos de entrega
     * @returns {Promise<Object>} Log actualizado
     */
    async logSmsDelivered(smsLogId, deliveryData = {}) {
        try {
            const smsLog = await InspectionOrderSmsLog.findByPk(smsLogId);
            
            if (!smsLog) {
                throw new Error(`SMS log con ID ${smsLogId} no encontrado`);
            }

            await smsLog.update({
                status: 'delivered',
                delivered_at: new Date(),
                provider_response: deliveryData.provider_response || smsLog.provider_response
            });

            console.log(`📱 SMS marcado como entregado: ${smsLogId}`);
            return smsLog;
        } catch (error) {
            console.error('❌ Error marcando SMS como entregado:', error);
            throw error;
        }
    }

    /**
     * Loggear SMS con manejo automático de éxito/fallo
     * @param {Object} smsData - Datos del SMS
     * @param {Function} smsSendFunction - Función que envía el SMS
     * @returns {Promise<Object>} Resultado del envío y log
     */
    async logSmsWithSend(smsData, smsSendFunction) {
        let smsLog = null;
        
        try {
            // Crear log inicial como pending
            smsLog = await InspectionOrderSmsLog.create({
                inspection_order_id: smsData.inspection_order_id,
                recipient_phone: smsData.recipient_phone,
                recipient_name: smsData.recipient_name,
                content: smsData.content,
                status: 'pending',
                priority: smsData.priority || 'normal',
                sms_type: smsData.sms_type || 'initial',
                trigger_source: smsData.trigger_source || 'manual',
                user_id: smsData.user_id || null,
                webhook_id: smsData.webhook_id || null,
                metadata: smsData.metadata || null
            });

            console.log(`📱 SMS log creado (pending): ${smsLog.id} para orden ${smsData.inspection_order_id}`);

            // Intentar enviar el SMS
            const sendResult = await smsSendFunction();

            // Actualizar log con éxito
            await smsLog.update({
                status: 'sent',
                sent_at: new Date(),
                provider_response: sendResult ? JSON.stringify(sendResult) : null
            });

            console.log(`📱 SMS enviado exitosamente: ${smsLog.id}`);
            
            return {
                success: true,
                smsLog,
                sendResult
            };

        } catch (error) {
            console.error('❌ Error enviando SMS:', error);
            
            // Actualizar log con fallo si existe
            if (smsLog) {
                await smsLog.update({
                    status: 'failed',
                    error_message: error.message,
                    provider_response: error.provider_response ? JSON.stringify(error.provider_response) : null
                });
            }

            return {
                success: false,
                smsLog,
                error: error.message
            };
        }
    }

    /**
     * Obtener estadísticas de SMS por orden
     * @param {number} inspectionOrderId - ID de la orden de inspección
     * @returns {Promise<Object>} Estadísticas
     */
    async getSmsStatsByOrder(inspectionOrderId) {
        try {
            const stats = await InspectionOrderSmsLog.findAll({
                where: {
                    inspection_order_id: inspectionOrderId,
                    deleted_at: null
                },
                attributes: [
                    'status',
                    'sms_type',
                    'trigger_source',
                    [InspectionOrderSmsLog.sequelize.fn('COUNT', InspectionOrderSmsLog.sequelize.col('id')), 'count']
                ],
                group: ['status', 'sms_type', 'trigger_source'],
                raw: true
            });

            return {
                inspection_order_id: inspectionOrderId,
                stats
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de SMS por orden:', error);
            throw error;
        }
    }

    /**
     * Obtener historial de SMS por orden
     * @param {number} inspectionOrderId - ID de la orden de inspección
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Historial de SMS
     */
    async getSmsHistoryByOrder(inspectionOrderId, limit = 10) {
        try {
            const smsHistory = await InspectionOrderSmsLog.findAll({
                where: {
                    inspection_order_id: inspectionOrderId,
                    deleted_at: null
                },
                include: [
                    {
                        model: (await import('../models/index.js')).User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit)
            });

            return smsHistory;
        } catch (error) {
            console.error('❌ Error obteniendo historial de SMS por orden:', error);
            throw error;
        }
    }
}

export default new SmsLoggingService();
