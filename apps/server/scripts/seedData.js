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

        // Crear departamentos
        const departments = await Department.bulkCreate([
            { name: 'Antioquia' },
            { name: 'Cundinamarca' },
            { name: 'Valle del Cauca' },
            { name: 'Atlántico' },
            { name: 'Santander' }
        ], { ignoreDuplicates: true });
        console.log('✅ Departamentos creados:', departments.length);

        // Crear ciudades
        const cities = await City.bulkCreate([
            { name: 'Medellín', department_id: 1 },
            { name: 'Bello', department_id: 1 },
            { name: 'Envigado', department_id: 1 },
            { name: 'Bogotá', department_id: 2 },
            { name: 'Soacha', department_id: 2 },
            { name: 'Cali', department_id: 3 },
            { name: 'Palmira', department_id: 3 },
            { name: 'Barranquilla', department_id: 4 },
            { name: 'Soledad', department_id: 4 },
            { name: 'Bucaramanga', department_id: 5 }
        ], { ignoreDuplicates: true });
        console.log('✅ Ciudades creadas:', cities.length);

        // Crear empresas
        const companies = await Company.bulkCreate([
            {
                name: 'VML Perito S.A.S.',
                nit: '900123456-7',
                city_id: 1, // Medellín
                address: 'Calle 10 # 20-30, Medellín'
            },
            {
                name: 'Consultores Asociados Ltda.',
                nit: '800987654-3',
                city_id: 4, // Bogotá
                address: 'Carrera 15 # 45-67, Bogotá'
            },
            {
                name: 'Expertos Legales S.A.',
                nit: '700456789-1',
                city_id: 6, // Cali
                address: 'Avenida 4 Norte # 12-34, Cali'
            }
        ], { ignoreDuplicates: true });
        console.log('✅ Empresas creadas:', companies.length);

        // Crear sedes
        const sedes = await Sede.bulkCreate([
            {
                company_id: 1,
                name: 'Sede Principal Medellín',
                email: 'medellin@vmlperito.com',
                phone: '604-1234567',
                city_id: 1, // Medellín
                address: 'Calle 10 # 20-30, Medellín'
            },
            {
                company_id: 1,
                name: 'Sede Bello',
                email: 'bello@vmlperito.com',
                phone: '604-2345678',
                city_id: 2, // Bello
                address: 'Carrera 50 # 45-12, Bello'
            },
            {
                company_id: 2,
                name: 'Sede Bogotá',
                email: 'bogota@consultores.com',
                phone: '601-3456789',
                city_id: 4, // Bogotá
                address: 'Carrera 15 # 45-67, Bogotá'
            },
            {
                company_id: 3,
                name: 'Sede Cali',
                email: 'cali@expertos.com',
                phone: '602-4567890',
                city_id: 6, // Cali
                address: 'Avenida 4 Norte # 12-34, Cali'
            }
        ], { ignoreDuplicates: true });
        console.log('✅ Sedes creadas:', sedes.length);

        // Crear usuarios
        const hashedPassword = await bcrypt.hash('123456', 10);
        const users = await User.bulkCreate([
            {
                sede_id: 1,
                name: 'Juan Pérez',
                email: 'juan@vmlperito.com',
                phone: '300-1234567',
                password: hashedPassword,
                is_active: true
            },
            {
                sede_id: 1,
                name: 'María García',
                email: 'maria@vmlperito.com',
                phone: '300-2345678',
                password: hashedPassword,
                is_active: true
            },
            {
                sede_id: 2,
                name: 'Carlos López',
                email: 'carlos@vmlperito.com',
                phone: '300-3456789',
                password: hashedPassword,
                is_active: true
            },
            {
                sede_id: 3,
                name: 'Ana Rodríguez',
                email: 'ana@consultores.com',
                phone: '300-4567890',
                password: hashedPassword,
                is_active: true
            },
            {
                sede_id: 4,
                name: 'Luis Martínez',
                email: 'luis@expertos.com',
                phone: '300-5678901',
                password: hashedPassword,
                is_active: true
            }
        ], { ignoreDuplicates: true });
        console.log('✅ Usuarios creados:', users.length);

        console.log('\n🎉 Datos de prueba creados exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('   Email: juan@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n   Email: maria@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n   Email: carlos@vmlperito.com');
        console.log('   Contraseña: 123456');

    } catch (error) {
        console.error('❌ Error al crear datos de prueba:', error);
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