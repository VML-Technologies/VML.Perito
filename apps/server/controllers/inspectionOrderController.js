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
import { Op, QueryTypes } from 'sequelize';
import automatedEventTriggers from '../services/automatedEventTriggers.js';
import InspectionPart from '../models/inspectionPart.js';
import InspectionCategory from '../models/inspectionCategory.js';
import InspectionCategoryResponse from '../models/inspectionCategoryResponse.js';
import MechanicalTest from '../models/mechanicalTest.js';
import InspectionModality from '../models/inspectionModality.js';
import sequelize from '../config/database.js';


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

registerPermission({
    name: 'inspection_orders.inspection_report',
    resource: 'inspection_orders',
    action: 'inspection_report',
    endpoint: '/api/inspection-orders/:session_id/inspection-report',
    method: 'GET',
    description: 'Ver informe de inspección',
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
        this.getResponsesData = this.getResponsesData.bind(this);
        this.getCategoryResponsesData = this.getCategoryResponsesData.bind(this);
        this.getInspectionReport = this.getInspectionReport.bind(this);
        this.getMechanicalTestsData = this.getMechanicalTestsData.bind(this);
        this.checkPlate = this.checkPlate.bind(this);
        this.getFixedStatus = this.getFixedStatus.bind(this);
    }

    getFixedStatus(statusId, statusName, result, comentariosAnulacion, placa) {
        const statusBadgeColorMap = {
            1: 'outline',
            2: 'outline',
            3: 'secondary',
            4: 'default',
            5: {
                'APROBADO': 'success',
                'RECHAZADO': 'destructive',
            }
        }
        const resultLabel = (statusId == 5 ? (result.split(" - ")[0] == 'ANULADO' ? 'Creada' : result.split(" - ")[0]) : statusName)
        const badgeColor = (statusId == 5 ? statusBadgeColorMap[statusId][resultLabel] : statusBadgeColorMap[statusId])
        const badgeLabel = statusId == 5 ? (resultLabel == 'Creada' ? 'Creada' : `${statusName} - ${resultLabel}`) : resultLabel
        const finalLabel = badgeLabel.includes('NO AEGURABLE PARCIAL') ? 'Pendiente de reinspección' : badgeLabel
        return {
            fixedStatus: finalLabel,
            badgeColor: badgeLabel == 'Creada' ? 'outline' : badgeColor,
            comentariosAnulacion: (result?.split(" - ")[0] == 'ANULADO'|| finalLabel == 'Pendiente de reinspección' ?comentariosAnulacion:null)
        }
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
                    attributes: ['id', 'comments', 'call_time', 'created_at'],
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
                }, {
                    model: Appointment,
                    as: 'appointments',
                    attributes: ['id', 'session_id', 'scheduled_date', 'scheduled_time', 'status', 'notes', 'direccion_inspeccion', 'observaciones', 'created_at', 'updated_at'],
                    where: {
                        deleted_at: null // Solo appointments activos
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
                            attributes: ['id', 'name', 'address'],
                            include: [
                                {
                                    model: City,
                                    as: 'city',
                                    attributes: ['id', 'name']
                                }
                            ]
                        }
                    ],
                    order: [['updated_at', 'DESC']],
                    required: false
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

            let transformedOrders = rows.map(order => {
                // Ordenar appointments por updated_at descendente (más reciente primero)
                const sortedAppointments = order.appointments
                    ? order.appointments.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    : [];

                return {
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
                    intermediary_key: order.clave_intermediario,
                    inspection_result_details: order.inspection_result_details,
                    appointments: sortedAppointments,
                    session_id: sortedAppointments.length > 0 ? sortedAppointments[0].session_id : null,
                    fixedStatus: this.getFixedStatus(order.InspectionOrderStatus?.id, order.InspectionOrderStatus?.name, order.inspection_result, order.inspection_result_details, order.placa).fixedStatus,
                    badgeColor: this.getFixedStatus(order.InspectionOrderStatus?.id, order.InspectionOrderStatus?.name, order.inspection_result, order.inspection_result_details).badgeColor,
                    comentariosAnulacion: this.getFixedStatus(order.InspectionOrderStatus?.id, order.InspectionOrderStatus?.name, order.inspection_result, order.inspection_result_details).comentariosAnulacion,
                };
            });

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

    async getInspectionReport(req, res) {
        try {
            const { session_id } = req.params;

            // 1. Obtener datos de la inspección
            const inspectionData = await Appointment.findOne({
                where: { session_id: session_id },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [
                            {
                                model: City,
                                as: 'city',
                                attributes: ['name']
                            }
                        ],
                        attributes: ['id', 'name']
                    },
                    {
                        model: InspectionModality,
                        as: 'inspectionModality',
                    }
                ]
            });
            // 2. Obtener partes de inspección
            const partsData = await InspectionPart.findAll({
                include: [{
                    model: InspectionCategory,
                    as: 'category', // <-- Alias agregado para evitar EagerLoadingError
                    attributes: ['categoria']
                }],
                order: [
                    ['categoria_id', 'ASC'],
                    ['parte', 'ASC']
                ]
            });
            // 3. Obtener respuestas de partes de inspección
            const responsesData = await this.getResponsesData(session_id);
            // 4. Obtener respuestas de categorías de inspección
            const categoryResponsesData = await this.getCategoryResponsesData(inspectionData.inspectionOrder.id);
            // 5. Obtener datos de pruebas mecánicas
            const mechanicalTestsData = await this.getMechanicalTestsData(session_id);
            // 6. Obtener datos de imágenes
            const imagesData = null;
            // 7. Obtener datos de accesorios
            const accessoriesData = null;
            // 8. Obtener datos de grabaciones
            const recordingsData = null;
            // 9. Obtener datos de checklist
            const checklistData = null;
            const categoryCommentsData = await this.getCategoryCommentsData(inspectionData.inspectionOrder.id);

            res.json({
                inspectionData: inspectionData,
                partsData: partsData,
                responsesData: responsesData,
                categoryResponsesData: categoryResponsesData,
                mechanicalTestsData: mechanicalTestsData,
                imagesData: imagesData,
                accessoriesData: accessoriesData,
                recordingsData: recordingsData,
                checklistData: checklistData,
                categoryCommentsData: categoryCommentsData
            });
        } catch (error) {
            console.error('Error al obtener informe de inspección:', error);
        }
    }

    async getResponsesData(inspection_id) {
        const query = `
        SELECT 
            ipr.id,
            ipr.part_id AS part_id,
            ipr.value,
            ipr.inspection_id,
            ipr.timestamp,
            ip.parte,
            ic.categoria,
            ip.bueno,
            ip.regular,
            ip.malo,
            ip.minimo,
            ip.opciones,
            ipr.comment AS part_response_comment,
            icr.comentario AS category_comment
        FROM inspection_part_responses ipr
        INNER JOIN inspection_parts ip ON ipr.part_id = ip.id
        INNER JOIN inspection_categories ic ON ip.categoria_id = ic.id
        LEFT JOIN inspection_category_responses icr 
            ON icr.inspection_id = ipr.inspection_id
        AND icr.category_id = ic.id
        WHERE ipr.inspection_id = :inspection_id
        `;

        const responses = await sequelize.query(query, {
            replacements: { inspection_id: inspection_id.trim() },
            type: QueryTypes.SELECT
        });

        console.log(`📝 Encontradas ${responses.length} respuestas para inspección ${inspection_id}`);

        // Formato de respuesta mejorado
        const formattedResponses = responses.map(response => ({
            id: response.id,
            part_id: response.part_id,
            value: response.value,
            inspection_id: response.inspection_id,
            timestamp: response.timestamp,
            partName: response.parte,
            category: response.categoria,
            bueno: response.bueno,
            regular: response.regular,
            malo: response.malo,
            minimo: response.minimo,
            opciones: response.opciones,
            comment: response.part_response_comment,
            commentCategory: response.category_comment
        }));

        return formattedResponses;
    }

    async getCategoryResponsesData(inspection_id) {
        const responses = await InspectionCategoryResponse.findAll({
            where: { inspection_id: inspection_id },
            include: [{
                model: InspectionCategory,
                as: 'category',
                attributes: ['id', 'categoria']
            }]
        });

        console.log(`📝 Encontradas ${responses.length} respuestas de categorías para inspección ${inspection_id}`);

        // Formato de respuesta
        const formattedResponses = responses.map(response => ({
            id: response.id,
            category_id: response.category_id,
            inspection_id: response.inspection_id,
            comentario: response.comentario,
            timestamp: response.timestamp,
            categoryName: response.category ? response.category.categoria : null
        }));

        return formattedResponses;
    }

    async getMechanicalTestsData(session_id) {
        const mechanicalTests = await MechanicalTest.findAll({
            where: { session_id: session_id },
            order: [['created_at', 'DESC']]
        });

        if (mechanicalTests.length === 0) {
            console.log('📭 No hay pruebas mecanizadas para session_id:', session_id);
            return {
                brakes: null,
                suspension: null,
                tires: null,
                alignment: null
            };
        }

        // Tomar la prueba más reciente (la primera por orden DESC)
        const latestTest = mechanicalTests[0];
        console.log('📋 Prueba más reciente:', latestTest.id, 'con datos:', !!latestTest.data);

        // Los datos vienen como JSON en el campo 'data'
        const testData = latestTest.data || {};

        // Procesar los datos para el formato esperado por el frontend
        const processedTests = {
            brakes: testData.brakes || null,
            suspension: testData.suspension || null,
            tires: testData.tires || null,
            alignment: testData.alignment || null
        };

        // Agregar información adicional si está disponible
        if (latestTest.observationText) {
            processedTests.observations = latestTest.observationText;
        }

        if (latestTest.status) {
            processedTests.status = latestTest.status;
        }

        // Agregar timestamp si no está presente
        Object.keys(processedTests).forEach(key => {
            if (processedTests[key] && !processedTests[key].timestamp) {
                processedTests[key].timestamp = latestTest.created_at;
            }
        });

        return processedTests;
    }

    async getCategoryCommentsData(inspection_id) {
        const responses = await InspectionCategoryResponse.findAll({
            where: { inspection_id: inspection_id },
            include: [{
                model: InspectionCategory,
                as: 'category',
                attributes: ['id', 'categoria']
            }]
        });

        // Formato de respuesta
        const formattedResponses = responses.map(response => ({
            id: response.id,
            category_id: response.category_id,
            inspection_id: response.inspection_id,
            comentario: response.comentario,
            timestamp: response.timestamp,
            categoryName: response.category ? response.category.categoria : null
        }));

        return formattedResponses;
    }

    /**
     * Verificar si existe una orden activa con la misma placa
     */
    async checkPlate(req, res) {
        try {
            const { plate } = req.params;

            if (!plate) {
                return res.status(400).json({
                    success: false,
                    message: 'La placa es requerida'
                });
            }

            // Buscar órdenes con la misma placa que NO estén en estado "Finalizado" (ID 5)
            const existingOrder = await InspectionOrder.findOne({
                where: {
                    placa: plate.toUpperCase(),
                    status: { [Op.ne]: 5 } // No igual a 5 (Finalizado)
                },
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (existingOrder) {
                return res.json({
                    success: true,
                    exists: true,
                    message: `Ya existe una orden de inspección activa para la placa ${plate.toUpperCase()}`,
                    order: {
                        id: existingOrder.id,
                        numero: existingOrder.numero,
                        status: existingOrder.InspectionOrderStatus?.name || 'Sin estado',
                        created_at: existingOrder.created_at,
                        nombre_cliente: existingOrder.nombre_cliente
                    }
                });
            }

            res.json({
                success: true,
                exists: false,
                message: `La placa ${plate.toUpperCase()} está disponible para crear una nueva orden`
            });

        } catch (error) {
            console.error('❌ Error verificando placa:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default InspectionOrderController; 