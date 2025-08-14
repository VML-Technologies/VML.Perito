import EventService from '../services/eventService.js';
import { Event, EventListener, NotificationType, User } from '../models/index.js';
import EventRegistry from '../services/eventRegistry.js';
import { Op } from 'sequelize';

class EventController {
    constructor() {
        this.eventService = new EventService();
        this.eventRegistry = EventRegistry.getInstance();

        // Bind methods
        this.getAllEvents = this.getAllEvents.bind(this);
        this.getEventById = this.getEventById.bind(this);
        this.createEvent = this.createEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.getEventListeners = this.getEventListeners.bind(this);
        this.createListener = this.createListener.bind(this);
        this.updateListener = this.updateListener.bind(this);
        this.deleteListener = this.deleteListener.bind(this);
        this.getEventStats = this.getEventStats.bind(this);
        this.triggerEvent = this.triggerEvent.bind(this);
        this.getEventsByCategory = this.getEventsByCategory.bind(this);
    }

    /**
     * Obtener todos los eventos
     */
    async getAllEvents(req, res) {
        try {
            const { page = 1, limit = 20, category, search, active } = req.query;
            const offset = (page - 1) * limit;

            // Construir filtros
            const where = {};

            if (category) {
                where.category = category;
            }

            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            if (active !== undefined) {
                where.is_active = active == 'true';
            }

            const events = await Event.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: events.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: events.count,
                    pages: Math.ceil(events.count / limit)
                }
            });

        } catch (error) {
            console.error('❌ Error obteniendo eventos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener evento por ID
     */
    async getEventById(req, res) {
        try {
            const { id } = req.params;

            const event = await Event.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: EventListener,
                        as: 'listeners',
                        include: [
                            {
                                model: NotificationType,
                                as: 'NotificationType',
                                attributes: ['id', 'name', 'description']
                            }
                        ]
                    }
                ]
            });

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            res.json({
                success: true,
                data: event
            });

        } catch (error) {
            console.error('❌ Error obteniendo evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear nuevo evento
     */
    async createEvent(req, res) {
        try {
            const { name, description, category, metadata } = req.body;
            const createdBy = req.user?.id;

            // Validar datos requeridos
            if (!name || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y categoría son requeridos'
                });
            }

            // Verificar si el evento ya existe
            const existingEvent = await Event.findOne({
                where: { name }
            });

            if (existingEvent) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un evento con ese nombre'
                });
            }

            // Crear el evento
            const event = await this.eventService.registerEvent(
                name,
                description,
                category,
                metadata,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: 'Evento creado exitosamente',
                data: event
            });

        } catch (error) {
            console.error('❌ Error creando evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar evento
     */
    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const { name, description, category, metadata, is_active } = req.body;

            const event = await Event.findByPk(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            // Verificar si el nombre ya existe en otro evento
            if (name && name !== event.name) {
                const existingEvent = await Event.findOne({
                    where: {
                        name,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingEvent) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un evento con ese nombre'
                    });
                }
            }

            // Actualizar el evento
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (category !== undefined) updateData.category = category;
            if (metadata !== undefined) updateData.metadata = metadata;
            if (is_active !== undefined) updateData.is_active = is_active;

            await event.update(updateData);

            // Recargar eventos en el servicio
            await this.eventService.loadEventsFromDatabase();

            res.json({
                success: true,
                message: 'Evento actualizado exitosamente',
                data: event
            });

        } catch (error) {
            console.error('❌ Error actualizando evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar evento (soft delete)
     */
    async deleteEvent(req, res) {
        try {
            const { id } = req.params;

            const event = await Event.findByPk(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            // Verificar si tiene listeners activos
            const activeListeners = await EventListener.count({
                where: {
                    event_id: id,
                    is_active: true
                }
            });

            if (activeListeners > 0) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede eliminar el evento porque tiene ${activeListeners} listeners activos`
                });
            }

            await event.destroy();

            // Recargar eventos en el servicio
            await this.eventService.loadEventsFromDatabase();

            res.json({
                success: true,
                message: 'Evento eliminado exitosamente'
            });

        } catch (error) {
            console.error('❌ Error eliminando evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener listeners de un evento
     */
    async getEventListeners(req, res) {
        try {
            const { eventId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const listeners = await EventListener.findAndCountAll({
                where: {
                    event_id: eventId
                },
                include: [
                    {
                        model: NotificationType,
                        as: 'NotificationType',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['priority', 'ASC'], ['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: listeners.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: listeners.count,
                    pages: Math.ceil(listeners.count / limit)
                }
            });

        } catch (error) {
            console.error('❌ Error obteniendo listeners:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear listener para un evento
     */
    async createListener(req, res) {
        try {
            const { eventId } = req.params;
            const {
                notification_type_id,
                conditions,
                priority,
                delay_seconds,
                channels
            } = req.body;
            const createdBy = req.user?.id;

            // Validar datos requeridos
            if (!notification_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del tipo de notificación es requerido'
                });
            }

            // Verificar que el evento existe
            const event = await Event.findByPk(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            // Verificar que el tipo de notificación existe
            const notificationType = await NotificationType.findByPk(notification_type_id);
            if (!notificationType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de notificación no encontrado'
                });
            }

            // Crear el listener
            const listener = await this.eventService.createListener({
                event_id: eventId,
                notification_type_id,
                conditions,
                priority: priority || 1,
                delay_seconds: delay_seconds || 0,
                channels,
                created_by: createdBy,
                is_active: true
            });

            res.status(201).json({
                success: true,
                message: 'Listener creado exitosamente',
                data: listener
            });

        } catch (error) {
            console.error('❌ Error creando listener:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar listener
     */
    async updateListener(req, res) {
        try {
            const { listenerId } = req.params;
            const {
                notification_type_id,
                conditions,
                priority,
                delay_seconds,
                channels,
                is_active
            } = req.body;

            const listener = await EventListener.findByPk(listenerId);
            if (!listener) {
                return res.status(404).json({
                    success: false,
                    message: 'Listener no encontrado'
                });
            }

            // Actualizar el listener
            const updateData = {};
            if (notification_type_id !== undefined) updateData.notification_type_id = notification_type_id;
            if (conditions !== undefined) updateData.conditions = conditions;
            if (priority !== undefined) updateData.priority = priority;
            if (delay_seconds !== undefined) updateData.delay_seconds = delay_seconds;
            if (channels !== undefined) updateData.channels = channels;
            if (is_active !== undefined) updateData.is_active = is_active;

            await listener.update(updateData);

            // Recargar listeners en el servicio
            await this.eventService.loadListenersFromDatabase();

            res.json({
                success: true,
                message: 'Listener actualizado exitosamente',
                data: listener
            });

        } catch (error) {
            console.error('❌ Error actualizando listener:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar listener
     */
    async deleteListener(req, res) {
        try {
            const { listenerId } = req.params;

            const listener = await EventListener.findByPk(listenerId);
            if (!listener) {
                return res.status(404).json({
                    success: false,
                    message: 'Listener no encontrado'
                });
            }

            await listener.destroy();

            // Recargar listeners en el servicio
            await this.eventService.loadListenersFromDatabase();

            res.json({
                success: true,
                message: 'Listener eliminado exitosamente'
            });

        } catch (error) {
            console.error('❌ Error eliminando listener:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de eventos
     */
    async getEventStats(req, res) {
        try {
            const stats = await this.eventRegistry.getEventStats();

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Disparar evento manualmente (para pruebas)
     */
    async triggerEvent(req, res) {
        try {
            const { eventName } = req.params;
            const { data = {}, context = {} } = req.body;

            const result = await this.eventRegistry.triggerEvent(eventName, data, context);

            if (result) {
                res.json({
                    success: true,
                    message: `Evento ${eventName} disparado exitosamente`
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: `Error disparando evento ${eventName}`
                });
            }

        } catch (error) {
            console.error('❌ Error disparando evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener eventos por categoría
     */
    async getEventsByCategory(req, res) {
        try {
            const { category } = req.params;

            const events = await this.eventRegistry.getEventsByCategory(category);

            res.json({
                success: true,
                data: events
            });

        } catch (error) {
            console.error('❌ Error obteniendo eventos por categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default new EventController(); 