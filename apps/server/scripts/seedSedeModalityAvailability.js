import {
    Sede,
    SedeType,
    InspectionModality,
    SedeModalityAvailability
} from '../models/index.js';

const seedSedeModalityAvailability = async () => {
    try {
        console.log('🏗️  Seeding disponibilidad de modalidades por sede...');

        // 1. Obtener tipos necesarios
        const cdaType = await SedeType.findOne({ where: { code: 'CDA' } });
        const comercialType = await SedeType.findOne({ where: { code: 'COMERCIAL' } });
        const soporteType = await SedeType.findOne({ where: { code: 'SOPORTE' } });

        if (!cdaType || !comercialType || !soporteType) {
            throw new Error('No se encontraron los tipos de sede necesarios');
        }

        // 2. Obtener modalidades
        const sedeModality = await InspectionModality.findOne({ where: { code: 'SEDE' } });
        const domicilioModality = await InspectionModality.findOne({ where: { code: 'DOMICILIO' } });
        const virtualModality = await InspectionModality.findOne({ where: { code: 'VIRTUAL' } });

        if (!sedeModality || !domicilioModality || !virtualModality) {
            throw new Error('No se encontraron las modalidades necesarias');
        }

        // 3. Obtener todas las sedes
        const allSedes = await Sede.findAll({
            include: [{
                model: SedeType,
                as: 'sedeType'
            }]
        });

        console.log(`📊 Configurando ${allSedes.length} sedes...`);

        // 4. Configurar disponibilidad por sede
        for (const sede of allSedes) {
            console.log(`\n🏢 Configurando: ${sede.name} (${sede.sedeType.code})`);

            if (sede.sedeType.code === 'CDA') {
                // Para todas las sedes CDA: Solo En Sede
                await SedeModalityAvailability.findOrCreate({
                    where: {
                        sede_id: sede.id,
                        inspection_modality_id: sedeModality.id,
                        active: true,
                        max_daily_capacity: 25,
                        working_hours_start: '07:00:00',
                        working_hours_end: '17:00:00',
                        working_days: '1,2,3,4,5,6' // Lunes a Sábado
                    }
                });
                console.log(`   ✅ Configurado: Solo En Sede`);

            } else if (sede.sedeType.code === 'COMERCIAL') {
                // Para sedes comerciales: NO tienen agendamiento
                console.log(`   ℹ️  Sin agendamiento (solo administrativa)`);

            } else if (sede.sedeType.code === 'SOPORTE') {
                // Para sedes de soporte: NO tienen agendamiento
                console.log(`   ℹ️  Sin agendamiento (solo administrativa)`);
            }
        }

        // 5. Configuración especial para CDA Distrital y CDA Cali Norte
        const cdaDistrital = await Sede.findOne({
            where: { name: 'CDA Distrital' },
            include: [{ model: SedeType, as: 'sedeType' }]
        });

        const cdaCaliNorte = await Sede.findOne({
            where: { name: 'CDA Cali Norte' },
            include: [{ model: SedeType, as: 'sedeType' }]
        });

        if (cdaDistrital) {
            console.log(`\n🎯 Configuración especial para CDA Distrital:`);

            // Agregar A Domicilio y Virtual
            await SedeModalityAvailability.findOrCreate({
                where: {
                    sede_id: cdaDistrital.id,
                    inspection_modality_id: domicilioModality.id,
                    active: true,
                    max_daily_capacity: 15,
                    working_hours_start: '07:00:00',
                    working_hours_end: '17:00:00',
                    working_days: '1,2,3,4,5,6'
                }
            });

            await SedeModalityAvailability.findOrCreate({
                where: {
                    sede_id: cdaDistrital.id,
                    inspection_modality_id: virtualModality.id,
                    active: true,
                    max_daily_capacity: 20,
                    working_hours_start: '08:00:00',
                    working_hours_end: '18:00:00',
                    working_days: '1,2,3,4,5,6'
                }
            });
            console.log(`   ✅ Configurado: En Sede + A Domicilio + Virtual`);
        }

        if (cdaCaliNorte) {
            console.log(`\n🎯 Configuración especial para CDA Cali Norte:`);

            // Agregar A Domicilio y Virtual
            await SedeModalityAvailability.findOrCreate({
                where: {
                    sede_id: cdaCaliNorte.id,
                    inspection_modality_id: domicilioModality.id,
                    active: true,
                    max_daily_capacity: 15,
                    working_hours_start: '07:00:00',
                    working_hours_end: '17:00:00',
                    working_days: '1,2,3,4,5,6,7' // Incluye domingos
                }
            });

            await SedeModalityAvailability.findOrCreate({
                where: {
                    sede_id: cdaCaliNorte.id,
                    inspection_modality_id: virtualModality.id,
                    active: true,
                    max_daily_capacity: 20,
                    working_hours_start: '08:00:00',
                    working_hours_end: '18:00:00',
                    working_days: '1,2,3,4,5,6,7' // Incluye domingos
                }
            });
            console.log(`   ✅ Configurado: En Sede + A Domicilio + Virtual`);
        }

        console.log('\n✅ Disponibilidad de modalidades configurada exitosamente');
        console.log('📋 Resumen de configuración:');
        console.log('   - Todas las sedes CDA: Solo En Sede');
        console.log('   - CDA Distrital: En Sede + A Domicilio + Virtual');
        console.log('   - CDA Cali Norte: En Sede + A Domicilio + Virtual');
        console.log('   - Sedes comerciales y soporte: Sin agendamiento');

    } catch (error) {
        console.error('❌ Error seeding disponibilidad de modalidades:', error);
        throw error;
    }
};

export default seedSedeModalityAvailability; 