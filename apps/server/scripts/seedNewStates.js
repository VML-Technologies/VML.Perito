import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import InspectionOrdersStatusInternal from '../models/inspectionOrdersStatusInternal.js';
import AppointmentStatus from '../models/appointmentStatus.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

const seedNewStates = async () => {
    try {
        console.log('🌱 Iniciando seed de estados de órdenes de inspección y citas...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Crear estados internos de órdenes de inspección
        console.log('\n📋 Creando estados internos de órdenes de inspección...');
        const inspectionStatusData = [
            {
                name: 'Activa',
                description: 'Orden de inspección activa y lista para procesar'
            },
            {
                name: 'En proceso',
                description: 'Orden de inspección en proceso de ejecución'
            },
            {
                name: 'Notificada',
                description: 'Orden de inspección notificada al cliente'
            },
            {
                name: 'Re activada',
                description: 'Orden de inspección reactivada después de estar pausada'
            },
            {
                name: 'Inspeccionada',
                description: 'Orden de inspección completada exitosamente'
            },
            {
                name: 'Fallida',
                description: 'Orden de inspección que no pudo completarse'
            },
            {
                name: 'Finalizada',
                description: 'Orden de inspección finalizada completamente'
            }
        ];

        for (const statusData of inspectionStatusData) {
            const [status, created] = await InspectionOrdersStatusInternal.findOrCreate({
                where: { name: statusData.name },
                defaults: statusData
            });
            
            if (created) {
                console.log(`✅ Estado interno creado: ${status.name}`);
            } else {
                console.log(`ℹ️ Estado interno ya existe: ${status.name}`);
            }
        }

        // Crear estados de citas
        console.log('\n📅 Creando estados de citas...');
        const appointmentStatusData = [
            {
                name: 'Pendiente',
                description: 'Cita programada y pendiente de ejecución'
            }, {
                name: 'En proceso',
                description: 'Cita en proceso de ejecución'
            }, {
                name: 'Llamada Finalizada',
                description: 'Llamada finalizada'
            }, {
                name: 'Revisión de supervisor',
                description: 'Revisión de supervisor'
            }, {
                name: 'Completada',
                description: 'Agendamiento completado'
            }, {
                name: 'Cancelado',
                description: 'Cita cancelada por el cliente o el sistema'
            }, {
                name: 'Reintento',
                description: 'Inspección reintentada'
            }
        ];

        for (const statusData of appointmentStatusData) {
            const [status, created] = await AppointmentStatus.findOrCreate({
                where: { name: statusData.name },
                defaults: statusData
            });
            
            if (created) {
                console.log(`✅ Estado de cita creado: ${status.name}`);
            } else {
                console.log(`ℹ️ Estado de cita ya existe: ${status.name}`);
            }
        }

        console.log('\n🎉 Seed de estados completado exitosamente!');
        console.log('\n📋 Resumen de estados creados:');
        console.log('   Estados internos de órdenes de inspección:');
        inspectionStatusData.forEach(status => {
            console.log(`     - ${status.name}: ${status.description}`);
        });
        console.log('   Estados de citas:');
        appointmentStatusData.forEach(status => {
            console.log(`     - ${status.name}: ${status.description}`);
        });

    } catch (error) {
        console.error('❌ Error en el seed de estados:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedNewStates()
        .then(() => {
            console.log('\n✅ Proceso de seed de estados completado exitosamente');
            // Cerrar la conexión después de un pequeño delay
            setTimeout(async () => {
                try {
                    await sequelize.close();
                    console.log('📴 Conexión a la base de datos cerrada correctamente.');
                    process.exit(0);
                } catch (closeError) {
                    console.error('⚠️ Error al cerrar la conexión:', closeError.message);
                    process.exit(1);
                }
            }, 2000);
        })
        .catch((error) => {
            console.error('❌ Error fatal en seedNewStates:', error);
            sequelize.close().then(() => process.exit(1));
        });
}

export default seedNewStates;
