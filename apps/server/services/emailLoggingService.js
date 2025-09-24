import InspectionOrderEmailLog from '../models/inspectionOrderEmailLog.js';

/**
 * Servicio para logging de emails de órdenes de inspección
 * Maneja el registro, actualización y consulta de logs de emails
 */
class EmailLoggingService {
    
    /**
     * Crear un nuevo log de email
     * @param {Object} emailData - Datos del email a loggear
     * @param {number} emailData.inspection_order_id - ID de la orden de inspección
     * @param {string} emailData.recipient_email - Email del destinatario
     * @param {string} emailData.recipient_name - Nombre del destinatario
     * @param {string} emailData.subject - Asunto del email
     * @param {string} emailData.content - Contenido en texto plano
     * @param {string} emailData.html_content - Contenido HTML
     * @param {string} emailData.email_type - Tipo de email (initial, resend, etc.)
     * @param {string} emailData.trigger_source - Fuente que disparó el envío
     * @param {number} emailData.user_id - ID del usuario (opcional)
     * @param {string} emailData.webhook_id - ID del webhook (opcional)
     * @param {string} emailData.priority - Prioridad del email (opcional)
     * @param {Object} emailData.metadata - Metadatos adicionales (opcional)
     * @returns {Promise<Object>} Resultado del log creado
     */
    static async createEmailLog(emailData) {
        try {
            console.log(`📧 Creando log de email para orden ${emailData.inspection_order_id}...`);
            
            const emailLog = await InspectionOrderEmailLog.create({
                inspection_order_id: emailData.inspection_order_id,
                recipient_email: emailData.recipient_email,
                recipient_name: emailData.recipient_name,
                subject: emailData.subject,
                content: emailData.content,
                html_content: emailData.html_content,
                status: 'pending',
                priority: emailData.priority || 'normal',
                email_type: emailData.email_type || 'initial',
                trigger_source: emailData.trigger_source || 'model_hook',
                user_id: emailData.user_id || null,
                webhook_id: emailData.webhook_id || null,
                retry_count: 0,
                metadata: emailData.metadata || null
            });

            console.log(`✅ Log de email creado exitosamente con ID: ${emailLog.id}`);
            
            return {
                success: true,
                emailLog: emailLog,
                message: 'Log de email creado exitosamente'
            };
            
        } catch (error) {
            console.error('❌ Error creando log de email:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error creando log de email'
            };
        }
    }

    /**
     * Actualizar el estado de un log de email
     * @param {number} emailLogId - ID del log de email
     * @param {Object} updateData - Datos a actualizar
     * @param {string} updateData.status - Nuevo estado
     * @param {string} updateData.provider_response - Respuesta del proveedor
     * @param {string} updateData.error_message - Mensaje de error
     * @param {string} updateData.message_id - ID del mensaje
     * @param {Date} updateData.sent_at - Fecha de envío
     * @param {Date} updateData.delivered_at - Fecha de entrega
     * @param {Date} updateData.opened_at - Fecha de apertura
     * @param {Date} updateData.clicked_at - Fecha de click
     * @param {number} updateData.retry_count - Contador de reintentos
     * @returns {Promise<Object>} Resultado de la actualización
     */
    static async updateEmailLog(emailLogId, updateData) {
        try {
            console.log(`📧 Actualizando log de email ID: ${emailLogId}...`);
            
            const emailLog = await InspectionOrderEmailLog.findByPk(emailLogId);
            if (!emailLog) {
                throw new Error(`Log de email con ID ${emailLogId} no encontrado`);
            }

            // Actualizar campos
            const fieldsToUpdate = {};
            if (updateData.status) fieldsToUpdate.status = updateData.status;
            if (updateData.provider_response) fieldsToUpdate.provider_response = updateData.provider_response;
            if (updateData.error_message) fieldsToUpdate.error_message = updateData.error_message;
            if (updateData.message_id) fieldsToUpdate.message_id = updateData.message_id;
            if (updateData.sent_at) fieldsToUpdate.sent_at = updateData.sent_at;
            if (updateData.delivered_at) fieldsToUpdate.delivered_at = updateData.delivered_at;
            if (updateData.opened_at) fieldsToUpdate.opened_at = updateData.opened_at;
            if (updateData.clicked_at) fieldsToUpdate.clicked_at = updateData.clicked_at;
            if (updateData.retry_count !== undefined) fieldsToUpdate.retry_count = updateData.retry_count;
            if (updateData.metadata) fieldsToUpdate.metadata = updateData.metadata;

            await emailLog.update(fieldsToUpdate);

            console.log(`✅ Log de email actualizado exitosamente`);
            
            return {
                success: true,
                emailLog: emailLog,
                message: 'Log de email actualizado exitosamente'
            };
            
        } catch (error) {
            console.error('❌ Error actualizando log de email:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error actualizando log de email'
            };
        }
    }

    /**
     * Marcar email como enviado exitosamente
     * @param {number} emailLogId - ID del log de email
     * @param {Object} sendResult - Resultado del envío
     * @param {string} sendResult.messageId - ID del mensaje del proveedor
     * @param {Object} sendResult.providerResponse - Respuesta del proveedor
     * @returns {Promise<Object>} Resultado de la actualización
     */
    static async markEmailAsSent(emailLogId, sendResult) {
        try {
            console.log(`📧 Marcando email como enviado - Log ID: ${emailLogId}...`);
            
            const updateData = {
                status: 'sent',
                sent_at: new Date(),
                message_id: sendResult.messageId || null,
                provider_response: sendResult.providerResponse ? JSON.stringify(sendResult.providerResponse) : null
            };

            return await this.updateEmailLog(emailLogId, updateData);
            
        } catch (error) {
            console.error('❌ Error marcando email como enviado:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error marcando email como enviado'
            };
        }
    }

