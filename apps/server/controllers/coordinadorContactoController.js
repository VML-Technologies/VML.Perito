import InspectionOrder from '../models/inspectionOrder.js';
import CallLog from '../models/callLog.js';
import CallStatus from '../models/callStatus.js';
import Appointment from '../models/appointment.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import InspectionModality from '../models/inspectionModality.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import Department from '../models/department.js';
import Notification from '../models/notification.js';
import NotificationConfig from '../models/notificationConfig.js';
import NotificationType from '../models/notificationType.js';
import NotificationChannel from '../models/notificationChannel.js';
import InspectionQueue from '../models/inspectionQueue.js';
import InspectionOrderSmsLog from '../models/inspectionOrderSmsLog.js';
import { registerPermission } from '../middleware/permissionRegistry.js';
import { Op, Sequelize } from 'sequelize';
import coordinatorDataService from '../services/coordinatorDataService.js';

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

registerPermission({
    name: 'reports.read',
    resource: 'reports',
    action: 'read',
    endpoint: '/api/coordinador-vml/reports/coordinator',
    method: 'GET',
    description: 'Generar reportes del coordinador VML',
});

registerPermission({
    name: 'coordinador_contacto.recuperacion',
    resource: 'coordinador_contacto',
    action: 'recuperacion',
    endpoint: '/api/coordinador-contacto/ordenes-recuperacion',
    method: 'GET',
    description: 'Ver órdenes en recuperación',
});

registerPermission({
    name: 'coordinador_contacto.no_recuperadas',
    resource: 'coordinador_contacto',
    action: 'no_recuperadas',
    endpoint: '/api/coordinador-contacto/ordenes-no-recuperadas',
    method: 'GET',
    description: 'Ver órdenes no recuperadas',
});

// Permiso para actividad de una orden (timeline)
registerPermission({
    name: 'coordinador_contacto.actividad',
    resource: 'coordinador_contacto',
    action: 'actividad',
    endpoint: '/api/coordinador-contacto/ordenes/:id/actividad',
    method: 'GET',
    description: 'Ver actividad (llamadas y SMS) de una orden específica',
});

class CoordinadorContactoController {
    constructor() {
        // Bind methods
        this.getOrders = this.getOrders.bind(this);
        this.getOrderDetails = this.getOrderDetails.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getAgents = this.getAgents.bind(this);
        this.assignAgent = this.assignAgent.bind(this);
        this.getCoordinatorReport = this.getCoordinatorReport.bind(this);
        this.getOrdenesRecuperacion = this.getOrdenesRecuperacion.bind(this);
        this.getOrdenesNoRecuperadas = this.getOrdenesNoRecuperadas.bind(this);
        this.getOrdenActividad = this.getOrdenActividad.bind(this);
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
                // Manejar filtros especiales para inspection_result
                if (status.startsWith('result_')) {
                    const resultMap = {
                        'result_rechazado': 'RECHAZADO - Vehículo no asegurable',
                        'result_aprobado_restricciones': 'APROBADO CON RESTRICCIONES - Vehículo asegurable con limitaciones',
                        'result_pendiente': 'PENDIENTE - Inspección en proceso',
                        'result_aprobado': 'APROBADO - Vehículo asegurable'
                    };

                    const resultValue = resultMap[status];
                    if (resultValue) {
                        whereConditions.inspection_result = resultValue;
                    }
                } else {
                    whereConditions.status = status;
                }
            }

