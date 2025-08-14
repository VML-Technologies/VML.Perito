import Event from '../models/event.js';
import EventListener from '../models/eventListener.js';
import { Op } from 'sequelize';

/**
 * Registro de eventos singleton para registrar eventos programáticamente
 * desde cualquier parte del código de la aplicación
 */
class EventRegistry {
    static instance = null;
    static isInitialized = false;

    constructor() {
        if (EventRegistry.instance) {
            return EventRegistry.instance;
        }

        this.events = new Map();
        this.listeners = new Map();
        this.eventService = null;
        EventRegistry.instance = this;
    }

    static getInstance() {
        if (!EventRegistry.instance) {
            EventRegistry.instance = new EventRegistry();
        }
        return EventRegistry.instance;
    }

    /**
     * Inicializar el registro con el servicio de eventos
     * @param {EventService} eventService - Instancia del servicio de eventos
     */
    initialize(eventService) {
        this.eventService = eventService;
        EventRegistry.isInitialized = true;
        console.log('🎯 EventRegistry inicializado');
    }

    /**
     * Registrar un evento del sistema (automático)
     * @param {string} name - Nombre del evento
     * @param {string} description - Descripción del evento
     * @param {string} category - Categoría del evento
     * @param {Object} metadata - Metadatos adicionales
     * @returns {Promise<Event>}
     */
    async registerSystemEvent(name, description, category, metadata = {}) {
        try {
            const event = await this.registerEvent(name, description, category, metadata, 'system');
            console.log(`🎯 Evento del sistema registrado: ${name}`);
            return event;
        } catch (error) {
            console.error(`❌ Error registrando evento del sistema ${name}:`, error.message);
            throw error;
        }
    }

    /**
     * Registrar un evento de negocio (manual)
     * @param {string} name - Nombre del evento
     * @param {string} description - Descripción del evento
     * @param {string} category - Categoría del evento
     * @param {Object} metadata - Metadatos adicionales
     * @param {number} createdBy - ID del usuario que crea el evento
     * @returns {Promise<Event>}
     */
    async registerBusinessEvent(name, description, category, metadata = {}, createdBy = null) {
        try {
            const event = await this.registerEvent(name, description, category, metadata, 'business', createdBy);
            console.log(`🎯 Evento de negocio registrado: ${name}`);
            return event;
        } catch (error) {
            console.error(`❌ Error registrando evento de negocio ${name}:`, error.message);
            throw error;
        }
    }

    /**
     * Registrar un evento en la base de datos
     * @param {string} name - Nombre del evento
     * @param {string} description - Descripción del evento
     * @param {string} category - Categoría del evento
     * @param {Object} metadata - Metadatos adicionales
     * @param {string} source - Fuente del evento (system, business)
     * @param {number} createdBy - ID del usuario que crea el evento
     * @returns {Promise<Event>}
     */
    async registerEvent(name, description, category, metadata = {}, source = 'system', createdBy = null) {
        try {
            // Verificar si el evento ya existe
            let event = await Event.findOne({
                where: { name }
            });

            if (event) {
                // SOLUCIÓN PERMANENTE: Merge seguro de metadata
                const updatedMetadata = this.safeMergeMetadata(event.metadata, metadata);

                // Solo actualizar si realmente hay cambios
                if (JSON.stringify(event.metadata) !== JSON.stringify(updatedMetadata)) {
                    event.metadata = updatedMetadata;
                    await event.save();
                    console.log(`🔄 Metadata actualizado para evento: ${name}`);
                }

                return event;
            }

            // Crear nuevo evento
            event = await Event.create({
                name,
                description,
                category,
                metadata,
                source,
                created_by: createdBy,
                is_active: true
            });

            return event;
        } catch (error) {
            console.error(`❌ Error registrando evento ${name}:`, error.message);
            throw error;
        }
    }

