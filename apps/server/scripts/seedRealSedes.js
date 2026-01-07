import {
    Department,
    City,
    Company,
    Sede,
    SedeType,
    VehicleType,
    SedeVehicleType,
    InspectionModality,
    ScheduleTemplate
} from '../models/index.js';

const seedRealSedes = async () => {
    try {
        console.log('🏢 Seeding sedes reales...');

        // 1. Crear empresa Previcar
        const [previcar] = await Company.findOrCreate({
            where: { name: 'Previcar' },
            defaults: {
                name: 'Previcar',
                email: 'info@previcar.com',
                phone: '601-234-5678',
                city_id: 1 // Asumiendo que Bogotá tiene ID 1
            }
        });
        console.log('✅ Empresa Previcar creada/encontrada');

        // 2. Obtener tipos necesarios
        const cdaType = await SedeType.findOne({ where: { code: 'CDA' } });
        const comercialType = await SedeType.findOne({ where: { code: 'COMERCIAL' } });
        const soporteType = await SedeType.findOne({ where: { code: 'SOPORTE' } });

        // Obtener tipos de vehículos
        const livianoType = await VehicleType.findOne({ where: { code: 'LIVIANO' } });
        const pesadoType = await VehicleType.findOne({ where: { code: 'PESADO' } });
        const motoType = await VehicleType.findOne({ where: { code: 'MOTO' } });

        // Obtener modalidades
        const sedeModality = await InspectionModality.findOne({ where: { code: 'SEDE' } });
        const domicilioModality = await InspectionModality.findOne({ where: { code: 'DOMICILIO' } });
        const virtualModality = await InspectionModality.findOne({ where: { code: 'VIRTUAL' } });

        // 3. Obtener ciudades
        const bogota = await City.findOne({
            where: { name: 'Bogotá' },
            include: [{ model: Department, as: 'department', where: { name: 'Cundinamarca' } }]
        });

        const cali = await City.findOne({
            where: { name: 'Cali' },
            include: [{ model: Department, as: 'department', where: { name: 'Valle del Cauca' } }]
        });

        const pasto = await City.findOne({
            where: { name: 'Pasto' },
            include: [{ model: Department, as: 'department', where: { name: 'Nariño' } }]
        });

        if (!bogota || !cali || !pasto) {
            console.log('❌ No se encontraron las ciudades necesarias');
            return;
        }

        // 4. Crear sedes CDA en Bogotá
        const sedesBogota = [
            {
                name: 'CDA 197',
                address: 'AUTOPISTA NORTE No. 197 -75',
                phone: '601-234-5001',
                email: 'cda197@previcar.com',
                city_id: bogota.id,
                company_id: previcar.id,
                sede_type_id: cdaType.id,
                vehicleTypes: [livianoType.id, pesadoType.id, motoType.id],
                schedules: [
                    {
                        name: 'Lunes a Viernes',
                        days_pattern: '1,2,3,4,5',
                        start_time: '07:00:00',
                        end_time: '17:00:00'
                    },
                    {
                        name: 'Sábados',
                        days_pattern: '6',
                        start_time: '08:00:00',
                        end_time: '17:00:00'
                    }
                ]
            },
            {
                name: 'CDA Distrital',
                address: 'Carrera 36 # 19 – 21',
                phone: '601-234-5002',
                email: 'cdadistrital@previcar.com',
                city_id: bogota.id,
                company_id: previcar.id,
                sede_type_id: cdaType.id,
                vehicleTypes: [livianoType.id],
                schedules: [
                    {
                        name: 'Lunes a Viernes',
                        days_pattern: '1,2,3,4,5',
                        start_time: '07:00:00',
                        end_time: '17:00:00'
                    },
                    {
                        name: 'Sábados',
                        days_pattern: '6',
                        start_time: '08:00:00',
                        end_time: '17:00:00'
                    }
                ]
            },
            {
                name: 'CDA PREVITAX',
                address: 'CALLE 12 B No. 44 – 08',
                phone: '601-234-5003',
                email: 'previtax@previcar.com',
                city_id: bogota.id,
                company_id: previcar.id,
                sede_type_id: cdaType.id,
                vehicleTypes: [livianoType.id],
                schedules: [
                    {
                        name: 'Lunes a Sábados',
                        days_pattern: '1,2,3,4,5,6',
                        start_time: '06:00:00',
                        end_time: '18:00:00'
                    }
                ]
            }
        ];

        // 5. Crear sedes CDA en Cali
        const sedesCali = [
            {
                name: 'CDA Cali Norte',
                address: 'CRA 1 N° 47 – 250',
                phone: '602-234-5004',
                email: 'calinorte@previcar.com',
                city_id: cali.id,
                company_id: previcar.id,
                sede_type_id: cdaType.id,
                vehicleTypes: [livianoType.id, pesadoType.id, motoType.id],
                schedules: [
                    {
                        name: 'Lunes a Viernes',
                        days_pattern: '1,2,3,4,5',
                        start_time: '07:00:00',
                        end_time: '17:00:00'
                    },
                    {
                        name: 'Sábados',
                        days_pattern: '6',
                        start_time: '08:00:00',
                        end_time: '17:00:00'
                    },
                    {
                        name: 'Domingos',
                        days_pattern: '7',
                        start_time: '08:00:00',
                        end_time: '12:00:00'
                    }
                ]
            },
            {
                name: 'CDA Cali Sur',
                address: 'CRA 41 N° 6-02',
                phone: '602-234-5005',
                email: 'calisur@previcar.com',
                city_id: cali.id,
                company_id: previcar.id,
                sede_type_id: cdaType.id,
                vehicleTypes: [livianoType.id, motoType.id],
                schedules: [
                    {
                        name: 'Lunes a Viernes',
                        days_pattern: '1,2,3,4,5',
                        start_time: '07:00:00',
                        end_time: '17:00:00'
                    },
                    {
                        name: 'Sábados',
                        days_pattern: '6',
                        start_time: '08:00:00',
                        end_time: '17:00:00'
                    },
                    {
                        name: 'Domingos',
                        days_pattern: '7',
                        start_time: '08:00:00',
                        end_time: '12:00:00'
                    }
                ]
            }
        ];

        // 6. Crear sedes administrativas
        const sedesAdministrativas = [
            {
                name: 'Sede Comercial Bogotá',
                address: 'Carrera 15 # 93-47 Oficina 501',
                phone: '601-234-5100',
                email: 'comercial@previcar.com',
                city_id: bogota.id,
                company_id: previcar.id,
                sede_type_id: comercialType.id,
                vehicleTypes: [],
                schedules: []
            },
            {
                name: 'Sede Soporte Bogotá',
                address: 'Carrera 15 # 93-47 Oficina 502',
                phone: '601-234-5200',
                email: 'soporte@previcar.com',
                city_id: bogota.id,
                company_id: previcar.id,
                sede_type_id: soporteType.id,
                vehicleTypes: [],
                schedules: []
            },
            {
                name: 'Cali Comercial',
                address: 'Calle 1#1-1',
                phone: '602-XXX-XXXX',
                email: 'calicomercial@previcar.com',
                city_id: cali.id,
                company_id: previcar.id,
                sede_type_id: comercialType.id,
                vehicleTypes: [],
                schedules: []
            },
            {
                name: 'Pasto Comercial',
                address: 'Calle 1#1-1',
                phone: '602-XXX-XXXX',
                email: 'pastocomercial@previcar.com',
                city_id: pasto.id,
                company_id: previcar.id,
                sede_type_id: comercialType.id,
                vehicleTypes: [],
                schedules: []
            }
        ];

        // 7. Crear todas las sedes
        const todasLasSedes = [...sedesBogota, ...sedesCali, ...sedesAdministrativas];

        for (const sedeData of todasLasSedes) {
            // Crear sede
            const [sede, created] = await Sede.findOrCreate({
                where: { name: sedeData.name },
                defaults: {
                    name: sedeData.name,
                    address: sedeData.address,
                    phone: sedeData.phone,
                    email: sedeData.email,
                    city_id: sedeData.city_id,
                    company_id: sedeData.company_id,
                    sede_type_id: sedeData.sede_type_id,
                    active: true
                }
            });

            if (created) {
                console.log(`✅ Sede creada: ${sede.name}`);

                // Asignar tipos de vehículos
                for (const vehicleTypeId of sedeData.vehicleTypes) {
                    await SedeVehicleType.findOrCreate({
                        where: {
                            sede_id: sede.id,
                            vehicle_type_id: vehicleTypeId
                        },
                        defaults: {
                            sede_id: sede.id,
                            vehicle_type_id: vehicleTypeId,
                            active: true
                        }
                    });
                }

                // Crear horarios para CDA
                if (sedeData.sede_type_id == cdaType.id) {
                    for (const scheduleData of sedeData.schedules) {
                        // Modalidad En Sede
                        await ScheduleTemplate.findOrCreate({
                            where: {
                                sede_id: sede.id,
                                inspection_modality_id: sedeModality.id,
                                name: `${scheduleData.name} - En Sede`,
                                days_pattern: scheduleData.days_pattern
                            },
                            defaults: {
                                sede_id: sede.id,
                                inspection_modality_id: sedeModality.id,
                                name: `${scheduleData.name} - En Sede`,
                                days_pattern: scheduleData.days_pattern,
                                start_time: scheduleData.start_time,
                                end_time: scheduleData.end_time,
                                interval_minutes: 60,
                                capacity_per_interval: 5,
                                active: true,
                                priority: 1
                            }
                        });

                        // Modalidad A Domicilio (con menos capacidad)
                        await ScheduleTemplate.findOrCreate({
                            where: {
                                sede_id: sede.id,
                                inspection_modality_id: domicilioModality.id,
                                name: `${scheduleData.name} - A Domicilio`,
                                days_pattern: scheduleData.days_pattern
                            },
                            defaults: {
                                sede_id: sede.id,
                                inspection_modality_id: domicilioModality.id,
                                name: `${scheduleData.name} - A Domicilio`,
                                days_pattern: scheduleData.days_pattern,
                                start_time: scheduleData.start_time,
                                end_time: scheduleData.end_time,
                                interval_minutes: 60,
                                capacity_per_interval: 3,
                                active: true,
                                priority: 2
                            }
                        });

                        // Modalidad Virtual
                        await ScheduleTemplate.findOrCreate({
                            where: {
                                sede_id: sede.id,
                                inspection_modality_id: virtualModality.id,
                                name: `${scheduleData.name} - Virtual`,
                                days_pattern: scheduleData.days_pattern
                            },
                            defaults: {
                                sede_id: sede.id,
                                inspection_modality_id: virtualModality.id,
                                name: `${scheduleData.name} - Virtual`,
                                days_pattern: scheduleData.days_pattern,
                                start_time: scheduleData.start_time,
                                end_time: scheduleData.end_time,
                                interval_minutes: 60,
                                capacity_per_interval: 2,
                                active: true,
                                priority: 3
                            }
                        });
                    }
                }
            } else {
                console.log(`ℹ️  Sede ya existía: ${sede.name}`);
            }
        }

        console.log('✅ Sedes reales configuradas exitosamente');
        console.log('📋 Resumen de sedes creadas:');
        console.log('   - CDAs: CDA 197, CDA Distrital, CDA PREVITAX (Bogotá)');
        console.log('   - CDAs: CDA Cali Norte, CDA Cali Sur (Cali)');
        console.log('   - Administrativas: Sede Comercial, Sede Soporte (Bogotá)');
        console.log('   - Comerciales: Cali Comercial, Pasto Comercial');

    } catch (error) {
        console.error('❌ Error seeding sedes reales:', error);
        throw error;
    }
};

export default seedRealSedes; 