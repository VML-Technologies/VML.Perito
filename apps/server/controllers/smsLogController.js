import { BaseController } from './baseController.js';
import InspectionOrderSmsLog from '../models/inspectionOrderSmsLog.js';
import InspectionOrder from '../models/inspectionOrder.js';
import User from '../models/user.js';
import { registerPermission } from '../middleware/permissionRegistry.js';
import { Op } from 'sequelize';

// Registrar permisos
registerPermission({
    name: 'sms_logs.read',
    resource: 'sms_logs',
    action: 'read',
    endpoint: '/api/sms-logs',
    method: 'GET',
    description: 'Ver logs de SMS',
});

registerPermission({
    name: 'sms_logs.create',
    resource: 'sms_logs',
    action: 'create',
    endpoint: '/api/sms-logs',
    method: 'POST',
    description: 'Crear logs de SMS',
});

registerPermission({
    name: 'sms_logs.update',
    resource: 'sms_logs',
    action: 'update',
    endpoint: '/api/sms-logs/:id',
    method: 'PUT',
    description: 'Actualizar logs de SMS',
});

registerPermission({
    name: 'sms_logs.delete',
    resource: 'sms_logs',
    action: 'delete',
    endpoint: '/api/sms-logs/:id',
    method: 'DELETE',
    description: 'Eliminar logs de SMS',
});

registerPermission({
    name: 'sms_logs.stats',
    resource: 'sms_logs',
    action: 'stats',
    endpoint: '/api/sms-logs/stats',
    method: 'GET',
    description: 'Ver estadísticas de SMS',
});

class SmsLogController extends BaseController {
    constructor() {
        super(InspectionOrderSmsLog);

        // Bind methods
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getByInspectionOrder = this.getByInspectionOrder.bind(this);
        this.logSmsSent = this.logSmsSent.bind(this);
        this.logSmsFailed = this.logSmsFailed.bind(this);
        this.logSmsDelivered = this.logSmsDelivered.bind(this);
    }

    /**
     * Listar logs de SMS con paginación, búsqueda y filtros
     */
    async index(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = '',
                sms_type = '',
                trigger_source = '',
                date_from = '',
                date_to = '',
                inspection_order_id = '',
                sortBy = 'created_at',
                sortOrder = 'DESC'
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Construir condiciones WHERE
            const whereConditions = {
                deleted_at: null
            };

            // Búsqueda por texto
            if (search) {
                const searchFields = [
                    { recipient_phone: { [Op.like]: `%${search}%` } },
                    { recipient_name: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } }
                ];

                whereConditions[Op.or] = searchFields;
            }

            // Filtros específicos
            if (status) {
                whereConditions.status = status;
            }

            if (sms_type) {
                whereConditions.sms_type = sms_type;
            }

            if (trigger_source) {
                whereConditions.trigger_source = trigger_source;
            }

            if (inspection_order_id) {
                whereConditions.inspection_order_id = inspection_order_id;
            }

            // Filtros de fecha
            if (date_from || date_to) {
                const dateConditions = {};

                if (date_from) {
                    dateConditions[Op.gte] = new Date(date_from);
                }

                if (date_to) {
                    const endDate = new Date(date_to);
                    endDate.setHours(23, 59, 59, 999);
                    dateConditions[Op.lte] = endDate;
                }

                whereConditions.created_at = dateConditions;
            }

            // Validar campos de ordenamiento
            const allowedSortFields = [
                'id', 'created_at', 'sent_at', 'delivered_at', 'status', 
                'recipient_phone', 'sms_type', 'trigger_source'
            ];
            const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
            const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

