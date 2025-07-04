import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import seedRBAC from './seedRBAC.js';
import createAdminUser from './seedUser.js';
import seedInspectionData from './seedInspectionData.js';
import seedUsers from './seedUsers.js';

dotenv.config();

const seedAll = async () => {
    try {
        console.log('🚀 Iniciando proceso completo de seed...');

        // 1. Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // 2. Ejecutar seed de RBAC (roles y permisos)
        console.log('\n📋 Paso 1: Configurando RBAC...');
        await seedRBAC();
        console.log('✅ RBAC configurado correctamente.');

        // 3. Crear usuario administrador
        console.log('\n👤 Paso 2: Creando usuario administrador...');
        await createAdminUser();
        console.log('✅ Usuario administrador creado correctamente.');

        // 4. Ejecutar seed de datos de inspección
        console.log('\n🏭 Paso 3: Cargando datos de inspección...');
        await seedInspectionData();
        console.log('✅ Datos de inspección cargados correctamente.');

        // 5. Crear usuarios con nuevos roles
        console.log('\n👥 Paso 4: Creando usuarios con roles específicos...');
        await seedUsers();
        console.log('✅ Usuarios con roles específicos creados correctamente.');

        // 6. Ejecutar seed de datos básicos (si existe)
        console.log('\n📊 Paso 5: Cargando datos básicos...');
        try {
            const seedData = await import('./seedData.js');
            if (seedData.default) {
                await seedData.default();
                console.log('✅ Datos básicos cargados correctamente.');
            }
        } catch (error) {
            console.log('⚠️  No se pudieron cargar datos básicos:', error.message);
        }

        console.log('\n🎉 ¡Proceso de seed completado exitosamente!');
        console.log('\n📋 Resumen de lo que se creó:');
        console.log('   - Roles: super_admin, admin, manager, user, comercial_mundial, agente_contacto');
        console.log('   - Permisos: CRUD para usuarios, departamentos, ciudades, empresas, sedes, roles, permisos');
        console.log('   - Permisos nuevos: inspection_orders.*, contact_agent.*');
        console.log('   - Estados de órdenes de inspección');
        console.log('   - Estados de llamadas');
        console.log('   - Tipos de inspección (En sede, A domicilio, Remoto)');
        console.log('   - Sistema de notificaciones configurado');
        console.log('   - Usuario administrador: admin@vmlperito.com (contraseña: 123456)');
        console.log('   - Usuario comercial: comercial@vmlperito.com (contraseña: 123456)');
        console.log('   - Usuario agente: agente@vmlperito.com (contraseña: 123456)');
        console.log('   - Usuario supervisora: supervisora@vmlperito.com (contraseña: 123456)');

        console.log('\n🔑 Credenciales de acceso:');
        console.log('\n👨‍💼 ADMINISTRADOR (Todos los permisos):');
        console.log('   Email: admin@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 COMERCIAL MUNDIAL (Crear órdenes de inspección):');
        console.log('   Email: comercial@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👨‍💼 Agente de Contact (Gestionar llamadas y agendamientos):');
        console.log('   Email: agente@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 SUPERVISORA (Ambos roles):');
        console.log('   Email: supervisora@vmlperito.com');
        console.log('   Contraseña: 123456');

    } catch (error) {
        console.error('❌ Error en el proceso de seed:', error);
        throw error;
    } finally {
        // No cerrar la conexión aquí, se cerrará en el bloque principal
    }
};

// Ejecutar si se llama directamente
// if (import.meta.url === `file://${process.argv[1]}`) {
seedAll()
    .then(() => {
        console.log('\n✅ Proceso de seed completado');
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
        console.error('❌ Error:', error);
        sequelize.close().then(() => process.exit(1));
    });
// }

export default seedAll; 