import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import scheduleController from '../controllers/scheduleController.js';

// Cargar variables de entorno
dotenv.config();

async function run() {
    console.log('🧪 Ejecutando tarea de recuperación ahora...');
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida');

        const t0 = Date.now();
        const result = await scheduleController.runRecoveryStatusUpdate();
        const ms = Date.now() - t0;

        console.log(`✅ Tarea de recuperación ejecutada manualmente en ${ms} ms`);
        if (result) {
            console.log(`   • Órdenes marcadas 'En proceso de recuperacion': ${result.updatedInProcess}`);
            console.log(`   • Órdenes marcadas 'Recuperacion fallida': ${result.updatedFailed}`);
        }
    } catch (err) {
        console.error('❌ Error ejecutando la tarea de recuperación:', err);
        process.exitCode = 1;
    } finally {
        try { await sequelize.close(); } catch { }
        console.log('🔌 Conexión a base de datos cerrada');
    }
}

run();
