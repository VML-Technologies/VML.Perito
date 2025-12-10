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
import nodemailer from 'nodemailer';
import EmailService from '../services/channels/emailService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                nombre_cliente: order.nombre_cliente,
                celular_cliente: order.celular_cliente,
                correo_cliente: order.correo_cliente,
                placa: order.placa,
                marca: order.marca,
                modelo: order.modelo,
                InspectionOrderStatus: order.InspectionOrderStatus,
                inspection_result: order.inspection_result,
                callLogs: order.callLogs,
                callLogsCount: order.callLogs ? order.callLogs.length : 0 // Agregar conteo de intentos
            }));

            res.json({
                data: {
                    orders: transformedOrders,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        pages: Math.ceil(count / parseInt(limit)),
                        limit: parseInt(limit)
                    }
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
                        required: false,
                        where: {
                            deleted_at: null
                        },
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

    /**
     * Enviar email de notificación de call log
     */
    async sendCallLogNotificationEmail(order, callLog, agent, skipIfAppointment = false) {
        try {
            // Si se está creando un appointment, no enviar email de call log
            if (skipIfAppointment) {
                console.log(`📧 Saltando email de call log para orden ${order.numero} porque se está creando un appointment`);
                return;
            }

            // Determinar el usuario destinatario según las reglas de negocio
            let targetUser = null;

            if (order.numero.toString().includes('9991')) {
                // Si la orden inicia con 9991, buscar por user_id
                targetUser = await User.findByPk(order.user_id);
                console.log(`📧 Orden ${order.numero} inicia con 9991, enviando email a user_id: ${order.user_id}`);
            } else if (order.clave_intermediario) {
                // Si no inicia con 9991 pero tiene clave_intermediario, buscar por clave_intermediario
                targetUser = await User.findOne({
                    where: {
                        intermediary_key: order.clave_intermediario,
                        is_active: true
                    }
                });
                console.log(`📧 Orden ${order.numero} con clave_intermediario: ${order.clave_intermediario}, enviando email a usuario comercial`);
            }

            if (!targetUser) {
                console.log(`⚠️ No se encontró usuario destinatario para la orden ${order.numero}`);
                return;
            }

            // Verificar si el usuario tiene habilitadas las notificaciones por email
            if (!targetUser.notification_channel_email_enabled) {
                console.log(`⚠️ Usuario ${targetUser.email} tiene deshabilitadas las notificaciones por email`);
                return;
            }

            // Configurar EmailService si no está configurado
            if (!EmailService.transporter) {
                console.log('📧 Configurando EmailService desde variables de entorno...');
                EmailService.configureFromEnv();
            }

            // Leer la plantilla HTML
            const templatePath = path.join(__dirname, '../mailTemplates/callLogNotification.html');
            let emailTemplate;

            try {
                emailTemplate = fs.readFileSync(templatePath, 'utf8');
            } catch (templateError) {
                console.error('❌ Error leyendo plantilla de email de call log:', templateError.message);
                throw new Error('No se pudo cargar la plantilla de email de call log');
            }

            // Variables para la plantilla
            const templateVariables = {
                user_name: targetUser.name,
                order_number: order.numero,
                client_name: order.nombre_cliente,
                client_phone: order.celular_cliente,
                vehicle_plate: order.placa,
                vehicle_brand: order.marca,
                vehicle_model: order.modelo,
                agent_name: agent.name,
                call_datetime: new Date(callLog.call_time).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                call_status: callLog.status?.name || 'Estado desconocido',
                requires_scheduling: callLog.status?.creates_schedule || false,
                has_comments: callLog.comments && callLog.comments.trim().length > 0,
                agent_comments: callLog.comments || '',
                current_year: new Date().getFullYear()
            };

            // Generar contenido HTML
            const htmlContent = this.replaceTemplateVariables(emailTemplate, templateVariables);

            // Crear objeto de notificación compatible con EmailService.send()
            const notification = {
                recipient_email: targetUser.email,
                title: 'Notificación de Llamada - Movilidad Mundial',
                content: `Se ha registrado una nueva llamada para la orden #${order.numero}. Estado: ${callLog.status?.name || 'Desconocido'}`,
                priority: 'normal',
                metadata: {
                    channel_data: {
                        email: {
                            subject: `Notificación de Llamada - Orden #${order.numero} - Movilidad Mundial`,
                            html: htmlContent
                        }
                    }
                }
            };

            await EmailService.send(notification, htmlContent);
            console.log(`📧 Email de notificación de call log enviado a ${targetUser.email} para orden ${order.numero}`);

        } catch (error) {
            console.error('❌ Error enviando email de notificación de call log:', error);
            // No lanzar el error para no interrumpir el flujo principal
        }
    }

    /**
     * Reemplazar variables en plantilla HTML
     */
    replaceTemplateVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value || '');
        }
        return result;
    }

    /**
     * Enviar email de notificación de agendamiento
     */
    async sendAppointmentNotificationEmail(order, appointment, agent) {
        try {
            // Determinar el usuario destinatario según las reglas de negocio
            let targetUser = null;

            if (order.numero.toString().includes('9991')) {
                // Si la orden inicia con 9991, buscar por user_id
                targetUser = await User.findByPk(order.user_id);
                console.log(`📧 Orden ${order.numero} inicia con 9991, enviando email de agendamiento a user_id: ${order.user_id}`);
            } else if (order.clave_intermediario) {
                // Si no inicia con 9991 pero tiene clave_intermediario, buscar por clave_intermediario
                targetUser = await User.findOne({
                    where: {
                        intermediary_key: order.clave_intermediario,
                        is_active: true
                    }
                });
                console.log(`📧 Orden ${order.numero} con clave_intermediario: ${order.clave_intermediario}, enviando email de agendamiento a usuario comercial`);
            }

            if (!targetUser) {
                console.log(`⚠️ No se encontró usuario destinatario para la orden ${order.numero}`);
                return;
            }

            // Verificar si el usuario tiene habilitadas las notificaciones por email
            if (!targetUser.notification_channel_email_enabled) {
                console.log(`⚠️ Usuario ${targetUser.email} tiene deshabilitadas las notificaciones por email`);
                return;
            }

            // Configurar EmailService si no está configurado
            if (!EmailService.transporter) {
                console.log('📧 Configurando EmailService desde variables de entorno...');
                EmailService.configureFromEnv();
            }

            // Leer la plantilla HTML
            const templatePath = path.join(__dirname, '../mailTemplates/appointmentNotification.html');
            let emailTemplate;

            try {
                emailTemplate = fs.readFileSync(templatePath, 'utf8');
            } catch (templateError) {
                console.error('❌ Error leyendo plantilla de email de agendamiento:', templateError.message);
                throw new Error('No se pudo cargar la plantilla de email de agendamiento');
            }

            // Formatear fecha y hora
            const appointmentDate = new Date(appointment.scheduled_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            const appointmentTime = appointment.scheduled_time;

            // Variables para la plantilla
            const templateVariables = {
                user_name: targetUser.name,
                order_number: order.numero,
                client_name: order.nombre_cliente,
                client_phone: order.celular_cliente,
                vehicle_plate: order.placa,
                vehicle_brand: order.marca,
                vehicle_model: order.modelo,
                inspection_modality: appointment.inspectionModality?.name || 'Modalidad no especificada',
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                appointment_status: appointment.status || 'pending',
                has_sede: appointment.sede && appointment.sede.name,
                sede_name: appointment.sede?.name || '',
                sede_address: appointment.sede?.address || '',
                sede_phone: appointment.sede?.phone || '',
                has_address: appointment.direccion_inspeccion && appointment.direccion_inspeccion.trim().length > 0,
                inspection_address: appointment.direccion_inspeccion || '',
                agent_name: agent.name,
                call_datetime: appointment.callLog ? new Date(appointment.callLog.call_time).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'No disponible',
                call_status: appointment.callLog?.status?.name || 'No disponible',
                has_appointment_comments: appointment.observaciones && appointment.observaciones.trim().length > 0,
                appointment_comments: appointment.observaciones || '',
                has_call_comments: appointment.callLog?.comments && appointment.callLog.comments.trim().length > 0,
                call_comments: appointment.callLog?.comments || '',
                current_year: new Date().getFullYear()
            };

            // Generar contenido HTML
            const htmlContent = this.replaceTemplateVariables(emailTemplate, templateVariables);

            // Crear objeto de notificación compatible con EmailService.send()
            const notification = {
                recipient_email: targetUser.email,
                title: 'Agendamiento de Inspección - Movilidad Mundial',
                content: `Se ha agendado exitosamente una inspección para la orden #${order.numero}. Fecha: ${appointmentDate} a las ${appointmentTime}`,
                priority: 'normal',
                metadata: {
                    channel_data: {
                        email: {
                            subject: `Agendamiento de Inspección - Orden #${order.numero} - Movilidad Mundial`,
                            html: htmlContent
                        }
                    }
                }
            };

            await EmailService.send(notification, htmlContent);
            console.log(`📧 Email de notificación de agendamiento enviado a ${targetUser.email} para orden ${order.numero}`);

        } catch (error) {
            console.error('❌ Error enviando email de notificación de agendamiento:', error);
            // No lanzar el error para no interrumpir el flujo principal
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

            // Verificar que la orden existe
            // Permitir gestión de órdenes no asignadas (para autogestiones sin actividad)
            const order = await InspectionOrder.findOne({
                where: {
                    id: inspection_order_id
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            // Si la orden no está asignada, asignarla al agente actual
            if (!order.assigned_agent_id) {
                await order.update({
                    assigned_agent_id: req.user.id
                });
                console.log(`✅ Orden ${order.numero} asignada automáticamente al agente ${req.user.name}`);
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

            // Enviar email de notificación solo si no se va a crear un appointment
            const skipEmail = req.body.skip_email_for_appointment === true;
            try {
                await this.sendCallLogNotificationEmail(order, fullCallLog, req.user, skipEmail);
            } catch (emailError) {
                console.error('❌ Error enviando email de notificación:', emailError);
                // No interrumpir el flujo principal si falla el email
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
            const {
                inspection_order_id,
                direccion_inspeccion,
                observaciones
            } = req.body;

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

            // Verificar si existen appointments activos para esta orden
            const existingAppointments = await Appointment.findAll({
                where: {
                    inspection_order_id: inspection_order_id,
                    deleted_at: null // Solo appointments activos
                }
            });

            // Si existen appointments activos, marcarlos como eliminados (soft delete)
            if (existingAppointments.length > 0) {
                try {
                    // Usar soft delete con la columna deleted_at
                    await Appointment.update(
                        {
                            deleted_at: new Date(),
                            updated_at: new Date()
                        },
                        {
                            where: {
                                inspection_order_id: inspection_order_id,
                                deleted_at: null // Solo los que no están eliminados
                            }
                        }
                    );

                    console.log(`📝 Se marcaron ${existingAppointments.length} appointments anteriores como eliminados para la orden ${inspection_order_id}`);
                } catch (updateError) {
                    console.warn('No se pudieron marcar appointments anteriores como eliminados:', updateError.message);
                    // Continuar con la creación del nuevo appointment
                }
            }

            // Generar session_id único si no se proporciona
            const appointmentData = {
                ...req.body,
                session_id: req.body.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            // Crear el nuevo agendamiento
            const appointment = await Appointment.create(appointmentData);

            // Actualizar la orden con el estado
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

            if (fullAppointment.inspectionModality.name === 'A Domicilio') {
                // Send simple email to list: simon.bolivar@holdingvml.net, betum98@gmail.com
                // usar nodemailer
                const to = ['simon.bolivar@holdingvml.net', 'miguel.pineda@holdingvml.net', 'analista.operativo1@holdingvml.net', 'coordinacion.nacional@holdingvml.net', 'radicados.operativos@holdingvml.net'];
                const subject = 'Orden de inspeccion a domicilio agendada';
                // enviar, fecha y hora, direccion de inspeccion, nombre del cliente, email del cliente, telefono del cliente y placa
                const html = `
                    <p>Hola,</p>
                    <p>Se genereo una nueva orden de inspeccion a domicilio.</p>
                    <p>Detalles de la orden:</p>
                    <p>ID de la orden: ${fullAppointment.id}</p>
                    <p>Fecha: ${fullAppointment.scheduled_date}</p>
                    <p>Hora: ${fullAppointment.scheduled_time}</p>
                    <p>Direccion de inspeccion: ${fullAppointment.direccion_inspeccion}</p>
                    <p>Nombre del cliente: ${fullAppointment.inspectionOrder.nombre_cliente}</p>
                    <p>Email del cliente: ${fullAppointment.inspectionOrder.correo_contacto}</p>
                    <p>Telefono del cliente: ${fullAppointment.inspectionOrder.celular_contacto}</p>
                    <p>Placa: ${fullAppointment.inspectionOrder.placa}</p>
                `;
                const text = `
                    Hola,
                    Se genereo una nueva orden de inspeccion a domicilio.
                    Detalles de la orden:
                    ID de la orden: ${fullAppointment.id}
                    Fecha: ${fullAppointment.scheduled_date}
                    Hora: ${fullAppointment.scheduled_time}
                    Direccion de inspeccion: ${fullAppointment.direccion_inspeccion}
                    Nombre del cliente: ${fullAppointment.inspectionOrder.nombre_cliente}
                    Email del cliente: ${fullAppointment.inspectionOrder.correo_contacto}
                    Telefono del cliente: ${fullAppointment.inspectionOrder.celular_contacto}
                    Placa: ${fullAppointment.inspectionOrder.placa}
                `;

                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                })

                const mailOptions = {
                    from: process.env.EMAIL_FROM,
                    to: to,
                    subject: subject,
                    html: html,
                    text: text
                };

                const result = await transporter.sendMail(mailOptions);
                console.log(`Email enviado: ${result.messageId}`);

            }

            // Enviar email de notificación de agendamiento
            try {
                await this.sendAppointmentNotificationEmail(order, fullAppointment, req.user);
                console.log(`📧 Email de notificación de agendamiento enviado para orden ${order.numero}`);
            } catch (emailError) {
                console.error('❌ Error enviando email de notificación de agendamiento:', emailError);
                // No interrumpir el flujo principal si falla el email
            }

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
                    call_log_id: appointmentData.call_log_id,
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

            // Preparar mensaje de respuesta
            let responseMessage = 'Agendamiento creado exitosamente';
            if (existingAppointments.length > 0) {
                responseMessage = `Agendamiento creado exitosamente. Se inhabilitó ${existingAppointments.length} agendamiento(s) anterior(es) para esta orden.`;
            }

            res.status(201).json({
                success: true,
                message: responseMessage,
                data: fullAppointment,
                replaced_appointments: existingAppointments.length
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

    // Obtener appointments activos de una orden específica
    async getActiveAppointments(req, res) {
        try {
            const { orderId } = req.params;

            // Verificar que la orden existe y está asignada al agente
            const order = await InspectionOrder.findOne({
                where: {
                    id: orderId,
                    assigned_agent_id: req.user.id
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada o no asignada a este agente'
                });
            }

            // Buscar appointments activos (no eliminados)
            const activeAppointments = await Appointment.findAll({
                where: {
                    inspection_order_id: orderId,
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
                order: [['created_at', 'DESC']]
            });

            res.json({
                success: true,
                data: activeAppointments,
                count: activeAppointments.length
            });

        } catch (error) {
            console.error('Error obteniendo appointments activos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
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