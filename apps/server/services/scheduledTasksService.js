import cron from 'node-cron';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { InspectionOrder } from '../models/index.js';
import InspectionQueue from '../models/inspectionQueue.js';

/**
 * Servicio de Tareas Programadas
 * Maneja todas las tareas que se ejecutan automáticamente en horarios específicos
 */
class ScheduledTasksService {
    constructor() {
        this.tasks = new Map();
        this.isRunning = false;
    }

    /**
     * Iniciar el servicio de tareas programadas
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ Servicio de tareas programadas ya está ejecutándose');
            return;
        }

        console.log('🚀 Iniciando servicio de tareas programadas...');

        // Registrar todas las tareas
        this.registerTasks();

        this.isRunning = true;
        console.log('✅ Servicio de tareas programadas iniciado correctamente');
    }

    /**
     * Detener el servicio de tareas programadas
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Servicio de tareas programadas no está ejecutándose');
            return;
        }

        console.log('🛑 Deteniendo servicio de tareas programadas...');

        // Detener todas las tareas
        this.tasks.forEach((task, name) => {
            task.destroy();
            console.log(`   - Tarea "${name}" detenida`);
        });

        this.tasks.clear();
        this.isRunning = false;
        console.log('✅ Servicio de tareas programadas detenido correctamente');
    }

    /**
     * Registrar todas las tareas programadas
     */
    registerTasks() {
        // Tarea diaria a medianoche: Marcar órdenes vencidas
        this.registerTask('marcar-ordenes-vencidas', '0 0 * * *', async () => {
            await this.marcarOrdenesVencidas();
        });

        // Tarea diaria a las 04:00 am: Desactivar inspecciones virtuales activas
        this.registerTask('clear-outdated-virtual-inspections', '0 4 * * *', async () => {
            await this.clearOutdatedVirtualInspections();
        });

        // Aquí se pueden agregar más tareas en el futuro
        // Ejemplo: limpieza de logs, reportes semanales, etc.
    }

    /**
     * Registrar una nueva tarea programada
     * @param {string} name - Nombre de la tarea
     * @param {string} schedule - Expresión cron (ej: '0 0 * * *' para medianoche diario)
     * @param {Function} taskFunction - Función a ejecutar
     */
    registerTask(name, schedule, taskFunction) {
        try {
            const task = cron.schedule(schedule, async () => {
                const startTime = new Date();
                console.log(`🕐 Ejecutando tarea programada: ${name} - ${startTime.toISOString()}`);

                try {
                    await taskFunction();
                    const endTime = new Date();
                    const duration = endTime - startTime;
                    console.log(`✅ Tarea "${name}" completada exitosamente en ${duration}ms`);
                } catch (error) {
                    console.error(`❌ Error en tarea "${name}":`, error);
                }
            }, {
                scheduled: false, // No iniciar automáticamente
                timezone: "America/Bogota" // Zona horaria de Colombia
            });

            this.tasks.set(name, task);
            task.start(); // Iniciar la tarea
            console.log(`📅 Tarea "${name}" registrada con horario: ${schedule}`);
        } catch (error) {
            console.error(`❌ Error registrando tarea "${name}":`, error);
        }
    }

