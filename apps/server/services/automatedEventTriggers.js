import EventRegistry from './eventRegistry.js';
import EventService from './eventService.js';

/**
 * Servicio para manejar triggers automáticos de eventos del sistema
 * Se integra con los controladores para disparar eventos automáticamente
 */
class AutomatedEventTriggers {
    constructor() {
        this.eventRegistry = EventRegistry.getInstance();
        this.eventService = null;
        this.isInitialized = false;
    }

    /**
     * Inicializar el servicio con el EventService
     * @param {EventService} eventService - Instancia del servicio de eventos
     */
    initialize(eventService) {
        this.eventService = eventService;
        this.eventRegistry.initialize(eventService);
        this.isInitialized = true;
        console.log('🎯 AutomatedEventTriggers inicializado');
    }

    /**
     * Trigger para eventos de usuario
     */
    async triggerUserEvents(action, userData, context = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const eventName = `user.${action}`;
        const data = {
            user: userData,
            action,
            timestamp: new Date().toISOString()
        };

        try {
            await this.eventRegistry.triggerEvent(eventName, data, context);
            console.log(`🎯 Evento de usuario disparado: ${eventName}`);
        } catch (error) {
            console.error(`❌ Error disparando evento de usuario ${eventName}:`, error);
        }
    }

    /**
     * Trigger para eventos de orden de inspección
     */
    async triggerInspectionOrderEvents(action, orderData, context = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const eventName = `inspection_order.${action}`;
        const data = {
            inspection_order: orderData,
            action,
            timestamp: new Date().toISOString()
        };

        try {
            await this.eventRegistry.triggerEvent(eventName, data, context);
            console.log(`🎯 Evento de orden disparado: ${eventName}`);
        } catch (error) {
            console.error(`❌ Error disparando evento de orden ${eventName}:`, error);
        }
    }

    /**
     * Trigger para eventos de cita
     */
    async triggerAppointmentEvents(action, appointmentData, context = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const eventName = `appointment.${action}`;
        const data = {
            appointment: appointmentData,
            action,
            timestamp: new Date().toISOString()
        };

        try {
            await this.eventRegistry.triggerEvent(eventName, data, context);
            console.log(`🎯 Evento de cita disparado: ${eventName}`);
        } catch (error) {
            console.error(`❌ Error disparando evento de cita ${eventName}:`, error);
        }
    }

    /**
     * Trigger para eventos de sistema
     */
    async triggerSystemEvents(action, systemData, context = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const eventName = `system.${action}`;
        const data = {
            system: systemData,
            action,
            timestamp: new Date().toISOString()
        };

        try {
            await this.eventRegistry.triggerEvent(eventName, data, context);
            console.log(`🎯 Evento de sistema disparado: ${eventName}`);
        } catch (error) {
            console.error(`❌ Error disparando evento de sistema ${eventName}:`, error);
        }
    }

    /**
     * Trigger para eventos de notificación
     */
    async triggerNotificationEvents(action, notificationData, context = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const eventName = `notification.${action}`;
        const data = {
            notification: notificationData,
            action,
            timestamp: new Date().toISOString()
        };

        try {
            await this.eventRegistry.triggerEvent(eventName, data, context);
            console.log(`🎯 Evento de notificación disparado: ${eventName}`);
        } catch (error) {
            console.error(`❌ Error disparando evento de notificación ${eventName}:`, error);
        }
    }

