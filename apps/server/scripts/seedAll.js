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

        // 3. Ejecutar seed de datos básicos (departamentos, ciudades, empresas, sedes)
        console.log('\n📊 Paso 2: Cargando datos básicos...');
        try {
            const { default: seedData } = await import('./seedData.js');
            if (seedData && typeof seedData === 'function') {
                await seedData();
                console.log('✅ Datos básicos cargados correctamente.');
            } else {
                console.log('⚠️  seedData no es una función válida, saltando...');
            }
        } catch (error) {
            console.log('⚠️  No se pudieron cargar datos básicos:', error.message);
        }

        // 4. Crear usuario administrador
        console.log('\n👤 Paso 3: Creando usuario administrador...');
        const { default: createAdminUser } = await import('./seedUser.js');
        await createAdminUser();
        console.log('✅ Usuario administrador creado correctamente.');

        // 5. Ejecutar seed de datos de inspección
        console.log('\n🏭 Paso 4: Cargando datos de inspección...');
        const { default: seedInspectionData } = await import('./seedInspectionData.js');
        await seedInspectionData();
        console.log('✅ Datos de inspección cargados correctamente.');

        // 6. Crear usuarios con nuevos roles
        console.log('\n👥 Paso 5: Creando usuarios con roles específicos...');
        const { default: seedUsers } = await import('./seedUsers.js');
        await seedUsers();
        console.log('✅ Usuarios con roles específicos creados correctamente.');

        console.log('\n🎉 ¡Proceso de seed completado exitosamente!');
        console.log('\n📋 Resumen de lo que se creó:');
        console.log('   - Roles: super_admin, admin, manager, user, comercial_mundial, agente_contacto, coordinador_contacto');
        console.log('   - Permisos: CRUD para usuarios, departamentos, ciudades, empresas, sedes, roles, permisos');
        console.log('   - Permisos nuevos: inspection_orders.*, contact_agent.*, coordinador_contacto.*');
        console.log('   - Estados de órdenes de inspección');
        console.log('   - Estados de llamadas');
        console.log('   - Tipos de inspección (En sede, A domicilio, Remoto)');
        console.log('   - Sistema de notificaciones configurado');
        console.log('   - Usuario administrador: admin@vmlperito.com (contraseña: 123456)');
        console.log('   - Usuario comercial: comercial@vmlperito.com (contraseña: 123456)');
        console.log('   - Usuario coordinadora: coordinadora@vmlperito.com (contraseña: 123456)');
        console.log('   - 5 Agentes de contacto: agente1@vmlperito.com a agente5@vmlperito.com (contraseña: 123456)');
        console.log('   - Usuario supervisora: supervisora@vmlperito.com (contraseña: 123456)');

        console.log('\n🔑 Credenciales de acceso principales:');
        console.log('\n👨‍💼 ADMINISTRADOR (Todos los permisos):');
        console.log('   Email: admin@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 COMERCIAL MUNDIAL (Crear órdenes de inspección):');
        console.log('   Email: comercial@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 COORDINADORA DE CONTACTO (Asignar agentes):');
        console.log('   Email: coordinadora@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👨‍💼 AGENTE DE CONTACTO (Gestionar llamadas):');
        console.log('   Email: agente1@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 SUPERVISORA (Todos los roles):');
        console.log('   Email: supervisora@vmlperito.com');
        console.log('   Contraseña: 123456');

    } catch (error) {
        console.error('❌ Error en el proceso de seed:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
};

// Ejecutar si se llama directamente
// if (import.meta.url === `file://${process.argv[1]}`) {
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