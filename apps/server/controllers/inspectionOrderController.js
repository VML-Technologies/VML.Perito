import { BaseController } from './baseController.js';
import InspectionOrder from '../models/inspectionOrder.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import CallLog from '../models/callLog.js';
import CallStatus from '../models/callStatus.js';
import Appointment from '../models/appointment.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import Department from '../models/department.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import { registerPermission } from '../middleware/permissionRegistry.js';
import { Op, Sequelize } from 'sequelize';

// Registrar permisos
registerPermission({
    name: 'inspection_orders.read',
    resource: 'inspection_orders',
    action: 'read',
    endpoint: '/api/inspection-orders',
    method: 'GET',
    description: 'Ver órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.create',
    resource: 'inspection_orders',
    action: 'create',
    endpoint: '/api/inspection-orders',
    method: 'POST',
    description: 'Crear órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.update',
    resource: 'inspection_orders',
    action: 'update',
    endpoint: '/api/inspection-orders/:id',
    method: 'PUT',
    description: 'Actualizar órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.delete',
    resource: 'inspection_orders',
    action: 'delete',
    endpoint: '/api/inspection-orders/:id',
    method: 'DELETE',
    description: 'Eliminar órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.stats',
    resource: 'inspection_orders',
    action: 'stats',
    endpoint: '/api/inspection-orders/stats',
    method: 'GET',
    description: 'Ver estadísticas de órdenes de inspección',
});

class InspectionOrderController extends BaseController {
    constructor() {
        super(InspectionOrder);

        // Bind methods
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getStats = this.getStats.bind(this);
        this.search = this.search.bind(this);
        this.getOrders = this.getOrders.bind(this);
    }

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
                sortOrder = 'DESC',
                context = 'default' // 'comercial', 'agent', 'coordinator'
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Construir condiciones WHERE según el contexto
            const whereConditions = {};

