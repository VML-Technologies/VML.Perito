import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Department, City, Company, Sede, User } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Crear departamentos (incluyendo los necesarios para sedes reales)
        const departments = await Department.bulkCreate([
            { name: 'Cundinamarca' }, // Para Bogotá
            { name: 'Valle del Cauca' }, // Para Cali
            { name: 'Antioquia' }, // Para Medellín
            { name: 'Atlántico' }, // Para Barranquilla
            { name: 'Santander' } // Para Bucaramanga
        ], { ignoreDuplicates: true });
        console.log('✅ Departamentos creados:', departments.length);

        // Crear ciudades (incluyendo las necesarias para sedes reales)
        const cities = await City.bulkCreate([
            // Cundinamarca
            { name: 'Bogotá', department_id: 1 },
            { name: 'Soacha', department_id: 1 },
            { name: 'Chía', department_id: 1 },

            // Valle del Cauca
            { name: 'Cali', department_id: 2 },
            { name: 'Palmira', department_id: 2 },
            { name: 'Buenaventura', department_id: 2 },

            // Antioquia
            { name: 'Medellín', department_id: 3 },
            { name: 'Bello', department_id: 3 },
            { name: 'Envigado', department_id: 3 },

            // Atlántico
            { name: 'Barranquilla', department_id: 4 },
            { name: 'Soledad', department_id: 4 },

            // Santander
            { name: 'Bucaramanga', department_id: 5 }
        ], { ignoreDuplicates: true });
        console.log('✅ Ciudades creadas:', cities.length);

        // Crear empresas (Previcar será la principal)
        const companies = await Company.bulkCreate([
            {
                name: 'Previcar',
                nit: '900123456-7',
                city_id: 1, // Bogotá
                address: 'Carrera 15 # 93-47, Bogotá',
                email: 'info@previcar.com',
                phone: '601-234-5678'
            },
            {
                name: 'VML Perito S.A.S.',
                nit: '800987654-3',
                city_id: 7, // Medellín
                address: 'Calle 10 # 20-30, Medellín',
                email: 'info@vmlperito.com',
                phone: '604-1234567'
            },
            {
                name: 'Consultores Asociados Ltda.',
                nit: '700456789-1',
                city_id: 4, // Cali
                address: 'Avenida 4 Norte # 12-34, Cali',
                email: 'info@consultores.com',
                phone: '602-4567890'
            }
        ], { ignoreDuplicates: true });
        console.log('✅ Empresas creadas:', companies.length);

        console.log('\n🎉 Datos básicos creados exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`   - Departamentos: ${departments.length} (incluyendo Cundinamarca y Valle del Cauca)`);
        console.log(`   - Ciudades: ${cities.length} (incluyendo Bogotá y Cali para sedes reales)`);
        console.log(`   - Empresas: ${companies.length} (Previcar como empresa principal)`);
        console.log('\n📍 Ciudades principales configuradas:');
        console.log('   - Bogotá (Cundinamarca) - Para CDAs principales');
        console.log('   - Cali (Valle del Cauca) - Para CDAs regionales');
        console.log('   - Medellín (Antioquia) - Para expansión futura');

    } catch (error) {
        console.error('❌ Error al crear datos básicos:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedData()
        .then(() => {
            console.log('✅ Seed de datos básicos completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default seedData; 