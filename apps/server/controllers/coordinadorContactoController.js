import InspectionOrder from '../models/inspectionOrder.js';
import CallLog from '../models/callLog.js';
import CallStatus from '../models/callStatus.js';
import Appointment from '../models/appointment.js';
import InspectionType from '../models/inspectionType.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import Department from '../models/department.js';
import Notification from '../models/notification.js';
import NotificationConfig from '../models/notificationConfig.js';
import NotificationType from '../models/notificationType.js';
import NotificationChannel from '../models/notificationChannel.js';
import { registerPermission } from '../middleware/permissionRegistry.js';
import { Op } from 'sequelize';

// Registrar permisos
registerPermission({
    name: 'coordinador_contacto.read',
    resource: 'coordinador_contacto',
    action: 'read',
    endpoint: '/api/coordinador-contacto',
    method: 'GET',
    description: 'Ver órdenes como Coordinador de Contact Center',
});

registerPermission({
    name: 'coordinador_contacto.assign',
    resource: 'coordinador_contacto',
    action: 'assign',
    endpoint: '/api/coordinador-contacto/assign',
    method: 'POST',
    description: 'Asignar agentes a órdenes',
});

registerPermission({
    name: 'coordinador_contacto.stats',
    resource: 'coordinador_contacto',
    action: 'stats',
    endpoint: '/api/coordinador-contacto/stats',
    method: 'GET',
    description: 'Ver estadísticas de órdenes',
});

class CoordinadorContactoController {
    constructor() {
        // Bind methods
        this.getOrders = this.getOrders.bind(this);
        this.getOrderDetails = this.getOrderDetails.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getAgents = this.getAgents.bind(this);
        this.assignAgent = this.assignAgent.bind(this);
    }

