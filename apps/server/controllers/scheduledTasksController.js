import scheduledTasksService from '../services/scheduledTasksService.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

/**
 * Controlador para gestionar tareas programadas
 */
class ScheduledTasksController {
    
    /**
     * Obtener estado del servicio de tareas programadas
     * GET /api/scheduled-tasks/status
     */
    async getStatus(req, res) {
        try {
            const status = scheduledTasksService.getStatus();
            
            res.json({
                success: true,
                message: 'Estado del servicio de tareas programadas obtenido exitosamente',
                data: status
            });
        } catch (error) {
            console.error('Error obteniendo estado de tareas programadas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Ejecutar una tarea manualmente
     * POST /api/scheduled-tasks/execute/:taskName
     */
    async executeTask(req, res) {
        try {
            const { taskName } = req.params;
            
            if (!taskName) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre de tarea es requerido'
                });
            }

            console.log(`🔧 Ejecutando tarea manualmente: ${taskName} - Solicitado por: ${req.user?.name || 'Usuario desconocido'}`);
            
            const result = await scheduledTasksService.executeTask(taskName);
            
            res.json({
                success: true,
                message: `Tarea "${taskName}" ejecutada exitosamente`,
                data: result
            });
        } catch (error) {
            console.error(`Error ejecutando tarea ${req.params.taskName}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando tarea programada',
                error: error.message
            });
        }
    }

    /**
     * Obtener lista de tareas disponibles
     * GET /api/scheduled-tasks/available
     */
    async getAvailableTasks(req, res) {
        try {
            const availableTasks = [
                {
                    name: 'marcar-ordenes-vencidas',
                    description: 'Marca órdenes de inspección como vencidas (más de 31 días)',
                    schedule: '0 0 * * * (Diario a medianoche)',
                    timezone: 'America/Bogota'
                }
                // Aquí se pueden agregar más tareas en el futuro
            ];

            res.json({
                success: true,
                message: 'Lista de tareas disponibles obtenida exitosamente',
                data: availableTasks
            });
        } catch (error) {
            console.error('Error obteniendo tareas disponibles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener logs de ejecución de tareas (simulado - en producción se podría conectar a un sistema de logging)
     * GET /api/scheduled-tasks/logs
     */
    async getLogs(req, res) {
        try {
            // En una implementación real, esto vendría de un sistema de logging
            // Por ahora, retornamos información básica
            const logs = [
                {
                    timestamp: new Date().toISOString(),
                    task: 'consulta-ordenes-antiguas',
                    status: 'success',
                    message: 'Tarea ejecutada exitosamente',
                    duration: '150ms'
                }
            ];

            res.json({
                success: true,
                message: 'Logs de tareas programadas obtenidos exitosamente',
                data: logs
            });
        } catch (error) {
            console.error('Error obteniendo logs de tareas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default new ScheduledTasksController();