    /**
     * Buscar o crear un evento (patrón find or create)
     * @param {string} name - Nombre del evento
     * @param {string} description - Descripción del evento
     * @param {string} category - Categoría del evento
     * @param {Object} metadata - Metadatos adicionales
     * @returns {Promise<{event: Event, created: boolean}>}
     */
    async findOrCreateEvent(name, description, category, metadata = {}) {
        try {
            // Verificar si el evento ya existe
            let event = await Event.findOne({
                where: { name }
            });

            if (event) {
                // SOLUCIÓN PERMANENTE: Merge seguro de metadata
                const updatedMetadata = this.safeMergeMetadata(event.metadata, metadata);

                // Solo actualizar si realmente hay cambios
                if (JSON.stringify(event.metadata) !== JSON.stringify(updatedMetadata)) {
                    event.metadata = updatedMetadata;
                    await event.save();
                    console.log(`🔄 Metadata actualizado para evento: ${name}`);
                }

                return { event, created: false };
            }

            // Crear nuevo evento
            event = await Event.create({
                name,
                description,
                category,
                metadata,
                source: 'system',
                created_by: null,
                is_active: true
            });

            return { event, created: true };
        } catch (error) {
            console.error(`❌ Error en findOrCreateEvent ${name}:`, error.message);
            throw error;
        }
    }

    /**
     * Merge seguro de metadata que evita corrupción
     * @param {Object} existingMetadata - Metadata existente
     * @param {Object} newMetadata - Nuevo metadata a agregar
     * @returns {Object} Metadata fusionado de forma segura
     */
    safeMergeMetadata(existingMetadata, newMetadata) {
        try {
            // Validar que ambos sean objetos válidos
            const existing = this.validateAndParseMetadata(existingMetadata);
            const newMeta = this.validateAndParseMetadata(newMetadata);

            // Realizar merge profundo de forma segura
            const merged = this.deepMerge(existing, newMeta);

            // Validar el resultado final
            if (!this.isValidMetadata(merged)) {
                console.warn(`⚠️ Metadata inválido detectado, usando metadata por defecto`);
                return { auto_registered: true, error: 'metadata_corrupted' };
            }

            return merged;
        } catch (error) {
            console.error(`❌ Error en safeMergeMetadata:`, error.message);
            return { auto_registered: true, error: 'merge_failed' };
        }
    }

    /**
     * Validar y parsear metadata de forma segura
     * @param {any} metadata - Metadata a validar
     * @returns {Object} Metadata validado
     */
    validateAndParseMetadata(metadata) {
        try {
            // Si es null, undefined o string vacío, retornar objeto vacío
            if (!metadata || metadata == '') {
                return {};
            }

            // Si es string, intentar parsear como JSON
            if (typeof metadata == 'string') {
                try {
                    const parsed = JSON.parse(metadata);
                    return this.isValidMetadata(parsed) ? parsed : {};
                } catch (parseError) {
                    console.warn(`⚠️ Error parseando metadata string:`, parseError.message);
                    return {};
                }
            }

            // Si es objeto, validar que sea válido
            if (typeof metadata == 'object' && metadata !== null) {
                return this.isValidMetadata(metadata) ? metadata : {};
            }

            // Si no es ninguno de los anteriores, retornar objeto vacío
            return {};
        } catch (error) {
            console.error(`❌ Error validando metadata:`, error.message);
            return {};
        }
    }

    /**
     * Verificar si el metadata es válido
     * @param {any} metadata - Metadata a verificar
     * @returns {boolean} True si es válido
     */
    isValidMetadata(metadata) {
        try {
            // Debe ser un objeto
            if (typeof metadata !== 'object' || metadata == null) {
                return false;
            }

            // No debe ser un array
            if (Array.isArray(metadata)) {
                return false;
            }

            // Verificar que no tenga referencias circulares
            const seen = new WeakSet();
            const checkCircular = (obj) => {
                if (typeof obj == 'object' && obj !== null) {
                    if (seen.has(obj)) {
                        return false; // Referencia circular detectada
                    }
                    seen.add(obj);

                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (!checkCircular(obj[key])) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };

            if (!checkCircular(metadata)) {
                return false;
            }

            // Verificar que se pueda serializar correctamente
            JSON.stringify(metadata);

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Merge profundo de objetos de forma segura
     * @param {Object} target - Objeto destino
     * @param {Object} source - Objeto fuente
     * @returns {Object} Objeto fusionado
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const sourceValue = source[key];
                const targetValue = result[key];

                // Si ambos valores son objetos (no arrays), hacer merge profundo
                if (this.isPlainObject(sourceValue) && this.isPlainObject(targetValue)) {
                    result[key] = this.deepMerge(targetValue, sourceValue);
                } else {
                    // Si no, el valor fuente sobrescribe el destino
                    result[key] = sourceValue;
                }
            }
        }

        return result;
    }

