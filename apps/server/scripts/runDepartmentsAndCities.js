#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar y ejecutar el seeding
import { seedDepartmentsAndCities } from './seedDepartmentsAndCities.js';

async function main() {
    try {
        console.log('🌍 Iniciando carga de departamentos y ciudades de Colombia...\n');
        await seedDepartmentsAndCities();
        console.log('\n🎉 ¡Proceso completado exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Error durante la ejecución:', error);
        process.exit(1);
    }
}

main();