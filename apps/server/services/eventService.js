import Event from '../models/event.js';
import EventListener from '../models/eventListener.js';
import NotificationType from '../models/notificationType.js';
import notificationService from './notificationService.js';
import { Op } from 'sequelize';

/**
 * Servicio principal para el manejo de eventos del sistema
 * Gestiona el registro, disparo y procesamiento de eventos
 */
class EventService {
    constructor() {
        this.registry = new Map();
        this.listeners = new Map();
        this.notificationService = notificationService;
        this.isInitialized = false;
        // NO inicializar automáticamente - se hará manualmente después de crear las tablas
    }

    /**
     * Inicializar el servicio de eventos
     */
    async initialize() {
        try {
            console.log('🎯 Inicializando EventService...');

            // Cargar eventos y listeners desde la base de datos
            await this.loadEventsFromDatabase();
            await this.loadListenersFromDatabase();

            this.isInitialized = true;
            console.log('✅ EventService inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando EventService:', error);
            throw error;
        }
    }

    /**
     * Cargar eventos desde la base de datos
     */
    async loadEventsFromDatabase() {
        try {
            const events = await Event.findAll({
                where: {
                    is_active: true
                }
            });

            this.registry.clear();
            events.forEach(event => {
                this.registry.set(event.name, event);
            });

            console.log(`📋 Cargados ${events.length} eventos desde la base de datos`);
        } catch (error) {
            console.error('❌ Error cargando eventos desde BD:', error);
        }
    }

    /**
     * Cargar listeners desde la base de datos
     */
    async loadListenersFromDatabase() {
        try {
            const listeners = await EventListener.findAll({
                where: {
                    is_active: true
                },
                include: [
                    {
                        model: Event,
                        as: 'Event',
                        where: { is_active: true }
                    },
                    {
                        model: NotificationType,
                        as: 'NotificationType'
                    }
                ]
            });

            this.listeners.clear();
            listeners.forEach(listener => {
                const eventName = listener.Event.name;
                if (!this.listeners.has(eventName)) {
                    this.listeners.set(eventName, []);
                }
                this.listeners.get(eventName).push(listener);
            });

            console.log(`📋 Cargados ${listeners.length} listeners desde la base de datos`);
        } catch (error) {
            console.error('❌ Error cargando listeners desde BD:', error);
        }
    }

    /**
     * Registrar un evento programáticamente
     * @param {string} name - Nombre del evento
     * @param {string} description - Descripción del evento
     * @param {string} category - Categoría del evento
     * @param {Object} metadata - Metadatos adicionales
     * @param {number} createdBy - ID del usuario que crea el evento
     * @returns {Promise<Event>}
     */
    async registerEvent(name, description, category, metadata = {}, createdBy = null) {
        try {
            // Verificar si el evento ya existe
            let event = await Event.findOne({
                where: { name }
            });

            if (event) {
                // Actualizar si es necesario
                if (event.description !== description ||
                    event.category !== category ||
                    JSON.stringify(event.metadata) !== JSON.stringify(metadata)) {

                    event.description = description;
                    event.category = category;
                    event.metadata = { ...event.metadata, ...metadata };
                    event.version += 1;
                    await event.save();

                    // Actualizar en memoria
                    this.registry.set(name, event);

                    console.log(`🔄 Evento actualizado: ${name}`);
                }
                return event;
            }

            // Crear nuevo evento
            event = await Event.create({
                name,
                description,
                category,
                metadata,
                created_by: createdBy,
                is_active: true
            });

            // Agregar al registro en memoria
            this.registry.set(name, event);

            console.log(`✅ Nuevo evento registrado: ${name} (${category})`);
            return event;

        } catch (error) {
            console.error(`❌ Error registrando evento ${name}:`, error);
            throw error;
        }
    }

