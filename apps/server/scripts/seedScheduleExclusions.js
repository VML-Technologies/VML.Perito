import db from '../config/database.js';
import { ScheduleTemplate, ScheduleExclusion } from '../models/index.js';

/**
 * Script para crear ejemplos de exclusiones de horarios (tiempos muertos)
 * Ejecutar con: node apps/server/scripts/seedScheduleExclusions.js
 */

async function seedScheduleExclusions() {
    try {
        await db.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Buscar algunas plantillas de horarios existentes
        const templates = await ScheduleTemplate.findAll({
            limit: 3,
            where: { active: true }
        });

        if (templates.length === 0) {
            console.log('❌ No se encontraron plantillas de horario activas. Ejecuta primero el seeding de scheduleTemplates.');
            return;
        }

        console.log(`📋 Encontradas ${templates.length} plantillas de horario para agregar exclusiones`);

        // Ejemplos de exclusiones comunes
        const exclusionExamples = [
            {
                name: 'Hora de almuerzo',
                start_time: '12:00:00',
                end_time: '13:00:00',
                days_pattern: null, // Aplica a todos los días
                exclusion_type: 'LUNCH',
                priority: 10
            },
            {
                name: 'Descanso matutino',
                start_time: '10:00:00',
                end_time: '10:15:00',
                days_pattern: '1,2,3,4,5', // Solo lunes a viernes
                exclusion_type: 'BREAK',
                priority: 5
            },
            {
                name: 'Mantenimiento sistemas',
                start_time: '15:30:00',
                end_time: '16:00:00',
                days_pattern: '2,4', // Solo martes y jueves
                exclusion_type: 'MAINTENANCE',
                priority: 8
            },
            {
                name: 'Reunión de equipo',
                start_time: '09:00:00',
                end_time: '09:30:00',
                days_pattern: '1', // Solo lunes
                exclusion_type: 'CUSTOM',
                priority: 7
            }
        ];

        // Crear exclusiones para cada template
        for (const template of templates) {
            console.log(`\n📝 Creando exclusiones para template: "${template.name}"`);
            
            for (const [index, exclusion] of exclusionExamples.entries()) {
                try {
                    const scheduleExclusion = await ScheduleExclusion.create({
                        schedule_template_id: template.id,
                        name: exclusion.name,
                        start_time: exclusion.start_time,
                        end_time: exclusion.end_time,
                        days_pattern: exclusion.days_pattern,
                        active: true,
                        exclusion_type: exclusion.exclusion_type,
                        priority: exclusion.priority
                    });

                    console.log(`   ✅ Exclusión creada: ${exclusion.name} (${exclusion.start_time} - ${exclusion.end_time})`);
                    
                    // Para no saturar, solo agregar 2 exclusiones por template
                    if (index >= 1) break;
                    
                } catch (error) {
                    console.log(`   ❌ Error creando exclusión ${exclusion.name}:`, error.message);
                }
            }
        }

        console.log('\n🎉 Proceso de seeding de exclusiones completado');

        // Mostrar resumen
        const totalExclusions = await ScheduleExclusion.count();
        console.log(`📊 Total de exclusiones en la base de datos: ${totalExclusions}`);

    } catch (error) {
        console.error('❌ Error en el seeding de exclusiones:', error);
    } finally {
        await db.close();
    }
}

// Solo ejecutar si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedScheduleExclusions();
}

export default seedScheduleExclusions;
