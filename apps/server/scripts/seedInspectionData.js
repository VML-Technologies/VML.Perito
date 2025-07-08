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
                name: 'Contacto exitoso',
                description: 'Se logró contactar al cliente exitosamente'
            },
            {
                name: 'Agendado',
                description: 'Inspección agendada con fecha y hora'
            },
            {
                name: 'No contesta',
                description: 'Cliente no contesta las llamadas'
            },
            {
                name: 'Ocupado',
                description: 'Cliente ocupado, reagendar llamada'
            },
            {
                name: 'Número incorrecto',
                description: 'Número de teléfono incorrecto'
            },
            {
                name: 'Solicita reagendar',
                description: 'Cliente solicita reagendar la llamada'
            },
            {
                name: 'En progreso',
                description: 'Inspección en progreso'
            },
            {
                name: 'Finalizada',
                description: 'Inspección completada'
            },
            {
                name: 'Cancelada',
                description: 'Orden cancelada'
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
            {
                name: 'order_created',
                description: 'Orden de inspección creada'
            },
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
            // Notificaciones para usuarios
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
            // Notificaciones para clientes
            {
                name: 'Inspección agendada - SMS cliente',
                notification_type: 'appointment_scheduled',
                notification_channel: 'sms',
                template_title: 'Inspección Agendada',
                template_content: 'Su inspección ha sido agendada para el {fecha} a las {hora}. Orden: #{numero}',
                for_clients: true,
                for_users: false,
                active: true
            }
        ];

        console.log('⚙️ Creando configuraciones de notificación...');
        for (const configData of notificationConfigs) {
            const notificationType = createdNotificationTypes.find(t => t.name === configData.notification_type);
            const notificationChannel = createdChannels.find(c => c.name === configData.notification_channel);

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

    } catch (error) {
        console.error('❌ Error en seed de datos de inspección:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
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