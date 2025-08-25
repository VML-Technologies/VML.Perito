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
import automatedEventTriggers from '../services/automatedEventTriggers.js';

// Función para generar número de orden incremental
const generateOrderNumber = async () => {
    try {
        // Buscar la última orden para obtener el número más alto
        const lastOrder = await InspectionOrder.findOne({
            where: {
                numero: {
                    [Op.like]: '9991%'
                }
            },
            order: [['numero', 'DESC']],
            attributes: ['numero']
        });

        let nextNumber = 1;

        if (lastOrder && lastOrder.numero) {
            // Extraer el número de la última orden (ej: "999100001" -> 1)
            const lastNumberMatch = lastOrder.numero.match(/9991(\d+)/);
            if (lastNumberMatch) {
                nextNumber = parseInt(lastNumberMatch[1]) + 1;
            }
        }

        // Formatear el número con ceros a la izquierda (5 dígitos)
        const formattedNumber = `9991${nextNumber.toString().padStart(5, '0')}`;

        return formattedNumber;
    } catch (error) {
        console.error('Error generating order number:', error);
        // Fallback: usar timestamp como número
        const timestamp = Date.now();
        return `9991${timestamp.toString().slice(-5)}`;
    }
};

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

            if (user.roles.some(role => role.name == 'agente_contacto')) {
                whereConditions.assigned_agent_id = req.user.id;
            }

            // Contexto específico para Comercial Mundial
            if (user.roles.some(role => role.name == 'comercial_mundial' && !req.user.email.includes('segurosmundial.com.co')) && req.user.intermediary_key) {
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
            if (user.roles.some(role => role.name == 'coordinador_contacto') && assigned_agent_id) {
                console.log(assigned_agent_id)
                if (assigned_agent_id == 'unassigned') {
                    whereConditions.assigned_agent_id = null;
                } else if (assigned_agent_id == 'assigned') {
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
                metodo_inspeccion_recomendado: order.metodo_inspeccion_recomendado,
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
            if (req.user.intermediary_key && !req.user.email.includes('segurosmundial.com.co')) {
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
            // Generar número de orden automáticamente
            const orderNumber = await generateOrderNumber();

            // Agregar el user_id, sede_id y numero del usuario autenticado
            const orderData = {
                ...req.body,
                user_id: req.user.id,
                sede_id: req.user.sede_id,
                numero: orderNumber
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

            // Disparar evento de orden de inspección creada
            try {
                await automatedEventTriggers.triggerInspectionOrderEvents('created', {
                    id: fullOrder.id,
                    numero: fullOrder.numero,
                    nombre_cliente: fullOrder.nombre_cliente,
                    correo_cliente: fullOrder.correo_cliente,
                    celular_cliente: fullOrder.celular_cliente,
                    placa: fullOrder.placa,
                    marca: fullOrder.marca,
                    linea: fullOrder.linea,
                    modelo: fullOrder.modelo,
                    tipo_vehiculo: fullOrder.tipo_vehiculo,
                    status: fullOrder.InspectionOrderStatus?.name || 'Nueva',
                    sede_name: fullOrder.sede?.name || 'No asignada',
                    created_at: fullOrder.created_at,
                    clave_intermediario: fullOrder.clave_intermediario
                }, {
                    created_by: req.user?.id,
                    ip_address: req.ip
                });
            } catch (eventError) {
                console.error('Error disparando evento inspection_order.created:', eventError);
            }

            res.status(201).json(fullOrder);
        } catch (error) {
            console.error('Error creating inspection order:', error.message);

            // Log specific validation errors if they exist
            if (error.name == 'SequelizeValidationError') {
                console.error('Validation errors:', error.errors.map(e => `${e.path}: ${e.message}`));
            }

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

    // Asignar agente a orden de inspección
    async assignAgent(req, res) {
        try {
            const { orderId } = req.params;
            const { agentId } = req.body;

            if (!agentId) {
                return res.status(400).json({ message: 'ID del agente es requerido' });
            }

            const order = await this.model.findByPk(orderId, {
                include: [
                    {
                        model: User,
                        as: 'AssignedAgent',
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

            const oldAgentId = order.assigned_agent_id;
            await order.update({ assigned_agent_id: agentId });

            // Obtener información del agente asignado
            const agent = await User.findByPk(agentId, {
                attributes: ['id', 'name', 'email', 'first_name', 'last_name']
            });

            // Disparar evento de asignación de agente
            try {
                await automatedEventTriggers.triggerInspectionOrderEvents('assigned', {
                    id: order.id,
                    numero: order.numero,
                    nombre_cliente: order.nombre_cliente,
                    tipo_vehiculo: order.tipo_vehiculo,
                    assigned_agent_id: agentId,
                    agent_name: agent.name,
                    agent_email: agent.email
                }, {
                    assigned_by: req.user?.id,
                    assigned_at: new Date().toISOString(),
                    ip_address: req.ip
                });
            } catch (eventError) {
                console.error('Error disparando evento inspection_order.assigned:', eventError);
            }

            res.json({
                message: 'Agente asignado exitosamente',
                order: {
                    id: order.id,
                    assigned_agent_id: order.assigned_agent_id,
                    agent: agent
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al asignar agente', error: error.message });
        }
    }

    /**
     * Actualizar datos de contacto de una orden de inspección
     */
    async updateContactData(req, res) {
        try {
            const { id } = req.params;
            const { nombre_contacto, celular_contacto, correo_contacto } = req.body;
            const userId = req.user.id;

            // Validaciones
            if (!nombre_contacto || nombre_contacto.trim().length < 2 || nombre_contacto.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del contacto debe tener entre 2 y 100 caracteres'
                });
            }

            // Validar formato de celular (10 dígitos sin código de país)
            const phoneRegex = /^\d{10}$/;
            if (!celular_contacto || !phoneRegex.test(celular_contacto)) {
                return res.status(400).json({
                    success: false,
                    message: 'El celular debe tener exactamente 10 dígitos numéricos'
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!correo_contacto || !emailRegex.test(correo_contacto)) {
                return res.status(400).json({
                    success: false,
                    message: 'El formato del correo electrónico no es válido'
                });
            }

            // Buscar la orden
            const order = await InspectionOrder.findByPk(id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            // Verificar si hay cambios en los datos de contacto
            const hasChanges = 
                order.nombre_contacto !== nombre_contacto.trim() ||
                order.celular_contacto !== celular_contacto ||
                order.correo_contacto !== correo_contacto.trim();

            if (!hasChanges) {
                return res.status(200).json({
                    success: true,
                    message: 'No hay cambios en los datos de contacto',
                    data: order
                });
            }

            // Actualizar los datos de contacto
            await order.update({
                nombre_contacto: nombre_contacto.trim(),
                celular_contacto,
                correo_contacto: correo_contacto.trim()
            }, {
                user_id: userId // Pasar el user_id para el hook afterUpdate
            });

            // Obtener la orden actualizada con relaciones
            const updatedOrder = await InspectionOrder.findByPk(id, {
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

            res.json({
                success: true,
                message: 'Datos de contacto actualizados exitosamente',
                data: updatedOrder
            });
        } catch (error) {
            console.error('❌ Error actualizando datos de contacto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default InspectionOrderController; 