    /**
     * Disparar un evento
     * @param {string} name - Nombre del evento
     * @param {Object} data - Datos del evento
     * @param {Object} context - Contexto adicional
     * @returns {Promise<boolean>}
     */
    async triggerEvent(name, data = {}, context = {}) {
        try {
            if (!this.isInitialized) {
                console.warn(`⚠️ EventService no inicializado, evento ${name} no procesado`);
                return false;
            }

            console.log(`🎯 Disparando evento: ${name}`);

            // Obtener el evento
            const event = this.registry.get(name);
            if (!event) {
                console.warn(`⚠️ Evento no encontrado: ${name}`);
                return false;
            }

            // Actualizar estadísticas del evento
            await this.updateEventStats(event.id);

            // Obtener listeners del evento
            const eventListeners = this.listeners.get(name) || [];
            if (eventListeners.length === 0) {
                console.log(`ℹ️ No hay listeners configurados para el evento: ${name}`);
                return true;
            } else {
                console.log(`ℹ️ ${eventListeners.length} Listeners encontrados para el evento: ${name}`);
            }

            // Procesar listeners en orden de prioridad
            const sortedListeners = eventListeners.sort((a, b) => a.priority - b.priority);

            // Consolidar listeners para evitar duplicación
            const consolidatedListeners = this.consolidateListeners(sortedListeners, data, context);

            for (const listener of consolidatedListeners) {
                try {
                    await this.processListener(listener, data, context);
                } catch (error) {
                    console.error(`❌ Error procesando listener ${listener.id} para evento ${name}:`, error);
                }
            }

            console.log(`✅ Evento ${name} procesado con ${consolidatedListeners.length} listeners consolidados`);
            return true;

        } catch (error) {
            console.error(`❌ Error disparando evento ${name}:`, error);
            return false;
        }
    }

    /**
     * Consolidar listeners para evitar duplicación
     * @param {Array} listeners - Lista de listeners
     * @param {Object} data - Datos del evento
     * @param {Object} context - Contexto adicional
     * @returns {Array} Listeners consolidados
     */
    consolidateListeners(listeners, data, context) {
        const consolidated = [];
        const processedTypes = new Set();

        for (const listener of listeners) {
            // Verificar si ya procesamos este tipo de notificación
            const notificationType = listener.NotificationType.name;

            if (processedTypes.has(notificationType)) {
                continue;
            }

            // Verificar condiciones
            if (!this.evaluateConditions(listener.conditions, data, context)) {
                continue;
            }

            // Agregar a la lista consolidada
            consolidated.push(listener);
            processedTypes.add(notificationType);
        }

        return consolidated;
    }

    /**
     * Procesar un listener específico
     * @param {EventListener} listener - Listener a procesar
     * @param {Object} data - Datos del evento
     * @param {Object} context - Contexto adicional
     */
    async processListener(listener, data, context) {
        try {
            // Verificar condiciones
            if (!(await this.evaluateConditions(listener.conditions, data, context))) {
                return;
            }

            // Aplicar retraso si está configurado
            if (listener.delay_seconds > 0) {
                await new Promise(resolve => setTimeout(resolve, listener.delay_seconds * 1000));
            }

            // Preparar datos para la notificación
            const notificationData = {
                ...data,
                event_name: listener.Event.name,
                event_category: listener.Event.category,
                listener_id: listener.id,
                context
            };

            // Enviar notificación
            await this.notificationService.createNotification(
                listener.NotificationType.name,
                notificationData,
                {
                    channels: listener.channels,
                    priority: listener.priority
                }
            );

            // Actualizar estadísticas del listener
            await this.updateListenerStats(listener.id);

            console.log(`📤 Notificación enviada por listener ${listener.id}`);

        } catch (error) {
            console.error(`❌ Error procesando listener ${listener.id}:`, error);
            throw error;
        }
    }

    /**
     * Evaluar condiciones de un listener
     * @param {Object} conditions - Condiciones a evaluar
     * @param {Object} data - Datos del evento
     * @param {Object} context - Contexto adicional
     * @returns {boolean}
     */
    async evaluateConditions(conditions, data, context) {
        if (!conditions || Object.keys(conditions).length === 0) return true;

        try {
            // Si las condiciones son un string JSON, parsearlo
            let conditionsObj = conditions;
            if (typeof conditions === 'string') {
                conditionsObj = JSON.parse(conditions);
            }



            // Evaluar cada condición usando lógica simple y flexible
            for (const [key, expectedValue] of Object.entries(conditionsObj)) {
                const actualValue = await this.getConditionValue(key, data, context);
                const result = this.compareValues(actualValue, expectedValue);

                if (!result) {
                    console.log(`⏭️ Condición no cumplida: ${key} (esperado: ${expectedValue}, actual: ${actualValue})`);
                    return false;
                }
            }

            console.log(`✅ Todas las condiciones cumplidas`);
            return true;
        } catch (error) {
            console.error('❌ Error evaluando condiciones:', error);
            return false;
        }
    }

