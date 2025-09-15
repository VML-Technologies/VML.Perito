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
                name: 'InspectYa',
                api_key: generateApiKey(),
                api_secret: generateApiSecret(),
                application_name: 'InspectYa',
                contact_email: 'admin@empresa.com',
                allowed_events: [
                    'inspection_order.started'
                ],
                allowed_ips: ['*'],
                rate_limit_per_minute: 1000,
                is_active: true,
                expires_at: null,
                created_by: createdBy
            },
            {
                name: 'API-MovilidadMundial',
                api_key: generateApiKey(),
                api_secret: generateApiSecret(),
                application_name: 'API-MovilidadMundial',
                contact_email: 'admin@movilidadmundial.com',
                allowed_events: [
                    'inspection_order.process_existing',
                    'inspection_order.created',
                    'inspection_order.assigned',
                    'appointment.scheduled'
                ],
                allowed_ips: ['*'],
                rate_limit_per_minute: 2000,
                is_active: true,
                expires_at: null,
                created_by: createdBy
            },
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

        console.log('\n🚀 Ejemplos de uso:');
        console.log('==================');
        
        // Ejemplo para API-MovilidadMundial
        const movilidadMundialKey = createdApiKeys.find(key => key.application_name === 'API-MovilidadMundial');
        if (movilidadMundialKey) {
            console.log(`
# Procesar orden de inspección existente (API-MovilidadMundial)
curl -X POST http://localhost:3000/api/webhooks/trigger \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${movilidadMundialKey.api_key}" \\
  -d '{
    "event": "inspection_order.process_existing",
    "data": {
      "inspection_order_id": 123
    },
    "context": {
      "source": "API-MovilidadMundial",
      "user_id": 456
    }
  }'
            `);
        }
        
        // Ejemplo para InspectYa
        const inspectYaKey = createdApiKeys.find(key => key.application_name === 'InspectYa');
        if (inspectYaKey) {
            console.log(`
# Crear orden de inspección (InspectYa)
curl -X POST http://localhost:3000/api/webhooks/trigger \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${inspectYaKey.api_key}" \\
  -d '{
    "event": "inspection_order.created",
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
        }

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