            // Filtro por agente asignado
            if (assigned_agent_id) {
                if (assigned_agent_id == 'unassigned') {
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

    // Obtener actividad (llamadas y SMS) de una orden de inspección
    async getOrdenActividad(req, res) {
        try {
            const { id } = req.params;
            const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

            // Validaciones básicas
            if (!id) {
                return res.status(400).json({ success: false, message: 'Falta el parámetro id' });
            }

            // Verificar que la orden exista (opcional pero útil)
            const order = await InspectionOrder.findByPk(id, { attributes: ['id'] });
            if (!order) {
                return res.status(404).json({ success: false, message: 'Orden no encontrada' });
            }

            // Obtener llamadas con estado y agente
            const callLogs = await CallLog.findAll({
                where: {
                    inspection_order_id: id,
                    deleted_at: null
                },
                include: [
                    {
                        model: CallStatus,
                        as: 'status',
                        attributes: ['id', 'name', 'creates_schedule']
                    },
                    {
                        model: User,
                        as: 'Agent',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    }
                ],
                order: [['call_time', 'DESC']],
                limit
            });

            // Obtener SMS logs
            const smsLogs = await InspectionOrderSmsLog.findAll({
                where: {
                    inspection_order_id: id,
                    deleted_at: null
                },
                attributes: [
                    'id', 'created_at', 'sent_at', 'status', 'recipient_phone', 'recipient_name', 'sms_type', 'priority', 'error_message'
                ],
                order: [['created_at', 'DESC']],
                limit
            });

            // Mapear a una línea de tiempo unificada
            const callEvents = callLogs.map(cl => ({
                type: 'call',
                at: cl.call_time,
                status: cl.status?.name || 'Desconocido',
                creates_schedule: !!cl.status?.creates_schedule,
                agent: cl.Agent ? { id: cl.Agent.id, name: cl.Agent.name } : null,
                comments: cl.comments || null,
                id: cl.id
            }));

            const smsEvents = smsLogs.map(sl => ({
                type: 'sms',
                at: sl.sent_at || sl.created_at,
                status: sl.status,
                sms_type: sl.sms_type,
                priority: sl.priority,
                recipient: { phone: sl.recipient_phone, name: sl.recipient_name },
                error_message: sl.error_message || null,
                id: sl.id
            }));

            const events = [...callEvents, ...smsEvents]
                .filter(e => !!e.at)
                .sort((a, b) => new Date(a.at) - new Date(b.at)); // Ascendente para timeline

            return res.json({
                success: true,
                data: {
                    events,
                    counts: { calls: callLogs.length, sms: smsLogs.length }
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo actividad de la orden:', error);
            return res.status(500).json({ success: false, message: 'Error obteniendo actividad', error: error.message });
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

    // Obtener estadísticas de asignaciones por agente
    async getAgentAssignmentStats(req, res) {
        try {
            // Obtener todos los agentes activos con rol agente_contacto
            const agents = await User.findAll({
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        where: { name: 'agente_contacto' },
                        through: { attributes: [] }
                    }
                ],
                attributes: ['id', 'name', 'email'],
                where: { is_active: true }
            });

            // Obtener estadísticas de órdenes por agente
            const agentStats = await Promise.all(
                agents.map(async (agent) => {
                    const [
                        totalAssigned,
                        pendingOrders,
                        inProgressOrders,
                        scheduledOrders,
                        completedOrders
                    ] = await Promise.all([
                        // Total de órdenes asignadas
                        InspectionOrder.count({
                            where: { assigned_agent_id: agent.id }
                        }),
                        // Órdenes pendientes (estado 1 - Creada)
                        InspectionOrder.count({
                            where: {
                                assigned_agent_id: agent.id,
                                status: 1
                            }
                        }),
                        // Órdenes en gestión (estado 2 - En contacto)
                        InspectionOrder.count({
                            where: {
                                assigned_agent_id: agent.id,
                                status: 2
                            }
                        }),
                        // Órdenes agendadas (estado 3 - Agendado)
                        InspectionOrder.count({
                            where: {
                                assigned_agent_id: agent.id,
                                status: 3
                            }
                        }),
                        // Órdenes completadas (estado 4 - Finalizada)
                        InspectionOrder.count({
                            where: {
                                assigned_agent_id: agent.id,
                                status: 4
                            }
                        })
                    ]);

                    return {
                        agent: {
                            id: agent.id,
                            name: agent.name,
                            email: agent.email
                        },
                        stats: {
                            total: totalAssigned,
                            pendientes: pendingOrders,
                            en_gestion: inProgressOrders,
                            agendadas: scheduledOrders,
                            completadas: completedOrders
                        }
                    };
                })
            );

            // Ordenar por total de órdenes asignadas (descendente)
            agentStats.sort((a, b) => b.stats.total - a.stats.total);

            res.json({
                success: true,
                data: agentStats
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de agentes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de agentes',
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
                        model: CallLog,
                        as: 'callLogs',
                        include: [
                            {
                                model: CallStatus,
                                as: 'status',
                                attributes: ['id', 'name', 'creates_schedule']
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
                        required: false,
                        where: {
                            deleted_at: null
                        },
                        include: [
                            {
                                model: InspectionModality,
                                as: 'inspectionModality',
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
            // Obtener datos de la orden
            const order = await InspectionOrder.findByPk(inspectionOrderId, {
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!order) {
                console.warn(`Orden ${inspectionOrderId} no encontrada para crear notificación`);
                return;
            }

            // Buscar la configuración de notificación para asignaciones de órdenes
            const notificationType = await NotificationType.findOne({
                where: { name: 'asignacion_orden' }
            });

            const notificationChannel = await NotificationChannel.findOne({
                where: { name: 'sistema' }
            });

            if (!notificationType || !notificationChannel) {
                console.warn('No se encontró configuración de notificación para asignaciones');
                return;
            }

            const notificationConfig = await NotificationConfig.findOne({
                where: {
                    notification_type_id: notificationType.id,
                    notification_channel_id: notificationChannel.id,
                    for_users: true,
                    active: true
                }
            });

            if (!notificationConfig) {
                console.warn('No se encontró configuración activa para notificaciones de asignación');
                return;
            }

            // Crear notificación directamente en la base de datos
            const notificationData = {
                notification_config_id: notificationConfig.id,
                title: type == 'reasignacion' ? 'Orden Reasignada' : 'Nueva Orden Asignada',
                content: type == 'reasignacion'
                    ? `Te han reasignado la orden #${order.numero} - ${order.nombre_cliente} (${order.placa})`
                    : `Te han asignado una nueva orden #${order.numero} - ${order.nombre_cliente} (${order.placa})`,
                recipient_user_id: agentId,
                recipient_type: 'user',
                inspection_order_id: inspectionOrderId,
                priority: 'normal',
                status: 'pending',
                metadata: {
                    type: type,
                    order_number: order.numero,
                    order_id: inspectionOrderId,
                    client_name: order.nombre_cliente,
                    vehicle_plate: order.placa,
                    status: order.InspectionOrderStatus?.name
                }
            };

            // Crear la notificación
            const notification = await Notification.create(notificationData);

            console.log(`✅ Notificación creada para agente ${agentId}:`, {
                id: notification.id,
                type: type,
                order: order.numero,
                config_id: notificationConfig.id
            });

            return notification;

        } catch (error) {
            console.error('Error creando notificación de asignación:', error);
            throw error;
        }
    }

    /**
     * Obtener órdenes en recuperación (días 2-5)
     * Órdenes que no tienen cita agendada ni están en cola de inspección
     * OPTIMIZADO: Usa NOT EXISTS subqueries para mejor performance en SQL Server
     */
    async getOrdenesRecuperacion(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';

            // Construir where clause base
            let whereClause = {
                deleted_at: null,
                status_internal: 'En proceso de recuperacion'
            };

            // Añadir filtros de búsqueda si se proporciona
            if (search.trim()) {
                whereClause[Op.or] = [
                    { numero: { [Op.like]: `%${search}%` } },
                    { placa: { [Op.like]: `%${search}%` } },
                    { nombre_cliente: { [Op.like]: `%${search}%` } },
                    { nombre_contacto: { [Op.like]: `%${search}%` } },
                    { celular_contacto: { [Op.like]: `%${search}%` } },
                    { correo_contacto: { [Op.like]: `%${search}%` } }
                ];
            }

            // Simplificado: ahora dependemos de status_internal para identificar órdenes en recuperación
            const ordenes = await InspectionOrder.findAll({
                where: whereClause,
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM call_logs
                                WHERE call_logs.inspection_order_id = InspectionOrder.id
                                AND call_logs.deleted_at IS NULL
                            )`),
                            'call_count'
                        ],
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM inspection_order_sms_logs
                                WHERE inspection_order_sms_logs.inspection_order_id = InspectionOrder.id
                                AND inspection_order_sms_logs.deleted_at IS NULL
                            )`),
                            'sms_count'
                        ]
                    ]
                },
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
                        attributes: ['id', 'name'],
                        required: false
                    }
                ],
                order: [['created_at', 'ASC']],
                limit: limit,
                offset: offset
            });

            const totalCount = await InspectionOrder.count({
                where: whereClause
            });

            // Formatear respuesta
            const ordenesFormateadas = ordenes.map(orden => {
                const ordenJson = orden.toJSON();
                const statusName = ordenJson.InspectionOrderStatus?.name || 'Pendiente';

                return {
                    ...ordenJson,
                    assigned_agent_name: ordenJson.AssignedAgent?.name || null,
                    estado: statusName,
                    fixedStatus: statusName,
                    badgeColor: 'default',
                    call_count: parseInt(ordenJson.call_count) || 0,
                    sms_count: parseInt(ordenJson.sms_count) || 0
                };
            });

            res.json({
                success: true,
                data: ordenesFormateadas,
                pagination: {
                    total: totalCount,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(totalCount / limit),
                    hasNext: page < Math.ceil(totalCount / limit),
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('❌ Error obteniendo órdenes en recuperación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener órdenes no recuperadas (día 6+)
     * Órdenes que no tienen cita agendada ni están en cola de inspección
     * OPTIMIZADO: Usa NOT EXISTS subqueries para mejor performance en SQL Server
     */
    async getOrdenesNoRecuperadas(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';

            // Construir where clause base
            let whereClause = {
                deleted_at: null,
                status_internal: 'Recuperacion fallida'
            };

            // Añadir filtros de búsqueda si se proporciona
            if (search.trim()) {
                whereClause[Op.or] = [
                    { numero: { [Op.like]: `%${search}%` } },
                    { placa: { [Op.like]: `%${search}%` } },
                    { nombre_cliente: { [Op.like]: `%${search}%` } },
                    { nombre_contacto: { [Op.like]: `%${search}%` } },
                    { celular_contacto: { [Op.like]: `%${search}%` } },
                    { correo_contacto: { [Op.like]: `%${search}%` } }
                ];
            }

            // Simplificado: ahora dependemos de status_internal para identificar órdenes no recuperadas
            const ordenes = await InspectionOrder.findAll({
                where: whereClause,
                attributes: {
                    include: [
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM call_logs
                                WHERE call_logs.inspection_order_id = InspectionOrder.id
                                AND call_logs.deleted_at IS NULL
                            )`),
                            'call_count'
                        ],
                        [
                            Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM inspection_order_sms_logs
                                WHERE inspection_order_sms_logs.inspection_order_id = InspectionOrder.id
                                AND inspection_order_sms_logs.deleted_at IS NULL
                            )`),
                            'sms_count'
                        ]
                    ]
                },
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
                        attributes: ['id', 'name'],
                        required: false
                    }
                ],
                order: [['created_at', 'ASC']],
                limit: limit,
                offset: offset
            });

            const totalCount = await InspectionOrder.count({
                where: whereClause
            });

            // Formatear respuesta
            const ordenesFormateadas = ordenes.map(orden => {
                const ordenJson = orden.toJSON();
                const statusName = ordenJson.InspectionOrderStatus?.name || 'Pendiente';

                return {
                    ...ordenJson,
                    assigned_agent_name: ordenJson.AssignedAgent?.name || null,
                    estado: statusName,
                    fixedStatus: statusName,
                    badgeColor: 'default',
                    call_count: parseInt(ordenJson.call_count) || 0,
                    sms_count: parseInt(ordenJson.sms_count) || 0
                };
            });

            res.json({
                success: true,
                data: ordenesFormateadas,
                pagination: {
                    total: totalCount,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(totalCount / limit),
                    hasNext: page < Math.ceil(totalCount / limit),
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('❌ Error obteniendo órdenes no recuperadas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Generar reporte completo del coordinador
     */
    async getCoordinatorReport(req, res) {
        try {
            const { start_date, end_date } = req.query;

            // Validar parámetros requeridos
            if (!start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos: start_date, end_date'
                });
            }

            // Validar formato de fechas
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de fecha inválido'
                });
            }

            if (startDate > endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de inicio no puede ser mayor a la fecha de fin'
                });
            }

            // Generar reporte usando el servicio
            const reportResult = await coordinatorDataService.getCoordinatorReport(start_date, end_date);

            // Configurar headers para descarga
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${reportResult.filename}"`);
            res.setHeader('Content-Length', reportResult.buffer.length);

            // Enviar archivo
            res.send(reportResult.buffer);

        } catch (error) {
            console.error('❌ Error generando reporte del coordinador:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al generar el reporte',
                error: error.message
            });
        }
    }
}

export default new CoordinadorContactoController();