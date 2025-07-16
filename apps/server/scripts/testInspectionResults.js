import InspectionOrder from '../models/inspectionOrder.js';
import User from '../models/user.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import '../models/index.js';

const testInspectionResults = async () => {
    try {
        console.log('🧪 Iniciando prueba de inspection_result...');

        // Buscar un usuario comercial para usar como referencia
        const commercialUser = await User.findOne({
            where: {
                email: 'comercial@mundial.com'
            }
        });

        if (!commercialUser) {
            console.log('❌ No se encontró usuario comercial. Ejecuta primero el seed de usuarios.');
            return;
        }

        // Buscar estados de orden
        const statuses = await InspectionOrderStatus.findAll();
        const createdStatus = statuses.find(s => s.name === 'Creada');
        const finalizedStatus = statuses.find(s => s.name === 'Finalizada');

        if (!createdStatus || !finalizedStatus) {
            console.log('❌ No se encontraron los estados necesarios. Ejecuta primero el seed de datos de inspección.');
            return;
        }

        // Crear órdenes de prueba con diferentes inspection_result
        const testOrders = [
            {
                user_id: commercialUser.id,
                sede_id: commercialUser.sede_id,
                producto: 'AUTO',
                callback_url: 'https://test.com/callback',
                numero: 100001,
                intermediario: 'Test Intermediario',
                clave_intermediario: commercialUser.intermediary_key,
                sucursal: 'Test Sucursal',
                cod_oficina: '0001',
                fecha: new Date().toISOString().split('T')[0],
                vigencia: '30',
                avaluo: 'Test Avaluo',
                vlr_accesorios: '0',
                placa: 'ABC123',
                marca: 'Toyota',
                linea: 'Corolla',
                clase: 'Automóvil',
                modelo: '2023',
                cilindraje: '1600',
                color: 'Blanco',
                servicio: 'Particular',
                motor: 'ABC123456',
                chasis: 'ABC123456789',
                vin: 'ABC12345678901234',
                carroceria: 'Sedán',
                combustible: 'Gasolina',
                cod_fasecolda: '12345678',
                tipo_doc: 'CC',
                num_doc: '12345678',
                nombre_cliente: 'Cliente Test 1',
                celular_cliente: '3001234567',
                correo_cliente: 'cliente1@test.com',
                nombre_contacto: 'Contacto Test 1',
                celular_contacto: '3001234567',
                correo_contacto: 'contacto1@test.com',
                status: finalizedStatus.id,
                inspection_result: 'RECHAZADO - Vehículo no asegurable',
                inspection_result_details: 'Vehículo con daños estructurales'
            },
            {
                user_id: commercialUser.id,
                sede_id: commercialUser.sede_id,
                producto: 'AUTO',
                callback_url: 'https://test.com/callback',
                numero: 100002,
                intermediario: 'Test Intermediario',
                clave_intermediario: commercialUser.intermediary_key,
                sucursal: 'Test Sucursal',
                cod_oficina: '0001',
                fecha: new Date().toISOString().split('T')[0],
                vigencia: '30',
                avaluo: 'Test Avaluo',
                vlr_accesorios: '0',
                placa: 'DEF456',
                marca: 'Honda',
                linea: 'Civic',
                clase: 'Automóvil',
                modelo: '2022',
                cilindraje: '1800',
                color: 'Negro',
                servicio: 'Particular',
                motor: 'DEF456789',
                chasis: 'DEF456789012',
                vin: 'DEF45678901234567',
                carroceria: 'Sedán',
                combustible: 'Gasolina',
                cod_fasecolda: '87654321',
                tipo_doc: 'CC',
                num_doc: '87654321',
                nombre_cliente: 'Cliente Test 2',
                celular_cliente: '3007654321',
                correo_cliente: 'cliente2@test.com',
                nombre_contacto: 'Contacto Test 2',
                celular_contacto: '3007654321',
                correo_contacto: 'contacto2@test.com',
                status: finalizedStatus.id,
                inspection_result: 'APROBADO CON RESTRICCIONES - Vehículo asegurable con limitaciones',
                inspection_result_details: 'Vehículo con restricciones menores'
            },
            {
                user_id: commercialUser.id,
                sede_id: commercialUser.sede_id,
                producto: 'AUTO',
                callback_url: 'https://test.com/callback',
                numero: 100003,
                intermediario: 'Test Intermediario',
                clave_intermediario: commercialUser.intermediary_key,
                sucursal: 'Test Sucursal',
                cod_oficina: '0001',
                fecha: new Date().toISOString().split('T')[0],
                vigencia: '30',
                avaluo: 'Test Avaluo',
                vlr_accesorios: '0',
                placa: 'GHI789',
                marca: 'Ford',
                linea: 'Focus',
                clase: 'Automóvil',
                modelo: '2021',
                cilindraje: '2000',
                color: 'Azul',
                servicio: 'Particular',
                motor: 'GHI789012',
                chasis: 'GHI789012345',
                vin: 'GHI78901234567890',
                carroceria: 'Sedán',
                combustible: 'Gasolina',
                cod_fasecolda: '11223344',
                tipo_doc: 'CC',
                num_doc: '11223344',
                nombre_cliente: 'Cliente Test 3',
                celular_cliente: '3001122334',
                correo_cliente: 'cliente3@test.com',
                nombre_contacto: 'Contacto Test 3',
                celular_contacto: '3001122334',
                correo_contacto: 'contacto3@test.com',
                status: finalizedStatus.id,
                inspection_result: 'PENDIENTE - Inspección en proceso',
                inspection_result_details: 'Inspección en curso'
            },
            {
                user_id: commercialUser.id,
                sede_id: commercialUser.sede_id,
                producto: 'AUTO',
                callback_url: 'https://test.com/callback',
                numero: 100004,
                intermediario: 'Test Intermediario',
                clave_intermediario: commercialUser.intermediary_key,
                sucursal: 'Test Sucursal',
                cod_oficina: '0001',
                fecha: new Date().toISOString().split('T')[0],
                vigencia: '30',
                avaluo: 'Test Avaluo',
                vlr_accesorios: '0',
                placa: 'JKL012',
                marca: 'Chevrolet',
                linea: 'Cruze',
                clase: 'Automóvil',
                modelo: '2020',
                cilindraje: '1400',
                color: 'Rojo',
                servicio: 'Particular',
                motor: 'JKL012345',
                chasis: 'JKL012345678',
                vin: 'JKL01234567890123',
                carroceria: 'Sedán',
                combustible: 'Gasolina',
                cod_fasecolda: '55667788',
                tipo_doc: 'CC',
                num_doc: '55667788',
                nombre_cliente: 'Cliente Test 4',
                celular_cliente: '3005566778',
                correo_cliente: 'cliente4@test.com',
                nombre_contacto: 'Contacto Test 4',
                celular_contacto: '3005566778',
                correo_contacto: 'contacto4@test.com',
                status: finalizedStatus.id,
                inspection_result: 'APROBADO - Vehículo asegurable',
                inspection_result_details: 'Vehículo en perfectas condiciones'
            },
            {
                user_id: commercialUser.id,
                sede_id: commercialUser.sede_id,
                producto: 'AUTO',
                callback_url: 'https://test.com/callback',
                numero: 100005,
                intermediario: 'Test Intermediario',
                clave_intermediario: commercialUser.intermediary_key,
                sucursal: 'Test Sucursal',
                cod_oficina: '0001',
                fecha: new Date().toISOString().split('T')[0],
                vigencia: '30',
                avaluo: 'Test Avaluo',
                vlr_accesorios: '0',
                placa: 'MNO345',
                marca: 'Nissan',
                linea: 'Sentra',
                clase: 'Automóvil',
                modelo: '2019',
                cilindraje: '1600',
                color: 'Gris',
                servicio: 'Particular',
                motor: 'MNO345678',
                chasis: 'MNO345678901',
                vin: 'MNO34567890123456',
                carroceria: 'Sedán',
                combustible: 'Gasolina',
                cod_fasecolda: '99887766',
                tipo_doc: 'CC',
                num_doc: '99887766',
                nombre_cliente: 'Cliente Test 5',
                celular_cliente: '3009988776',
                correo_cliente: 'cliente5@test.com',
                nombre_contacto: 'Contacto Test 5',
                celular_contacto: '3009988776',
                correo_contacto: 'contacto5@test.com',
                status: createdStatus.id,
                inspection_result: null, // Sin resultado de inspección
                inspection_result_details: null
            }
        ];

        console.log('📝 Creando órdenes de prueba con diferentes inspection_result...');

        for (const orderData of testOrders) {
            const existingOrder = await InspectionOrder.findOne({
                where: { numero: orderData.numero }
            });

            if (!existingOrder) {
                await InspectionOrder.create(orderData);
                console.log(`✅ Orden #${orderData.numero} creada con inspection_result: ${orderData.inspection_result || 'null'}`);
            } else {
                console.log(`⚠️ Orden #${orderData.numero} ya existe, saltando...`);
            }
        }

        console.log('🎉 Prueba de inspection_result completada exitosamente!');
        console.log('📊 Ahora puedes probar los filtros en las páginas:');
        console.log('   - Comercial Mundial');
        console.log('   - Coordinador de Contacto');
        console.log('   - Agente de Contacto');
        console.log('');
        console.log('🔍 Valores de prueba creados:');
        console.log('   - RECHAZADO - Vehículo no asegurable (rojo)');
        console.log('   - APROBADO CON RESTRICCIONES - Vehículo asegurable con limitaciones (naranja)');
        console.log('   - PENDIENTE - Inspección en proceso (amarillo)');
        console.log('   - APROBADO - Vehículo asegurable (verde)');
        console.log('   - null (usando status de la orden)');

    } catch (error) {
        console.error('❌ Error en prueba de inspection_result:', error);
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testInspectionResults()
        .then(() => {
            console.log('✅ Script completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default testInspectionResults; 