    /**
     * Desactiva inspecciones virtuales activas en la cola
     */
    async clearOutdatedVirtualInspections() {
        try {
            console.log('🔄 Iniciando limpieza de inspecciones virtuales activas en la cola...');
            const [actualizadas] = await InspectionQueue.update(
                { is_active: false },
                { where: { is_active: true } }
            );
            console.log(`✅ Se desactivaron ${actualizadas} inspecciones virtuales en la cola (is_active = 0)`);
            return {
                success: true,
                inspeccionesDesactivadas: actualizadas,
                fechaConsulta: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error desactivando inspecciones virtuales:', error);
            throw error;
        }
    }

    /**
     * Marcar órdenes de inspección vencidas (más de 30 días)
     */
    async marcarOrdenesVencidas() {
        try {
            console.log('🔄 Iniciando marcado de órdenes vencidas...');

            // Calcular fecha de hace 31 días
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);

            console.log(`📅 Marcando órdenes creadas antes de: ${fechaLimite.toISOString()}`);

            // Primero, obtener las órdenes que van a ser actualizadas para logging
            const ordenesAVencer = await InspectionOrder.findAll({
                where: {
                    status: {
                        [Op.ne]: 6 // status != 6
                    },
                    created_at: {
                        [Op.lt]: fechaLimite // created_at < fechaLimite
                    }
                },
                attributes: ['id', 'numero', 'nombre_cliente', 'status', 'created_at'],
                order: [['created_at', 'DESC']]
            });

            const cantidadAVencer = ordenesAVencer.length;
            console.log(`📊 Se encontraron ${cantidadAVencer} órdenes para marcar como vencidas`);

            if (cantidadAVencer > 0) {
                console.log('📋 Primeras 5 órdenes que serán marcadas como vencidas:');
                ordenesAVencer.slice(0, 5).forEach((orden, index) => {
                    console.log(`   ${index + 1}. ID: ${orden.id}, Número: ${orden.numero}, Cliente: ${orden.nombre_cliente}, Status actual: ${orden.status}, Fecha: ${orden.created_at.toISOString()}`);
                });

                if (cantidadAVencer > 5) {
                    console.log(`   ... y ${cantidadAVencer - 5} órdenes más`);
                }

                // Ejecutar el UPDATE usando Sequelize
                const [ordenesActualizadas] = await InspectionOrder.update(
                    {
                        status: 6, // Marcar como vencida
                        updated_at: new Date() // Actualizar timestamp
                    },
                    {
                        where: {
                            status: {
                                [Op.ne]: 6 // status != 6
                            },
                            created_at: {
                                [Op.lt]: fechaLimite // created_at < fechaLimite
                            }
                        }
                    }
                );

                console.log(`✅ Se marcaron ${ordenesActualizadas} órdenes como vencidas (status = 6)`);

                // Log de las órdenes actualizadas
                if (ordenesActualizadas > 0) {
                    console.log('📝 Órdenes marcadas como vencidas:');
                    ordenesAVencer.forEach((orden, index) => {
                        console.log(`   ${index + 1}. ID: ${orden.id}, Número: ${orden.numero}, Cliente: ${orden.nombre_cliente}`);
                    });
                }

                return {
                    success: true,
                    ordenesEncontradas: cantidadAVencer,
                    ordenesActualizadas: ordenesActualizadas,
                    fechaConsulta: new Date().toISOString(),
                    fechaLimite: fechaLimite.toISOString(),
                    ordenes: ordenesAVencer.map(orden => ({
                        id: orden.id,
                        numero: orden.numero,
                        nombre_cliente: orden.nombre_cliente,
                        status_anterior: orden.status,
                        status_nuevo: 6,
                        created_at: orden.created_at
                    }))
                };
            } else {
                console.log('✅ No se encontraron órdenes para marcar como vencidas');
                return {
                    success: true,
                    ordenesEncontradas: 0,
                    ordenesActualizadas: 0,
                    fechaConsulta: new Date().toISOString(),
                    fechaLimite: fechaLimite.toISOString(),
                    ordenes: []
                };
            }

        } catch (error) {
            console.error('❌ Error marcando órdenes como vencidas:', error);
            throw error;
        }
    }

    /**
     * Obtener estado del servicio
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            tasksCount: this.tasks.size,
            tasks: Array.from(this.tasks.keys())
        };
    }

    /**
     * Ejecutar una tarea manualmente (para testing)
     * @param {string} taskName - Nombre de la tarea
     */
    async executeTask(taskName) {
        if (!this.tasks.has(taskName)) {
            throw new Error(`Tarea "${taskName}" no encontrada`);
        }

        console.log(`🔧 Ejecutando tarea manualmente: ${taskName}`);

        switch (taskName) {
            case 'marcar-ordenes-vencidas':
                return await this.marcarOrdenesVencidas();
            case 'clear-outdated-virtual-inspections':
                return await this.clearOutdatedVirtualInspections();
            default:
                throw new Error(`Función para tarea "${taskName}" no implementada`);
        }
    }
}

// Crear instancia singleton
const scheduledTasksService = new ScheduledTasksService();

export default scheduledTasksService;