    // Obtener órdenes con paginación, filtros y sorting
    async getOrders(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = '',
                assigned_agent_id = '',
                date_from = '',
                date_to = '',
                sortBy = 'created_at',
                sortOrder = 'DESC'
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Construir condiciones WHERE
            const whereConditions = {};

            // Búsqueda por texto (placa, nombre cliente, documento)
            if (search) {
                whereConditions[Op.or] = [
                    { placa: { [Op.like]: `%${search}%` } },
                    { nombre_cliente: { [Op.like]: `%${search}%` } },
                    { num_doc: { [Op.like]: `%${search}%` } },
                    { correo_cliente: { [Op.like]: `%${search}%` } }
                ];
            }

            // Filtro por estado
            if (status) {
                whereConditions.status = status;
            }

            // Filtro por agente asignado
            if (assigned_agent_id) {
                if (assigned_agent_id === 'unassigned') {
                    whereConditions.assigned_agent_id = null;
                } else {
                    whereConditions.assigned_agent_id = assigned_agent_id;
                }
            }

            // Filtros por fecha
            if (date_from || date_to) {
                const dateConditions = {};

                if (date_from) {
                    dateConditions[Op.gte] = new Date(date_from);
                }

                if (date_to) {
                    // Agregar 23:59:59 al final del día para incluir todo el día
                    const endDate = new Date(date_to);
                    endDate.setHours(23, 59, 59, 999);
                    dateConditions[Op.lte] = endDate;
                }

                whereConditions.created_at = dateConditions;
            }

            // Validar campo de ordenamiento
            const allowedSortFields = [
                'created_at', 'updated_at', 'placa', 'nombre_cliente',
                'fecha', 'status', 'assigned_agent_id'
            ];
            const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
            const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

            const { count, rows } = await InspectionOrder.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: User,
                        as: 'AssignedAgent',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: Sede,
                        as: 'Sede',
                        attributes: ['id', 'name'],
                        required: false,
                        include: [
                            {
                                model: City,
                                as: 'city',
                                attributes: ['id', 'name'],
                                include: [
                                    {
                                        model: Department,
                                        as: 'department',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                limit: parseInt(limit),
                offset: offset,
                order: [[validSortBy, validSortOrder]],
                distinct: true
            });

            res.json({
                success: true,
                data: {
                    orders: rows,
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
                        assigned_agent_id,
                        date_from,
                        date_to,
                        sortBy: validSortBy,
                        sortOrder: validSortOrder
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener órdenes',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de órdenes
    async getStats(req, res) {
        try {
            const [
                totalOrders,
                pendingOrders,
                inProgressOrders,
                scheduledOrders,
                completedOrders,
                unassignedOrders
            ] = await Promise.all([
                // Total de órdenes
                InspectionOrder.count(),

                // Órdenes pendientes (estado 1 - Creada)
                InspectionOrder.count({
                    where: { status: 1 }
                }),

                // Órdenes en gestión (tienen agente asignado pero no están agendadas)
                InspectionOrder.count({
                    where: {
                        assigned_agent_id: { [Op.not]: null },
                        status: { [Op.in]: [1, 2] } // Creada o En contacto
                    }
                }),

                // Órdenes agendadas (estado 3 - Agendado)
                InspectionOrder.count({
                    where: { status: 3 }
                }),

                // Órdenes completadas (estado 4 - Finalizada)
                InspectionOrder.count({
                    where: { status: 4 }
                }),

                // Órdenes sin asignar
                InspectionOrder.count({
                    where: { assigned_agent_id: null }
                })
            ]);

            res.json({
                success: true,
                data: {
                    total: totalOrders,
                    pendientes: pendingOrders,
                    en_gestion: inProgressOrders,
                    agendadas: scheduledOrders,
                    completadas: completedOrders,
                    sin_asignar: unassignedOrders
                }
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    // Obtener agentes disponibles
    async getAgents(req, res) {
        try {
            const agents = await User.findAll({
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        where: { name: 'agente_contacto' },
                        through: { attributes: [] }
                    }
                ],
                attributes: ['id', 'name', 'email', 'is_active'],
                where: { is_active: true }
            });

            res.json({
                success: true,
                data: agents
            });
        } catch (error) {
            console.error('Error al obtener agentes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener agentes',
                error: error.message
            });
        }
    }

    // Obtener detalles de una orden específica
    async getOrderDetails(req, res) {
        try {
            const { id } = req.params;

            const order = await InspectionOrder.findByPk(id, {
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: User,
                        as: 'AssignedAgent',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: CallLog,
                        as: 'callLogs',
                        include: [
                            {
                                model: CallStatus,
                                as: 'status',
                                attributes: ['id', 'name', 'description']
                            },
                            {
                                model: User,
                                as: 'Agent',
                                attributes: ['id', 'name', 'email'],
                                required: false
                            }
                        ],
                        order: [['call_time', 'DESC']]
                    },
                    {
                        model: Appointment,
                        as: 'appointments',
                        include: [
                            {
                                model: InspectionType,
                                as: 'inspectionType',
                                attributes: ['id', 'name', 'description']
                            },
                            {
                                model: Sede,
                                as: 'sede',
                                attributes: ['id', 'name'],
                                include: [
                                    {
                                        model: City,
                                        as: 'city',
                                        attributes: ['id', 'name'],
                                        include: [
                                            {
                                                model: Department,
                                                as: 'department',
                                                attributes: ['id', 'name']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        order: [['scheduled_date', 'DESC']]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Error al obtener detalles de la orden:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener detalles de la orden',
                error: error.message
            });
        }
    }

    // Asignar o reasignar agente a una orden
    async assignAgent(req, res) {
        try {
            const { inspection_order_id, agent_id } = req.body;

            if (!inspection_order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de orden de inspección es requerido'
                });
            }

            // Verificar que la orden existe
            const order = await InspectionOrder.findByPk(inspection_order_id, {
                include: [
                    {
                        model: User,
                        as: 'AssignedAgent',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            // Si se proporciona agent_id, verificar que el agente existe y tiene el rol correcto
            if (agent_id) {
                const agent = await User.findOne({
                    where: { id: agent_id, is_active: true },
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            where: { name: 'agente_contacto' },
                            through: { attributes: [] }
                        }
                    ]
                });

                if (!agent) {
                    return res.status(400).json({
                        success: false,
                        message: 'Agente no encontrado o no tiene el rol de agente de contact center'
                    });
                }
            }

            const previousAgentId = order.assigned_agent_id;

            // Actualizar la orden
            await order.update({
                assigned_agent_id: agent_id || null,
                updated_at: new Date()
            });

            // Cargar la orden actualizada con las relaciones
            const updatedOrder = await InspectionOrder.findByPk(inspection_order_id, {
                include: [
                    {
                        model: User,
                        as: 'AssignedAgent',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            // Obtener sistema WebSocket
            const webSocketSystem = req.app.get('webSocketSystem');

            // Si había un agente anterior y se está reasignando/removiendo, notificarle
            if (previousAgentId && previousAgentId !== agent_id) {
                // Crear notificación de remoción para el agente anterior
                await this.createAssignmentNotification(
                    previousAgentId,
                    inspection_order_id,
                    'remocion'
                );

                // Enviar notificación WebSocket al agente anterior
                if (webSocketSystem && webSocketSystem.isInitialized()) {
                    const removalNotificationData = {
                        type: 'orden_removida',
                        order_id: inspection_order_id,
                        order_number: order.numero,
                        order: {
                            id: updatedOrder.id,
                            numero: updatedOrder.numero,
                            cliente: updatedOrder.nombre_cliente,
                            placa: updatedOrder.placa,
                            estado: updatedOrder.InspectionOrderStatus?.name
                        },
                        message: agent_id
                            ? `La orden #${order.numero} ha sido reasignada a otro agente`
                            : `La orden #${order.numero} ha sido removida de tu asignación`,
                        timestamp: new Date().toISOString()
                    };

                    // Enviar notificación al agente anterior
                    webSocketSystem.sendToUser(previousAgentId, 'order_removed', removalNotificationData);

                    console.log(`📡 Notificación de remoción enviada al agente ${previousAgentId}:`, removalNotificationData);
                }
            }

            // Crear notificación para el agente asignado
            if (agent_id) {
                await this.createAssignmentNotification(
                    agent_id,
                    inspection_order_id,
                    previousAgentId ? 'reasignacion' : 'asignacion'
                );

                // Emitir evento WebSocket al nuevo agente
                if (webSocketSystem && webSocketSystem.isInitialized()) {
                    const notificationData = {
                        type: previousAgentId ? 'reasignacion_orden' : 'asignacion_orden',
                        order_id: inspection_order_id,
                        order_number: order.numero,
                        order: {
                            id: updatedOrder.id,
                            numero: updatedOrder.numero,
                            cliente: updatedOrder.nombre_cliente,
                            placa: updatedOrder.placa,
                            estado: updatedOrder.InspectionOrderStatus?.name
                        },
                        message: previousAgentId
                            ? `Te han reasignado la orden #${order.numero}`
                            : `Te han asignado una nueva orden #${order.numero}`,
                        timestamp: new Date().toISOString()
                    };

                    // Enviar notificación al agente específico
                    webSocketSystem.sendToUser(agent_id, 'order_assigned', notificationData);

                    console.log(`📡 Notificación WebSocket enviada al agente ${agent_id}:`, notificationData);
                }
            }

            res.json({
                success: true,
                message: agent_id
                    ? (previousAgentId ? 'Agente reasignado exitosamente' : 'Agente asignado exitosamente')
                    : 'Asignación removida exitosamente',
                data: updatedOrder
            });

        } catch (error) {
            console.error('Error al asignar agente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al asignar agente',
                error: error.message
            });
        }
    }

    // Método auxiliar para crear notificaciones de asignación
    async createAssignmentNotification(agentId, inspectionOrderId, type) {
        try {
            // Buscar configuración de notificación para asignación de órdenes
            const notificationConfig = await NotificationConfig.findOne({
                include: [
                    {
                        model: NotificationType,
                        as: 'type',
                        where: { name: 'asignacion_orden' }
                    },
                    {
                        model: NotificationChannel,
                        as: 'channel',
                        where: { name: 'sistema' }
                    }
                ],
                where: {
                    for_users: true,
                    active: true
                }
            });

            if (!notificationConfig) {
                console.warn('No se encontró configuración de notificación para asignación de órdenes');
                return;
            }

            // Obtener datos de la orden
            const order = await InspectionOrder.findByPk(inspectionOrderId);

            const title = type === 'reasignacion'
                ? 'Orden Reasignada'
                : type === 'remocion'
                    ? 'Orden Removida'
                    : 'Nueva Orden Asignada';

            const content = type === 'reasignacion'
                ? `Te han reasignado la orden de inspección #${order.numero} para el vehículo ${order.placa}`
                : type === 'remocion'
                    ? `La orden de inspección #${order.numero} para el vehículo ${order.placa} ha sido removida de tu asignación`
                    : `Te han asignado una nueva orden de inspección #${order.numero} para el vehículo ${order.placa}`;

            // Crear la notificación
            await Notification.create({
                notification_config_id: notificationConfig.id,
                inspection_order_id: inspectionOrderId,
                recipient_type: 'user',
                recipient_user_id: agentId,
                title: title,
                content: content,
                status: 'pending'
            });

        } catch (error) {
            console.error('Error al crear notificación de asignación:', error);
        }
    }
}

export default new CoordinadorContactoController(); 