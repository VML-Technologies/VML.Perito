import Event from '../models/event.js';
import EventListener from '../models/eventListener.js';
import NotificationType from '../models/notificationType.js';
import NotificationConfig from '../models/notificationConfig.js';
import NotificationChannel from '../models/notificationChannel.js';
import User from '../models/user.js';
import { Op } from 'sequelize';

/**
 * Seeder avanzado para listeners basado en seeders_adjustment.md
 * Implementa listeners granulares con condiciones específicas
 */
const seedAdvancedListeners = async () => {
    try {
        console.log('🎯 Configurando listeners avanzados...');

        // Buscar eventos necesarios
        const events = await Event.findAll({
            where: {
                name: {
                    [Op.in]: [
                        'user.created',
                        'inspection_order.created',
                        'inspection_order.assigned',
                        'inspection_order.scheduled'
                    ]
                }
            }
        });

        // Buscar usuario administrador
        const adminUser = await User.findOne({ where: { email: 'admin@vmltechnologies.com' } });

        if (!adminUser) {
            console.log('⚠️ No se encontró el usuario administrador');
            return;
        }

        // Crear tipos de notificación específicos según seeders_adjustment.md
        const requiredTypes = [
            // user.created
            'user_welcome',

            // inspection_order.created
            'order_created_commercial_email',
            'order_created_coordinator_email',
            'order_created_commercial_inapp',
            'order_created_coordinator_inapp',
            'order_created_commercial_push',
            'order_created_coordinator_push',

            // inspection_order.assigned
            'order_assigned_commercial_inapp',
            'order_assigned_coordinator_inapp',
            'order_assigned_commercial_push',
            'order_assigned_coordinator_push',

            // inspection_order.scheduled
            'appointment_confirmation_client_email',
            'appointment_confirmation_client_sms',
            'appointment_scheduled_commercial_inapp',
            'appointment_scheduled_commercial_push',
            'appointment_reminder_client_email',
            'appointment_reminder_client_sms'
        ];

        console.log('📝 Creando tipos de notificación específicos...');
        for (const typeName of requiredTypes) {
            await NotificationType.findOrCreate({
                where: { name: typeName },
                defaults: {
                    name: typeName,
                    description: `Tipo de notificación para ${typeName}`
                }
            });
        }

        // Buscar canales disponibles
        const channels = await NotificationChannel.findAll();
        console.log(`📡 Canales disponibles: ${channels.map(c => c.name).join(', ')}`);

        // Crear configuraciones de notificación para los tipos específicos
        console.log('🔧 Creando configuraciones de notificación...');
        const configsToCreate = [
            // ===== CONFIGURACIONES PARA USUARIOS =====
            // Email para comercial
            {
                name: 'Email al Comercial - Orden Creada',
                notification_type_name: 'order_created_commercial_email',
                channel_name: 'email',
                template_title: 'Orden de Inspección Creada - {{inspection_order.numero}}',
                template_content: 'Se ha creado una nueva orden de inspección {{inspection_order.numero}} para el cliente {{inspection_order.nombre_cliente}}',
                for_clients: false,
                for_users: true,
                target_roles: ['comercial_mundial'],
                trigger_conditions: { is_commercial_creator: true }
            },
            // Email para coordinadores
            {
                name: 'Email a Coordinadores - Orden Creada',
                notification_type_name: 'order_created_coordinator_email',
                channel_name: 'email',
                template_title: 'Nueva Orden de Inspección - {{inspection_order.numero}}',
                template_content: 'Se ha creado una nueva orden de inspección {{inspection_order.numero}} para el cliente {{inspection_order.nombre_cliente}}',
                for_clients: false,
                for_users: true,
                target_roles: ['coordinador_contacto'],
                trigger_conditions: {} // Sin condiciones - se envía a todos los coordinadores
            },
            // In-App para comercial
            {
                name: 'In-App al Comercial - Orden Creada',
                notification_type_name: 'order_created_commercial_inapp',
                channel_name: 'in_app',
                template_title: 'Orden Creada',
                template_content: 'Nueva orden {{inspection_order.numero}} creada para {{inspection_order.nombre_cliente}}',
                for_clients: false,
                for_users: true,
                target_roles: ['comercial_mundial'],
                trigger_conditions: { is_commercial_creator: true }
            },
            // In-App para coordinadores
            {
                name: 'In-App a Coordinadores - Orden Creada',
                notification_type_name: 'order_created_coordinator_inapp',
                channel_name: 'in_app',
                template_title: 'Nueva Orden',
                template_content: 'Nueva orden {{inspection_order.numero}} creada para {{inspection_order.nombre_cliente}}',
                for_clients: false,
                for_users: true,
                target_roles: ['coordinador_contacto'],
                trigger_conditions: {} // Sin condiciones - se envía a todos los coordinadores
            },
            // Push para comercial
            {
                name: 'Push al Comercial - Orden Creada',
                notification_type_name: 'order_created_commercial_push',
                channel_name: 'push',
                template_title: 'Orden Creada',
                template_content: 'Nueva orden {{inspection_order.numero}} creada',
                for_clients: false,
                for_users: true,
                target_roles: ['comercial_mundial'],
                trigger_conditions: { is_commercial_creator: true }
            },
            // Push para coordinadores
            {
                name: 'Push a Coordinadores - Orden Creada',
                notification_type_name: 'order_created_coordinator_push',
                channel_name: 'push',
                template_title: 'Nueva Orden',
                template_content: 'Nueva orden {{inspection_order.numero}} creada',
                for_clients: false,
                for_users: true,
                target_roles: ['coordinador_contacto'],
                trigger_conditions: {} // Sin condiciones - se envía a todos los coordinadores
            },

            // ===== CONFIGURACIONES PARA CLIENTES =====
            // Email para cliente (cuando se agende una cita)
            {
                name: 'Email de Confirmación al Cliente - Cita Agendada',
                notification_type_name: 'appointment_confirmation_client_email',
                channel_name: 'email',
                template_title: 'Cita de Inspección Confirmada - {{inspection_order.numero}}',
                template_content: `
Hola {{inspection_order.nombre_cliente}},

Tu cita de inspección ha sido confirmada exitosamente.

Detalles de la cita:
- Número de orden: {{inspection_order.numero}}
- Vehículo: {{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}
- Placa: {{inspection_order.placa}}
- Fecha: {{appointment.scheduled_date}}
- Hora: {{appointment.scheduled_time}}
- Sede: {{sede.name}}

Por favor llega 10 minutos antes de tu cita.

Saludos,
Equipo VML Perito
                `.trim(),
                for_clients: true,
                for_users: false,
                target_roles: [],
                trigger_conditions: { is_client: true }
            },
            // SMS para cliente (cuando se agende una cita)
            {
                name: 'SMS de Confirmación al Cliente - Cita Agendada',
                notification_type_name: 'appointment_confirmation_client_sms',
                channel_name: 'sms',
                template_title: 'Cita Confirmada',
                template_content: 'Hola {{inspection_order.nombre_cliente}}, tu cita para la orden {{inspection_order.numero}} ha sido confirmada para el {{appointment.scheduled_date}} a las {{appointment.scheduled_time}} en {{sede.name}}.',
                for_clients: true,
                for_users: false,
                target_roles: [],
                trigger_conditions: { is_client: true }
            },
            // Recordatorio por email (1 día antes)
            {
                name: 'Recordatorio por Email al Cliente - 1 Día Antes',
                notification_type_name: 'appointment_reminder_client_email',
                channel_name: 'email',
                template_title: 'Recordatorio de Cita - {{inspection_order.numero}}',
                template_content: `
Hola {{inspection_order.nombre_cliente}},

Te recordamos que mañana tienes tu cita de inspección.

Detalles:
- Número de orden: {{inspection_order.numero}}
- Vehículo: {{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}
- Placa: {{inspection_order.placa}}
- Fecha: {{appointment.scheduled_date}}
- Hora: {{appointment.scheduled_time}}
- Sede: {{sede.name}}

Por favor llega 10 minutos antes.

Saludos,
Equipo VML Perito
                `.trim(),
                for_clients: true,
                for_users: false,
                target_roles: [],
                trigger_conditions: { is_client: true, not_same_day: true }
            },
            // Recordatorio por SMS (1 día antes)
            {
                name: 'Recordatorio por SMS al Cliente - 1 Día Antes',
                notification_type_name: 'appointment_reminder_client_sms',
                channel_name: 'sms',
                template_title: 'Recordatorio de Cita',
                template_content: 'Hola {{inspection_order.nombre_cliente}}, recordatorio: mañana tienes cita para la orden {{inspection_order.numero}} a las {{appointment.scheduled_time}} en {{sede.name}}.',
                for_clients: true,
                for_users: false,
                target_roles: [],
                trigger_conditions: { is_client: true, not_same_day: true }
            }
        ];

        for (const configData of configsToCreate) {
            const notificationType = await NotificationType.findOne({
                where: { name: configData.notification_type_name }
            });
            const channel = channels.find(c => c.name === configData.channel_name);

            if (!notificationType || !channel) {
                console.log(`⚠️ Tipo o canal no encontrado: ${configData.notification_type_name} -> ${configData.channel_name}`);
                continue;
            }

            await NotificationConfig.findOrCreate({
                where: {
                    notification_type_id: notificationType.id,
                    notification_channel_id: channel.id
                },
                defaults: {
                    name: configData.name,
                    notification_type_id: notificationType.id,
                    notification_channel_id: channel.id,
                    template_title: configData.template_title,
                    template_content: configData.template_content,
                    template_variables: {
                        'inspection_order.numero': 'Número de la orden',
                        'inspection_order.nombre_cliente': 'Nombre del cliente',
                        'inspection_order.marca': 'Marca del vehículo',
                        'inspection_order.linea': 'Línea del vehículo',
                        'inspection_order.modelo': 'Modelo del vehículo',
                        'inspection_order.placa': 'Placa del vehículo',
                        'appointment.scheduled_date': 'Fecha de la cita',
                        'appointment.scheduled_time': 'Hora de la cita',
                        'sede.name': 'Nombre de la sede'
                    },
                    for_clients: configData.for_clients,
                    for_users: configData.for_users,
                    target_roles: configData.target_roles,
                    target_users: [],
                    trigger_conditions: configData.trigger_conditions,
                    schedule_type: 'immediate',
                    priority: 'normal',
                    retry_attempts: 3,
                    active: true
                }
            });
        }

        // Configuración de listeners basada en seeders_adjustment.md
        const listenersConfig = [
            // ===== USER.CREATED =====
            {
                event_name: 'user.created',
                notification_type_name: 'user_welcome',
                conditions: {}, // Sin condiciones - se envía a todos los usuarios nuevos
                priority: 1,
                delay_seconds: 0,
                channels: ['email'],
                description: 'Email de bienvenida para usuario creado'
            },

            // ===== INSPECTION_ORDER.CREATED =====
            // Email para comercial que creó la orden
            {
                event_name: 'inspection_order.created',
                notification_type_name: 'order_created_commercial_email',
                conditions: { is_commercial_creator: true },
                priority: 1,
                delay_seconds: 0,
                channels: ['email'],
                description: 'Email al comercial que creó la orden'
            },
            // Email para coordinadores
            {
                event_name: 'inspection_order.created',
                notification_type_name: 'order_created_coordinator_email',
                conditions: {}, // Sin condiciones - se envía a todos los coordinadores
                priority: 2,
                delay_seconds: 0,
                channels: ['email'],
                description: 'Email a coordinadores de contacto'
            },
            // In-App para comercial
            {
                event_name: 'inspection_order.created',
                notification_type_name: 'order_created_commercial_inapp',
                conditions: { is_commercial_creator: true },
                priority: 3,
                delay_seconds: 0,
                channels: ['in_app'],
                description: 'Notificación in-app al comercial'
            },
            // In-App para coordinadores
            {
                event_name: 'inspection_order.created',
                notification_type_name: 'order_created_coordinator_inapp',
                conditions: {}, // Sin condiciones - se envía a todos los coordinadores
                priority: 4,
                delay_seconds: 0,
                channels: ['in_app'],
                description: 'Notificación in-app a coordinadores'
            },
            // Push para comercial
            {
                event_name: 'inspection_order.created',
                notification_type_name: 'order_created_commercial_push',
                conditions: { is_commercial_creator: true },
                priority: 5,
                delay_seconds: 0,
                channels: ['push'],
                description: 'Push notification al comercial'
            },
            // Push para coordinadores
            {
                event_name: 'inspection_order.created',
                notification_type_name: 'order_created_coordinator_push',
                conditions: {}, // Sin condiciones - se envía a todos los coordinadores
                priority: 6,
                delay_seconds: 0,
                channels: ['push'],
                description: 'Push notification a coordinadores'
            },

            // ===== INSPECTION_ORDER.ASSIGNED =====
            // In-App para comercial
            {
                event_name: 'inspection_order.assigned',
                notification_type_name: 'order_assigned_commercial_inapp',
                conditions: { is_commercial_creator: true },
                priority: 1,
                delay_seconds: 0,
                channels: ['in_app'],
                description: 'Notificación in-app de asignación al comercial'
            },
            // In-App para coordinadores
            {
                event_name: 'inspection_order.assigned',
                notification_type_name: 'order_assigned_coordinator_inapp',
                conditions: { user_role: 'coordinador_contacto' },
                priority: 2,
                delay_seconds: 0,
                channels: ['in_app'],
                description: 'Notificación in-app de asignación a coordinadores'
            },
            // Push para comercial
            {
                event_name: 'inspection_order.assigned',
                notification_type_name: 'order_assigned_commercial_push',
                conditions: { is_commercial_creator: true },
                priority: 3,
                delay_seconds: 0,
                channels: ['push'],
                description: 'Push notification de asignación al comercial'
            },
            // Push para coordinadores
            {
                event_name: 'inspection_order.assigned',
                notification_type_name: 'order_assigned_coordinator_push',
                conditions: { user_role: 'coordinador_contacto' },
                priority: 4,
                delay_seconds: 0,
                channels: ['push'],
                description: 'Push notification de asignación a coordinadores'
            },

            // ===== INSPECTION_ORDER.SCHEDULED =====
            // Email de confirmación al cliente
            {
                event_name: 'inspection_order.scheduled',
                notification_type_name: 'appointment_confirmation_client_email',
                conditions: { is_client: true },
                priority: 1,
                delay_seconds: 0,
                channels: ['email'],
                description: 'Email de confirmación de cita al cliente'
            },
            // SMS de confirmación al cliente
            {
                event_name: 'inspection_order.scheduled',
                notification_type_name: 'appointment_confirmation_client_sms',
                conditions: { is_client: true },
                priority: 2,
                delay_seconds: 0,
                channels: ['sms'],
                description: 'SMS de confirmación de cita al cliente'
            },
            // In-App para comercial
            {
                event_name: 'inspection_order.scheduled',
                notification_type_name: 'appointment_scheduled_commercial_inapp',
                conditions: { is_commercial_creator: true },
                priority: 3,
                delay_seconds: 0,
                channels: ['in_app'],
                description: 'Notificación in-app de cita programada al comercial'
            },
            // Push para comercial
            {
                event_name: 'inspection_order.scheduled',
                notification_type_name: 'appointment_scheduled_commercial_push',
                conditions: { is_commercial_creator: true },
                priority: 4,
                delay_seconds: 0,
                channels: ['push'],
                description: 'Push notification de cita programada al comercial'
            },
            // Recordatorio por email (1 día antes)
            {
                event_name: 'inspection_order.scheduled',
                notification_type_name: 'appointment_reminder_client_email',
                conditions: { is_client: true, not_same_day: true },
                priority: 5,
                delay_seconds: 86400, // 1 día
                channels: ['email'],
                description: 'Recordatorio por email al cliente (1 día antes)'
            },
            // Recordatorio por SMS (1 día antes)
            {
                event_name: 'inspection_order.scheduled',
                notification_type_name: 'appointment_reminder_client_sms',
                conditions: { is_client: true, not_same_day: true },
                priority: 6,
                delay_seconds: 86400, // 1 día
                channels: ['sms'],
                description: 'Recordatorio por SMS al cliente (1 día antes)'
            }
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const config of listenersConfig) {
            try {
                // Buscar evento y tipo de notificación
                const event = events.find(e => e.name === config.event_name);
                const notificationType = await NotificationType.findOne({
                    where: { name: config.notification_type_name }
                });

                if (!event || !notificationType) {
                    console.log(`⚠️ Evento o tipo de notificación no encontrado: ${config.event_name} -> ${config.notification_type_name}`);
                    continue;
                }

                // Crear o actualizar listener
                const [listener, created] = await EventListener.findOrCreate({
                    where: {
                        event_id: event.id,
                        notification_type_id: notificationType.id
                    },
                    defaults: {
                        conditions: config.conditions,
                        priority: config.priority,
                        delay_seconds: config.delay_seconds,
                        channels: config.channels,
                        is_active: true,
                        execution_count: 0,
                        created_by: adminUser.id
                    }
                });

                if (created) {
                    console.log(`✅ Listener creado: ${config.description}`);
                    createdCount++;
                } else {
                    // Actualizar configuración existente
                    await listener.update({
                        conditions: config.conditions,
                        priority: config.priority,
                        delay_seconds: config.delay_seconds,
                        channels: config.channels
                    });
                    console.log(`🔄 Listener actualizado: ${config.description}`);
                    skippedCount++;
                }

            } catch (error) {
                console.error(`❌ Error creando listener ${config.description}:`, error.message);
            }
        }

        console.log(`\n🎉 Configuración de listeners completada:`);
        console.log(`   - ${createdCount} listeners creados`);
        console.log(`   - ${skippedCount} listeners actualizados`);

        // Mostrar estadísticas finales
        const totalListeners = await EventListener.count({ where: { is_active: true } });
        console.log(`📈 Total de listeners activos: ${totalListeners}`);

    } catch (error) {
        console.error('❌ Error configurando listeners avanzados:', error);
        throw error;
    }
};

export default seedAdvancedListeners; 