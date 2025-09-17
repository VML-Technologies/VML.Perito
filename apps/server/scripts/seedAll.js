import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAll = async () => {
    try {
        console.log('🚀 Iniciando proceso completo de seed...');

        // 1. Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // 2. Ejecutar seed de RBAC (roles y permisos)
        console.log('\n📋 Paso 1: Configurando RBAC...');
        const { default: seedRBAC } = await import('./seedRBAC.js');
        await seedRBAC();
        console.log('✅ RBAC configurado correctamente.');

        // 3. Ejecutar seed de estados de órdenes y citas
        console.log('\n📋 Paso 2: Configurando estados de órdenes y citas...');
        const { default: seedNewStates } = await import('./seedNewStates.js');
        await seedNewStates();
        console.log('✅ Estados de órdenes y citas configurados correctamente.');

        // 3. Ejecutar seed de datos básicos (departamentos, ciudades, empresas, sedes)
        console.log('\n📊 Paso 2: Cargando datos básicos...');
        try {
            const { default: seedData } = await import('./seedData.js');
            if (seedData && typeof seedData == 'function') {
                await seedData();
                console.log('✅ Datos básicos cargados correctamente.');
            } else {
                console.log('⚠️  seedData no es una función válida, saltando...');
            }
        } catch (error) {
            console.log('⚠️  No se pudieron cargar datos básicos:', error.message);
        }

        // 4. Configurar sistema de modalidades avanzado (tipos de sede, modalidades, vehículos)
        console.log('\n🎯 Paso 3: Configurando sistema de modalidades avanzado...');
        const { default: seedModalitySystem } = await import('./seedModalitySystem.js');
        await seedModalitySystem();
        console.log('✅ Sistema de modalidades avanzado configurado correctamente.');

        // 5. Crear usuarios (administrador y usuarios con roles)
        console.log('\n👥 Paso 4: Creando usuarios...');
        const { default: seedUsers } = await import('./seedUsers.js');
        await seedUsers();
        console.log('✅ Usuarios creados correctamente.');

        // 6. Ejecutar seed de datos de inspección
        console.log('\n🏭 Paso 5: Cargando datos de inspección...');
        const { default: seedInspectionData } = await import('./seedInspectionData.js');
        await seedInspectionData();
        console.log('✅ Datos de inspección cargados correctamente.');

        // 7. Crear sedes reales con configuración completa
        console.log('\n🏢 Paso 6: Creando sedes reales...');
        const { default: seedRealSedes } = await import('./seedRealSedes.js');
        await seedRealSedes();
        console.log('✅ Sedes reales creadas correctamente.');

        // 8. Configurar disponibilidad de modalidades por sede
        console.log('\n🎯 Paso 7: Configurando disponibilidad de modalidades...');
        const { default: seedSedeModalityAvailability } = await import('./seedSedeModalityAvailability.js');
        await seedSedeModalityAvailability();
        console.log('✅ Disponibilidad de modalidades configurada correctamente.');

        // 9. Configurar sistema de eventos dinámico
        console.log('\n🎯 Paso 8: Configurando sistema de eventos dinámico...');
        const { default: seedEventSystem } = await import('./seedEventSystem.js');
        await seedEventSystem();
        console.log('✅ Sistema de eventos dinámico configurado correctamente.');

        // 10. Configurar plantillas básicas
        console.log('\n📝 Paso 9: Configurando plantillas básicas...');
        const { default: seedTemplates } = await import('./seedTemplates.js');
        await seedTemplates();
        console.log('✅ Plantillas básicas configuradas correctamente.');

        // 11. Configurar plantillas avanzadas específicas
        console.log('\n📝 Paso 10: Configurando plantillas avanzadas...');
        const { default: seedAdvancedTemplates } = await import('./seedAdvancedTemplates.js');
        await seedAdvancedTemplates();
        console.log('✅ Plantillas avanzadas configuradas correctamente.');

        // 12. Configurar configuraciones de canales
        console.log('\n🌐 Paso 11: Configurando configuraciones de canales...');
        const { default: seedChannels } = await import('./seedChannels.js');
        await seedChannels();
        console.log('✅ Configuraciones de canales configuradas correctamente.');

        // 13. Configurar listeners avanzados con condiciones granulares
        console.log('\n🎯 Paso 12: Configurando listeners avanzados...');
        const { default: seedAdvancedListeners } = await import('./seedAdvancedListeners.js');
        await seedAdvancedListeners();
        console.log('✅ Listeners avanzados configurados correctamente.');

        // 13. Configurar sistema de webhooks
        console.log('\n🔗 Paso 13: Configurando sistema de webhooks...');
        const { seedWebhooks } = await import('./seedWebhooks.js');
        await seedWebhooks();
        console.log('✅ Sistema de webhooks configurado correctamente.');

        // 14. Agregar evento inspection_order.started
        console.log('\n🎯 Paso 14: Agregando evento inspection_order.started...');
        const { default: addInspectionOrderStarted } = await import('./addInspectionOrderStarted.js');
        await addInspectionOrderStarted();
        console.log('✅ Evento inspection_order.started configurado correctamente.');

        console.log('\n🎉 ¡Proceso de seed completado exitosamente!');
        console.log('\n📋 Resumen de lo que se creó:');
        console.log('   - Roles: super_admin, admin, manager, user, comercial_mundial, agente_contacto, coordinador_contacto');
        console.log('   - Permisos: CRUD para usuarios, departamentos, ciudades, empresas, sedes, roles, permisos');
        console.log('   - Permisos nuevos: inspection_orders.*, contact_agent.*, coordinador_contacto.*');
        console.log('   - Estados de órdenes de inspección');
        console.log('   - Estados de llamadas');
        console.log('   - Modalidades de inspección: En Sede, A Domicilio, Virtual');
        console.log('   - Sistema de modalidades: Tipos de sede (CDA, Comercial, Soporte)');
        console.log('   - Tipos de vehículos: Livianos, Pesados, Motos');
        console.log('   - Sedes reales: CDA 197, CDA Distrital, CDA PREVITAX (Bogotá)');
        console.log('   - Sedes reales: CDA Cali Norte, CDA Cali Sur (Cali)');
        console.log('   - Sedes administrativas: Comercial y Soporte (Bogotá)');
        console.log('   - Agendamiento: Solo CDAs para inspecciones de asegurabilidad');
        console.log('   - Modalidades: Todas En Sede, CDA Distrital y Cali Norte con las 3 opciones');
        console.log('   - Horarios flexibles con intervalos de 1 hora y capacidad de 5 cupos');
        console.log('   - Configuración de tipos de vehículos por sede');
        console.log('   - Sistema de notificaciones configurado');
        console.log('   - Sistema de eventos dinámico con 13 eventos del sistema');
        console.log('   - Plantillas de notificación: 5 plantillas por defecto');
        console.log('   - Sistema de eventos dinámico: 21 eventos del sistema');
        console.log('   - Plantillas básicas: 2 plantillas del sistema (alertas, mantenimiento)');
        console.log('   - Plantillas avanzadas: 17 plantillas específicas por tipo de notificación');
        console.log('   - Configuraciones de canales: 5 canales configurados (Email, SMS, WhatsApp, In-App, Push)');
        console.log('   - Listeners avanzados: 18 listeners granulares con condiciones específicas y configuraciones integradas');
        console.log('   - Usuario administrador: admin@vmltechnologies.com (contraseña: 123456)');
        console.log('   - Usuario comercial: comercial@vmltechnologies.com (contraseña: 123456)');
        console.log('   - Usuario coordinadora: coordinador_cc@vmltechnologies.com (contraseña: 123456)');
        console.log('   - 5 Agentes de contacto: agente_cc_1@vmltechnologies.com a agente_cc_5@vmltechnologies.com (contraseña: 123456)');

        console.log('\n🔑 Credenciales de acceso principales:');
        console.log('\n👨‍💼 ADMINISTRADOR (Todos los permisos):');
        console.log('   Email: admin@vmltechnologies.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 COMERCIAL MUNDIAL (Crear órdenes de inspección):');
        console.log('   Email: comercial@vmltechnologies.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 COORDINADORA DE CONTACTO (Asignar agentes):');
        console.log('   Email: coordinador_cc@vmltechnologies.com');
        console.log('   Contraseña: 123456');
        console.log('\n👨‍💼 AGENTE DE CONTACT CENTER (Gestionar llamadas):');
        console.log('   Email: agente_cc_1@vmltechnologies.com');
        console.log('   Contraseña: 123456');

    } catch (error) {
        console.error('❌ Error en el proceso de seed:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
};

// Ejecutar si se llama directamente
// if (import.meta.url == `file://${process.argv[1]}`) {
seedAll()
    .then(() => {
        console.log('\n✅ Proceso de seed completado exitosamente');
        // Cerrar la conexión después de un pequeño delay
        setTimeout(async () => {
            try {
                await sequelize.close();
                console.log('📴 Conexión a la base de datos cerrada correctamente.');
                process.exit(0);
            } catch (closeError) {
                console.error('⚠️ Error al cerrar la conexión:', closeError.message);
                process.exit(1);
            }
        }, 2000);
    })
    .catch((error) => {
        console.error('❌ Error fatal en seedAll:', error);
        sequelize.close().then(() => process.exit(1));
    });
// }

export default seedAll; 