    /**
     * Obtener el valor actual de una condición desde los datos
     * @param {string} key - Clave de la condición
     * @param {Object} data - Datos del evento
     * @param {Object} context - Contexto adicional
     * @returns {any}
     */
    async getConditionValue(key, data, context) {
        // Mapeo simple de claves a rutas de datos
        const valueMap = {
            // Usuario
            'user_id': data.user?.id,
            'user_email': data.user?.email,
            'user_role': data.user?.role || data.user?.roles?.[0]?.name || context.user?.role || context.user?.roles?.[0]?.name || (context.created_by ? await this.getUserRole(context.created_by) : null),
            'user_roles': data.user?.roles?.map(r => r.name) || context.user?.roles?.map(r => r.name) || (context.created_by ? await this.getUserRoles(context.created_by) : []),

            // Orden de inspección
            'order_id': data.inspection_order?.id,
            'order_status': data.inspection_order?.status,
            'order_vehicle_type': data.inspection_order?.vehicle_type,
            'order_sede_type': data.inspection_order?.sede_type,
            'order_priority': data.inspection_order?.priority,
            'order_has_appointment': !!data.inspection_order?.appointment_id,
            'order_commercial_user_id': data.inspection_order?.commercial_user_id,
            'order_customer_email': data.inspection_order?.correo_cliente,
            'order_customer_name': data.inspection_order?.nombre_cliente,

            // Cita
            'appointment_id': data.appointment?.id,
            'appointment_date': data.appointment?.scheduled_date,
            'appointment_time': data.appointment?.scheduled_time,
            'appointment_is_today': this.isToday(data.appointment?.scheduled_date),

            // Agente
            'agent_id': data.agent?.id,
            'agent_email': data.agent?.email,
            'agent_role': data.agent?.role || data.agent?.roles?.[0]?.name,

            // Contexto
            'event_name': data.event_name || context.event_name,
            'event_category': data.event_category || context.event_category,

            // Valores booleanos simples
            'is_urgent': data.inspection_order?.priority === 'urgent',
            'is_commercial_creator': data.inspection_order?.commercial_user_id === data.user?.id,
            'is_client': data.inspection_order?.correo_cliente === data.user?.email,
            'not_same_day': !this.isToday(data.appointment?.scheduled_date)
        };

        return valueMap[key] || null;
    }

    /**
     * Comparar valores de manera flexible
     * @param {any} actual - Valor actual
     * @param {any} expected - Valor esperado
     * @returns {boolean}
     */
    compareValues(actual, expected) {
        // Si el valor esperado es null/undefined, siempre es true
        if (expected === null || expected === undefined) return true;

        // Si el valor actual es null/undefined, solo es true si el esperado también lo es
        if (actual === null || actual === undefined) return expected === null || expected === undefined;

        // Comparación de arrays
        if (Array.isArray(expected)) {
            if (Array.isArray(actual)) {
                // Ambos son arrays: verificar si hay intersección
                return actual.some(val => expected.includes(val));
            } else {
                // Actual es valor simple, expected es array: verificar si está incluido
                return expected.includes(actual);
            }
        }

        // Comparación de booleanos
        if (typeof expected === 'boolean') {
            return actual === expected;
        }

        // Comparación de strings (case insensitive)
        if (typeof expected === 'string' && typeof actual === 'string') {
            return actual.toLowerCase() === expected.toLowerCase();
        }

        // Comparación directa
        return actual === expected;
    }

    /**
     * Verificar si una fecha es hoy
     * @param {string|Date} date - Fecha a verificar
     * @returns {boolean}
     */
    isToday(date) {
        if (!date) return false;
        const dateObj = new Date(date);
        const today = new Date();
        return dateObj.toDateString() === today.toDateString();
    }

    /**
     * Obtener rol del usuario por ID
     * @param {number} userId - ID del usuario
     * @returns {Promise<string|null>}
     */
    async getUserRole(userId) {
        try {
            const { User, Role, UserRole } = await import('../models/index.js');
            const userRole = await UserRole.findOne({
                where: { user_id: userId },
                include: [{ model: Role, as: 'role', attributes: ['name'] }]
            });
            return userRole?.role?.name || null;
        } catch (error) {
            console.error('Error obteniendo rol del usuario:', error);
            return null;
        }
    }

