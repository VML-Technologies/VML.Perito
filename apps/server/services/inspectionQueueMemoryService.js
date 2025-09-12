import { InspectionQueue, InspectionOrder, User } from '../models/index.js';
import { Op } from 'sequelize';

class InspectionQueueMemoryService {
    constructor() {
        this.queueData = new Map(); // hash_acceso -> queueEntry
        this.queueByOrderId = new Map(); // inspection_order_id -> queueEntry
        this.activeConnections = new Map(); // hash_acceso -> Set of socketIds
        this.stats = {
            en_cola: 0,
            en_proceso: 0,
            completadas: 0,
            total: 0
        };
        this.isInitialized = false;
    }

    /**
     * Inicializar el servicio cargando datos desde la base de datos
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ InspectionQueueMemoryService ya inicializado');
            return;
        }

        try {
            console.log('🔄 Inicializando InspectionQueueMemoryService...');
            
            // Cargar todas las entradas activas de la cola
            const activeEntries = await InspectionQueue.findAll({
                where: {
                    is_active: true,
                    estado: { [Op.in]: ['en_cola', 'en_proceso'] }
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

            // Cargar en memoria
            this.queueData.clear();
            this.queueByOrderId.clear();
            
            activeEntries.forEach(entry => {
                const entryData = entry.toJSON();
                this.queueData.set(entry.hash_acceso, entryData);
                this.queueByOrderId.set(entry.inspection_order_id, entryData);
            });

            // Calcular estadísticas
            this.updateStats();

            this.isInitialized = true;
            console.log(`✅ InspectionQueueMemoryService inicializado con ${activeEntries.length} entradas activas`);
            
        } catch (error) {
            console.error('❌ Error inicializando InspectionQueueMemoryService:', error);
            throw error;
        }
    }

    /**
     * Agregar entrada a la cola en memoria y base de datos
     */
    async addToQueue(inspectionOrderId, hashAcceso, inspectionOrder) {
        try {
            // Verificar si ya existe
            const existingEntry = this.queueByOrderId.get(inspectionOrderId);
            if (existingEntry) {
                const tiempoTranscurrido = Date.now() - new Date(existingEntry.tiempo_ingreso).getTime();
                const tiempoMinutos = Math.floor(tiempoTranscurrido / (1000 * 60));
                
                if (tiempoMinutos <= 5) {
                    return {
                        success: true,
                        data: existingEntry,
                        tiempo_en_cola: tiempoMinutos,
                        message: 'La orden ya está en la cola. Usando entrada existente.'
                    };
                } else {
                    // Remover entrada antigua
                    await this.removeFromQueue(existingEntry.id);
                }
            }

            // Crear nueva entrada en base de datos
            const queueEntry = await InspectionQueue.create({
                inspection_order_id: inspectionOrderId,
                placa: inspectionOrder.placa,
                numero_orden: inspectionOrder.numero,
                nombre_cliente: inspectionOrder.nombre_contacto,
                hash_acceso: hashAcceso,
                estado: 'en_cola',
                tiempo_ingreso: new Date()
            });

            // Cargar con relaciones
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

            const entryData = fullEntry.toJSON();

            // Agregar a memoria
            this.queueData.set(hashAcceso, entryData);
            this.queueByOrderId.set(inspectionOrderId, entryData);
            this.updateStats();

            return {
                success: true,
                data: entryData,
                message: 'Entrada agregada a la cola exitosamente'
            };

        } catch (error) {
            console.error('Error adding to queue:', error);
            throw error;
        }
    }

    /**
     * Obtener estado de la cola por hash
     */
    getQueueStatusByHash(hash) {
        const entry = this.queueData.get(hash);
        if (!entry) {
            return null;
        }

        // Calcular posición en la cola
        const position = this.getPositionInQueue(entry);
        
        return {
            ...entry,
            position
        };
    }

    /**
     * Obtener estado de la cola por orderId
     */
    getQueueStatusByOrderId(orderId) {
        const entry = this.queueByOrderId.get(orderId);
        if (!entry) {
            return null;
        }

        const position = this.getPositionInQueue(entry);
        
        return {
            ...entry,
            position
        };
    }

    /**
     * Calcular posición en la cola
     */
    getPositionInQueue(entry) {
        let position = 1;
        const entryTime = new Date(entry.tiempo_ingreso).getTime();
        
        for (const [hash, queueEntry] of this.queueData) {
            if (queueEntry.estado === 'en_cola' && 
                new Date(queueEntry.tiempo_ingreso).getTime() < entryTime) {
                position++;
            }
        }
        
        return position;
    }