            const includes = [
                {
                    model: InspectionOrder,
                    as: 'inspectionOrder',
                    attributes: ['id', 'numero', 'placa', 'nombre_cliente'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ];

            const { count, rows } = await InspectionOrderSmsLog.findAndCountAll({
                where: whereConditions,
                include: includes,
                limit: parseInt(limit),
                offset: offset,
                order: [[validSortBy, validSortOrder]],
                distinct: true
            });

            res.json({
                success: true,
                data: {
                    sms_logs: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        pages: Math.ceil(count / parseInt(limit)),
                        limit: parseInt(limit),
                        hasNext: parseInt(page) < Math.ceil(count / parseInt(limit)),
                        hasPrev: parseInt(page) > 1
                    },
                    filters: {
                        search,
                        status,
                        sms_type,
                        trigger_source,
                        date_from,
                        date_to,
                        inspection_order_id,
                        sortBy: validSortBy,
                        sortOrder: validSortOrder
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener logs de SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs de SMS',
                error: error.message
            });
        }
    }

    /**
     * Obtener logs de SMS por orden de inspección
     */
    async getByInspectionOrder(req, res) {
        try {
            const { inspection_order_id } = req.params;
            const { limit = 10 } = req.query;

            if (!inspection_order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de orden de inspección es requerido'
                });
            }

            const smsLogs = await InspectionOrderSmsLog.findAll({
                where: {
                    inspection_order_id: inspection_order_id,
                    deleted_at: null
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                data: {
                    inspection_order_id,
                    sms_logs: smsLogs,
                    total: smsLogs.length
                }
            });
        } catch (error) {
            console.error('Error al obtener logs de SMS por orden:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs de SMS por orden',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de SMS
     */
    async getStats(req, res) {
        try {
            const { date_from, date_to } = req.query;

            const whereConditions = {
                deleted_at: null
            };

            // Filtros de fecha
            if (date_from || date_to) {
                const dateConditions = {};

                if (date_from) {
                    dateConditions[Op.gte] = new Date(date_from);
                }

                if (date_to) {
                    const endDate = new Date(date_to);
                    endDate.setHours(23, 59, 59, 999);
                    dateConditions[Op.lte] = endDate;
                }

                whereConditions.created_at = dateConditions;
            }

            const [
                total,
                sent,
                delivered,
                failed,
                pending,
                byType,
                bySource
            ] = await Promise.all([
                // Total de SMS
                InspectionOrderSmsLog.count({ where: whereConditions }),

                // SMS enviados
                InspectionOrderSmsLog.count({
                    where: {
                        ...whereConditions,
                        status: 'sent'
                    }
                }),

                // SMS entregados
                InspectionOrderSmsLog.count({
                    where: {
                        ...whereConditions,
                        status: 'delivered'
                    }
                }),

                // SMS fallidos
                InspectionOrderSmsLog.count({
                    where: {
                        ...whereConditions,
                        status: { [Op.in]: ['failed', 'error'] }
                    }
                }),

                // SMS pendientes
                InspectionOrderSmsLog.count({
                    where: {
                        ...whereConditions,
                        status: 'pending'
                    }
                }),

                // Por tipo de SMS
                InspectionOrderSmsLog.findAll({
                    where: whereConditions,
                    attributes: [
                        'sms_type',
                        [InspectionOrderSmsLog.sequelize.fn('COUNT', InspectionOrderSmsLog.sequelize.col('id')), 'count']
                    ],
                    group: ['sms_type'],
                    raw: true
                }),

                // Por fuente de disparo
                InspectionOrderSmsLog.findAll({
                    where: whereConditions,
                    attributes: [
                        'trigger_source',
                        [InspectionOrderSmsLog.sequelize.fn('COUNT', InspectionOrderSmsLog.sequelize.col('id')), 'count']
                    ],
                    group: ['trigger_source'],
                    raw: true
                })
            ]);

            res.json({
                success: true,
                data: {
                    total,
                    sent,
                    delivered,
                    failed,
                    pending,
                    by_type: byType,
                    by_source: bySource
                }
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de SMS',
                error: error.message
            });
        }
    }

    /**
     * Loggear SMS enviado exitosamente
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
                provider_response: provider_response ? JSON.stringify(provider_response) : null,
                sent_at: new Date(),
                metadata: metadata || null
            });

            console.log(`📱 SMS log creado: ${smsLog.id} para orden ${inspection_order_id}`);
            return smsLog;
        } catch (error) {
            console.error('❌ Error loggeando SMS enviado:', error);
            throw error;
        }
    }

    /**
     * Loggear SMS fallido
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
                provider_response: provider_response ? JSON.stringify(provider_response) : null,
                metadata: metadata || null
            });

            console.log(`📱 SMS fallido loggeado: ${smsLog.id} para orden ${inspection_order_id}`);
            return smsLog;
        } catch (error) {
            console.error('❌ Error loggeando SMS fallido:', error);
            throw error;
        }
    }

    /**
     * Actualizar SMS como entregado
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
                provider_response: deliveryData.provider_response ? 
                    JSON.stringify(deliveryData.provider_response) : smsLog.provider_response
            });

            console.log(`📱 SMS marcado como entregado: ${smsLogId}`);
            return smsLog;
        } catch (error) {
            console.error('❌ Error marcando SMS como entregado:', error);
            throw error;
        }
    }

    /**
     * Crear log de SMS (método público para API)
     */
    async store(req, res) {
        try {
            const {
                inspection_order_id,
                recipient_phone,
                recipient_name,
                content,
                priority = 'normal',
                sms_type = 'initial',
                trigger_source = 'manual',
                webhook_id = null,
                metadata = null
            } = req.body;

            // Validaciones
            if (!inspection_order_id || !recipient_phone || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'inspection_order_id, recipient_phone y content son requeridos'
                });
            }

            const smsLog = await InspectionOrderSmsLog.create({
                inspection_order_id,
                recipient_phone,
                recipient_name,
                content,
                status: 'pending',
                priority,
                sms_type,
                trigger_source,
                user_id: req.user?.id || null,
                webhook_id,
                metadata: metadata || null
            });

            res.status(201).json({
                success: true,
                message: 'Log de SMS creado exitosamente',
                data: smsLog
            });
        } catch (error) {
            console.error('Error creando log de SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Error creando log de SMS',
                error: error.message
            });
        }
    }