    /**
     * Obtener roles del usuario por ID
     * @param {number} userId - ID del usuario
     * @returns {Promise<string[]>}
     */
    async getUserRoles(userId) {
        try {
            const { User, Role, UserRole } = await import('../models/index.js');
            const userRoles = await UserRole.findAll({
                where: { user_id: userId },
                include: [{ model: Role, as: 'role', attributes: ['name'] }]
            });
            return userRoles.map(ur => ur.role.name);
        } catch (error) {
            console.error('Error obteniendo roles del usuario:', error);
            return [];
        }
    }

    /**
     * Actualizar estadísticas del evento
     * @param {number} eventId - ID del evento
     */
    async updateEventStats(eventId) {
        try {
            await Event.increment(['trigger_count'], {
                where: { id: eventId }
            });

            await Event.update(
                { last_triggered: new Date() },
                { where: { id: eventId } }
            );
        } catch (error) {
            console.error(`❌ Error actualizando estadísticas del evento ${eventId}:`, error);
        }
    }

    /**
     * Actualizar estadísticas del listener
     * @param {number} listenerId - ID del listener
     */
    async updateListenerStats(listenerId) {
        try {
            await EventListener.increment(['execution_count'], {
                where: { id: listenerId }
            });

            await EventListener.update(
                { last_executed: new Date() },
                { where: { id: listenerId } }
            );
        } catch (error) {
            console.error(`❌ Error actualizando estadísticas del listener ${listenerId}:`, error);
        }
    }

    /**
     * Crear un listener para un evento
     * @param {Object} listenerData - Datos del listener
     * @returns {Promise<EventListener>}
     */
    async createListener(listenerData) {
        try {
            const listener = await EventListener.create(listenerData);

            // Recargar listeners desde BD
            await this.loadListenersFromDatabase();

            console.log(`✅ Listener creado: ${listener.id}`);
            return listener;
        } catch (error) {
            console.error('❌ Error creando listener:', error);
            throw error;
        }
    }

    /**
     * Buscar un listener existente por criterios específicos
     * @param {Object} criteria - Criterios de búsqueda
     * @returns {Promise<EventListener|null>}
     */
    async findListener(criteria) {
        try {
            const listener = await EventListener.findOne({
                where: criteria,
                include: [
                    {
                        model: Event,
                        as: 'Event'
                    },
                    {
                        model: NotificationType,
                        as: 'NotificationType'
                    }
                ]
            });

            return listener;
        } catch (error) {
            console.error('❌ Error buscando listener:', error);
            return null;
        }
    }

    /**
     * Obtener listeners de un evento
     * @param {string} eventName - Nombre del evento
     * @returns {Array}
     */
    getEventListeners(eventName) {
        return this.listeners.get(eventName) || [];
    }

    /**
     * Obtener todos los eventos registrados
     * @returns {Array}
     */
    getAllEvents() {
        return Array.from(this.registry.values());
    }

    /**
     * Obtener eventos por categoría
     * @param {string} category - Categoría de eventos
     * @returns {Array}
     */
    getEventsByCategory(category) {
        return Array.from(this.registry.values()).filter(event => event.category === category);
    }

    /**
     * Verificar si un evento existe
     * @param {string} name - Nombre del evento
     * @returns {boolean}
     */
    eventExists(name) {
        return this.registry.has(name);
    }

    /**
     * Obtener estadísticas del servicio
     * @returns {Promise<Object>}
     */
    async getStats() {
        try {
            const totalEvents = this.registry.size;
            const totalListeners = Array.from(this.listeners.values()).reduce((sum, listeners) => sum + listeners.length, 0);

            const eventsByCategory = {};
            this.registry.forEach(event => {
                if (!eventsByCategory[event.category]) {
                    eventsByCategory[event.category] = 0;
                }
                eventsByCategory[event.category]++;
            });

            return {
                totalEvents,
                totalListeners,
                eventsByCategory,
                isInitialized: this.isInitialized
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas del EventService:', error);
            return {
                totalEvents: 0,
                totalListeners: 0,
                eventsByCategory: {},
                isInitialized: this.isInitialized
            };
        }
    }
}

export default EventService; 