    /**
     * Actualizar estado de entrada en cola
     */
    async updateQueueStatus(id, newStatus, inspectorId = null, observaciones = null) {
        try {
            // Buscar en memoria
            let entry = null;
            for (const [hash, queueEntry] of this.queueData) {
                if (queueEntry.id === id) {
                    entry = queueEntry;
                    break;
                }
            }

            if (!entry) {
                throw new Error('Entrada en cola no encontrada');
            }

            // Actualizar en base de datos
            const updateData = { estado: newStatus };
            
            if (newStatus === 'en_proceso' && !entry.tiempo_inicio) {
                updateData.tiempo_inicio = new Date();
            } else if (newStatus === 'completada' && !entry.tiempo_fin) {
                updateData.tiempo_fin = new Date();
            }

            if (inspectorId !== undefined) {
                updateData.inspector_asignado_id = inspectorId;
            }

            if (observaciones !== undefined) {
                updateData.observaciones = observaciones;
            }

            await InspectionQueue.update(updateData, { where: { id } });

            // Actualizar en memoria
            const updatedEntry = await InspectionQueue.findByPk(id, {
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

            const entryData = updatedEntry.toJSON();

            // Actualizar referencias en memoria
            this.queueData.set(entry.hash_acceso, entryData);
            this.queueByOrderId.set(entry.inspection_order_id, entryData);

            // Si se completó, remover de memoria activa
            if (newStatus === 'completada') {
                this.queueData.delete(entry.hash_acceso);
                this.queueByOrderId.delete(entry.inspection_order_id);
            }

            this.updateStats();

            return {
                success: true,
                data: entryData,
                message: 'Estado actualizado exitosamente'
            };

        } catch (error) {
            console.error('Error updating queue status:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las entradas de la cola con filtros
     */
    getQueueEntries(filters = {}) {
        const { estado = 'en_cola', page = 1, limit = 10 } = filters;
        
        let entries = Array.from(this.queueData.values());
        
        // Filtrar por estado
        if (estado) {
            entries = entries.filter(entry => entry.estado === estado);
        }

        // Ordenar por prioridad y tiempo de ingreso
        entries.sort((a, b) => {
            if (a.prioridad !== b.prioridad) {
                return (b.prioridad || 0) - (a.prioridad || 0);
            }
            return new Date(a.tiempo_ingreso) - new Date(b.tiempo_ingreso);
        });

        // Paginación
        const offset = (page - 1) * limit;
        const paginatedEntries = entries.slice(offset, offset + limit);
        
        return {
            data: paginatedEntries,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(entries.length / limit),
                total_items: entries.length,
                items_per_page: parseInt(limit)
            }
        };
    }

    /**
     * Obtener estadísticas de la cola
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        let enCola = 0;
        let enProceso = 0;
        let completadas = 0;

        for (const entry of this.queueData.values()) {
            switch (entry.estado) {
                case 'en_cola':
                    enCola++;
                    break;
                case 'en_proceso':
                    enProceso++;
                    break;
                case 'completada':
                    completadas++;
                    break;
            }
        }

        this.stats = {
            en_cola: enCola,
            en_proceso: enProceso,
            completadas: completadas,
            total: enCola + enProceso + completadas
        };
    }

    /**
     * Remover entrada de la cola
     */
    async removeFromQueue(id) {
        try {
            // Buscar en memoria
            let entry = null;
            for (const [hash, queueEntry] of this.queueData) {
                if (queueEntry.id === id) {
                    entry = queueEntry;
                    break;
                }
            }

            if (entry) {
                // Soft delete en base de datos
                await InspectionQueue.update(
                    { is_active: false },
                    { where: { id } }
                );

                // Remover de memoria
                this.queueData.delete(entry.hash_acceso);
                this.queueByOrderId.delete(entry.inspection_order_id);
                this.updateStats();
            }

        } catch (error) {
            console.error('Error removing from queue:', error);
            throw error;
        }
    }

    /**
     * Registrar conexión activa para un hash
     */
    registerConnection(hash, socketId) {
        if (!this.activeConnections.has(hash)) {
            this.activeConnections.set(hash, new Set());
        }
        this.activeConnections.get(hash).add(socketId);
    }

    /**
     * Remover conexión activa
     */
    removeConnection(hash, socketId) {
        const connections = this.activeConnections.get(hash);
        if (connections) {
            connections.delete(socketId);
            if (connections.size === 0) {
                this.activeConnections.delete(hash);
            }
        }
    }

    /**
     * Obtener conexiones activas para un hash
     */
    getActiveConnections(hash) {
        return this.activeConnections.get(hash) || new Set();
    }

    /**
     * Limpiar conexiones inactivas
     */
    cleanupInactiveConnections() {
        const now = Date.now();
        const inactiveThreshold = 5 * 60 * 1000; // 5 minutos

        for (const [hash, connections] of this.activeConnections) {
            // Si no hay conexiones activas y la entrada es antigua, limpiar
            if (connections.size === 0) {
                const entry = this.queueData.get(hash);
                if (entry && (now - new Date(entry.tiempo_ingreso).getTime()) > inactiveThreshold) {
                    this.activeConnections.delete(hash);
                }
            }
        }
    }

    /**
     * Obtener información de debug
     */
    getDebugInfo() {
        return {
            totalEntries: this.queueData.size,
            activeConnections: this.activeConnections.size,
            stats: this.stats,
            isInitialized: this.isInitialized
        };
    }
}

// Singleton instance
const inspectionQueueMemoryService = new InspectionQueueMemoryService();

export default inspectionQueueMemoryService;
