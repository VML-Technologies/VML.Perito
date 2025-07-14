import InspectionOrder from '../models/inspectionOrder.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import CallLog from '../models/callLog.js';
import CallStatus from '../models/callStatus.js';
import Appointment from '../models/appointment.js';
import Sede from '../models/sede.js';
import City from '../models/city.js';
import Department from '../models/department.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import NotificationConfig from '../models/notificationConfig.js';
import NotificationType from '../models/notificationType.js';
import NotificationChannel from '../models/notificationChannel.js';
import { InspectionModality, SedeModalityAvailability, SedeType } from '../models/index.js';
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
        this.getInspectionModalities = this.getInspectionModalities.bind(this);
        this.getDepartments = this.getDepartments.bind(this);
        this.getCities = this.getCities.bind(this);
        this.getSedes = this.getSedes.bind(this);
        this.getAvailableModalities = this.getAvailableModalities.bind(this);
        this.getAvailableSedes = this.getAvailableSedes.bind(this);
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
                callLogs: order.callLogs,
                callLogsCount: order.callLogs ? order.callLogs.length : 0 // Agregar conteo de intentos
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
                        include: [
                            {
                                model: InspectionModality,
                                as: 'inspectionModality'
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
            const {
                inspection_order_id,
                call_status_id,
                observaciones,
                fecha_seguimiento
            } = req.body;

            // Validar campos requeridos
            if (!inspection_order_id || !call_status_id) {
                return res.status(400).json({
                    success: false,
                    message: 'inspection_order_id y call_status_id son requeridos'
                });
            }

            // Verificar que la orden existe y está asignada al agente
            const order = await InspectionOrder.findOne({
                where: {
                    id: inspection_order_id,
                    assigned_agent_id: req.user.id
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada o no asignada a este agente'
                });
            }

            // Mapear los datos del frontend al formato del modelo
            const callLogData = {
                inspection_order_id: inspection_order_id,
                agent_id: req.user.id, // ID del agente autenticado
                status_id: call_status_id, // Mapear call_status_id a status_id
                comments: observaciones || null, // Mapear observaciones a comments
                call_time: new Date() // Establecer el tiempo de la llamada
            };

            const callLog = await CallLog.create(callLogData);

            // Cargar el call log completo con relaciones
            const fullCallLog = await CallLog.findByPk(callLog.id, {
                include: [
                    {
                        model: CallStatus,
                        as: 'status',
                        attributes: ['id', 'name', 'creates_schedule']
                    },
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'nombre_cliente', 'placa']
                    }
                ]
            });

            // TODO: Emitir evento WebSocket
            const webSocketSystem = req.app.get('webSocketSystem');
            if (webSocketSystem && webSocketSystem.isInitialized()) {
                const notificationData = {
                    type: 'call_logged',
                    order_id: order.id,
                    order_number: order.numero,
                    agent_id: req.user.id,
                    agent_name: req.user.name,
                    call_log_id: callLog.id,
                    message: `Llamada registrada para la orden #${order.numero}`,
                    timestamp: new Date().toISOString()
                };
                webSocketSystem.sendToUser(req.user.id, 'call_logged', notificationData);
            }

            // TODO: Crear notificación

            res.status(201).json({
                success: true,
                message: 'Llamada registrada exitosamente',
                data: fullCallLog
            });
        } catch (error) {
            console.error('Error al crear registro de llamada:', error);
            res.status(400).json({
                success: false,
                message: 'Error al crear registro de llamada',
                error: error.message
            });
        }
    }

    // Crear agendamiento
    async createAppointment(req, res) {
        try {
            const { inspection_order_id } = req.body;

            // Validar que se proporcione el ID de la orden
            if (!inspection_order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'inspection_order_id es requerido'
                });
            }

            // Verificar que la orden existe y está asignada al agente
            const order = await InspectionOrder.findOne({
                where: {
                    id: inspection_order_id,
                    assigned_agent_id: req.user.id
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada o no asignada a este agente'
                });
            }

            // Crear el agendamiento
            const appointment = await Appointment.create(req.body);

            // Actualizar el estado de la orden a "Agendado" (id: 3)
            await order.update({
                status: 3, // ID del estado "Agendado"
                updated_at: new Date()
            });

            // Cargar el agendamiento completo
            const fullAppointment = await Appointment.findByPk(appointment.id, {
                include: [
                    {
                        model: InspectionModality,
                        as: 'inspectionModality'
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

            // Emitir evento WebSocket para notificar el cambio de estado
            const webSocketSystem = req.app.get('webSocketSystem');
            if (webSocketSystem && webSocketSystem.isInitialized()) {
                const notificationData = {
                    type: 'order_status_updated',
                    order_id: inspection_order_id,
                    order_number: order.numero,
                    new_status: 'Agendado',
                    previous_status: order.InspectionOrderStatus?.name || 'Desconocido',
                    appointment_id: appointment.id,
                    assigned_agent_id: order.assigned_agent_id, // <--- AGREGADO
                    assigned_agent_name: req.user?.name,        // <--- Opcional, para mostrar en el toast
                    message: `La orden #${order.numero} ha sido agendada exitosamente`,
                    timestamp: new Date().toISOString()
                };

                // Enviar notificación al coordinador y otros agentes
                webSocketSystem.getSocketManager().broadcast('order_status_updated', notificationData);
                console.log(`📡 Notificación de cambio de estado enviada:`, notificationData);

                // Emitir también call_logged al agente
                const callLogNotification = {
                    type: 'call_logged',
                    order_id: order.id,
                    order_number: order.numero,
                    agent_id: req.user.id,
                    agent_name: req.user.name,
                    call_log_id: appointment.call_log_id,
                    message: `Llamada registrada para la orden #${order.numero}`,
                    timestamp: new Date().toISOString()
                };
                webSocketSystem.sendToUser(req.user.id, 'call_logged', callLogNotification);
            }

            // Crear notificación de agendamiento
            try {
                // Buscar configuración de notificación para agendamientos
                const appointmentNotificationType = await NotificationType.findOne({
                    where: { name: 'appointment_scheduled' }
                });

                const inAppChannel = await NotificationChannel.findOne({
                    where: { name: 'in_app' }
                });

                if (appointmentNotificationType && inAppChannel) {
                    const appointmentNotificationConfig = await NotificationConfig.findOne({
                        where: {
                            notification_type_id: appointmentNotificationType.id,
                            notification_channel_id: inAppChannel.id,
                            for_users: true,
                            active: true
                        }
                    });

                    if (appointmentNotificationConfig) {
                        // Crear notificación para el agente que creó el agendamiento
                        await Notification.create({
                            notification_config_id: appointmentNotificationConfig.id,
                            inspection_order_id: inspection_order_id,
                            appointment_id: appointment.id,
                            recipient_user_id: req.user.id,
                            recipient_type: 'user',
                            title: 'Agendamiento Creado',
                            content: `Se ha agendado exitosamente la orden #${order.numero} - ${order.nombre_cliente} (${order.placa})`,
                            priority: 'normal',
                            status: 'pending',
                            metadata: {
                                type: 'appointment_created',
                                order_number: order.numero,
                                order_id: inspection_order_id,
                                appointment_id: appointment.id,
                                client_name: order.nombre_cliente,
                                vehicle_plate: order.placa,
                                agent_id: req.user.id
                            }
                        });

                        console.log(`✅ Notificación de agendamiento creada para orden #${order.numero}`);
                    }
                }
            } catch (notificationError) {
                console.error('Error creando notificación de agendamiento:', notificationError);
                // No fallar el proceso principal si la notificación falla
            }

            res.status(201).json({
                success: true,
                message: 'Agendamiento creado exitosamente',
                data: fullAppointment
            });
        } catch (error) {
            console.error('Error al crear agendamiento:', error);
            res.status(400).json({
                success: false,
                message: 'Error al crear agendamiento',
                error: error.message
            });
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

    // Obtener modalidades de inspección
    async getInspectionModalities(req, res) {
        try {
            const modalities = await InspectionModality.findAll({
                where: { active: true },
                order: [['name', 'ASC']]
            });
            res.json(modalities);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener modalidades de inspección', error: error.message });
        }
    }

    // Obtener todas las modalidades disponibles (sin filtrar por ubicación)
    async getAllAvailableModalities(req, res) {
        try {
            const modalities = await InspectionModality.findAll({
                where: { active: true },
                include: [{
                    model: SedeModalityAvailability,
                    as: 'sedeAvailabilities',
                    required: true,
                    where: { active: true },
                    include: [{
                        model: Sede,
                        as: 'sede',
                        required: true,
                        where: { active: true }
                    }]
                }],
                order: [['name', 'ASC']]
            });

            const modalitiesWithCount = modalities.map(modality => ({
                id: modality.id,
                name: modality.name,
                code: modality.code,
                description: modality.description,
                sedesCount: modality.sedeAvailabilities.length
            }));

            res.json({
                success: true,
                data: modalitiesWithCount
            });

        } catch (error) {
            console.error('Error obteniendo modalidades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener sedes disponibles por modalidad (sin filtrar por ciudad)
    async getSedesByModality(req, res) {
        try {
            const { modalityId } = req.query;

            if (!modalityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Modalidad es requerida'
                });
            }

            // Nuevo enfoque: buscar por SedeModalityAvailability
            const sede_modality_availability = await SedeModalityAvailability.findAll({
                where: {
                    inspection_modality_id: modalityId
                },
                include: [
                    {
                        model: Sede,
                        as: 'sede',
                        include: [
                            {
                                model: City,
                                as: 'city',
                                include: [{ model: Department, as: 'department' }]
                            }
                        ]
                    }
                ]
            });

            // Mapear la respuesta para que sea igual que antes
            const sedesWithAvailability = sede_modality_availability.map(item => {
                const sede = item.sede;
                return {
                    id: sede.id,
                    name: sede.name,
                    address: sede.address,
                    phone: sede.phone,
                    email: sede.email,
                    city: sede.city?.name,
                    department: sede.city?.department?.name,
                    department_id: sede.city?.department?.id,
                    city_id: sede.city?.id,
                    availability: {
                        maxDailyCapacity: item.max_daily_capacity,
                        workingHoursStart: item.working_hours_start,
                        workingHoursEnd: item.working_hours_end,
                        workingDays: item.working_days
                    }
                };
            });

            res.json({
                success: true,
                data: sedesWithAvailability
            });

        } catch (error) {
            console.error('Error obteniendo sedes por modalidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
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

    // Obtener modalidades disponibles por departamento y ciudad
    async getAvailableModalities(req, res) {
        try {
            const { departmentId, cityId } = req.query;

            if (!departmentId || !cityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Departamento y ciudad son requeridos'
                });
            }

            const availableModalities = await InspectionModality.findAll({
                include: [{
                    model: SedeModalityAvailability,
                    as: 'sedeAvailabilities',
                    required: true,
                    where: { active: true },
                    include: [{
                        model: Sede,
                        as: 'sede',
                        required: true,
                        where: {
                            city_id: cityId,
                            active: true
                        },
                        include: [{
                            model: City,
                            as: 'city',
                            required: true,
                            where: { department_id: departmentId }
                        }]
                    }]
                }],
                where: { active: true }
            });

            const modalitiesWithCount = availableModalities.map(modality => ({
                id: modality.id,
                name: modality.name,
                code: modality.code,
                description: modality.description,
                sedesCount: modality.sedeAvailabilities.length
            }));

            res.json({
                success: true,
                data: modalitiesWithCount
            });

        } catch (error) {
            console.error('Error obteniendo modalidades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener sedes disponibles por modalidad y tipo de inspección
    async getAvailableSedes(req, res) {
        try {
            const { modalityId, cityId } = req.query;

            if (!modalityId || !cityId) {
                return res.status(400).json({
                    success: false,
                    message: 'Modalidad, tipo de inspección y ciudad son requeridos'
                });
            }

            const sedes = await Sede.findAll({
                include: [
                    {
                        model: SedeModalityAvailability,
                        as: 'modalityAvailabilities',
                        required: true,
                        where: {
                            inspection_modality_id: modalityId,
                            active: true
                        },
                        include: [{
                            model: InspectionModality,
                            as: 'inspectionModality'
                        }]
                    },
                    {
                        model: City,
                        as: 'city',
                        include: [{
                            model: Department,
                            as: 'department'
                        }]
                    },
                    {
                        model: SedeType,
                        as: 'sedeType',
                        where: { code: 'CDA' } // Solo sedes CDA para agendamiento
                    }
                ],
                where: {
                    city_id: cityId,
                    active: true
                }
            });

            const sedesWithAvailability = sedes.map(sede => ({
                id: sede.id,
                name: sede.name,
                address: sede.address,
                phone: sede.phone,
                email: sede.email,
                city: sede.city.name,
                department: sede.city.department.name,
                availability: sede.modalityAvailabilities[0] ? {
                    maxDailyCapacity: sede.modalityAvailabilities[0].max_daily_capacity,
                    workingHoursStart: sede.modalityAvailabilities[0].working_hours_start,
                    workingHoursEnd: sede.modalityAvailabilities[0].working_hours_end,
                    workingDays: sede.modalityAvailabilities[0].working_days
                } : null
            }));

            res.json({
                success: true,
                data: sedesWithAvailability
            });

        } catch (error) {
            console.error('Error obteniendo sedes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

export default new ContactAgentController(); 