    /**
     * Actualizar log de SMS
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const smsLog = await InspectionOrderSmsLog.findByPk(id);
            
            if (!smsLog) {
                return res.status(404).json({
                    success: false,
                    message: 'Log de SMS no encontrado'
                });
            }

            // Los campos JSON se manejan automáticamente por Sequelize
            // No necesitamos hacer JSON.stringify manualmente

            await smsLog.update(updateData);

            res.json({
                success: true,
                message: 'Log de SMS actualizado exitosamente',
                data: smsLog
            });
        } catch (error) {
            console.error('Error actualizando log de SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Error actualizando log de SMS',
                error: error.message
            });
        }
    }

    /**
     * Obtener log de SMS específico
     */
    async show(req, res) {
        try {
            const { id } = req.params;

            const smsLog = await InspectionOrderSmsLog.findByPk(id, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_cliente'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ]
            });

            if (!smsLog) {
                return res.status(404).json({
                    success: false,
                    message: 'Log de SMS no encontrado'
                });
            }

            res.json({
                success: true,
                data: smsLog
            });
        } catch (error) {
            console.error('Error obteniendo log de SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo log de SMS',
                error: error.message
            });
        }
    }

    /**
     * Eliminar log de SMS (soft delete)
     */
    async destroy(req, res) {
        try {
            const { id } = req.params;

            const smsLog = await InspectionOrderSmsLog.findByPk(id);
            
            if (!smsLog) {
                return res.status(404).json({
                    success: false,
                    message: 'Log de SMS no encontrado'
                });
            }

            await smsLog.destroy();

            res.json({
                success: true,
                message: 'Log de SMS eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando log de SMS:', error);
            res.status(500).json({
                success: false,
                message: 'Error eliminando log de SMS',
                error: error.message
            });
        }
    }
}

export default new SmsLogController();
