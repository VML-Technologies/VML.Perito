import Event from '../models/event.js';
import EventListener from '../models/eventListener.js';
import NotificationType from '../models/notificationType.js';
import User from '../models/user.js';

const seedEventSystem = async () => {
    try {
        console.log('🎯 Configurando sistema de eventos...');

        // 1. Crear eventos del sistema por defecto
        const defaultEvents = [
            {
                name: 'user.created',
                description: 'Se dispara cuando se crea un nuevo usuario en el sistema',
                category: 'user',
                metadata: {
                    variables: ['user.id', 'user.email', 'user.first_name', 'user.last_name', 'user.role'],
                    description: 'Evento que se dispara automáticamente cuando se registra un nuevo usuario'
                }
            },
            {
                name: 'user.password_changed',
                description: 'Se dispara cuando un usuario cambia su contraseña',
                category: 'user',
                metadata: {
                    variables: ['user.id', 'user.email', 'user.first_name', 'user.last_name', 'changed_at'],
                    description: 'Evento de seguridad que se dispara cuando se modifica la contraseña'
                }
            },
            {
                name: 'user.login',
                description: 'Se dispara cuando un usuario inicia sesión',
                category: 'user',
                metadata: {
                    variables: ['user.id', 'user.email', 'user.first_name', 'user.last_name', 'login_time', 'ip_address'],
                    description: 'Evento de auditoría para seguimiento de accesos'
                }
            },
            {
                name: 'inspection_order.created',
                description: 'Se dispara cuando se crea una nueva orden de inspección',
                category: 'inspection_order',
                metadata: {
                    variables: ['order.id', 'order.reference', 'order.customer_name', 'order.vehicle_type', 'order.modality', 'order.sede_name'],
                    description: 'Evento principal para notificaciones de nuevas órdenes'
                }
            },
            {
                name: 'inspection_order.assigned',
                description: 'Se dispara cuando se asigna una orden de inspección a un agente',
                category: 'inspection_order',
                metadata: {
                    variables: ['order.id', 'order.reference', 'agent.id', 'agent.email', 'agent.first_name', 'agent.last_name', 'assigned_at'],
                    description: 'Evento para notificar al agente sobre su nueva asignación'
                }
            },
            {
                name: 'inspection_order.status_changed',
                description: 'Se dispara cuando cambia el estado de una orden de inspección',
                category: 'inspection_order',
                metadata: {
                    variables: ['order.id', 'order.reference', 'old_status', 'new_status', 'changed_by', 'changed_at'],
                    description: 'Evento para seguimiento de cambios de estado'
                }
            },
            {
                name: 'inspection_order.started',
                description: 'Se dispara cuando se inicia una inspección virtual',
                category: 'inspection_order',
                metadata: {
                    variables: [
                        'inspection_order.id',
                        'inspection_order.numero',
                        'inspection_order.nombre_cliente',
                        'inspection_order.celular_cliente',
                        'inspection_order.correo_cliente',
                        'inspection_order.placa',
                        'appointment.session_id',
                        'appointment.scheduled_date',
                        'appointment.scheduled_time',
                        'appointment.session_url',
                        'sede.name',
                        'sede.address'
                    ],
                    description: 'Evento para notificar al cliente que la inspección virtual ha comenzado'
                }
            },
            {
                name: 'inspection_order.completed',
                description: 'Se dispara cuando se completa una orden de inspección',
                category: 'inspection_order',
                metadata: {
                    variables: ['order.id', 'order.reference', 'completed_by', 'completed_at', 'results_summary'],
                    description: 'Evento para notificar la finalización de inspecciones'
                }
            },
            {
                name: 'appointment.created',
                description: 'Se dispara cuando se crea una nueva cita',
                category: 'appointment',
                metadata: {
                    variables: ['appointment.id', 'appointment.date', 'appointment.time', 'customer.name', 'customer.email', 'sede.name'],
                    description: 'Evento para confirmaciones de citas'
                }
            },
            {
                name: 'appointment.cancelled',
                description: 'Se dispara cuando se cancela una cita',
                category: 'appointment',
                metadata: {
                    variables: ['appointment.id', 'appointment.date', 'appointment.time', 'customer.name', 'customer.email', 'cancelled_by', 'cancelled_at', 'reason'],
                    description: 'Evento para notificar cancelaciones'
                }
            },
            {
                name: 'appointment.rescheduled',
                description: 'Se dispara cuando se reprograma una cita',
                category: 'appointment',
                metadata: {
                    variables: ['appointment.id', 'old_date', 'old_time', 'new_date', 'new_time', 'customer.name', 'customer.email', 'rescheduled_by'],
                    description: 'Evento para notificar cambios de horario'
                }
            },
            {
                name: 'call.logged',
                description: 'Se dispara cuando se registra una nueva llamada',
                category: 'call',
                metadata: {
                    variables: ['call.id', 'call.customer_name', 'call.phone', 'call.duration', 'agent.name', 'call.status'],
                    description: 'Evento para seguimiento de llamadas'
                }
            },
            {
                name: 'system.maintenance',
                description: 'Se dispara cuando se programa mantenimiento del sistema',
                category: 'system',
                metadata: {
                    variables: ['maintenance.start_time', 'maintenance.end_time', 'maintenance.description', 'affected_services'],
                    description: 'Evento para notificar mantenimientos programados'
                }
            },
            {
                name: 'system.error',
                description: 'Se dispara cuando ocurre un error crítico en el sistema',
                category: 'system',
                metadata: {
                    variables: ['error.code', 'error.message', 'error.stack', 'error.timestamp', 'affected_module'],
                    description: 'Evento para alertas de errores del sistema'
                }
            }
        ];

        // Crear eventos usando findOrCreate
        for (const eventData of defaultEvents) {
            const [event, created] = await Event.findOrCreate({
                where: { name: eventData.name },
                defaults: {
                    ...eventData,
                    is_active: true,
                    trigger_count: 0,
                    version: 1
                }
            });

            if (created) {
                console.log(`✅ Evento creado: ${eventData.name}`);
            } else {
                console.log(`⚠️  Evento ya existe: ${eventData.name}`);
            }
        }

        // Los listeners se crean en seedAdvancedListeners.js con configuración granular
        console.log('ℹ️  Listeners configurados en seedAdvancedListeners.js');

        console.log('✅ Sistema de eventos configurado correctamente');
        console.log(`📊 Eventos creados: ${defaultEvents.length}`);

        // Mostrar estadísticas
        const totalEvents = await Event.count();
        const totalListeners = await EventListener.count();
        console.log(`📈 Total de eventos en BD: ${totalEvents}`);
        console.log(`📈 Total de listeners en BD: ${totalListeners}`);

    } catch (error) {
        console.error('❌ Error configurando sistema de eventos:', error);
        throw error;
    }
};

export default seedEventSystem; 