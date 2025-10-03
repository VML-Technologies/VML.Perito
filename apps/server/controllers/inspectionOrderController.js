import { BaseController } from './baseController.js';
import InspectionOrder from '../models/inspectionOrder.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import CallLog from '../models/callLog.js';
import CallStatus from '../models/callStatus.js';
import Appointment from '../models/appointment.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import Accessory from '../models/accessory.js';
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
import ImageCapture from '../models/imageCapture.js';
import InspectionQueue from '../models/inspectionQueue.js';
import sequelize from '../config/database.js';
import fs from 'fs';
import ImageProcessor from '../utils/imageProcessor.js';


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
        this.getFullInspectionOrder = this.getFullInspectionOrder.bind(this);
        this.resendInspectionSMS = this.resendInspectionSMS.bind(this);
        // Bind métodos de cálculo
        this.groupPartsByCategory = this.groupPartsByCategory.bind(this);
        this.getResponseValue = this.getResponseValue.bind(this);
        this.calculateChecklistScores = this.calculateChecklistScores.bind(this);
        this.calculateAsegurabilidad = this.calculateAsegurabilidad.bind(this);
    }

    getFixedStatus(statusId, statusName, result, comentariosAnulacion, appointments) {
        const statusBadgeColorMap = {
            "ANULADO": "outline",
            "APROBADO": "success",
            "INSPECCION EN CURSO": "secondary",
            "NO ASEGURABLE PARCIAL": "default",
            "RECHAZADO": "destructive"
        }
        if (result) {
            const cleanResult = result.split("-")[0].trim()
            return {
                fixedStatus: cleanResult=='NO ASEGURABLE PARCIAL'?'Reinspeccion':cleanResult,
                badgeColor: statusBadgeColorMap[cleanResult],
                comentariosAnulacion: comentariosAnulacion
            }
        }

        if (statusId == 4) {
            let retryStates = ["ineffective_with_retry", "failed"]
            let noRetryStates = ["ineffective_no_retry"]
            if (retryStates.includes(appointments[0].status)) {
                return {
                    fixedStatus: 'No finalizada por novedad del cliente',
                    badgeColor: 'default',
                    comentariosAnulacion: null
                }
            } else if (noRetryStates.includes(appointments[0].status)) {
                return {
                    fixedStatus: 'No reagendar',
                    badgeColor: 'default',
                    comentariosAnulacion: null
                }
            } else {
                return {
                    fixedStatus: 'Activa',
                    badgeColor: 'Activa',
                    comentariosAnulacion: null
                }
            }
        }

        return {
            fixedStatus: statusName,
            badgeColor: statusBadgeColorMap[statusId],
            comentariosAnulacion: null
        };
    }


    getFinalFixedStatus(statusId, appointments) {
        let retryStates = ["ineffective_with_retry", "failed"]
        let noRetryStates = ["ineffective_no_retry"]
        if (statusId == 4) {
            if (retryStates.includes(appointments[0].status)) {
                return 'Reagendar'
            } else if (noRetryStates.includes(appointments[0].status)) {
                return 'No reagendar'
            } else {
                return 'Activa'
            }
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
            const whereConditions = {
                deleted_at: null
            };

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
                    metodo_inspeccion_recomendado: order.metodo_inspeccion_recomendado,
                    session_id: sortedAppointments.length > 0 ? sortedAppointments[0].session_id : null,
                    fixedStatus: this.getFixedStatus(order.InspectionOrderStatus?.id, order.InspectionOrderStatus?.name, order.inspection_result, order.inspection_result_details, sortedAppointments).fixedStatus,
                    badgeColor: this.getFixedStatus(order.InspectionOrderStatus?.id, order.InspectionOrderStatus?.name, order.inspection_result, order.inspection_result_details, sortedAppointments).badgeColor,
                    comentariosAnulacion: this.getFixedStatus(order.InspectionOrderStatus?.id, order.InspectionOrderStatus?.name, order.inspection_result, order.inspection_result_details, sortedAppointments).comentariosAnulacion,
                };
            })

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

                // Órdenes completadas
                InspectionOrder.count({
                    where: {
                        ...whereConditions,
                        //inspection_result: not null or status == 5
                        inspection_result: { [Op.not]: null },
                        status: 5
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

    // Función para agrupar partes por categoría
    groupPartsByCategory(parts) {
        const grouped = {};
        parts.forEach(part => {
            if (!part.categoria) return;

            const categoriaNombre = part.categoria;
            if (!grouped[categoriaNombre]) {
                grouped[categoriaNombre] = [];
            }
            grouped[categoriaNombre].push(part);
        });
        return grouped;
    }

    // Función para obtener el valor de respuesta formateado
    getResponseValue(part, partResponses) {
        const value = partResponses[part.id];
        if (!value) return 'No presenta';

        if (Array.isArray(part.opciones) && part.opciones.length > 0) {
            const opt = part.opciones.find(opt => String(opt.value) === String(value));
            return opt ? opt.label : value;
        } else {
            return value === 'bueno' ? 'Bueno' : value === 'regular' ? 'Regular' : value === 'malo' ? 'Malo' : value;
        }
    }

    // Función para calcular puntajes del checklist
    calculateChecklistScores(parts, partResponses) {
        const groupedParts = this.groupPartsByCategory(parts);
        const categoryScores = {};
        let totalPercentSum = 0;
        let totalPercentCount = 0;
        let hasRejectionCriteria = false;
        let hasMinScoreRejection = false;

        Object.entries(groupedParts).forEach(([categoria, parts]) => {
            // Casos especiales: categorías de rechazo inmediato
            if (categoria === 'POLITICAS DE ASEGURABILIDAD "Estructura y Carroceria"' ||
                categoria === 'POLITICAS DE ASEGURABILIDAD "Sistema de identificación"') {
                const hasAnySelected = parts.some(part => {
                    const value = partResponses[part.id];
                    return value !== undefined && value !== "" && value !== null;
                });

                if (hasAnySelected) {
                    categoryScores[categoria] = 0; // 0% si hay alguna marcada
                    hasRejectionCriteria = true;
                } else {
                    categoryScores[categoria] = 100; // 100% si no hay ninguna marcada
                }

                // No sumar al total general, se maneja por separado
                return;
            }

            // Caso especial: POLITICAS DE ASEGURABILIDAD solo para observaciones
            if (categoria === 'POLITICAS DE ASEGURABILIDAD') {
                categoryScores[categoria] = null; // null indica que no tiene puntaje
                return;
            }

            let sumSelected = 0;
            let sumMax = 0;

            parts.forEach(part => {
                const value = partResponses[part.id];

                if (Array.isArray(part.opciones) && part.opciones.length > 0) {
                    // Para partes con opciones múltiples
                    const opt = part.opciones.find(opt => String(opt.value) === String(value));
                    if (value !== undefined && value !== "") {
                        const selectedValue = opt ? Number(opt.value) : 0;
                        sumSelected += selectedValue;
                    }
                    // Para máximo, tomamos el mayor value numérico
                    const maxOpt = part.opciones.reduce((max, opt) => Number(opt.value) > max ? Number(opt.value) : max, 0);
                    sumMax += maxOpt;
                } else {
                    // Para partes con bueno/regular/malo
                    if (value === 'bueno') {
                        sumSelected += Number(part.bueno);
                    } else if (value === 'regular') {
                        sumSelected += Number(part.regular);
                    } else if (value === 'malo') {
                        sumSelected += Number(part.malo);
                    }
                    // Usamos bueno como máximo para estas partes
                    sumMax += Number(part.bueno);
                }
            });

            // Calculamos porcentaje basado en valores seleccionados vs máximo posible
            const percent = sumMax > 0 ? (sumSelected / sumMax) * 100 : 0;
            categoryScores[categoria] = percent;

            // Verificar si la categoría cumple con el mínimo requerido
            const categoryMin = parts[0]?.minimo;
            if (categoryMin !== undefined && categoryMin > 0 && percent < categoryMin) {
                hasMinScoreRejection = true;
            }

            if (sumMax > 0) {
                totalPercentSum += percent;
                totalPercentCount++;
            }
        });

        // Si hay criterios de rechazo marcados o alguna categoría no cumple el mínimo, el puntaje general es 0%
        const generalScore = (hasRejectionCriteria || hasMinScoreRejection) ? 0 : (totalPercentCount > 0 ? (totalPercentSum / totalPercentCount) : 0);

        return { categoryScores, generalScore };
    }

    // Función para calcular asegurabilidad basada en los datos reales
    calculateAsegurabilidad(parts, partResponses, mechanicalTests) {
        // Verificar criterios de rechazo inmediato del checklist
        const hasRejectionCriteria = () => {
            if (!partResponses || Object.keys(partResponses).length === 0) {
                return false;
            }

            // Buscar respuestas en categorías de rechazo inmediato
            const rejectionCategories = [
                'POLITICAS DE ASEGURABILIDAD "Estructura y Carroceria"',
                'POLITICAS DE ASEGURABILIDAD "Sistema de identificación"'
            ];


            // Verificar si hay alguna respuesta marcada en estas categorías
            for (const [part_id, response] of Object.entries(partResponses)) {
                const part = parts.find(p => p.id.toString() === part_id.toString());
                if (part && part.categoria && rejectionCategories.includes(part.categoria)) {
                    if (response === 'checked' || response === true || response === 'si') {
                        return true;
                    }
                }
            }

            return false;
        };

        // Verificar fallas en pruebas mecanizadas
        const hasMechanicalFailures = () => {
            if (!mechanicalTests) return false;

            // Verificar suspensión
            if (mechanicalTests.suspension) {
                const suspensionValues = Object.values(mechanicalTests.suspension);
                if (suspensionValues.some(item => item.status && item.status !== 'BUENO')) {
                    return true;
                }
            }

            // Verificar frenos
            if (mechanicalTests.brakes) {
                if (mechanicalTests.brakes.eficaciaTotal && mechanicalTests.brakes.eficaciaTotal.status !== 'BUENO') {
                    return true;
                }
                if (mechanicalTests.brakes.frenoAuxiliar && mechanicalTests.brakes.frenoAuxiliar.status !== 'BUENO') {
                    return true;
                }
            }

            // Verificar alineación
            if (mechanicalTests.alignment && mechanicalTests.alignment.axes) {
                if (mechanicalTests.alignment.axes.some(axis => axis.status && axis.status !== 'BUENO')) {
                    return true;
                }
            }

            return false;
        };

        // Verificar puntaje mínimo no cumplido
        const hasMinScoreRejection = () => {
            if (!partResponses || !parts) {
                return false;
            }

            // Agrupar partes por categoría
            const groupedParts = parts.reduce((acc, part) => {
                if (!part.categoria) return acc;

                const categoria = part.categoria;
                if (!acc[categoria]) {
                    acc[categoria] = [];
                }
                acc[categoria].push(part);
                return acc;
            }, {});


            // Verificar cada categoría
            for (const [categoria, parts] of Object.entries(groupedParts)) {
                // Saltar categorías de rechazo inmediato y observaciones
                if (categoria.includes('POLITICAS DE ASEGURABILIDAD') || categoria === 'OBSERVACIONES') {
                    continue;
                }

                // Calcular puntaje de la categoría
                let sumSelected = 0;
                let sumMax = 0;

                parts.forEach(part => {
                    const value = partResponses[part.id];

                    // Parsear opciones si vienen como string JSON
                    let opciones = part.opciones;
                    if (typeof part.opciones === 'string') {
                        try {
                            opciones = JSON.parse(part.opciones);
                        } catch (e) {
                            opciones = [];
                        }
                    }

                    if (Array.isArray(opciones) && opciones.length > 0) {
                        const opt = opciones.find(opt => String(opt.value) === String(value));
                        if (value !== undefined && value !== "") {
                            const selectedValue = opt ? Number(opt.value) : 0;
                            sumSelected += selectedValue;
                        }
                        const maxOpt = opciones.reduce((max, opt) => Number(opt.value) > max ? Number(opt.value) : max, 0);
                        sumMax += maxOpt;
                    } else {
                        if (value === 'bueno') {
                            const buenoValue = Number(part.bueno || 100);
                            sumSelected += buenoValue;
                        } else if (value === 'regular') {
                            const regularValue = Number(part.regular || 50);
                            sumSelected += regularValue;
                        } else if (value === 'malo') {
                            const maloValue = Number(part.malo || 0);
                            sumSelected += maloValue;
                        }
                        const buenoMax = Number(part.bueno || 100);
                        sumMax += buenoMax;
                    }
                });

                const percent = sumMax > 0 ? (sumSelected / sumMax) * 100 : 0;
                const minRequired = parts[0]?.minimo;


                if (minRequired && percent < minRequired) {
                    return true;
                }
            }

            return false;
        };

        // Determinar asegurabilidad
        const rejectionCriteria = hasRejectionCriteria();
        const mechanicalFailures = hasMechanicalFailures();
        const minScoreRejection = hasMinScoreRejection();


        const isAsegurable = !rejectionCriteria && !mechanicalFailures && !minScoreRejection;

        let reason = '';
        if (rejectionCriteria) {
            reason = 'Criterios de rechazo inmediato detectados';
        } else if (mechanicalFailures) {
            reason = 'Fallas en pruebas mecanizadas';
        } else if (minScoreRejection) {
            reason = 'Puntaje mínimo no cumplido';
        } else {
            reason = 'Vehículo cumple todos los criterios';
        }


        return { isAsegurable, reason };
    }

    /**
     * Obtener orden de inspección por hash de acceso (público)
     */
    async getByHash(req, res) {
        try {
            const { hash } = req.params;

            if (!hash) {
                return res.status(400).json({
                    success: false,
                    message: 'El hash de acceso es requerido'
                });
            }

            // Buscar la orden directamente en InspectionOrder por inspection_link
            const order = await InspectionOrder.findOne({
                where: { inspection_link: `/inspeccion/${hash}` },
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: Appointment,
                        as: 'appointments',
                        // attributes: ['id', 'scheduled_date', 'scheduled_time', 'session_id', 'status'],
                        include: [
                            {
                                model: Sede,
                                as: 'sede',
                                attributes: ['id', 'name', 'address']
                            },
                            {
                                model: InspectionModality,
                                as: 'inspectionModality',
                                attributes: ['id', 'name', 'code']
                            }
                        ]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            // ✅ CORRECIÓN: Aplicar la misma lógica que en inspectionQueueController
            // Verificar si ya existe un appointment activo (no en estados finales)
            const activeAppointments = await Appointment.findAll({
                where: {
                    inspection_order_id: order.id,
                    deleted_at: null,
                    status: {
                        [Op.not]: ['completed', 'failed', 'ineffective_with_retry', 'ineffective_no_retry', 'call_finished', 'revision_supervisor']
                    }
                }
            });

            console.log('🚀 activeAppointments encontrados:', activeAppointments.length);

            // Determinar si se debe mostrar el botón de iniciar inspección
            let showStartButton = true;
            let appointmentStatus = null;
            let activeAppointment = null;
            
            if (activeAppointments.length > 0) {
                // ✅ HAY appointment activo - Usuario debe ir al APPOINTMENT (redirigir a inspección)
                activeAppointment = activeAppointments[0];
                appointmentStatus = activeAppointment.status;
                showStartButton = false; // NO mostrar botón, debe ir directo al appointment
                console.log('🚀 Appointment activo encontrado, usuario debe ir al APPOINTMENT');
            } else {
                // vamos a buscar los active inspectionQueue y como ya no tenemos un appointment activo
                //  marcaremos como is_active el inspectionQueue como false
                const queueRecord = await InspectionQueue.findOne({
                    where: {
                        inspection_order_id: order.id,
                        is_active: true
                    }
                });
                if (queueRecord && queueRecord.appointment_id) {
                    console.log('🚀 Marcando inspectionQueue como inactiva');
                    queueRecord.is_active = false;
                    await queueRecord.save();
                } else {
                    console.log('🚀 No se encontró inspectionQueue');
                }

                // No hay appointments - Usuario debe ESPERAR (puede iniciar inspección)
                showStartButton = true; // SÍ mostrar botón para iniciar inspección
                console.log('🚀 No hay appointments, usuario debe ESPERAR (puede iniciar inspección)');
            }

            // Preparar datos del appointment para la respuesta
            let appointmentData = null;
            if (activeAppointment) {
                // Si hay appointment activo, usar ese
                appointmentData = {
                    id: activeAppointment.id,
                    scheduled_date: activeAppointment.scheduled_date,
                    scheduled_time: activeAppointment.scheduled_time,
                    session_id: activeAppointment.session_id,
                    status: activeAppointment.status
                };
            } else if (order.appointments && order.appointments.length > 0) {
                // Si no hay appointment activo pero sí hay appointments finales, usar el primero
                const appointment = order.appointments[0];
                appointmentData = {
                    id: appointment.id,
                    scheduled_date: appointment.scheduled_date,
                    scheduled_time: appointment.scheduled_time,
                    session_id: appointment.session_id,
                    status: appointment.status,
                    sede: appointment.sede,
                    modality: appointment.inspectionModality
                };
            }

            res.json({
                success: true,
                data: {
                    id: order.id,
                    numero: order.numero,
                    placa: order.placa,
                    nombre_contacto: order.nombre_contacto,
                    celular_contacto: order.celular_contacto,
                    status: order.InspectionOrderStatus?.name || 'Sin estado',
                    created_at: new Date(),
                    show_start_button: showStartButton,
                    appointment: appointmentData
                }
            });

        } catch (error) {
            console.error('❌ Error obteniendo orden por hash:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Iniciar inspección de una orden
     */
    async startInspection(req, res) {
        try {
            const { id } = req.params;
            const { inspector_id } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de la orden es requerido'
                });
            }

            // Buscar la orden
            const order = await InspectionOrder.findByPk(id, {
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            // Verificar que la orden esté en estado válido para iniciar inspección
            if (order.status !== 1) { // Asumiendo que 1 es "Pendiente" o estado válido para iniciar
                return res.status(400).json({
                    success: false,
                    message: 'La orden no está en estado válido para iniciar inspección'
                });
            }

            // Actualizar estado a "En Proceso" (asumiendo que 2 es "En Proceso")
            await order.update({
                status: 2,
                inspector_id: inspector_id || null,
                fecha_inicio_inspeccion: new Date()
            });

            // Disparar evento de inspección iniciada
            try {
                await automatedEventTriggers.triggerEvent('inspection_started', {
                    order_id: order.id,
                    inspector_id: inspector_id,
                    placa: order.placa,
                    numero_orden: order.numero
                });
            } catch (eventError) {
                console.warn('⚠️ Error disparando evento inspection_started:', eventError);
            }

            res.json({
                success: true,
                message: 'Inspección iniciada exitosamente',
                data: {
                    id: order.id,
                    numero: order.numero,
                    placa: order.placa,
                    status: 'En Proceso',
                    inspector_id: inspector_id,
                    fecha_inicio: order.fecha_inicio_inspeccion
                }
            });

        } catch (error) {
            console.error('❌ Error iniciando inspección:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
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

            /*
status != 6
if status == 5 then check for latest @appointment an if it is with status != ineffective_with_retry
            */
            const existingOrder = await InspectionOrder.findOne({
                where: {
                    placa: plate.toUpperCase(),
                    status: { [Op.ne]: 6 } // status != 6
                },
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: Appointment,
                        as: 'appointments',
                        attributes: ['id', 'status', 'created_at'],
                        where: {
                            deleted_at: null
                        },
                        order: [['created_at', 'DESC']],
                        limit: 1,
                        required: false
                    }
                ]
            });

            if (existingOrder) {
                // Verificar lógica adicional: si status == 5, verificar que el appointment más reciente no sea ineffective_with_retry
                if (existingOrder.status === 5 && existingOrder.appointments && existingOrder.appointments.length > 0) {
                    const latestAppointment = existingOrder.appointments[0];
                    if (latestAppointment.status === 'ineffective_with_retry') {
                        // Si el appointment más reciente es ineffective_with_retry, no considerar la orden como existente
                        // Continuar con la lógica normal (no retornar aquí)
                    } else {
                        // El appointment no es ineffective_with_retry, la orden existe
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
                } else {
                    // Para otros status o si no hay appointments, la orden existe
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

    async getFullInspectionOrder(req, res) {
        try {
            const { id } = req.params;
            const inspectionOrder = await InspectionOrder.findByPk(id, {
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['name']
                    }, {
                        model: Appointment,
                        as: 'appointments',
                        attributes: ['id', 'session_id', 'observaciones', 'scheduled_date', 'scheduled_time', 'created_at', 'updated_at'],
                        where: {
                            deleted_at: null // Solo appointments activos
                        },
                        include: [
                            {
                                model: InspectionModality,
                                as: 'inspectionModality',
                                attributes: ['name']
                            },
                            {
                                model: Sede,
                                as: 'sede',
                                attributes: ['name'],
                            }, {
                                model: ImageCapture,
                                as: 'imageCaptures',
                                attributes: ['id', 'image_url', 'name', 'category', 'slot', 'blob_name', 'created_at']
                            }, {
                                model: Accessory,
                                as: 'accessories',
                                attributes: ['id', 'description', 'brand', 'reference', 'unit', 'value', 'quantity', 'total_value', 'notes', 'created_at', 'updated_at']
                            }
                        ],
                        order: [['updated_at', 'DESC']],
                        required: false
                    }
                ],
                attributes: ['id', 'numero', 'placa', 'nombre_cliente', 'num_doc', 'celular_cliente', 'correo_cliente', 'marca', 'linea', 'modelo', 'clase', 'color', 'carroceria', 'cilindraje', 'producto', 'motor', 'chasis', 'vin', 'cod_fasecolda', 'combustible', 'servicio', 'nombre_contacto', 'celular_contacto', 'correo_contacto', 'created_at', 'inspection_result']
            });

            if (!inspectionOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            console.log(`🔍 Orden encontrada: ${inspectionOrder.id}, Appointments: ${inspectionOrder.appointments?.length || 0}`);
            if (inspectionOrder.appointments && inspectionOrder.appointments.length > 0) {
                inspectionOrder.appointments.forEach((appointment, index) => {
                    console.log(`📋 Appointment ${index + 1}: ${appointment.session_id}, ImageCaptures: ${appointment.imageCaptures?.length || 0}`);
                    if (appointment.imageCaptures && appointment.imageCaptures.length > 0) {
                        appointment.imageCaptures.forEach((img, imgIndex) => {
                            console.log(`📸 Imagen ${imgIndex + 1}: ID=${img.id}, slot=${img.slot}, name=${img.name}, hasBlobName=${!!img.blob_name}`);
                        });
                    }
                });
            }

            if (!inspectionOrder.appointments || inspectionOrder.appointments.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        ...inspectionOrder,
                        appointments: []
                    }
                });
            }
            
            const mostRecentAppointment = inspectionOrder.appointments && inspectionOrder.appointments.length > 0 
                ? inspectionOrder.appointments[0] 
                : null;

            // Extender con respuestas e imágenes
            const fullInspectionOrderAppointments = await Promise.all(inspectionOrder.appointments.map(async (appointment) => {
                // Obtener respuestas de partes de inspección
                const responsesData = await this.getResponsesData(appointment.session_id);

                // Obtener respuestas de categorías de inspección
                const categoryResponsesData = await this.getCategoryResponsesData(inspectionOrder.id);

                // Obtener datos de pruebas mecánicas
                const mechanicalTestsData = await this.getMechanicalTestsData(appointment.session_id);

                // Obtener comentarios de categorías
                const categoryCommentsData = await this.getCategoryCommentsData(inspectionOrder.id);

                let processedImages = null;
                if (appointment === mostRecentAppointment && appointment.imageCaptures && appointment.imageCaptures.length > 0) {
                    try {
                        console.log(`📸 Procesando imágenes para appointment más reciente ${appointment.session_id}:`);
                        console.log('📸 ImageCaptures encontradas:', appointment.imageCaptures.map(img => ({
                            id: img.id,
                            slot: img.slot,
                            name: img.name,
                            category: img.category,
                            hasBlobName: !!img.blob_name,
                            hasImageUrl: !!img.image_url
                        })));

                        // remover imagenes adicionales img.slot.startsWith('adicional_')
                        appointment.imageCaptures = appointment.imageCaptures.filter(img => !img.slot.startsWith('adicional_'));


                        const imageProcessor = new ImageProcessor();
                        processedImages = await imageProcessor.processInspectionImages(appointment.imageCaptures, 60);
                        console.log(`📸 Imágenes procesadas para appointment más reciente ${appointment.session_id}: ${processedImages.total_count} total`);
                    } catch (error) {
                        console.error('❌ Error procesando imágenes:', error);
                        console.error('❌ Stack trace:', error.stack);
                        processedImages = {
                            main_images: [],
                            additional_images: [],
                            total_count: 0,
                            error: error.message
                        };
                    }
                } else if (appointment === mostRecentAppointment) {
                    console.log(`📭 No hay imágenes para appointment más reciente ${appointment.session_id}`);
                } else {
                    console.log(`⏭️ Saltando imágenes para appointment ${appointment.session_id} (no es el más reciente)`);
                }

                // Obtener partes de inspección (estructura base) - Evitar relaciones circulares
                const partsData = await sequelize.query(`
                    SELECT 
                        ip.id,
                        ip.parte,
                        ip.bueno,
                        ip.regular,
                        ip.malo,
                        ip.minimo,
                        ip.opciones,
                        ic.categoria
                    FROM inspection_parts ip
                    INNER JOIN inspection_categories ic ON ip.categoria_id = ic.id
                    ORDER BY ip.categoria_id ASC, ip.parte ASC
                `, {
                    type: QueryTypes.SELECT
                });

                console.log(`📋 Encontradas ${partsData.length} partes de inspección para appointment ${appointment.session_id}`);

                // Procesar respuestas para crear un objeto de respuestas por part_id
                const partResponses = {};
                responsesData.forEach(response => {
                    if (response.part_id) {
                        partResponses[response.part_id] = response.value;
                    }
                });

                // Calcular todos los valores en el backend
                const groupedParts = this.groupPartsByCategory(partsData);
                const { categoryScores, generalScore } = this.calculateChecklistScores(partsData, partResponses);
                const { isAsegurable, reason } = this.calculateAsegurabilidad(partsData, partResponses, mechanicalTestsData);

                // Procesar partes con valores de respuesta formateados
                const processedParts = partsData.map(part => ({
                    ...part,
                    responseValue: this.getResponseValue(part, partResponses),
                    hasResponse: partResponses[part.id] !== undefined
                }));

                // Convertir appointment a objeto plano para evitar referencias circulares
                const plainAppointment = {
                    id: appointment.id,
                    session_id: appointment.session_id,
                    scheduled_date: appointment.scheduled_date,
                    scheduled_time: appointment.scheduled_time,
                    created_at: appointment.created_at,
                    observaciones: appointment.observaciones,
                    accessories: appointment.accessories,
                    inspectionModality: appointment.inspectionModality ? {
                        id: appointment.inspectionModality.id,
                        name: appointment.inspectionModality.name
                    } : null,
                    sede: appointment.sede ? {
                        id: appointment.sede.id,
                        name: appointment.sede.name
                    } : null
                };

                // Crear estructura organizada por categorías para el frontend
                const inspectionResults = Object.entries(groupedParts).map(([categoria, parts]) => {
                    const categoryScore = categoryScores[categoria];
                    const categoryComment = categoryCommentsData.find(c => c.categoryName === categoria);

                    return {
                        categoria,
                        puntaje: categoryScore,
                        minimo: parts[0]?.minimo || 0,
                        cumpleMinimo: categoryScore !== null ? (categoryScore >= (parts[0]?.minimo || 0)) : true,
                        parts: processedParts.filter(el => el.categoria == categoria),
                        comentario: categoryComment ? categoryComment.comentario : null,
                        // Solo lo esencial para el render visual
                        estado: categoryScore === null ? 'observacion' :
                            categoryScore >= (parts[0]?.minimo || 0) ? 'aprobado' : 'rechazado',
                        color: categoryScore === null ? 'gray' :
                            categoryScore >= (parts[0]?.minimo || 0) ? 'green' : 'red'
                    };
                });

                return {
                    ...plainAppointment,
                    // Solo datos esenciales para el frontend
                    inspectionResults,
                    calculatedData: {
                        generalScore,
                        asegurabilidad: {
                            isAsegurable,
                            reason
                        },
                        // Resumen por estado
                        resumen: {
                            aprobadas: inspectionResults.filter(cat => cat.estado === 'aprobado').length,
                            rechazadas: inspectionResults.filter(cat => cat.estado === 'rechazado').length,
                            observaciones: inspectionResults.filter(cat => cat.estado === 'observacion').length
                        }
                    },
                    // Datos de pruebas mecánicas (solo si existen)
                    mechanicalTests: mechanicalTestsData && Object.keys(mechanicalTestsData).length > 0 ? mechanicalTestsData : null,
                    // Imágenes procesadas con URLs de Azure Blob Storage
                    images: processedImages
                };
            }));

            // Convertir inspectionOrder a objeto plano para evitar referencias circulares
            const plainInspectionOrder = {
                id: inspectionOrder.id,
                numero: inspectionOrder.numero,
                placa: inspectionOrder.placa,
                nombre_cliente: inspectionOrder.nombre_cliente,
                num_doc: inspectionOrder.num_doc,
                celular_cliente: inspectionOrder.celular_cliente,
                correo_cliente: inspectionOrder.correo_cliente,
                marca: inspectionOrder.marca,
                linea: inspectionOrder.linea,
                modelo: inspectionOrder.modelo,
                clase: inspectionOrder.clase,
                color: inspectionOrder.color,
                carroceria: inspectionOrder.carroceria,
                cilindraje: inspectionOrder.cilindraje,
                producto: inspectionOrder.producto,
                motor: inspectionOrder.motor,
                chasis: inspectionOrder.chasis,
                vin: inspectionOrder.vin,
                cod_fasecolda: inspectionOrder.cod_fasecolda,
                combustible: inspectionOrder.combustible,
                servicio: inspectionOrder.servicio,
                nombre_contacto: inspectionOrder.nombre_contacto,
                celular_contacto: inspectionOrder.celular_contacto,
                correo_contacto: inspectionOrder.correo_contacto,
                fecha_creacion: inspectionOrder.created_at,
                inspection_result: inspectionOrder.inspection_result,
                InspectionOrderStatus: inspectionOrder.InspectionOrderStatus ? {
                    id: inspectionOrder.InspectionOrderStatus.id,
                    name: inspectionOrder.InspectionOrderStatus.name
                } : null
            };

            const response = {
                success: true,
                data: {
                    ...plainInspectionOrder,
                    appointments: fullInspectionOrderAppointments
                }
            };

            // Log de la respuesta final para debugging
            console.log('📤 Respuesta final enviada:');
            console.log(`📤 - Orden ID: ${response.data.id}`);
            console.log(`📤 - Appointments: ${response.data.appointments.length}`);
            response.data.appointments.forEach((appointment, index) => {
                console.log(`📤 - Appointment ${index + 1}: ${appointment.session_id}`);
                if (appointment.images) {
                    console.log(`📤   - Imágenes: ${appointment.images.total_count} total`);
                    console.log(`📤   - Principales: ${appointment.images.main_images?.length || 0}`);
                    console.log(`📤   - Adicionales: ${appointment.images.additional_images?.length || 0}`);
                    if (appointment.images.error) {
                        console.log(`📤   - Error: ${appointment.images.error}`);
                    }
                } else {
                    console.log(`📤   - Sin imágenes procesadas`);
                }
            });

            res.json(response);
        } catch (error) {
            console.error('Error al obtener orden de inspección completa:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener orden de inspección completa',
                error: error.message
            });
        }
    }

    /**
     * Iniciar inspección virtual con inspector y sede asignados
     */
    async startVirtualInspection(req, res) {
        // try {
        console.log('🔍 === INICIO startVirtualInspection ===');
        console.log('👤 Usuario autenticado:', req.user ? { id: req.user.id, email: req.user.email } : 'No autenticado');
        console.log('🎭 Roles del usuario:', req.user?.roles?.map(r => r.name) || 'Sin roles');

        const { id } = req.params;
        const { inspector_id, sede_id } = req.body;

        console.log('📋 Parámetros recibidos:', { id, inspector_id, sede_id });

        if (!inspector_id || !sede_id) {
            return res.status(400).json({
                success: false,
                message: 'El inspector y la sede son requeridos'
            });
        }

        // Buscar la orden
        const order = await InspectionOrder.findByPk(id, {
            include: [
                {
                    model: InspectionOrderStatus,
                    as: 'InspectionOrderStatus',
                    attributes: ['id', 'name', 'description']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden de inspección no encontrada'
            });
        }

        // Verificar que la orden esté en estado válido
        if (order.status != 1) {
            return res.status(400).json({
                order: order,
                success: false,
                message: 'La orden no está en estado válido para iniciar inspección'
            });
        }

        // Obtener modalidad virtual
        const virtualModality = await InspectionModality.findOne({
            where: { code: 'VIRTUAL' }
        });

        if (!virtualModality) {
            return res.status(500).json({
                success: false,
                message: 'Modalidad virtual no encontrada'
            });
        }

        // Generar session_id único
        const generateSessionId = () => {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 10);
            return `session_${timestamp}_${random}`;
        };

        const sessionId = generateSessionId();

        // Crear agendamiento
        const appointment = await Appointment.create({
            sede_id: sede_id,
            inspection_order_id: order.id,
            inspection_modality_id: virtualModality.id,
            user_id: inspector_id,
            scheduled_date: new Date().toISOString().split('T')[0],
            scheduled_time: new Date().toTimeString().split(' ')[0],
            session_id: sessionId,
            status: 'pending'
        });

        // Actualizar estado de la orden
        await order.update({
            status: 3, // En Proceso
            assigned_agent_id: inspector_id,
            fecha_inicio_inspeccion: new Date()
        });

        // Obtener información del inspector y sede
        const inspector = await User.findByPk(inspector_id, {
            attributes: ['id', 'name', 'email']
        });

        const sede = await Sede.findByPk(sede_id, {
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name']
                }
            ],
            attributes: ['id', 'name', 'address']
        });

        // Emitir evento WebSocket para notificar al usuario
        try {
            const socketManager = await import('../websocket/socketManager.js');
            const hash = order.inspection_link?.replace('/inspeccion/', '');

            if (hash) {
                // Emitir actualización de estado de cola
                socketManager.default.emitQueueStatusUpdate(hash, {
                    session_id: sessionId,
                    inspector: inspector,
                    sede: sede,
                    redirect_url: `${process.env.FRONTEND_URL}/inspection/${sessionId}`,
                    estado: 'en_proceso'
                });

                // Emitir evento específico de inspector asignado
                socketManager.default.emitInspectorAssigned(hash, {
                    inspector: inspector,
                    status: 'en_proceso',
                    session_id: sessionId,
                    sede: sede
                });
            }
        } catch (wsError) {
            console.warn('⚠️ Error emitiendo evento WebSocket:', wsError);
        }

        console.log('✅ Inspección virtual iniciada exitosamente');
        console.log('🔍 === FIN startVirtualInspection ===');

        res.json({
            success: true,
            message: 'Inspección virtual iniciada exitosamente',
            data: {
                appointment_id: appointment.id,
                session_id: sessionId,
                inspector: inspector,
                sede: sede,
                redirect_url: `${process.env.FRONTEND_URL}/inspection/${sessionId}`
            }
        });

        // } catch (error) {
        //     console.error('❌ Error iniciando inspección virtual:', error);
        //     console.error('🔍 === ERROR startVirtualInspection ===');
        //     res.status(500).json({
        //         success: false,
        //         message: 'Error interno del servidor',
        //         error: error.message
        //     });
        // }
    }

    /**
     * Buscar orden de inspección por placa
     */
    async searchByPlate(req, res) {
        try {
            const { plate } = req.query;

            if (!plate) {
                return res.status(400).json({
                    success: false,
                    message: 'La placa es requerida'
                });
            }

            // Buscar la orden por placa
            const order = await InspectionOrder.findOne({
                where: { placa: plate.toUpperCase() },
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            res.json({
                success: true,
                data: {
                    id: order.id,
                    numero: order.numero,
                    placa: order.placa,
                    nombre_contacto: order.nombre_contacto,
                    celular_contacto: order.celular_contacto,
                    email_contacto: order.email_contacto,
                    status: order.InspectionOrderStatus?.name || 'Sin estado',
                    created_at: order.created_at
                }
            });

        } catch (error) {
            console.error('❌ Error buscando orden por placa:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Reenviar SMS de inspección
     */
    async resendInspectionSMS(req, res) {
        try {
            const { id } = req.params;

            console.log(`📱 Reenviando SMS para orden de inspección: ${id}`);

            // Buscar la orden de inspección
            const inspectionOrder = await InspectionOrder.findByPk(id, {
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (!inspectionOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }

            // Verificar que la orden tenga inspection_link
            if (!inspectionOrder.inspection_link) {
                return res.status(400).json({
                    success: false,
                    message: 'La orden no tiene link de inspección generado'
                });
            }

            // Verificar que tenga datos de contacto
            if (!inspectionOrder.celular_contacto || !inspectionOrder.nombre_contacto) {
                return res.status(400).json({
                    success: false,
                    message: 'La orden no tiene datos de contacto completos'
                });
            }

            // Importar servicios
            const smsService = await import('../services/channels/smsService.js');
            const smsLoggingService = await import('../services/smsLoggingService.js');
            const emailService = await import('../services/channels/emailService.js');
            const emailLoggingService = await import('../services/emailLoggingService.js');
            const fs = await import('fs');
            const path = await import('path');

            // Crear mensaje SMS (mismo formato que en inspectionOrder.js)
            const smsMessage = `Hola ${inspectionOrder.nombre_contacto} te hablamos desde Seguros Mundial. Para la inspeccion de ${inspectionOrder.placa} debes tener los documentos, carro limpio, internet, disponibilidad 45Min. Para ingresar dale click aca: ${process.env.FRONTEND_URL || 'http://localhost:3000'}${inspectionOrder.inspection_link}`;

            // Preparar datos para email
            const inspectionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${inspectionOrder.inspection_link}`;
            const emailData = {
                NAME: inspectionOrder.nombre_contacto,
                PLACA: inspectionOrder.placa,
                INSPECTION_LINK: inspectionLink
            };

            // Loggear SMS con envío automático
            const smsData = {
                inspection_order_id: inspectionOrder.id,
                recipient_phone: inspectionOrder.celular_contacto,
                recipient_name: inspectionOrder.nombre_contacto,
                content: smsMessage,
                priority: 'normal',
                sms_type: 'resend',
                trigger_source: 'controller',
                user_id: req.user?.id || null,
                metadata: {
                    placa: inspectionOrder.placa,
                    inspection_link: inspectionOrder.inspection_link,
                    resend: true,
                    resend_by: req.user?.id || 'system',
                    resend_at: new Date().toISOString()
                }
            };

            const result = await smsLoggingService.default.logSmsWithSend(smsData, async () => {
                return await smsService.default.send({
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
                        },
                        resend: true, // Marcar como reenvío
                        resend_by: req.user?.id || 'system',
                        resend_at: new Date().toISOString()
                    }
                });
            });

            if (result.success) {
                console.log(`✅ SMS reenviado y loggeado exitosamente a ${inspectionOrder.nombre_contacto} (${inspectionOrder.celular_contacto})`);
            } else {
                console.error(`❌ Error reenviando SMS: ${result.error}`);
            }

            // Enviar email si tiene correo de contacto
            let emailResult = null;
            if (inspectionOrder.correo_contacto) {
                try {
                    console.log(`📧 Enviando email a: ${inspectionOrder.correo_contacto}`);
                    
                    // Leer plantilla de email
                    const templatePath = path.join(process.cwd(), 'mailTemplates', 'inspectionLinkNotification.html');
                    let emailTemplate = fs.readFileSync(templatePath, 'utf8');
                    
                    // Reemplazar variables en la plantilla
                    console.log(`📧 Datos para reemplazo:`, emailData);
                    Object.keys(emailData).forEach(key => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        const beforeReplace = emailTemplate.includes(`{{${key}}}`);
                        emailTemplate = emailTemplate.replace(regex, emailData[key]);
                        const afterReplace = emailTemplate.includes(`{{${key}}}`);
                        console.log(`📧 Reemplazando {{${key}}} -> ${emailData[key]} (antes: ${beforeReplace}, después: ${afterReplace})`);
                    });
                    
                    // Crear objeto de notificación para email
                    const emailNotification = {
                        recipient_email: inspectionOrder.correo_contacto,
                        title: 'Link de Inspección - Seguros Mundial',
                        content: smsMessage, // Contenido de respaldo
                        priority: 'normal',
                        metadata: {
                            channel_data: {
                                email: {
                                    subject: 'Link de Inspección de Asegurabilidad - Seguros Mundial',
                                    html: emailTemplate
                                }
                            },
                            inspection_order_id: inspectionOrder.id,
                            placa: inspectionOrder.placa,
                            nombre_contacto: inspectionOrder.nombre_contacto,
                            resend: true,
                            resend_by: req.user?.id || 'system',
                            resend_at: new Date().toISOString()
                        }
                    };
                    
                    // Preparar datos para logging de email
                    const emailLogData = {
                        inspection_order_id: inspectionOrder.id,
                        recipient_email: inspectionOrder.correo_contacto,
                        recipient_name: inspectionOrder.nombre_contacto,
                        subject: emailNotification.metadata.channel_data.email.subject,
                        content: smsMessage,
                        html_content: emailTemplate,
                        email_type: 'resend',
                        trigger_source: 'controller',
                        user_id: req.user?.id || null,
                        priority: 'normal',
                        metadata: {
                            order_number: inspectionOrder.numero,
                            vehicle_plate: inspectionOrder.placa,
                            resent_by: req.user?.id || 'system',
                            resent_at: new Date().toISOString()
                        }
                    };
                    
                    // Enviar email con logging
                    const emailLogResult = await emailLoggingService.default.sendEmailWithLogging(
                        emailLogData,
                        async () => {
                            return await emailService.default.send(emailNotification, emailTemplate);
                        }
                    );
                    
                    emailResult = emailLogResult;
                    
                    if (emailResult.success) {
                        console.log(`✅ Email enviado y loggeado exitosamente a ${inspectionOrder.correo_contacto}`);
                    } else {
                        console.error(`❌ Error enviando email: ${emailResult.error}`);
                    }
                    
                } catch (emailError) {
                    console.error(`❌ Error procesando email:`, emailError);
                    emailResult = { success: false, error: emailError.message };
                }
            } else {
                console.log(`⚠️ No se envió email: la orden no tiene correo de contacto`);
            }

            // Respuesta exitosa
            return res.json({
                success: true,
                message: 'SMS y Email reenviados exitosamente',
                data: {
                    inspection_order_id: inspectionOrder.id,
                    numero: inspectionOrder.numero,
                    placa: inspectionOrder.placa,
                    nombre_contacto: inspectionOrder.nombre_contacto,
                    celular_contacto: inspectionOrder.celular_contacto,
                    correo_contacto: inspectionOrder.correo_contacto,
                    inspection_link: inspectionOrder.inspection_link,
                    sms_sent: result.success,
                    sms_log_id: result.smsLog?.id || null,
                    sms_result: result.sendResult || null,
                    email_sent: emailResult?.success || false,
                    email_log_id: emailResult?.emailLog?.id || null,
                    email_result: emailResult || null,
                    resent_at: new Date().toISOString(),
                    resent_by: req.user?.id || 'system'
                }
            });

        } catch (error) {
            console.error('❌ Error reenviando SMS:', error);
            return res.status(500).json({
                success: false,
                message: 'Error reenviando SMS: ' + error.message
            });
        }
    }
}

export default InspectionOrderController; 