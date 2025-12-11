import { BaseController } from './baseController.js';
import { InspectionQueue, InspectionOrder, User, Role, Appointment } from '../models/index.js';
import { Op } from 'sequelize';
import inspectionQueueMemoryService from '../services/inspectionQueueMemoryService.js';
import socketManager from '../websocket/socketManager.js';

class InspectionQueueController extends BaseController {
    constructor() {
        super();
        // Hacer bind de los métodos para que this funcione correctamente
        this.getQueue = this.getQueue.bind(this);
        this.addToQueue = this.addToQueue.bind(this);
        this.addToQueuePublic = this.addToQueuePublic.bind(this);
        this.getQueueStatusPublic = this.getQueueStatusPublic.bind(this);
        this.updateQueueStatus = this.updateQueueStatus.bind(this);
        this.getQueueStats = this.getQueueStats.bind(this);
        this.getAvailableInspectors = this.getAvailableInspectors.bind(this);
        this.getQueueStatusByHashPublic = this.getQueueStatusByHashPublic.bind(this);
        this.checkBusinessHours = this.checkBusinessHours.bind(this);
        this.success = this.success.bind(this);
        this.error = this.error.bind(this);
    }

    /**
     * Verificar si el servicio está dentro del horario de atención
     * @returns {Object} { isOpen: boolean, message: string }
     */
    checkBusinessHours() {
        try {
            // Obtener hora actual en zona horaria de Bogotá
            const now = new Date();
            const bogotaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

            const dayOfWeek = bogotaTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
            const hour = bogotaTime.getHours();
            const minute = bogotaTime.getMinutes();
            const currentTime = hour * 60 + minute; // Convertir a minutos

            // Verificar si es domingo
            if (dayOfWeek === 0) {
                return {
                    isOpen: false,
                    message: 'El servicio no está disponible los domingos'
                };
            }

            // Lunes a viernes: 8:00 AM - 5:00 PM (17:00)
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                const startTime = 8 * 60;  // 8:00 AM = 480 minutos
                const endTime = 23 * 60;    // 5:00 PM = 1020 minutos

                if (currentTime < startTime) {
                    return {
                        isOpen: false,
                        message: 'El servicio abre a las 8:00 AM'
                    };
                }

                if (currentTime > endTime) {
                    return {
                        isOpen: false,
                        message: 'El servicio cierra a las 5:00 PM'
                    };
                }

                return { isOpen: true, message: 'Servicio disponible' };
            }

            // Sábados: 8:00 AM - 12:00 PM
            if (dayOfWeek === 6) {
                const startTime = 8 * 60;  // 8:00 AM = 480 minutos
                const endTime = 12 * 60;   // 12:00 PM = 720 minutos

                if (currentTime < startTime) {
                    return {
                        isOpen: false,
                        message: 'El servicio abre a las 8:00 AM'
                    };
                }

                if (currentTime > endTime) {
                    return {
                        isOpen: false,
                        message: 'El servicio cierra a las 12:00 PM los sábados'
                    };
                }

                return { isOpen: true, message: 'Servicio disponible' };
            }

            return { isOpen: false, message: 'Horario no válido' };

        } catch (error) {
            console.error('Error verificando horario de atención:', error);
            // En caso de error, permitir el acceso (fail-open para evitar interrupciones)
            return { isOpen: true, message: 'Servicio disponible' };
        }
    }

    // Métodos de respuesta estandarizados
    success(res, data, message = 'Operación exitosa', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    error(res, message, error = null, statusCode = 500) {
        console.error('Error en InspectionQueueController:', message, error);
        return res.status(statusCode).json({
            success: false,
            message,
            error: error && typeof error === 'object' && error.message ? error.message : (error || 'Error desconocido'),
            timestamp: new Date().toISOString()
        });
    }

    // Obtener todas las entradas en cola
    async getQueue(req, res) {
        try {
            let { page = 1, limit = 10, estado = 'en_cola' } = req.query;
            limit = 100000

            console.log('🔍 Obteniendo datos de cola desde memoria con filtros:', { page, limit, estado });

            // Usar el servicio de memoria
            const result = inspectionQueueMemoryService.getQueueEntries({
                estado,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            console.log('📊 Datos obtenidos desde memoria:', {
                totalItems: result.pagination.total_items,
                currentPage: result.pagination.current_page,
                totalPages: result.pagination.total_pages
            });

            return this.success(res, result);

        } catch (error) {
            console.error('Error getting inspection queue:', error);
            return this.error(res, 'Error al obtener la cola de inspecciones', error);
        }
    }

    // Agregar entrada a la cola
    async addToQueue(req, res) {
        try {
            const { inspection_order_id, hash_acceso } = req.body;

            // Verificar que la orden existe
            const inspectionOrder = await InspectionOrder.findByPk(inspection_order_id);
            if (!inspectionOrder) {
                return this.error(res, 'Orden de inspección no encontrada', null, 404);
            }

            // Verificar si ya existe una entrada en la cola para esta orden
            const existingEntry = await InspectionQueue.findOne({
                where: {
                    inspection_order_id,
                    estado: { [Op.in]: ['en_cola', 'en_proceso'] }
                }
            });

            const appointments = await Appointment.findAll({
                where: {
                    inspection_order_id,
                    deleted_at: null,
                    status: {
                        [Op.not]: ['completed', 'failed', 'ineffective_with_retry', 'ineffective_no_retry', 'call_finished', 'revision_supervisor']
                    }
                }
            });

            console.log('🚀 appointments:', appointments);

            if (existingEntry && appointments.length == 0) {

                // Calcular tiempo transcurrido desde el ingreso
                const tiempoTranscurrido = Date.now() - new Date(existingEntry.tiempo_ingreso).getTime();
                const tiempoMinutos = Math.floor(tiempoTranscurrido / (1000 * 60));

                // ✅ CORRECIÓN: Siempre usar entrada existente, mantener posición original
                // Solo actualizar timestamp de actividad
                await existingEntry.update({ updated_at: new Date() });

                return this.success(res, {
                    message: 'La orden ya está en la cola. Manteniendo posición original private?.',
                    data: existingEntry,
                    tiempo_en_cola: tiempoMinutos
                });
            }

            // Crear entrada en la cola
            const queueEntry = await InspectionQueue.create({
                inspection_order_id,
                placa: inspectionOrder.placa,
                numero_orden: inspectionOrder.numero,
                nombre_cliente: inspectionOrder.nombre_contacto,
                hash_acceso,
                estado: 'en_cola',
                tiempo_ingreso: new Date()
            });

            // Emitir evento WebSocket
            req.io.to('coordinador_vml').emit('inspectionAddedToQueue', {
                queueEntry: await InspectionQueue.findByPk(queueEntry.id, {
                    include: [
                        {
                            model: InspectionOrder,
                            as: 'inspectionOrder',
                            attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'telefono_contacto']
                        }
                    ]
                })
            });

            return this.success(res, {
                message: 'Entrada agregada a la cola exitosamente',
                data: queueEntry
            });

        } catch (error) {
            console.error('Error adding to inspection queue:', error);
            return this.error(res, 'Error al agregar a la cola de inspecciones', error);
        }
    }

    // Agregar entrada a la cola (versión pública sin autenticación)
    async addToQueuePublic(req, res) {
        console.log("############################# DEBUG #############################");
        console.log('🚀 addToQueuePublic');
        try {
            const { inspection_order_id, hash_acceso } = req.body;

            // ✅ VALIDAR HORARIO DE ATENCIÓN
            const isWithinBusinessHours = this.checkBusinessHours();
            if (!isWithinBusinessHours.isOpen) {
                return this.error(res, isWithinBusinessHours.message, null, 403);
            }

            // Verificar que la orden existe
            const inspectionOrder = await InspectionOrder.findByPk(inspection_order_id);
            if (!inspectionOrder) {
                return this.error(res, 'Orden de inspección no encontrada', null, 404);
            }

            // --- Notificación a coordinadores (SMS y Email) ---
            try {
                const coordinadores = await User.findAll({
                    include: [{
                        model: Role,
                        as: 'roles',
                        where: { name: 'coordinador_vml' }
                    }],
                    where: { is_active: true },
                    attributes: ['id', 'name', 'email', 'phone']
                });
                console.log('[NOTIF] Coordinadores encontrados:', coordinadores.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone })));
                const emails = coordinadores.map(u => u.email).filter(Boolean);
                const phones = coordinadores.map(u => (u.phone || '').replace(/\s+/g, '').trim());
                console.log('[NOTIF] Emails a notificar:', emails);
                console.log('[NOTIF] Phones procesados:', phones);
                const smsMessage = `El vehículo de placa ${inspectionOrder.placa} está en la cola de espera.`;
                const emailTemplatePath = 'apps/server/mailTemplates/clientEnterToQueue.html';
                const emailSubject = `Vehículo en cola de espera - ${inspectionOrder.placa}`;
                const emailData = {
                    vehicle_plate: inspectionOrder.placa,
                    current_year: new Date().getFullYear()
                };
                // Enviar SMS a cada coordinador usando smsService
                let smsCount = 0;
                if (phones.length > 0) {
                    try {
                        const smsService = await import('../services/channels/smsService.js');
                        for (let i = 0; i < coordinadores.length; i++) {
                            const phone = phones[i];
                            const name = coordinadores[i].name;
                            if (phone) {
                                try {
                                    console.log(`[NOTIF] Enviando SMS a ${name} (${phone})`);
                                    await smsService.default.send({
                                        recipient_phone: phone,
                                        content: smsMessage,
                                        priority: 'normal',
                                        metadata: {
                                            placa: inspectionOrder.placa,
                                            nombre_contacto: inspectionOrder.nombre_contacto
                                        }
                                    });
                                    smsCount++;
                                } catch (err) {
                                    console.error(`[NOTIF] Error enviando SMS a ${name} (${phone}):`, err);
                                }
                            } else {
                                console.warn(`[NOTIF] Phone vacío para coordinador ${name} (ID: ${coordinadores[i].id})`);
                            }
                        }
                        console.log(`[NOTIF] Total SMS enviados: ${smsCount}`);
                    } catch (err) {
                        console.error('Error enviando SMS a coordinadores:', err);
                    }
                } else {
                    console.warn('[NOTIF] No hay teléfonos válidos para enviar SMS a coordinadores.');
                }
                // Enviar email a todos los coordinadores usando emailService
                if (emails.length > 0) {
                    try {
                        const emailService = await import('../services/channels/emailService.js');
                        console.log(`[NOTIF] Enviando email a:`, emails);
                        await emailService.default.send({
                            recipient_email: emails.join(','),
                            title: emailSubject,
                            content: 'El vehículo de placa ' + inspectionOrder.placa + ' está en la cola de espera.',
                            priority: 'normal',
                            metadata: {
                                channel_data: {
                                    email: {
                                        subject: emailSubject,
                                        template: emailTemplatePath,
                                        data: emailData
                                    }
                                },
                                vehicle_plate: inspectionOrder.placa,
                                current_year: new Date().getFullYear()
                            }
                        }, null);
                        console.log('[NOTIF] Email enviado correctamente a coordinadores.');
                    } catch (err) {
                        console.error('Error enviando email a coordinadores:', err);
                    }
                } else {
                    console.warn('[NOTIF] No hay emails válidos para enviar notificación a coordinadores.');
                }
            } catch (err) {
                console.error('Error en notificación a coordinadores:', err);
            }
            // --- Fin notificación ---

            // ✅ CORRECIÓN: Consulta directa a DB en lugar de servicio en memoria
            // Verificar si ya existe una entrada en la cola para esta orden
            const existingEntry = await InspectionQueue.findOne({
                where: {
                    inspection_order_id,
                    estado: { [Op.in]: ['en_cola'] },
                    is_active: true,
                    deleted_at: null
                }
            });
            console.log('🚀 existingEntry:', existingEntry);

            // Verificar si ya existe un appointment activo
            const appointments = await Appointment.findAll({
                where: {
                    inspection_order_id,
                    deleted_at: null,
                    status: {
                        [Op.not]: ['completed', 'failed', 'ineffective_with_retry', 'ineffective_no_retry', 'call_finished', 'revision_supervisor']
                    }
                }
            });
            console.log('🚀 appointments:', appointments);
            console.log('🚀 appointments encontrados:', appointments.length);
            console.log('🚀 existingEntry && appointments.length == 0:', existingEntry && appointments.length == 0);
            if (existingEntry && appointments.length == 0) {
                // Calcular tiempo transcurrido desde el ingreso
                const tiempoTranscurrido = Date.now() - new Date(existingEntry.tiempo_ingreso).getTime();
                const tiempoMinutos = Math.floor(tiempoTranscurrido / (1000 * 60));

                // Actualizar timestamp de actividad
                await existingEntry.update({ updated_at: new Date() });

                // Calcular posición en la cola
                const position = await InspectionQueue.count({
                    where: {
                        estado: 'en_cola',
                        tiempo_ingreso: { [Op.lte]: existingEntry.tiempo_ingreso },
                        is_active: true,
                        deleted_at: null
                    }
                });

                const queueData = {
                    ...existingEntry.toJSON(),
                    position
                };

                return this.success(res, {
                    message: 'La orden ya está en la cola. Manteniendo posición original public.',
                    data: queueData,
                    tiempo_en_cola: tiempoMinutos
                });
            }

            // Si hay appointments activos, no agregar a la cola
            if (appointments.length > 0) {
                return this.error(res, 'Ya existe un agendamiento activo para esta orden', null, 400);
            }

            // Crear nueva entrada en la cola
            const queueEntry = await InspectionQueue.create({
                inspection_order_id,
                placa: inspectionOrder.placa,
                numero_orden: inspectionOrder.numero,
                nombre_cliente: inspectionOrder.nombre_contacto,
                hash_acceso,
                estado: 'en_cola',
                tiempo_ingreso: new Date()
            });

            // Obtener datos completos con relaciones
            const fullEntry = await InspectionQueue.findByPk(queueEntry.id, {
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'celular_contacto']
                    },
                    {
                        model: User,
                        as: 'inspector',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            // Calcular posición en la cola
            const position = await InspectionQueue.count({
                where: {
                    estado: 'en_cola',
                    tiempo_ingreso: { [Op.lte]: queueEntry.tiempo_ingreso },
                    is_active: true,
                    deleted_at: null
                }
            });

            const queueData = {
                ...fullEntry.toJSON(),
                position
            };

            // Emitir evento WebSocket para nueva entrada
            if (req.io) {
                req.io.to('coordinador_vml').emit('inspectionAddedToQueue', {
                    queueEntry: queueData
                });
            }

            // Emitir evento a través del socketManager para coordinadores
            try {
                socketManager.io.to('coordinador_vml').emit('newQueueEntry', {
                    queueEntry: queueData,
                    timestamp: new Date().toISOString()
                });
            } catch (wsError) {
                console.warn('⚠️ Error emitiendo evento a coordinadores:', wsError);
            }

            // Emitir actualización a conexiones públicas
            try {
                socketManager.emitQueueStatusUpdate(hash_acceso, queueData);
            } catch (wsError) {
                console.warn('⚠️ Error emitiendo WebSocket público:', wsError);
            }

            return this.success(res, {
                message: 'Entrada agregada a la cola exitosamente',
                data: queueData
            });

        } catch (error) {
            console.error('Error adding to inspection queue (public):', error);

            // Manejar errores específicos de Sequelize
            if (error.name === 'SequelizeUniqueConstraintError') {
                return this.error(res, 'Ya existe una entrada con este hash de acceso', null, 400);
            }

            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return this.error(res, 'Error de referencia: la orden de inspección no existe', null, 400);
            }

            return this.error(res, 'Error al agregar a la cola de inspecciones', error);
        }
    }

    // Obtener estado de la cola (versión pública sin autenticación)
    async getQueueStatusPublic(req, res) {
        try {
            const { orderId } = req.params;

            const queueEntry = await InspectionQueue.findOne({
                where: {
                    inspection_order_id: orderId
                },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'celular_contacto']
                    },
                    {
                        model: User,
                        as: 'inspector',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!queueEntry) {
                return this.error(res, 'Entrada en cola no encontrada', null, 404);
            }

            // Calcular posición en la cola
            const position = await InspectionQueue.count({
                where: {
                    estado: 'en_cola',
                    tiempo_ingreso: { [Op.lte]: queueEntry.tiempo_ingreso }
                }
            });

            return this.success(res, {
                data: {
                    ...queueEntry.toJSON(),
                    position
                }
            });

        } catch (error) {
            console.error('Error getting queue status (public):', error);
            return this.error(res, 'Error al obtener el estado de la cola', error);
        }
    }

    // Obtener estado de la cola por hash (versión pública sin autenticación)
    async getQueueStatusByHashPublic(req, res) {
        try {
            const { hash } = req.params;

            // ✅ CORRECIÓN: Consulta directa a DB como en coordinatorDataService
            const queueEntry = await InspectionQueue.findOne({
                where: {
                    hash_acceso: hash,
                    is_active: true,
                    deleted_at: null
                },
                include: [
                    {
                        model: InspectionOrder,
                        as: 'inspectionOrder',
                        attributes: ['id', 'numero', 'placa', 'nombre_contacto', 'celular_contacto']

                    },
                    {
                        model: User,
                        as: 'inspector',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            if (!queueEntry) {
                return this.error(res, 'Entrada en cola no encontrada', null, 404);
            }

            // Calcular posición en la cola
            const position = await InspectionQueue.count({
                where: {
                    estado: 'en_cola',
                    tiempo_ingreso: { [Op.lte]: queueEntry.tiempo_ingreso },
                    is_active: true,
                    deleted_at: null
                }
            });

            const queueData = {
                ...queueEntry.toJSON(),
                position
            };

            return this.success(res, {
                data: queueData
            });

        } catch (error) {
            console.error('Error getting queue status by hash (public):', error);
            return this.error(res, 'Error al obtener el estado de la cola', error);
        }
    }

    // Actualizar estado de entrada en cola
    async updateQueueStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado, inspector_asignado_id, observaciones } = req.body;

            // Usar el servicio de memoria
            const result = await inspectionQueueMemoryService.updateQueueStatus(
                id,
                estado,
                inspector_asignado_id,
                observaciones
            );

            // Emitir evento WebSocket
            if (req.io) {
                req.io.to('coordinador_vml').emit('inspectionQueueStatusUpdated', {
                    queueEntry: result.data
                });
            }

            // Emitir evento a través del socketManager para coordinadores
            try {
                socketManager.io.to('coordinador_vml').emit('queueStatusUpdated', {
                    queueEntry: result.data,
                    timestamp: new Date().toISOString()
                });
            } catch (wsError) {
                console.warn('⚠️ Error emitiendo evento a coordinadores:', wsError);
            }

            // Emitir actualización a conexiones públicas si hay hash
            if (result.data && result.data.hash_acceso) {
                try {
                    socketManager.emitQueueStatusUpdate(result.data.hash_acceso, result.data);

                    // Si se asignó un inspector, emitir evento específico
                    if (estado === 'en_proceso' && inspector_asignado_id) {
                        const inspector = await User.findByPk(inspector_asignado_id, {
                            attributes: ['id', 'name', 'email']
                        });

                        if (inspector) {
                            socketManager.emitInspectorAssigned(result.data.hash_acceso, {
                                inspector: inspector,
                                status: 'en_proceso'
                            });
                        }
                    }
                } catch (wsError) {
                    console.warn('⚠️ Error emitiendo WebSocket público:', wsError);
                }
            }

            return this.success(res, {
                message: result.message,
                data: result.data
            });

        } catch (error) {
            console.error('Error updating queue status:', error);
            return this.error(res, 'Error al actualizar el estado de la cola', error);
        }
    }

    // Obtener estadísticas de la cola
    async getQueueStats(req, res) {
        try {
            // Usar el servicio de memoria
            const stats = inspectionQueueMemoryService.getStats();

            return this.success(res, {
                data: stats
            });

        } catch (error) {
            console.error('Error getting queue stats:', error);
            return this.error(res, 'Error al obtener estadísticas de la cola', error);
        }
    }

    // Obtener inspectores disponibles
    async getAvailableInspectors(req, res) {
        try {
            const inspectors = await User.findAll({
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        where: {
                            name: { [Op.in]: ['inspector_vml_virtual', 'inspector_vml_cda', 'inspector_aliado'] }
                        }
                    }
                ],
                where: {
                    is_active: true
                },
                attributes: ['id', 'name', 'email']
            });

            return this.success(res, {
                data: inspectors
            });

        } catch (error) {
            console.error('Error getting available inspectors:', error);
            return this.error(res, 'Error al obtener inspectores disponibles', error);
        }
    }
}

export default new InspectionQueueController();
