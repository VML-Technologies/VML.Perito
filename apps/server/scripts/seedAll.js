import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import seedRBAC from './seedRBAC.js';
import createAdminUser from './seedUser.js';

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

        // 4. Ejecutar seed de datos básicos (si existe)
        console.log('\n📊 Paso 3: Cargando datos básicos...');
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
        console.log('   - Roles: super_admin, admin, manager, user');
        console.log('   - Permisos: CRUD para usuarios, departamentos, ciudades, empresas, sedes, roles y permisos');
        console.log('   - Usuario administrador: admin@vmlperito.com (contraseña: 123456)');
        console.log('   - Asignación: Usuario administrador tiene rol super_admin');
        console.log('\n🔑 Credenciales de acceso:');
        console.log('   Email: admin@vmlperito.com');
        console.log('   Contraseña: 123456');

    } catch (error) {
        console.error('❌ Error en el proceso de seed:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedAll()
        .then(() => {
            console.log('\n✅ Proceso de seed completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default seedAll; 