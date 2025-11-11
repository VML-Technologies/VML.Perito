import sequelize from '../config/database.js';
import Department from '../models/department.js';
import City from '../models/city.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para poblar la base de datos con departamentos y ciudades de Colombia
 * Utiliza find or create para evitar duplicados
 */
async function seedDepartmentsAndCities() {
    try {
        console.log('🚀 Iniciando seeding de departamentos y ciudades...');

        // Leer el archivo JSON con los municipios
        const municipiosPath = path.join(__dirname, '../../../municipios.json');
        const municipiosData = JSON.parse(fs.readFileSync(municipiosPath, 'utf8'));

        let departmentCount = 0;
        let cityCount = 0;
        let departmentCreated = 0;
        let cityCreated = 0;

        // Sincronizar la base de datos
        await sequelize.sync();

        console.log('📊 Procesando departamentos y municipios...');

        // Procesar cada departamento
        for (const [departmentName, cities] of Object.entries(municipiosData)) {
            try {
                // Find or create department
                const [department, wasCreated] = await Department.findOrCreate({
                    where: { name: departmentName },
                    defaults: { name: departmentName }
                });

                departmentCount++;
                if (wasCreated) {
                    departmentCreated++;
                    console.log(`✅ Departamento creado: ${departmentName}`);
                } else {
                    console.log(`🔄 Departamento existente: ${departmentName}`);
                }

                // Procesar ciudades del departamento
                for (const cityName of cities) {
                    try {
                        const [city, wasCityCreated] = await City.findOrCreate({
                            where: {
                                name: cityName,
                                department_id: department.id
                            },
                            defaults: {
                                name: cityName,
                                department_id: department.id
                            }
                        });

                        cityCount++;
                        if (wasCityCreated) {
                            cityCreated++;
                        }

                    } catch (cityError) {
                        console.error(`❌ Error procesando ciudad ${cityName} en ${departmentName}:`, cityError.message);
                    }
                }

                console.log(`📍 Procesadas ${cities.length} ciudades para ${departmentName}`);

            } catch (departmentError) {
                console.error(`❌ Error procesando departamento ${departmentName}:`, departmentError.message);
            }
        }

        console.log('\n📈 Resumen del seeding:');
        console.log(`📊 Departamentos procesados: ${departmentCount}`);
        console.log(`🆕 Departamentos creados: ${departmentCreated}`);
        console.log(`🔄 Departamentos existentes: ${departmentCount - departmentCreated}`);
        console.log(`📊 Ciudades procesadas: ${cityCount}`);
        console.log(`🆕 Ciudades creadas: ${cityCreated}`);
        console.log(`🔄 Ciudades existentes: ${cityCount - cityCreated}`);

        console.log('\n✅ Seeding completado exitosamente!');

    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        throw error;
    }
}

/**
 * Función para ejecutar el script si se llama directamente
 */
async function main() {
    try {
        await seedDepartmentsAndCities();
        process.exit(0);
    } catch (error) {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { seedDepartmentsAndCities };