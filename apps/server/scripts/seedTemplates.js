import NotificationTemplate from '../models/notificationTemplate.js';
import User from '../models/user.js';

/**
 * Seeder básico para plantillas esenciales del sistema
 * Las plantillas específicas se manejan en seedAdvancedTemplates.js
 */
const seedTemplates = async () => {
    try {
        console.log('📝 Configurando plantillas básicas...');

        const adminUser = await User.findOne({ where: { email: 'admin@vmltechnologies.com' } });
        if (!adminUser) {
            console.log('⚠️ Usuario admin no encontrado, saltando seeding de plantillas');
            return;
        }

        // Solo plantillas básicas que no conflictúen con las avanzadas
        const basicTemplates = [
            {
                name: 'system_alert',
                description: 'Plantilla para alertas del sistema',
                category: 'system',
                channels: {
                    email: {
                        subject: 'Alerta del Sistema - {{alert.title}}',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #dc3545; color: white; padding: 25px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">⚠️ Alerta del Sistema</h1>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">{{alert.title}}</h2>
                                    <p style="color: #555; line-height: 1.6;">{{alert.message}}</p>
                                    
                                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <p style="color: #333; margin: 0;"><strong>Fecha:</strong> {{alert.timestamp}}</p>
                                        <p style="color: #333; margin: 10px 0 0 0;"><strong>Prioridad:</strong> {{alert.priority}}</p>
                                    </div>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">VML Perito - Sistema de Inspecciones Automotrices</p>
                                </div>
                            </div>
                        `,
                        variables: ['alert.title', 'alert.message', 'alert.timestamp', 'alert.priority']
                    }
                },
                variables: ['alert.title', 'alert.message', 'alert.timestamp', 'alert.priority'],
                is_active: true,
                created_by: adminUser.id
            },
            {
                name: 'maintenance_notice',
                description: 'Plantilla para avisos de mantenimiento',
                category: 'system',
                channels: {
                    email: {
                        subject: 'Aviso de Mantenimiento - {{maintenance.title}}',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #ffc107; color: #333; padding: 25px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">🔧 Mantenimiento Programado</h1>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">{{maintenance.title}}</h2>
                                    <p style="color: #555; line-height: 1.6;">{{maintenance.description}}</p>
                                    
                                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <p style="color: #333; margin: 0;"><strong>Fecha:</strong> {{maintenance.date}}</p>
                                        <p style="color: #333; margin: 10px 0 0 0;"><strong>Duración:</strong> {{maintenance.duration}}</p>
                                        <p style="color: #333; margin: 10px 0 0 0;"><strong>Servicios afectados:</strong> {{maintenance.affected_services}}</p>
                                    </div>
                                    
                                    <p style="color: #555; line-height: 1.6;">
                                        Disculpe las molestias. El sistema estará disponible nuevamente después del mantenimiento.
                                    </p>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">VML Perito - Sistema de Inspecciones Automotrices</p>
                                </div>
                            </div>
                        `,
                        variables: ['maintenance.title', 'maintenance.description', 'maintenance.date', 'maintenance.duration', 'maintenance.affected_services']
                    }
                },
                variables: ['maintenance.title', 'maintenance.description', 'maintenance.date', 'maintenance.duration', 'maintenance.affected_services'],
                is_active: true,
                created_by: adminUser.id
            }
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const templateData of basicTemplates) {
            try {
                const [template, created] = await NotificationTemplate.findOrCreate({
                    where: { name: templateData.name },
                    defaults: templateData
                });

                if (created) {
                    console.log(`✅ Plantilla básica creada: ${templateData.name}`);
                    createdCount++;
                } else {
                    console.log(`⚠️ Plantilla básica ya existe: ${templateData.name}`);
                    skippedCount++;
                }

            } catch (error) {
                console.error(`❌ Error procesando plantilla básica ${templateData.name}:`, error.message);
            }
        }

        console.log(`\n📝 Plantillas básicas configuradas:`);
        console.log(`   - ${createdCount} plantillas creadas`);
        console.log(`   - ${skippedCount} plantillas existentes`);

        // Mostrar estadísticas
        const totalTemplates = await NotificationTemplate.count();
        console.log(`📈 Total de plantillas en BD: ${totalTemplates}`);

    } catch (error) {
        console.error('❌ Error configurando plantillas básicas:', error);
        throw error;
    }
};

export default seedTemplates; 