import { BaseController } from './baseController.js';
import { InspectionQueue, InspectionOrder, User, Role } from '../models/index.js';
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
        this.success = this.success.bind(this);
        this.error = this.error.bind(this);
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

            if (existingEntry) {
                // Calcular tiempo transcurrido desde el ingreso
                const tiempoTranscurrido = Date.now() - new Date(existingEntry.tiempo_ingreso).getTime();
                const tiempoMinutos = Math.floor(tiempoTranscurrido / (1000 * 60));
                
                if (tiempoMinutos <= 5) {
                    // Si es reciente (≤ 5 minutos), usar la misma entrada
                    return this.success(res, {
                        message: 'La orden ya está en la cola. Usando entrada existente.',
                        data: existingEntry,
                        tiempo_en_cola: tiempoMinutos
                    });
                } else {
                    // Si es más antiguo (> 5 minutos), marcar como vencida y crear nueva
                    await existingEntry.destroy(); // Esto usa paranoid (soft delete)
                }
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
        try {
            const { inspection_order_id, hash_acceso } = req.body;

            // Verificar que la orden existe
            const inspectionOrder = await InspectionOrder.findByPk(inspection_order_id);
            if (!inspectionOrder) {
                return this.error(res, 'Orden de inspección no encontrada', null, 404);
            }

            // Usar el servicio de memoria
            const result = await inspectionQueueMemoryService.addToQueue(
                inspection_order_id, 
                hash_acceso, 
                inspectionOrder
            );

            // Emitir evento WebSocket para nueva entrada
            if (req.io) {
                req.io.to('coordinador_vml').emit('inspectionAddedToQueue', {
                    queueEntry: result.data
                });
            }

            // Emitir evento a través del socketManager para coordinadores
            try {
                socketManager.io.to('coordinador_vml').emit('newQueueEntry', {
                    queueEntry: result.data,
                    timestamp: new Date().toISOString()
                });
            } catch (wsError) {
                console.warn('⚠️ Error emitiendo evento a coordinadores:', wsError);
            }

            // Emitir actualización a conexiones públicas
            try {
                socketManager.emitQueueStatusUpdate(hash_acceso, {
                    ...result.data,
                    position: result.position || 1
                });
            } catch (wsError) {
                console.warn('⚠️ Error emitiendo WebSocket público:', wsError);
            }

            return this.success(res, {
                message: result.message,
                data: result.data,
                ...(result.tiempo_en_cola && { tiempo_en_cola: result.tiempo_en_cola })
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

            // Usar el servicio de memoria
            const queueStatus = inspectionQueueMemoryService.getQueueStatusByHash(hash);

            if (!queueStatus) {
                return this.error(res, 'Entrada en cola no encontrada', null, 404);
            }

            return this.success(res, {
                data: queueStatus
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
