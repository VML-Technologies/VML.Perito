import sequelize from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrateAppointments() {
    try {
        console.log('🔄 Iniciando migración de la tabla appointments...');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Ejecutar la migración
        const migrationSQL = `
            ALTER TABLE \`appointments\` 
            ADD COLUMN \`inspection_order_id\` bigint NOT NULL AFTER \`sede_id\`,
            ADD CONSTRAINT \`appointments_ibfk_inspection_order\` 
            FOREIGN KEY (\`inspection_order_id\`) REFERENCES \`inspection_orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
        `;

        await sequelize.query(migrationSQL);
        console.log('✅ Columna inspection_order_id agregada exitosamente');

        // Agregar índice
        const indexSQL = `
            ALTER TABLE \`appointments\` 
            ADD INDEX \`appointment_inspection_order_idx\` (\`inspection_order_id\`);
        `;

        await sequelize.query(indexSQL);
        console.log('✅ Índice appointment_inspection_order_idx agregado exitosamente');

        console.log('🎉 Migración completada exitosamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);

        // Si la columna ya existe, continuar
        if (error.message.includes('Duplicate column name') || error.message.includes('already exists')) {
            console.log('ℹ️ La columna inspection_order_id ya existe, continuando...');
        } else {
            throw error;
        }
    } finally {
        await sequelize.close();
    }
}

// Ejecutar migración
migrateAppointments().catch(console.error); 