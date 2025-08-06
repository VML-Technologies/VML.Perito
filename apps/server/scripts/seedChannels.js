import { ChannelConfig } from '../models/index.js';

/**
 * Script para crear configuraciones de canales por defecto
 */
const seedChannels = async () => {
    console.log('🌐 Iniciando seeding de configuraciones de canales...');

    try {
        // Configuraciones de canales por defecto
        const defaultChannels = [
            {
                channel_name: 'email',
                display_name: 'Email',
                description: 'Canal de correo electrónico usando SMTP',
                is_active: true,
                config: {
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true' || false,
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || '',
                    from: process.env.SMTP_FROM || 'noreply@vmltechnologies.com',
                    test_email: process.env.SMTP_TEST_EMAIL || 'test@example.com'
                },
                template_config: {
                    fields: ['subject', 'body', 'html'],
                    max_subject_length: 100,
                    max_body_length: 10000
                },
                rate_limit: 100,
                priority: 1,
                max_retries: 3,
                retry_delay: 60,
                timeout: 30,
                metadata: {
                    provider: 'SMTP',
                    supports_html: true,
                    supports_attachments: true
                }
            },
            {
                channel_name: 'sms',
                display_name: 'SMS',
                description: 'Canal de mensajes de texto usando Hablame.co',
                is_active: true,
                config: {
                    api_key: process.env.SMS_API_KEY || '',
                    from: process.env.SMS_FROM || 'VMLPerito',
                    test_phone: process.env.SMS_TEST_PHONE || '+573001234567'
                },
                template_config: {
                    fields: ['message'],
                    max_message_length: 160,
                    supports_unicode: true
                },
                rate_limit: 50,
                priority: 2,
                max_retries: 3,
                retry_delay: 30,
                timeout: 15,
                metadata: {
                    provider: 'Hablame.co',
                    supports_unicode: true,
                    delivery_reports: true
                }
            },
            {
                channel_name: 'whatsapp',
                display_name: 'WhatsApp',
                description: 'Canal de WhatsApp Business API',
                is_active: false, // Desactivado por defecto hasta configurar
                config: {
                    api_key: process.env.WHATSAPP_API_KEY || '',
                    phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
                    business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
                    test_phone: process.env.WHATSAPP_TEST_PHONE || '+573001234567'
                },
                template_config: {
                    fields: ['message'],
                    max_message_length: 1000,
                    supports_media: true
                },
                rate_limit: 20,
                priority: 3,
                max_retries: 3,
                retry_delay: 60,
                timeout: 30,
                metadata: {
                    provider: 'WhatsApp Business API',
                    supports_media: true,
                    supports_templates: true
                }
            },
            {
                channel_name: 'in_app',
                display_name: 'In-App',
                description: 'Notificaciones internas de la aplicación',
                is_active: true,
                config: {
                    websocket_url: process.env.WEBSOCKET_URL || 'ws://localhost:3000',
                    broadcast_enabled: true
                },
                template_config: {
                    fields: ['title', 'message', 'data'],
                    max_title_length: 100,
                    max_message_length: 500
                },
                rate_limit: 1000,
                priority: 4,
                max_retries: 1,
                retry_delay: 5,
                timeout: 10,
                metadata: {
                    provider: 'WebSocket',
                    real_time: true,
                    supports_rich_content: true
                }
            },
            {
                channel_name: 'push',
                display_name: 'Push',
                description: 'Notificaciones push del navegador',
                is_active: false, // Desactivado por defecto hasta configurar VAPID
                config: {
                    vapid_public_key: process.env.VAPID_PUBLIC_KEY || '',
                    vapid_private_key: process.env.VAPID_PRIVATE_KEY || '',
                    vapid_subject: process.env.VAPID_SUBJECT || 'mailto:noreply@vmltechnologies.com'
                },
                template_config: {
                    fields: ['title', 'body', 'icon', 'data'],
                    max_title_length: 50,
                    max_body_length: 200
                },
                rate_limit: 100,
                priority: 5,
                max_retries: 2,
                retry_delay: 30,
                timeout: 20,
                metadata: {
                    provider: 'Web Push',
                    supports_actions: true,
                    supports_badges: true
                }
            }
        ];

        // Crear o actualizar configuraciones de canales
        for (const channelData of defaultChannels) {
            const [channel, created] = await ChannelConfig.findOrCreate({
                where: { channel_name: channelData.channel_name },
                defaults: channelData
            });

            if (!created) {
                // Actualizar configuración existente solo si es necesario
                await channel.update(channelData);
                console.log(`🔄 Configuración de canal actualizada: ${channelData.display_name}`);
            } else {
                console.log(`✅ Configuración de canal creada: ${channelData.display_name}`);
            }
        }

        console.log('✅ Seeding de configuraciones de canales completado exitosamente');

        // Mostrar resumen
        const totalChannels = await ChannelConfig.count();
        const activeChannels = await ChannelConfig.count({ where: { is_active: true } });

        console.log(`📊 Resumen de canales:`);
        console.log(`   - Total: ${totalChannels}`);
        console.log(`   - Activos: ${activeChannels}`);
        console.log(`   - Inactivos: ${totalChannels - activeChannels}`);

    } catch (error) {
        console.error('❌ Error en el seeding de configuraciones de canales:', error);
        throw error;
    }
};

export default seedChannels; 