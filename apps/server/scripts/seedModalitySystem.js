import {
    SedeType,
    InspectionModality,
    VehicleType
} from '../models/index.js';

const seedModalitySystem = async () => {
    try {
        console.log('🏗️  Seeding sistema de modalidades avanzado...');

        // 1. Insertar tipos de sede actualizados
        const sedeTypes = [
            { name: 'CDA', code: 'CDA', description: 'Centro de Diagnóstico Automotor' },
            { name: 'Comercial', code: 'COMERCIAL', description: 'Sede comercial y ventas' },
            { name: 'Soporte', code: 'SOPORTE', description: 'Sede de soporte y contact center' }
        ];

        for (const type of sedeTypes) {
            const [created, wasCreated] = await SedeType.findOrCreate({
                where: { code: type.code },
                defaults: type
            });
            console.log(`${wasCreated ? '✅ Creado' : 'ℹ️  Existía'} tipo de sede: ${type.name}`);
        }

        // 2. Insertar modalidades de inspección
        const modalities = [
            { name: 'En Sede', code: 'SEDE', description: 'Inspección realizada en las instalaciones de la sede' },
            { name: 'A Domicilio', code: 'DOMICILIO', description: 'Inspección realizada en el domicilio del cliente' },
            { name: 'Virtual', code: 'VIRTUAL', description: 'Inspección realizada de forma virtual/remota' }
        ];

        for (const modality of modalities) {
            const [created, wasCreated] = await InspectionModality.findOrCreate({
                where: { code: modality.code },
                defaults: modality
            });
            console.log(`${wasCreated ? '✅ Creada' : 'ℹ️  Existía'} modalidad: ${modality.name}`);
        }

        // 3. Insertar tipos de vehículos
        const vehicleTypes = [
            { name: 'Livianos', code: 'LIVIANO', description: 'Vehículos livianos (automóviles, camionetas pequeñas)' },
            { name: 'Pesados', code: 'PESADO', description: 'Vehículos pesados (camiones, buses, tractomulas)' },
            { name: 'Motos', code: 'MOTO', description: 'Motocicletas y ciclomotores' }
        ];

        for (const vehicleType of vehicleTypes) {
            const [created, wasCreated] = await VehicleType.findOrCreate({
                where: { code: vehicleType.code },
                defaults: vehicleType
            });
            console.log(`${wasCreated ? '✅ Creado' : 'ℹ️  Existía'} tipo de vehículo: ${vehicleType.name}`);
        }

        console.log('✅ Sistema de modalidades avanzado configurado exitosamente');

    } catch (error) {
        console.error('❌ Error seeding sistema de modalidades:', error);
        throw error;
    }
};

export default seedModalitySystem; 