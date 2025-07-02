import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { Department, City, Company, Sede, User } from '../models/index.js';

dotenv.config();

const setupDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Opción 1: Forzar recreación (CUIDADO: elimina todos los datos)
        if (process.env.FORCE_DB === 'true') {
            console.log('⚠️  Forzando recreación de la base de datos...');
            await sequelize.sync({ force: true });
            console.log('✅ Base de datos recreada.');
            return;
        }

        // Opción 2: Sincronización segura (recomendada)
        console.log('🔄 Sincronizando modelos...');
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados.');

        // Verificar si las tablas tienen datos
        const userCount = await User.count();
        const sedeCount = await Sede.count();
        const companyCount = await Company.count();
        const cityCount = await City.count();
        const departmentCount = await Department.count();

        console.log('\n📊 Estado actual de la base de datos:');
        console.log(`   Departamentos: ${departmentCount}`);
        console.log(`   Ciudades: ${cityCount}`);
        console.log(`   Empresas: ${companyCount}`);
        console.log(`   Sedes: ${sedeCount}`);
        console.log(`   Usuarios: ${userCount}`);

        if (userCount === 0 && sedeCount === 0) {
            console.log('\n💡 La base de datos está vacía. Ejecuta "npm run seed:all" para crear datos de prueba.');
        } else if (userCount > 0 && sedeCount === 0) {
            console.log('\n⚠️  Hay usuarios pero no hay sedes. Esto puede causar problemas de foreign key.');
            console.log('💡 Considera ejecutar "npm run seed:all" para crear la estructura completa.');
        } else {
            console.log('\n✅ La base de datos tiene datos. El sistema está listo.');
        }

    } catch (error) {
        console.error('❌ Error al configurar la base de datos:', error.message);

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            console.log('\n💡 Solución:');
            console.log('   1. Ejecuta: FORCE_DB=true npm run setup:db');
            console.log('   2. Luego ejecuta: npm run seed:all');
            console.log('   ⚠️  Esto eliminará todos los datos existentes.');
        }
    } finally {
        await sequelize.close();
    }
};

setupDatabase(); 