    /**
     * Verificar si un valor es un objeto plano (no array, no null)
     * @param {any} value - Valor a verificar
     * @returns {boolean} True si es objeto plano
     */
    isPlainObject(value) {
        return typeof value == 'object' && value !== null && !Array.isArray(value);
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
            if (!EventRegistry.isInitialized || !this.eventService) {
                console.warn(`⚠️ EventRegistry no inicializado, evento ${name} no procesado`);
                return false;
            }

            // Registrar el evento si no existe
            await this.ensureEventExists(name, data, context);

            // Disparar el evento a través del servicio
            const result = await this.eventService.triggerEvent(name, data, context);

            console.log(`🎯 Evento disparado: ${name}`);
            return result;

        } catch (error) {
            console.error(`❌ Error disparando evento ${name}:`, error.message);
            return false;
        }
    }

    /**
     * Asegurar que un evento existe antes de dispararlo
     * @param {string} name - Nombre del evento
     * @param {Object} data - Datos del evento
     * @param {Object} context - Contexto adicional
     */
    async ensureEventExists(name, data = {}, context = {}) {
        try {
            const event = await Event.findOne({
                where: { name }
            });

            if (!event) {
                // Inferir categoría del nombre del evento
                const category = this.inferCategoryFromName(name);
                const description = this.generateDescriptionFromName(name);

                await this.registerSystemEvent(name, description, category, {
                    auto_registered: true,
                    data_structure: Object.keys(data),
                    context_keys: Object.keys(context)
                });
            }
        } catch (error) {
            console.error(`❌ Error asegurando existencia del evento ${name}:`, error.message);
        }
    }

    /**
     * Inferir categoría del nombre del evento
     * @param {string} name - Nombre del evento
     * @returns {string} Categoría inferida
     */
    inferCategoryFromName(name) {
        const parts = name.split('.');
        if (parts.length >= 2) {
            return parts[0];
        }
        return 'system';
    }

    /**
     * Generar descripción automática del evento
     * @param {string} name - Nombre del evento
     * @returns {string} Descripción generada
     */
    generateDescriptionFromName(name) {
        const parts = name.split('.');
        if (parts.length >= 2) {
            const entity = parts[0].replace(/_/g, ' ');
            const action = parts[1].replace(/_/g, ' ');
            return `${action} de ${entity}`;
        }
        return `Evento: ${name}`;
    }

    /**
     * Obtener todos los eventos registrados
     * @returns {Promise<Array>}
     */
    async getAllEvents() {
        try {
            return await Event.findAll({
                order: [['category', 'ASC'], ['name', 'ASC']]
            });
        } catch (error) {
            console.error('❌ Error obteniendo eventos:', error.message);
            return [];
        }
    }

    /**
     * Obtener eventos por categoría
     * @param {string} category - Categoría de eventos
     * @returns {Promise<Array>}
     */
    async getEventsByCategory(category) {
        try {
            return await Event.findAll({
                where: {
                    category,
                    is_active: true
                },
                order: [['name', 'ASC']]
            });
        } catch (error) {
            console.error(`❌ Error obteniendo eventos de categoría ${category}:`, error.message);
            return [];
        }
    }

    /**
     * Verificar si un evento existe
     * @param {string} name - Nombre del evento
     * @returns {Promise<boolean>}
     */
    async eventExists(name) {
        try {
            const event = await Event.findOne({
                where: { name }
            });
            return !!event;
        } catch (error) {
            console.error(`❌ Error verificando existencia del evento ${name}:`, error.message);
            return false;
        }
    }

    /**
     * Obtener estadísticas de eventos
     * @returns {Promise<Object>}
     */
    async getEventStats() {
        try {
            const totalEvents = await Event.count();

            const activeEvents = await Event.count({
                where: {
                    is_active: true
                }
            });

            const eventsByCategory = await Event.findAll({
                attributes: [
                    'category',
                    [Event.sequelize.fn('COUNT', Event.sequelize.col('id')), 'count']
                ],
                group: ['category'],
                raw: true
            });

            return {
                total: totalEvents,
                active: activeEvents,
                inactive: totalEvents - activeEvents,
                byCategory: eventsByCategory
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de eventos:', error.message);
            return {
                total: 0,
                active: 0,
                inactive: 0,
                byCategory: []
            };
        }
    }
}

export default EventRegistry; 