    /**
     * Marcar email como fallido
     * @param {number} emailLogId - ID del log de email
     * @param {string} errorMessage - Mensaje de error
     * @param {Object} providerResponse - Respuesta del proveedor (opcional)
     * @returns {Promise<Object>} Resultado de la actualización
     */
    static async markEmailAsFailed(emailLogId, errorMessage, providerResponse = null) {
        try {
            console.log(`📧 Marcando email como fallido - Log ID: ${emailLogId}...`);
            
            const updateData = {
                status: 'failed',
                error_message: errorMessage,
                provider_response: providerResponse ? JSON.stringify(providerResponse) : null
            };

            return await this.updateEmailLog(emailLogId, updateData);
            
        } catch (error) {
            console.error('❌ Error marcando email como fallido:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error marcando email como fallido'
            };
        }
    }

    /**
     * Obtener logs de email por orden de inspección
     * @param {number} inspectionOrderId - ID de la orden de inspección
     * @param {Object} options - Opciones de consulta
     * @param {string} options.status - Filtrar por estado
     * @param {string} options.email_type - Filtrar por tipo
     * @param {number} options.limit - Límite de resultados
     * @param {number} options.offset - Offset para paginación
     * @returns {Promise<Object>} Lista de logs de email
     */
    static async getEmailLogsByInspectionOrder(inspectionOrderId, options = {}) {
        try {
            console.log(`📧 Obteniendo logs de email para orden ${inspectionOrderId}...`);
            
            const whereClause = {
                inspection_order_id: inspectionOrderId
            };

            if (options.status) {
                whereClause.status = options.status;
            }

            if (options.email_type) {
                whereClause.email_type = options.email_type;
            }

            const queryOptions = {
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit: options.limit || 50,
                offset: options.offset || 0
            };

            const emailLogs = await InspectionOrderEmailLog.findAndCountAll(queryOptions);

            console.log(`✅ Encontrados ${emailLogs.count} logs de email`);
            
            return {
                success: true,
                emailLogs: emailLogs.rows,
                total: emailLogs.count,
                message: 'Logs de email obtenidos exitosamente'
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo logs de email:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error obteniendo logs de email'
            };
        }
    }

    /**
     * Obtener estadísticas de emails por orden de inspección
     * @param {number} inspectionOrderId - ID de la orden de inspección
     * @returns {Promise<Object>} Estadísticas de emails
     */
    static async getEmailStatsByInspectionOrder(inspectionOrderId) {
        try {
            console.log(`📧 Obteniendo estadísticas de email para orden ${inspectionOrderId}...`);
            
            const stats = await InspectionOrderEmailLog.findAll({
                where: {
                    inspection_order_id: inspectionOrderId
                },
                attributes: [
                    'status',
                    [InspectionOrderEmailLog.sequelize.fn('COUNT', InspectionOrderEmailLog.sequelize.col('id')), 'count']
                ],
                group: ['status'],
                raw: true
            });

            const totalEmails = await InspectionOrderEmailLog.count({
                where: {
                    inspection_order_id: inspectionOrderId
                }
            });

            const statsObject = {
                total: totalEmails,
                by_status: {}
            };

            stats.forEach(stat => {
                statsObject.by_status[stat.status] = parseInt(stat.count);
            });

            console.log(`✅ Estadísticas de email obtenidas: ${totalEmails} total`);
            
            return {
                success: true,
                stats: statsObject,
                message: 'Estadísticas de email obtenidas exitosamente'
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de email:', error);
            return {
                success: false,
                error: error.message,
                message: 'Error obteniendo estadísticas de email'
            };
        }
    }

    /**
     * Procesar envío de email con logging completo
     * @param {Object} emailData - Datos del email
     * @param {Function} sendFunction - Función para enviar el email
     * @returns {Promise<Object>} Resultado completo del envío y logging
     */
    static async sendEmailWithLogging(emailData, sendFunction) {
        let emailLog = null;
        
        try {
            // 1. Crear log inicial
            const logResult = await this.createEmailLog(emailData);
            if (!logResult.success) {
                throw new Error(`Error creando log: ${logResult.error}`);
            }
            emailLog = logResult.emailLog;

            // 2. Enviar email
            console.log(`📧 Enviando email a: ${emailData.recipient_email}`);
            const sendResult = await sendFunction();

            // 3. Marcar como enviado exitosamente
            await this.markEmailAsSent(emailLog.id, sendResult);

            console.log(`✅ Email enviado y loggeado exitosamente - Log ID: ${emailLog.id}`);
            
            return {
                success: true,
                emailLog: emailLog,
                sendResult: sendResult,
                message: 'Email enviado y loggeado exitosamente'
            };
            
        } catch (error) {
            console.error('❌ Error en envío de email:', error);
            
            // Marcar como fallido si se creó el log
            if (emailLog) {
                await this.markEmailAsFailed(emailLog.id, error.message);
            }
            
            return {
                success: false,
                error: error.message,
                emailLog: emailLog,
                message: 'Error en envío de email'
            };
        }
    }
}

export default EmailLoggingService;