    /**
     * Registrar eventos del sistema automáticamente
     */
    async registerSystemEvents() {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const systemEvents = [
            // Eventos de usuario
            { name: 'user.created', description: 'Usuario creado', category: 'user' },
            { name: 'user.updated', description: 'Usuario actualizado', category: 'user' },
            { name: 'user.deleted', description: 'Usuario eliminado', category: 'user' },
            { name: 'user.activated', description: 'Usuario activado', category: 'user' },
            { name: 'user.deactivated', description: 'Usuario desactivado', category: 'user' },
            { name: 'user.password_changed', description: 'Contraseña cambiada', category: 'user' },
            { name: 'user.login', description: 'Usuario inició sesión', category: 'user' },
            { name: 'user.logout', description: 'Usuario cerró sesión', category: 'user' },

            // Eventos de orden de inspección
            { name: 'inspection_order.created', description: 'Orden de inspección creada', category: 'inspection_order' },
            { name: 'inspection_order.updated', description: 'Orden de inspección actualizada', category: 'inspection_order' },
            { name: 'inspection_order.assigned', description: 'Orden de inspección asignada', category: 'inspection_order' },
            { name: 'inspection_order.scheduled', description: 'Orden de inspección programada', category: 'inspection_order' },
            { name: 'inspection_order.completed', description: 'Orden de inspección completada', category: 'inspection_order' },
            { name: 'inspection_order.cancelled', description: 'Orden de inspección cancelada', category: 'inspection_order' },
            { name: 'inspection_order.reassigned', description: 'Orden de inspección reasignada', category: 'inspection_order' },

            // Eventos de cita
            { name: 'appointment.created', description: 'Cita creada', category: 'appointment' },
            { name: 'appointment.updated', description: 'Cita actualizada', category: 'appointment' },
            { name: 'appointment.confirmed', description: 'Cita confirmada', category: 'appointment' },
            { name: 'appointment.cancelled', description: 'Cita cancelada', category: 'appointment' },
            { name: 'appointment.rescheduled', description: 'Cita reprogramada', category: 'appointment' },
            { name: 'appointment.reminder', description: 'Recordatorio de cita', category: 'appointment' },
            { name: 'appointment.completed', description: 'Cita completada', category: 'appointment' },

            // Eventos de sistema
            { name: 'system.maintenance', description: 'Mantenimiento del sistema', category: 'system' },
            { name: 'system.error', description: 'Error del sistema', category: 'system' },
            { name: 'system.backup', description: 'Backup del sistema', category: 'system' },
            { name: 'system.update', description: 'Actualización del sistema', category: 'system' },

            // Eventos de notificación
            { name: 'notification.sent', description: 'Notificación enviada', category: 'notification' },
            { name: 'notification.failed', description: 'Notificación fallida', category: 'notification' },
            { name: 'notification.delivered', description: 'Notificación entregada', category: 'notification' },
            { name: 'notification.read', description: 'Notificación leída', category: 'notification' }
        ];

        let createdCount = 0;
        let existingCount = 0;

        for (const event of systemEvents) {
            try {
                const result = await this.eventRegistry.findOrCreateEvent(
                    event.name,
                    event.description,
                    event.category,
                    { auto_registered: true }
                );

                if (result.created) {
                    createdCount++;
                } else {
                    existingCount++;
                }
            } catch (error) {
                console.error(`❌ Error registrando evento ${event.name}:`, error);
            }
        }

        console.log(`✅ Eventos del sistema: ${createdCount} creados, ${existingCount} existentes`);
    }

    /**
     * Crear listeners predefinidos para eventos comunes
     */
    async createDefaultListeners() {
        if (!this.isInitialized) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        const defaultListeners = [
            // Listener para notificar cuando se crea un usuario
            {
                event_name: 'user.created',
                notification_type_name: 'user_welcome',
                conditions: { user_role: 'client' },
                priority: 1,
                channels: ['email', 'in_app']
            },
            // Listener para notificar cuando se programa una cita
            {
                event_name: 'appointment.scheduled',
                notification_type_name: 'appointment_confirmation',
                conditions: {},
                priority: 1,
                channels: ['email', 'sms', 'whatsapp']
            },
            // Listener para recordatorio de cita
            {
                event_name: 'appointment.reminder',
                notification_type_name: 'appointment_reminder',
                conditions: {},
                priority: 2,
                delay_seconds: 3600, // 1 hora antes
                channels: ['email', 'sms']
            }
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const listenerConfig of defaultListeners) {
            try {
                // Verificar si ya existe un listener para este evento y tipo de notificación
                const existingListener = await this.checkExistingListener(listenerConfig);

                if (existingListener) {
                    console.log(`⏭️ Listener ya existe para ${listenerConfig.event_name} -> ${listenerConfig.notification_type_name}`);
                    skippedCount++;
                    continue;
                }

                await this.createListener(listenerConfig);
                createdCount++;
            } catch (error) {
                console.error(`❌ Error creando listener para ${listenerConfig.event_name}:`, error);
            }
        }

        console.log(`✅ Listeners predefinidos: ${createdCount} creados, ${skippedCount} existentes`);
    }

