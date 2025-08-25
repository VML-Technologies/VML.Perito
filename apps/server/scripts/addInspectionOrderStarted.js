import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Event from '../models/event.js';
import EventListener from '../models/eventListener.js';
import NotificationType from '../models/notificationType.js';
import NotificationConfig from '../models/notificationConfig.js';
import NotificationTemplate from '../models/notificationTemplate.js';
import NotificationChannel from '../models/notificationChannel.js';
import User from '../models/user.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

/**
 * Crear evento inspection_order.started
 */
const createInspectionOrderStartedEvent = async () => {
    try {
        console.log('🎯 Creando evento inspection_order.started...');

        const [event, eventCreated] = await Event.findOrCreate({
            where: { name: 'inspection_order.started' },
            defaults: {
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
                },
                is_active: true,
                trigger_count: 0,
                version: 1
            }
        });

        if (eventCreated) {
            console.log('✅ Evento inspection_order.started creado');
        } else {
            console.log('ℹ️ Evento inspection_order.started ya existe');
        }

        return event;

    } catch (error) {
        console.error('❌ Error creando evento inspection_order.started:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Crear tipo de notificación para SMS de inicio de inspección
 */
const createInspectionStartedNotificationType = async () => {
    try {
        console.log('📋 Creando tipo de notificación inspection_started_client_sms...');

        const [notificationType, typeCreated] = await NotificationType.findOrCreate({
            where: { name: 'inspection_started_client_sms' },
            defaults: {
                name: 'inspection_started_client_sms',
                description: 'SMS al cliente cuando inicia la inspección virtual'
            }
        });

        if (typeCreated) {
            console.log('✅ Tipo de notificación inspection_started_client_sms creado');
        } else {
            console.log('ℹ️ Tipo de notificación inspection_started_client_sms ya existe');
        }

        return notificationType;

    } catch (error) {
        console.error('❌ Error creando tipo de notificación:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Crear plantilla de notificación para SMS
 */
const createInspectionStartedTemplate = async (adminUser) => {
    try {
        console.log('📝 Creando plantilla de notificación SMS...');

        const [notificationTemplate, templateCreated] = await NotificationTemplate.findOrCreate({
            where: { name: 'inspection_started_client_sms' },
            defaults: {
                name: 'inspection_started_client_sms',
                description: 'SMS al cliente cuando inicia la inspección virtual',
                category: 'inspection_order',
                channels: {
                    sms: {
                        subject: 'Inspección Virtual Iniciada',
                        template: '¡Hola! SEGUROS MUNDIAL te informa que te estamos esperando para la inspección virtual, únete a la sesión con el siguiente enlace: {{inspection_order.appointment.session_url}}'
                    }
                },
                variables: [
                    'inspection_order.numero',
                    'inspection_order.nombre_cliente',
                    'inspection_order.celular_cliente',
                    'appointment.session_id',
                    'appointment.scheduled_date',
                    'appointment.scheduled_time',
                    'appointment.session_url',
                    'sede.name'
                ],
                is_active: true,
                created_by: adminUser.id
            }
        });

        if (templateCreated) {
            console.log('✅ Plantilla de notificación SMS creada');
        } else {
            console.log('ℹ️ Plantilla de notificación SMS ya existe');
        }

        return notificationTemplate;

    } catch (error) {
        console.error('❌ Error creando plantilla de notificación:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Crear configuración de notificación para SMS
 */
const createInspectionStartedConfig = async (notificationType, smsChannel, adminUser) => {
    try {
        console.log('⚙️ Creando configuración de notificación SMS...');

        const [notificationConfig, configCreated] = await NotificationConfig.findOrCreate({
            where: {
                notification_type_id: notificationType.id,
                notification_channel_id: smsChannel.id
            },
            defaults: {
                name: 'SMS al Cliente - Inspección Iniciada',
                notification_type_id: notificationType.id,
                notification_channel_id: smsChannel.id,
                template_title: 'Inspección Virtual Iniciada',
                template_content: '¡Hola! SEGUROS MUNDIAL te informa que te estamos esperando para la inspección virtual, únete a la sesión con el siguiente enlace: {{inspection_order.appointment.session_url}}',
                template_variables: {
                    'inspection_order.numero': 'Número de la orden',
                    'inspection_order.nombre_cliente': 'Nombre del cliente',
                    'inspection_order.celular_cliente': 'Celular del cliente',
                    'appointment.session_id': 'ID de la sesión',
                    'appointment.scheduled_date': 'Fecha de la cita',
                    'appointment.scheduled_time': 'Hora de la cita',
                    'appointment.session_url': 'URL de la sesión virtual',
                    'sede.name': 'Nombre de la sede'
                },
                for_clients: true,
                for_users: false,
                target_roles: [],
                trigger_conditions: { is_client: true },
                schedule_type: 'immediate',
                priority: 'high',
                retry_attempts: 3,
                active: true,
                created_by: adminUser.id
            }
        });

        if (configCreated) {
            console.log('✅ Configuración de notificación SMS creada');
        } else {
            console.log('ℹ️ Configuración de notificación SMS ya existe');
        }

        return notificationConfig;

    } catch (error) {
        console.error('❌ Error creando configuración de notificación:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Crear listener para el evento
 */
const createInspectionStartedListener = async (event, notificationType, adminUser) => {
    try {
        console.log('👂 Creando listener para inspection_order.started...');

        const [listener, listenerCreated] = await EventListener.findOrCreate({
            where: {
                event_id: event.id,
                notification_type_id: notificationType.id
            },
            defaults: {
                conditions: { is_client: true },
                priority: 1,
                delay_seconds: 0,
                channels: ['sms'],
                is_active: true,
                execution_count: 0,
                created_by: adminUser.id
            }
        });

        if (listenerCreated) {
            console.log('✅ Listener para inspection_order.started creado');
        } else {
            console.log('ℹ️ Listener para inspection_order.started ya existe');
        }

        return listener;

    } catch (error) {
        console.error('❌ Error creando listener:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Función principal que ejecuta todo el proceso
 */
const addInspectionOrderStarted = async () => {
    try {
        console.log('🎯 Iniciando configuración del evento inspection_order.started...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Buscar usuario administrador
        const adminUser = await User.findOne({ where: { email: 'admin@vmltechnologies.com' } });
        if (!adminUser) {
            console.log('⚠️ Usuario admin no encontrado. Ejecuta primero el seed de usuarios.');
            return;
        }

        // Buscar canal SMS
        const smsChannel = await NotificationChannel.findOne({ where: { name: 'sms' } });
        if (!smsChannel) {
            console.log('⚠️ Canal SMS no encontrado. Ejecuta primero el seed de canales.');
            return;
        }

        // 1. Crear el evento
        const event = await createInspectionOrderStartedEvent();

        // 2. Crear tipo de notificación
        const notificationType = await createInspectionStartedNotificationType();

        // 3. Crear plantilla de notificación
        const notificationTemplate = await createInspectionStartedTemplate(adminUser);

        // 4. Crear configuración de notificación
        const notificationConfig = await createInspectionStartedConfig(notificationType, smsChannel, adminUser);

        // 5. Crear listener para el evento
        const listener = await createInspectionStartedListener(event, notificationType, adminUser);

        console.log('🎉 Evento inspection_order.started configurado correctamente');

        // Cerrar conexión
        await sequelize.close();
        console.log('📴 Conexión a la base de datos cerrada correctamente.');

    } catch (error) {
        console.error('❌ Error en configuración del evento inspection_order.started:', error);
        throw error;
    }
};

export default addInspectionOrderStarted;
export { 
    createInspectionOrderStartedEvent, 
    createInspectionStartedNotificationType, 
    createInspectionStartedTemplate, 
    createInspectionStartedConfig, 
    createInspectionStartedListener 
};
