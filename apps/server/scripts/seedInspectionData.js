import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import CallStatus from '../models/callStatus.js';
import InspectionModality from '../models/inspectionModality.js';
import NotificationChannel from '../models/notificationChannel.js';
import NotificationType from '../models/notificationType.js';
import NotificationConfig from '../models/notificationConfig.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

const seedInspectionData = async () => {
    try {
        console.log('🏭 Iniciando seed de datos de inspección...');

        // ===== ESTADOS DE ÓRDENES DE INSPECCIÓN =====
        const inspectionStatuses = [
            {
                name: 'Creada',
                description: 'Orden de inspección creada, pendiente de contacto'
            },
            {
                name: 'En proceso de agendamiento',
                description: 'Se inicio proceso de contacto con el cliente'
            },
            {
                name: 'Agendado',
                description: 'Inspección agendada con fecha y hora'
            },
            {
                name: 'Inspeccion en curso',
                description: 'Inspección en proceso'
            },
            {
                name: 'Finalizado',
                description: 'Inspección completada'
            }
        ];

        console.log('📋 Creando estados de órdenes de inspección...');
        const createdStatuses = [];
        for (const statusData of inspectionStatuses) {
            const [status, created] = await InspectionOrderStatus.findOrCreate({
                where: { name: statusData.name },
                defaults: statusData
            });
            createdStatuses.push(status);
            if (created) {
                console.log(`✅ Estado creado: ${status.name}`);
            } else {
                console.log(`ℹ️ Estado ya existe: ${status.name}`);
            }
        }

        // ===== ESTADOS DE LLAMADAS =====
        const callStatuses = [
            {
                name: 'Contacto exitoso',
                creates_schedule: true
            },
            {
                name: 'Agendado',
                creates_schedule: true
            },
            {
                name: 'No contesta',
                creates_schedule: false
            },
            {
                name: 'Ocupado',
                creates_schedule: false
            },
            {
                name: 'Número incorrecto',
                creates_schedule: false
            },
            {
                name: 'Solicita reagendar',
                creates_schedule: false
            }
        ];

        console.log('📞 Creando estados de llamadas...');
        const createdCallStatuses = [];
        for (const statusData of callStatuses) {
            const [status, created] = await CallStatus.findOrCreate({
                where: { name: statusData.name },
                defaults: statusData
            });
            createdCallStatuses.push(status);
            if (created) {
                console.log(`✅ Estado de llamada creado: ${status.name}`);
            } else {
                console.log(`ℹ️ Estado de llamada ya existe: ${status.name}`);
            }
        }

        // ===== MODALIDADES DE INSPECCIÓN =====
        const inspectionModalities = [
            {
                name: 'En Sede',
                description: 'Inspección realizada en las instalaciones de la empresa',
                code: 'SEDE',
                active: true
            },
            {
                name: 'A Domicilio',
                description: 'Inspección realizada en el domicilio del cliente',
                code: 'DOMICILIO',
                active: true
            },
            {
                name: 'Virtual',
                description: 'Inspección realizada de forma virtual',
                code: 'VIRTUAL',
                active: true
            }
        ];

        console.log('🔍 Creando modalidades de inspección...');
        const createdModalities = [];
        for (const modalityData of inspectionModalities) {
            const [modality, created] = await InspectionModality.findOrCreate({
                where: { code: modalityData.code },
                defaults: modalityData
            });
            createdModalities.push(modality);
            if (created) {
                console.log(`✅ Modalidad creada: ${modality.name}`);
            } else {
                console.log(`ℹ️ Modalidad ya existe: ${modality.name}`);
            }
        }

        // ===== CANALES DE NOTIFICACIÓN =====
        const notificationChannels = [
            {
                name: 'sistema',
                description: 'Notificaciones del sistema interno',
                active: true
            },
            {
                name: 'in_app',
                description: 'Notificaciones dentro de la aplicación',
                active: true
            },
            {
                name: 'email',
                description: 'Notificaciones por correo electrónico',
                active: true
            },
            {
                name: 'sms',
                description: 'Notificaciones por SMS',
                active: true
            },
            {
                name: 'whatsapp',
                description: 'Notificaciones por WhatsApp',
                active: true
            },
            {
                name: 'push',
                description: 'Notificaciones push del navegador',
                active: true
            }
        ];

        console.log('📱 Creando canales de notificación...');
        const createdChannels = [];
        for (const channelData of notificationChannels) {
            const [channel, created] = await NotificationChannel.findOrCreate({
                where: { name: channelData.name },
                defaults: channelData
            });
            createdChannels.push(channel);
            if (created) {
                console.log(`✅ Canal de notificación creado: ${channel.name}`);
            } else {
                console.log(`ℹ️ Canal de notificación ya existe: ${channel.name}`);
            }
        }

        // ===== TIPOS DE NOTIFICACIÓN =====
        const notificationTypes = [
            // Tipos existentes (removido order_created - se maneja en seedAdvancedListeners.js)
            {
                name: 'call_made',
                description: 'Llamada realizada'
            },
            {
                name: 'appointment_scheduled',
                description: 'Agendamiento realizado'
            },
            {
                name: 'inspection_completed',
                description: 'Inspección completada'
            },
            {
                name: 'status_updated',
                description: 'Estado de orden actualizado'
            },
            {
                name: 'asignacion_orden',
                description: 'Asignación de orden a agente'
            },

            // Nuevos tipos específicos para clientes (SMS)
            {
                name: 'inspection_confirmation',
                description: 'Confirmación de agendamiento de inspección'
            },
            {
                name: 'inspection_reminder',
                description: 'Recordatorio de agendamiento de inspección (Día anterior)'
            },
            {
                name: 'virtual_inspection_start',
                description: 'Inspección Virtual - Inspector inicia proceso'
            },
            {
                name: 'inspection_no_show',
                description: 'No presentación a la Inspección'
            },

            // Nuevos tipos específicos para usuario comercial (Email)
            {
                name: 'inspection_completed_commercial',
                description: 'Finalización de inspección - Usuario Comercial'
            },
            {
                name: 're_communication_attempt',
                description: 'Re Comunicación con el Usuario - 3 intentos fallidos'
            },
            {
                name: 'user_declined_scheduling',
                description: 'Comunicación cuando usuario decide NO agendar'
            },

            // Tipos para AutomatedEventTriggers
            {
                name: 'user_welcome',
                description: 'Bienvenida de usuario nuevo'
            },
            {
                name: 'appointment_confirmation',
                description: 'Confirmación de cita programada'
            },
            {
                name: 'appointment_reminder',
                description: 'Recordatorio de cita próxima'
            }
        ];

        console.log('📮 Creando tipos de notificación...');
        const createdNotificationTypes = [];
        for (const typeData of notificationTypes) {
            const [type, created] = await NotificationType.findOrCreate({
                where: { name: typeData.name },
                defaults: typeData
            });
            createdNotificationTypes.push(type);
            if (created) {
                console.log(`✅ Tipo de notificación creado: ${type.name}`);
            } else {
                console.log(`ℹ️ Tipo de notificación ya existe: ${type.name}`);
            }
        }

        // ===== CONFIGURACIONES DE NOTIFICACIÓN =====
        const notificationConfigs = [
            // Notificaciones para usuarios (existentes)
            {
                name: 'Llamada realizada - Notificación interna',
                notification_type: 'call_made',
                notification_channel: 'in_app',
                template_title: 'Llamada realizada',
                template_content: 'Se ha registrado una llamada para la orden #{numero}',
                for_clients: false,
                for_users: true,
                active: true
            },
            {
                name: 'Agendamiento realizado - Notificación interna',
                notification_type: 'appointment_scheduled',
                notification_channel: 'in_app',
                template_title: 'Agendamiento realizado',
                template_content: 'Se ha agendado una inspección para la orden #{numero}',
                for_clients: false,
                for_users: true,
                active: true
            },
            {
                name: 'Asignación de orden - Sistema',
                notification_type: 'asignacion_orden',
                notification_channel: 'sistema',
                template_title: 'Orden Asignada',
                template_content: 'Te han asignado una nueva orden de inspección #{numero}',
                for_clients: false,
                for_users: true,
                active: true
            },

            // ===== NOTIFICACIONES PARA CLIENTES =====

            // Confirmación de agendamiento - SMS
            {
                name: 'Confirmación de Agendamiento - SMS',
                notification_type: 'inspection_confirmation',
                notification_channel: 'sms',
                template_title: 'Confirmación de Inspección',
                template_content: 'Hola {{inspection_order.nombre_cliente}}, tu agendamiento para la Inspeccion de Asegurabilidad ha sido confirmada para el dia {{appointment.date}} a las {{appointment.time}} en el {{appointment.location}}',
                for_clients: true,
                for_users: false,
                active: true
            },

            // Confirmación de agendamiento - Email (nuevo)
            {
                name: 'Confirmación de Agendamiento - Email',
                notification_type: 'inspection_confirmation',
                notification_channel: 'email',
                template_title: 'Confirmación de Inspección - {{inspection_order.numero}}',
                template_content: `
Hola {{inspection_order.nombre_cliente}},

Tu agendamiento para la Inspección de Asegurabilidad ha sido confirmado.

Detalles del agendamiento:
- Fecha: {{appointment.date}}
- Hora: {{appointment.time}}
- Ubicación: {{appointment.location}}
- Número de orden: {{inspection_order.numero}}
- Vehículo: {{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}
- Placa: {{inspection_order.placa}}

Por favor, llega 10 minutos antes de la hora programada.

Saludos,
Equipo Movilidad Mundial
                `.trim(),
                for_clients: true,
                for_users: false,
                active: true
            },

            // Recordatorio de inspección - SMS
            {
                name: 'Recordatorio de Inspección - SMS',
                notification_type: 'inspection_reminder',
                notification_channel: 'sms',
                template_title: 'Recordatorio de Inspección',
                template_content: 'Hola {{inspection_order.nombre_cliente}}, recuerda que el dia de mañana tendras tu inspección de Asegurabilidad a las {{appointment.time}} en el {{appointment.location}}, te esperamos',
                for_clients: true,
                for_users: false,
                active: true
            },

            // Inicio de inspección virtual - SMS
            {
                name: 'Inicio de Inspección Virtual - SMS',
                notification_type: 'virtual_inspection_start',
                notification_channel: 'sms',
                template_title: 'Inspección Virtual Iniciada',
                template_content: 'Hola {{inspection_order.nombre_cliente}}, te recordamos que el Inspector {{inspector.name}} lo esta esperando en este momento, recuerda que puedes unirte a la sesion con el enlace {{meeting.link}}',
                for_clients: true,
                for_users: false,
                active: true
            },

            // No presentación a inspección - SMS
            {
                name: 'No Presentación a Inspección - SMS',
                notification_type: 'inspection_no_show',
                notification_channel: 'sms',
                template_title: 'No Presentación a Inspección',
                template_content: 'Hola {{inspection_order.nombre_cliente}} vemos que no pudiste realizar tu inspección el dia {{appointment.date}} a las {{appointment.time}}, nos comunicaremos contigo para buscar un nuevo agendamiento que se acople a ti',
                for_clients: true,
                for_users: false,
                active: true
            },

            // ===== NOTIFICACIONES PARA USUARIO COMERCIAL =====

            // Finalización de inspección - Email comercial
            {
                name: 'Finalización de Inspección - Comercial',
                notification_type: 'inspection_completed_commercial',
                notification_channel: 'email',
                template_title: 'Inspección Completada - {{inspection_order.numero}}',
                template_content: `
Hola {{commercial_user.name}},

La inspección de asegurabilidad para la orden {{inspection_order.numero}} ha sido completada.

Detalles de la inspección:
- Número de orden: {{inspection_order.numero}}
- Cliente: {{inspection_order.nombre_cliente}}
- Vehículo: {{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}
- Placa: {{inspection_order.placa}}
- Fecha de inspección: {{inspection_order.fecha}}
- Resultado: {{inspection_result.status}}

{{#if inspection_result.details}}
Detalles adicionales:
{{inspection_result.details}}
{{/if}}

Saludos,
Equipo Movilidad Mundial
                `.trim(),
                for_clients: false,
                for_users: true,
                active: true
            },

            // Re comunicación con usuario - Email comercial
            {
                name: 'Re Comunicación con Usuario - Comercial',
                notification_type: 're_communication_attempt',
                notification_channel: 'email',
                template_title: 'Re Comunicación Requerida - {{inspection_order.numero}}',
                template_content: `
Hola {{commercial_user.name}},

Se han realizado tres intentos de contacto con el cliente de la orden {{inspection_order.numero}} sin éxito.

Detalles del cliente:
- Nombre: {{inspection_order.nombre_cliente}}
- Teléfono: {{inspection_order.celular_cliente}}
- Email: {{inspection_order.correo_cliente}}
- Vehículo: {{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.placa}}

Por favor, realiza un seguimiento directo con el cliente para coordinar el agendamiento de la inspección.

Saludos,
Equipo Movilidad Mundial
                `.trim(),
                for_clients: false,
                for_users: true,
                active: true
            },

            // Usuario rechaza agendamiento - Email comercial
            {
                name: 'Usuario Rechaza Agendamiento - Comercial',
                notification_type: 'user_declined_scheduling',
                notification_channel: 'email',
                template_title: 'Cliente Rechaza Agendamiento - {{inspection_order.numero}}',
                template_content: `
Hola {{commercial_user.name}},

El cliente de la orden {{inspection_order.numero}} ha decidido NO proceder con el agendamiento de la inspección.

Detalles del cliente:
- Nombre: {{inspection_order.nombre_cliente}}
- Teléfono: {{inspection_order.celular_cliente}}
- Email: {{inspection_order.correo_cliente}}
- Vehículo: {{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.placa}}

Motivo del rechazo: {{rejection_reason}}

Por favor, realiza un seguimiento para entender las razones y evaluar alternativas.

Saludos,
Equipo Movilidad Mundial
                `.trim(),
                for_clients: false,
                for_users: true,
                active: true
            }
        ];

        console.log('⚙️ Creando configuraciones de notificación...');
        for (const configData of notificationConfigs) {
            const notificationType = createdNotificationTypes.find(t => t.name == configData.notification_type);
            const notificationChannel = createdChannels.find(c => c.name == configData.notification_channel);

            if (notificationType && notificationChannel) {
                const [config, created] = await NotificationConfig.findOrCreate({
                    where: {
                        notification_type_id: notificationType.id,
                        notification_channel_id: notificationChannel.id
                    },
                    defaults: {
                        name: configData.name,
                        notification_type_id: notificationType.id,
                        notification_channel_id: notificationChannel.id,
                        template_title: configData.template_title,
                        template_content: configData.template_content,
                        for_clients: configData.for_clients,
                        for_users: configData.for_users,
                        active: configData.active
                    }
                });

                if (created) {
                    console.log(`✅ Configuración creada: ${configData.template_title}`);
                } else {
                    console.log(`ℹ️ Configuración ya existe: ${configData.template_title}`);
                }
            }
        }

        console.log('🎉 Seed de datos de inspección completado exitosamente!');
        console.log(`📊 Resumen:`);
        console.log(`   - Estados de órdenes: ${createdStatuses.length}`);
        console.log(`   - Estados de llamadas: ${createdCallStatuses.length}`);
        console.log(`   - Modalidades de inspección: ${createdModalities.length}`);
        console.log(`   - Canales de notificación: ${createdChannels.length}`);
        console.log(`   - Tipos de notificación: ${createdNotificationTypes.length}`);
        console.log(`   - Configuraciones de notificación: ${notificationConfigs.length}`);

        console.log('\n📋 Tipos de notificación configurados:');
        console.log('   Clientes (SMS + Email):');
        console.log('   - Confirmación de agendamiento (SMS + Email)');
        console.log('   - Recordatorio de inspección (SMS)');
        console.log('   - Inicio de inspección virtual (SMS)');
        console.log('   - No presentación a inspección (SMS)');
        console.log('   Usuario Comercial (Email):');
        console.log('   - Finalización de inspección');
        console.log('   - Re comunicación después de 3 intentos');
        console.log('   - Usuario rechaza agendamiento');

    } catch (error) {
        console.error('❌ Error en seed de datos de inspección:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (import.meta.url == `file://${process.argv[1]}`) {
    seedInspectionData()
        .then(() => {
            console.log('✅ Seed de datos de inspección completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default seedInspectionData; 