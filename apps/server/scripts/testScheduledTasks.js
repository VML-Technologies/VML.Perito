import dotenv from 'dotenv';
import scheduledTasksService from '../services/scheduledTasksService.js';
import sequelize from '../config/database.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script de prueba para tareas programadas
 * Ejecuta la consulta de órdenes antiguas manualmente para verificar que funciona
 */
async function testScheduledTasks() {
    console.log('🧪 Iniciando prueba de tareas programadas...');
    
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida');
        
        // Inicializar el servicio
        scheduledTasksService.start();
        console.log('✅ Servicio de tareas programadas iniciado');
        
        // Ejecutar la tarea manualmente
        console.log('\n🔄 Ejecutando marcado de órdenes vencidas...');
        const result = await scheduledTasksService.executeTask('marcar-ordenes-vencidas');
        
        console.log('\n📊 Resultado del marcado:');
        console.log(`   - Órdenes encontradas: ${result.ordenesEncontradas}`);
        console.log(`   - Órdenes actualizadas: ${result.ordenesActualizadas}`);
        console.log(`   - Fecha de consulta: ${result.fechaConsulta}`);
        console.log(`   - Fecha límite: ${result.fechaLimite}`);
        
        if (result.ordenes && result.ordenes.length > 0) {
            console.log('\n📋 Órdenes marcadas como vencidas:');
            result.ordenes.slice(0, 3).forEach((orden, index) => {
                console.log(`   ${index + 1}. ID: ${orden.id}, Número: ${orden.numero}, Cliente: ${orden.nombre_cliente}, Status: ${orden.status_anterior} → ${orden.status_nuevo}`);
            });
        }
        
        // Obtener estado del servicio
        const status = scheduledTasksService.getStatus();
        console.log('\n📈 Estado del servicio:');
        console.log(`   - Ejecutándose: ${status.isRunning}`);
        console.log(`   - Tareas registradas: ${status.tasksCount}`);
        console.log(`   - Tareas: ${status.tasks.join(', ')}`);
        
        console.log('\n✅ Prueba completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        console.error('📍 Detalles:', error.message);
        if (error.stack) {
            console.error('📍 Stack trace:', error.stack);
        }
    } finally {
        // Detener el servicio
        scheduledTasksService.stop();
        console.log('🛑 Servicio de tareas programadas detenido');
        
        // Cerrar conexión a base de datos
        await sequelize.close();
        console.log('🔌 Conexión a base de datos cerrada');
        
        process.exit(0);
    }
}

// Ejecutar la prueba
testScheduledTasks();