    /**
     * Verificar si ya existe un listener para el evento y tipo de notificación
     */
    async checkExistingListener(listenerConfig) {
        if (!this.eventService) {
            return false;
        }

        try {
            // Obtener el evento
            const event = await this.eventService.registry.get(listenerConfig.event_name);
            if (!event) {
                return false;
            }

            // Obtener el tipo de notificación
            const notificationType = await this.eventService.notificationService.getNotificationTypeByName(
                listenerConfig.notification_type_name
            );
            if (!notificationType) {
                return false;
            }

            // Buscar si ya existe un listener con estos parámetros
            const existingListener = await this.eventService.findListener({
                event_id: event.id,
                notification_type_id: notificationType.id
            });

            return existingListener;
        } catch (error) {
            console.error(`❌ Error verificando listener existente:`, error);
            return false;
        }
    }

    /**
     * Crear un listener específico
     */
    async createListener(listenerConfig) {
        if (!this.isInitialized || !this.eventService) {
            console.warn('⚠️ AutomatedEventTriggers no inicializado');
            return;
        }

        try {
            // Obtener el evento
            const event = await this.eventService.registry.get(listenerConfig.event_name);
            if (!event) {
                console.warn(`⚠️ Evento no encontrado: ${listenerConfig.event_name}`);
                return;
            }

            // Obtener el tipo de notificación
            const notificationType = await this.eventService.notificationService.getNotificationTypeByName(
                listenerConfig.notification_type_name
            );
            if (!notificationType) {
                console.warn(`⚠️ Tipo de notificación no encontrado: ${listenerConfig.notification_type_name}`);
                return;
            }

            // Buscar o crear el listener
            const result = await this.findOrCreateListener({
                event_id: event.id,
                notification_type_id: notificationType.id,
                conditions: listenerConfig.conditions || null,
                priority: listenerConfig.priority || 1,
                delay_seconds: listenerConfig.delay_seconds || 0,
                channels: listenerConfig.channels || null,
                is_active: true
            });

            if (result.created) {
                console.log(`✅ Listener creado para ${listenerConfig.event_name}`);
            } else {
                console.log(`⏭️ Listener ya existe para ${listenerConfig.event_name}`);
            }

            return result.listener;

        } catch (error) {
            console.error(`❌ Error creando listener:`, error);
            throw error;
        }
    }

    /**
     * Buscar o crear un listener (patrón find or create)
     */
    async findOrCreateListener(listenerData) {
        if (!this.eventService) {
            throw new Error('EventService no inicializado');
        }

        try {
            // Buscar listener existente
            const existingListener = await this.eventService.findListener({
                event_id: listenerData.event_id,
                notification_type_id: listenerData.notification_type_id
            });

            if (existingListener) {
                // Actualizar configuración si es necesario
                const needsUpdate =
                    JSON.stringify(existingListener.conditions) !== JSON.stringify(listenerData.conditions) ||
                    existingListener.priority !== listenerData.priority ||
                    existingListener.delay_seconds !== listenerData.delay_seconds ||
                    JSON.stringify(existingListener.channels) !== JSON.stringify(listenerData.channels) ||
                    existingListener.is_active !== listenerData.is_active;

                if (needsUpdate) {
                    await existingListener.update(listenerData);
                    console.log(`🔄 Listener actualizado: ${existingListener.id}`);
                }

                return { listener: existingListener, created: false };
            }

            // Crear nuevo listener
            const newListener = await this.eventService.createListener(listenerData);
            return { listener: newListener, created: true };

        } catch (error) {
            console.error('❌ Error en findOrCreateListener:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de triggers automáticos
     */
    async getStats() {
        if (!this.isInitialized) {
            return { error: 'No inicializado' };
        }

        try {
            const eventStats = await this.eventRegistry.getEventStats();
            const serviceStats = await this.eventService.getStats();

            return {
                eventRegistry: eventStats,
                eventService: serviceStats,
                isInitialized: this.isInitialized
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return { error: error.message };
        }
    }
}

// Exportar singleton
const automatedEventTriggers = new AutomatedEventTriggers();
export default automatedEventTriggers; 