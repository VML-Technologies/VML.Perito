import InspectionOrder from '../models/inspectionOrder.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import CallLog from '../models/callLog.js';
import CallStatus from '../models/callStatus.js';
import Appointment from '../models/appointment.js';
import InspectionType from '../models/inspectionType.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import Department from '../models/department.js';
import { registerPermission } from '../middleware/permissionRegistry.js';
import { Op } from 'sequelize';

// Registrar permisos
registerPermission({
    name: 'contact_agent.read',
    resource: 'contact_agent',
    action: 'read',
    endpoint: '/api/contact-agent',
    method: 'GET',
    description: 'Ver órdenes como Agente de Contact',
});

registerPermission({
    name: 'contact_agent.create_call',
    resource: 'contact_agent',
    action: 'create_call',
    endpoint: '/api/contact-agent/call-logs',
    method: 'POST',
    description: 'Registrar llamadas',
});

registerPermission({
    name: 'contact_agent.create_appointment',
    resource: 'contact_agent',
    action: 'create_appointment',
    endpoint: '/api/contact-agent/appointments',
    method: 'POST',
    description: 'Crear agendamientos',
});

class ContactAgentController {
    constructor() {
        // Bind methods
        this.getOrders = this.getOrders.bind(this);
        this.getOrderDetails = this.getOrderDetails.bind(this);
        this.createCallLog = this.createCallLog.bind(this);
        this.createAppointment = this.createAppointment.bind(this);
        this.getCallStatuses = this.getCallStatuses.bind(this);
        this.getInspectionTypes = this.getInspectionTypes.bind(this);
        this.getDepartments = this.getDepartments.bind(this);
        this.getCities = this.getCities.bind(this);
        this.getSedes = this.getSedes.bind(this);
    }

    // Obtener órdenes para Agente de Contact
    async getOrders(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status = ''
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const whereConditions = {
                // Solo mostrar órdenes asignadas a este agente
                assigned_agent_id: req.user.id
            };

            if (search) {
                whereConditions[Op.or] = [
                    { placa: { [Op.like]: `%${search}%` } },
                    { nombre_cliente: { [Op.like]: `%${search}%` } },
                ];
            }

            if (status) {
                whereConditions.status = status;
            }

            const { count, rows } = await InspectionOrder.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: CallLog,
                        as: 'callLogs',
                        include: [
                            {
                                model: CallStatus,
                                as: 'status'
                            }
                        ]
                    }
                ],
                limit: parseInt(limit),
                offset: offset,
                order: [['created_at', 'DESC']],
            });

            // Transformar datos para que coincidan con el frontend
            const transformedOrders = rows.map(order => ({
                id: order.id,
                numero: order.numero,
                cliente_nombre: order.nombre_cliente,
                cliente_telefono: order.celular_cliente,
                cliente_email: order.correo_cliente,
                vehiculo_placa: order.placa,
                vehiculo_marca: order.marca,
                vehiculo_modelo: order.modelo,
                InspectionOrderStatus: order.InspectionOrderStatus,
                callLogs: order.callLogs
            }));

            res.json({
                orders: transformedOrders,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / parseInt(limit)),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
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
                                as: 'status'
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
                                as: 'inspectionType'
                            },
                            {
                                model: Sede,
                                as: 'sede',
                                include: [
                                    {
                                        model: City,
                                        as: 'city',
                                        include: [
                                            {
                                                model: Department,
                                                as: 'department'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ message: 'Orden no encontrada' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener detalles de la orden', error: error.message });
        }
    }

    // Crear registro de llamada
    async createCallLog(req, res) {
        try {
            const callLog = await CallLog.create(req.body);

            // Cargar el call log completo con relaciones
            const fullCallLog = await CallLog.findByPk(callLog.id, {
                include: [
                    {
                        model: CallStatus,
                        as: 'status'
                    },
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder'
                    }
                ]
            });

            // TODO: Emitir evento WebSocket
            // TODO: Crear notificación

            res.status(201).json(fullCallLog);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear registro de llamada', error: error.message });
        }
    }

    // Crear agendamiento
    async createAppointment(req, res) {
        try {
            const appointment = await Appointment.create(req.body);

            // Cargar el agendamiento completo
            const fullAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    {
                        model: InspectionType,
                        as: 'inspectionType'
                    },
                    {
                        model: Sede,
                        as: 'sede',
                        include: [
                            {
                                model: City,
                                as: 'city',
                                include: [
                                    {
                                        model: Department,
                                        as: 'department'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: CallLog,
                        as: 'callLog'
                    },
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder'
                    }
                ]
            });

            // TODO: Emitir evento WebSocket
            // TODO: Crear notificación

            res.status(201).json(fullAppointment);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear agendamiento', error: error.message });
        }
    }

    // Obtener estados de llamada
    async getCallStatuses(req, res) {
        try {
            const statuses = await CallStatus.findAll({
                order: [['name', 'ASC']]
            });
            res.json(statuses);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener estados de llamada', error: error.message });
        }
    }

    // Obtener tipos de inspección
    async getInspectionTypes(req, res) {
        try {
            const types = await InspectionType.findAll({
                where: { active: true },
                order: [['name', 'ASC']]
            });
            res.json(types);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener tipos de inspección', error: error.message });
        }
    }

    // Obtener departamentos
    async getDepartments(req, res) {
        try {
            const departments = await Department.findAll({
                order: [['name', 'ASC']]
            });
            res.json(departments);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener departamentos', error: error.message });
        }
    }

    // Obtener ciudades por departamento
    async getCities(req, res) {
        try {
            const { departmentId } = req.params;
            const cities = await City.findAll({
                where: { department_id: departmentId },
                order: [['name', 'ASC']]
            });
            res.json(cities);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener ciudades', error: error.message });
        }
    }

    // Obtener sedes por ciudad
    async getSedes(req, res) {
        try {
            const { cityId } = req.params;
            const sedes = await Sede.findAll({
                where: { city_id: cityId },
                order: [['name', 'ASC']]
            });
            res.json(sedes);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener sedes', error: error.message });
        }
    }
}

export default new ContactAgentController(); 