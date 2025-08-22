import WebhookApiKey from '../models/webhookApiKey.js';
import User from '../models/user.js';
import sequelize from '../config/database.js';

/**
 * Generar string aleatorio
 */
const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generar API key con formato estándar
 */
const generateApiKey = () => {
    return `wh_live_sk_${generateRandomString(32)}`;
};

/**
 * Generar API secret
 */
const generateApiSecret = () => {
    return generateRandomString(64);
};

/**
 * Crear datos de prueba para webhooks
 */
export const seedWebhooks = async () => {
    try {
        console.log('🔗 Iniciando seeding de webhooks...');

        // Obtener usuario admin para asignar como creador
        const adminUser = await User.findOne({
            where: { email: 'admin@vmlperito.com' }
        });

        if (!adminUser) {
            console.warn('⚠️ Usuario admin no encontrado, usando ID 1');
        }

        const createdBy = adminUser?.id || 1;

        // Datos de prueba para API keys
        const webhookApiKeys = [
            {
                name: 'Sistema CRM Comercial',
                api_key: generateApiKey(),
                api_secret: generateApiSecret(),
                application_name: 'crm-comercial',
                contact_email: 'admin@empresa.com',
                allowed_events: [
                    'inspection_order.created',
                    'inspection_order.assigned',
                    'inspection_order.started',
                    'appointment.scheduled'
                ],
                allowed_ips: ['192.168.1.100', '10.0.0.50', '192.168.20.6'],
                rate_limit_per_minute: 100,
                is_active: true,
                expires_at: new Date('2025-12-31T23:59:59Z'),
                created_by: createdBy
            },
            {
                name: 'Sistema de Agendamiento',
                api_key: generateApiKey(),
                api_secret: generateApiSecret(),
                application_name: 'sistema-agendamiento',
                contact_email: 'agendamiento@empresa.com',
                allowed_events: [
                    'appointment.scheduled',
                    'appointment.cancelled'
                ],
                allowed_ips: ['192.168.20.6'],
                rate_limit_per_minute: 200,
                is_active: true,
                expires_at: null,
                created_by: createdBy
            },
            {
                name: 'Integración Externa',
                api_key: generateApiKey(),
                api_secret: generateApiSecret(),
                application_name: 'integracion-externa',
                contact_email: 'integracion@empresa.com',
                allowed_events: [
                    'inspection_order.created',
                    'inspection_order.assigned',
                    'inspection_order.started',
                    'inspection_order.completed',
                    'appointment.scheduled',
                    'appointment.cancelled'
                ],
                allowed_ips: ['203.0.113.0/24','192.168.20.6'],
                rate_limit_per_minute: 50,
                is_active: true,
                expires_at: new Date('2024-06-30T23:59:59Z'),
                created_by: createdBy
            },
            {
                name: 'API de Pruebas',
                api_key: generateApiKey(),
                api_secret: generateApiSecret(),
                application_name: 'api-pruebas',
                contact_email: 'pruebas@vmlperito.com',
                allowed_events: [
                    'inspection_order.created',
                    'inspection_order.started',
                    'appointment.scheduled'
                ],
                allowed_ips: ['192.168.20.6'],
                rate_limit_per_minute: 1000,
                is_active: true,
                expires_at: null,
                created_by: createdBy
            }
        ];

        // Crear API keys
        const createdApiKeys = [];
        for (const apiKeyData of webhookApiKeys) {
            const existingApiKey = await WebhookApiKey.findOne({
                where: { application_name: apiKeyData.application_name }
            });

            if (existingApiKey) {
                console.log(`⚠️ API Key ya existe para: ${apiKeyData.application_name}`);
                createdApiKeys.push(existingApiKey);
            } else {
                const newApiKey = await WebhookApiKey.create(apiKeyData);
                console.log(`✅ API Key creada: ${newApiKey.application_name}`);
                createdApiKeys.push(newApiKey);
            }
        }

        console.log(`🎯 Seeding de webhooks completado. ${createdApiKeys.length} API keys creadas/verificadas.`);

        // Mostrar información de las API keys creadas
        console.log('\n📋 API Keys disponibles para pruebas:');
        console.log('=====================================');
        
        for (const apiKey of createdApiKeys) {
            console.log(`\n🔑 ${apiKey.name}`);
            console.log(`   Aplicación: ${apiKey.application_name}`);
            console.log(`   API Key: ${apiKey.api_key}`);
            console.log(`   API Secret: ${apiKey.api_secret}`);
            const allowedEvents = Array.isArray(apiKey.allowed_events) 
                ? apiKey.allowed_events 
                : (typeof apiKey.allowed_events === 'string' 
                    ? JSON.parse(apiKey.allowed_events) 
                    : apiKey.allowed_events || []);
            console.log(`   Eventos permitidos: ${allowedEvents.join(', ')}`);
            console.log(`   Rate limit: ${apiKey.rate_limit_per_minute}/min`);
            console.log(`   Estado: ${apiKey.is_active ? '✅ Activo' : '❌ Inactivo'}`);
            if (apiKey.expires_at) {
                console.log(`   Expira: ${apiKey.expires_at.toISOString()}`);
            }
        }

        console.log('\n🚀 Ejemplo de uso:');
        console.log('==================');
        console.log(`
# Crear orden de inspección
curl -X POST http://localhost:3001/api/webhooks/events \\
  -H "Authorization: Bearer ${createdApiKeys[0].api_key}" \\
  -H "X-Webhook-Signature: t=1640995200,v1=sha256hash" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "inspection_order.created",
    "data": {
      "inspection_order": {
        "numero": "ORD-WEBHOOK-001",
        "nombre_cliente": "Juan Pérez",
        "telefono_cliente": "+57 300 123 4567",
        "email_cliente": "juan.perez@email.com",
        "placa": "ABC123",
        "tipo_vehiculo_id": 1,
        "modalidad_inspeccion_id": 1,
        "sede_id": 5,
        "comercial_id": 15
      }
    },
    "context": {
      "source_system": "crm-comercial",
      "source_user_id": "user_123"
    }
  }'
        `);

        return createdApiKeys;

    } catch (error) {
        console.error('❌ Error en seeding de webhooks:', error);
        throw error;
    }
};

/**
 * Ejecutar seeding si se llama directamente
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida.');
        
        await seedWebhooks();
        
        console.log('🎉 Seeding de webhooks completado exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando seeding de webhooks:', error);
        process.exit(1);
    }
}