            const user = await User.findByPk(req.user.id, {
                include: [{
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] }
                }]
            });

            if (user.roles.some(role => role.name === 'agente_contacto')) {
                whereConditions.assigned_agent_id = req.user.id;
            }

            // Contexto específico para Comercial Mundial
            if (user.roles.some(role => role.name === 'comercial_mundial') && req.user.intermediary_key) {
                whereConditions.clave_intermediario = req.user.intermediary_key;
            }

            // Búsqueda por texto
            if (search) {
                const searchFields = [
                    { placa: { [Op.like]: `%${search}%` } },
                    { nombre_cliente: { [Op.like]: `%${search}%` } },
                    { num_doc: { [Op.like]: `%${search}%` } },
                    { correo_cliente: { [Op.like]: `%${search}%` } },
                    { numero: { [Op.like]: `%${search}%` } }
                ];

                whereConditions[Op.or] = searchFields;
            }

            // Filtro por estado
            if (status) {
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

            // Filtro por agente asignado (solo para coordinador)
            if (user.roles.some(role => role.name === 'coordinador_contacto') && assigned_agent_id) {
                console.log(assigned_agent_id)
                if (assigned_agent_id === 'unassigned') {
                    whereConditions.assigned_agent_id = null;
                } else if (assigned_agent_id === 'assigned') {
                    whereConditions.assigned_agent_id = { [Op.not]: null };
                } else {
                    whereConditions.assigned_agent_id = assigned_agent_id;
                }
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

            // // Validar campos de ordenamiento
            const allowedSortFields = [
                'id', 'numero', 'nombre_cliente', 'placa', 'created_at',
                'status', 'assigned_agent_id'
            ];
            const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
            const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

            const includes = [
                {
                    model: InspectionOrderStatus,
                    as: 'InspectionOrderStatus',
                    attributes: ['id', 'name', 'description']
                }, {
                    model: User,
                    as: 'AssignedAgent',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }, {
                    model: CallLog,
                    as: 'callLogs',
                    attributes: ['id', 'comments', 'created_at'],
                    include: [
                        {
                            model: CallStatus,
                            as: 'status',
                            attributes: ['name']
                        },
                        {
                            model: User,
                            as: 'Agent',
                            attributes: ['name'],
                            required: false
                        }
                    ],
                    order: [['call_time', 'DESC']]
                },
            ];

            const { count, rows } = await InspectionOrder.findAndCountAll({
                where: whereConditions,
                include: includes,
                limit: parseInt(limit),
                offset: offset,
                order: [[validSortBy, validSortOrder]],
                distinct: true
            });

            let transformedOrders = rows.map(order => ({
                id: order.id,
                numero: order.numero,
                nombre_cliente: order.nombre_cliente,
                celular_cliente: order.celular_cliente,
                correo_cliente: order.correo_cliente,
                placa: order.placa,
                marca: order.marca,
                modelo: order.modelo,
                producto: order.producto,
                InspectionOrderStatus: order.InspectionOrderStatus,
                inspection_result: order.inspection_result,
                callLogs: order.callLogs,
                callLogsCount: order.callLogs ? order.callLogs.length : 0,
                nombre_contacto: order.nombre_contacto,
                celular_contacto: order.celular_contacto,
                correo_contacto: order.correo_contacto,
                created_at: order.created_at,
                AssignedAgent: order.AssignedAgent,
                intermediary_key: order.clave_intermediario
            }));

            res.json({
                success: true,
                data: {
                    orders: transformedOrders,
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

    // Listar órdenes con paginación, búsqueda y ordenamiento (método original)
    async index(req, res) {
        // Usar el método unificado con contexto 'comercial'
        req.query.context = 'comercial';
        return this.getOrders(req, res);
    }

    // Obtener estadísticas
    async getStats(req, res) {
        try {
            const whereConditions = {};

            // Filtrar por intermediary_key del usuario logueado
            if (req.user.intermediary_key) {
                whereConditions.clave_intermediario = req.user.intermediary_key;
            }

            const [
                total,
                pendientes,
                en_gestion,
                agendadas,
                completadas,
                sin_asignar
            ] = await Promise.all([
                // Total de órdenes
                InspectionOrder.count({ where: whereConditions }),

                // Órdenes pendientes (estado 1 - Creada)
                InspectionOrder.count({
                    where: {
                        ...whereConditions,
                        status: 1
                    }
                }),

                // Órdenes en gestión (tienen agente asignado pero no están agendadas)
                InspectionOrder.count({
                    where: {
                        ...whereConditions,
                        assigned_agent_id: { [Op.not]: null },
                        status: { [Op.in]: [1, 2] } // Creada o En contacto
                    }
                }),

                // Órdenes agendadas (estado 3 - Agendado)
                InspectionOrder.count({
                    where: {
                        ...whereConditions,
                        status: 3
                    }
                }),

                // Órdenes completadas (estado 4 - Finalizada)
                InspectionOrder.count({
                    where: {
                        ...whereConditions,
                        status: 4
                    }
                }),

                // Órdenes sin asignar
                InspectionOrder.count({
                    where: {
                        ...whereConditions,
                        assigned_agent_id: null
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    total,
                    pendientes,
                    en_gestion,
                    agendadas,
                    completadas,
                    sin_asignar
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

    // Crear orden con validaciones
    async store(req, res) {
        try {
            // Agregar el user_id y sede_id del usuario autenticado
            const orderData = {
                ...req.body,
                user_id: req.user.id,
                sede_id: req.user.sede_id
            };

            const order = await this.model.create(orderData);

            // Cargar la orden completa con relaciones
            const fullOrder = await this.model.findByPk(order.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            res.status(201).json(fullOrder);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear orden de inspección', error: error.message });
        }
    }

    // Obtener orden específica
    async show(req, res) {
        try {
            const order = await this.model.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ message: 'Orden de inspección no encontrada' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener orden de inspección', error: error.message });
        }
    }

    // Búsqueda rápida por placa
    async search(req, res) {
        try {
            const { placa } = req.query;

            if (!placa) {
                return res.status(400).json({ message: 'Placa es requerida para la búsqueda' });
            }

            const whereConditions = {
                placa: { [Op.like]: `%${placa}%` }
            };

            // Filtrar por intermediary_key del usuario logueado
            if (req.user.intermediary_key) {
                whereConditions.clave_intermediario = req.user.intermediary_key;
            }

            const orders = await this.model.findAll({
                where: whereConditions,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                limit: 10,
                order: [['created_at', 'DESC']]
            });

            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
        }
    }
}

export default InspectionOrderController; 