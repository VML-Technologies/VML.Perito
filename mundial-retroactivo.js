// imports
import Company from "./apps/server/models/company.js";
import Sede from "./apps/server/models/sede.js";
import User from "./apps/server/models/user.js";
import InspectionOrder from "./apps/server/models/inspectionOrder.js";
import bcrypt from "bcryptjs";
import fs from "fs";


async function main() {

    // // Crear empresa
    // console.log("Creando empresa...")
    // const [empresa] = await Company.findOrCreate({
    //     where: { name: 'Casos Especiales Mundial' },
    //     defaults: {
    //         name: 'Casos Especiales Mundial',
    //         email: 'info@casosespecialesmundial.com',
    //         phone: '3000000000',
    //         city_id: 1
    //     }
    // });

    // // Crear sede
    // console.log("Creando sede...")
    // const [sede] = await Sede.findOrCreate({
    //     where: {
    //         name: 'Automas Retroactivo',
    //     },
    //     defaults: {
    //         name: 'Automas Retroactivo',
    //         address: 'Sede temporal para administrador',
    //         phone: '601-000-0000',
    //         email: 'info@automasretroactivo.com',
    //         city_id: 1,
    //         company_id: empresa.id,
    //         sede_type_id: 2,
    //         active: true
    //     }
    // });

    // // Crear usuario
    // const hashedPassword = await bcrypt.hash('ScrumMa5t3r&', 10);
    // console.log("Creando usuario...")
    // const [user] = await User.findOrCreate({
    //     where: {
    //         identification: 'SCRUMMASTER',
    //     },
    //     defaults: {
    //         sede_id: sede.id,
    //         identification: 'SCRUMMASTER',
    //         name: 'Monica Gil',
    //         email: 'monica@vmltechnologies.com',
    //         phone: '3043425127',
    //         password: hashedPassword,
    //         is_active: true,
    //         intermediary_key: 'SCRUMMASTER',
    //         notification_channel_in_app_enabled: true,
    //         notification_channel_sms_enabled: true,
    //         notification_channel_email_enabled: true,
    //         notification_channel_whatsapp_enabled: true,
    //     },
    //     roles: ['comercial_mundial']
    // })

    // // crear ordenes de inspeccion
    // console.log("Creando ordenes de inspeccion...")


    // load data.csv
    const data = fs.readFileSync('data.csv', 'utf8');
    const lines = data.split('\n')
    const jsonData = []

    const modelsData = []
    let headers = lines[0].split(',').map(el => el.trim())

    lines.forEach(line => {
        let temp = {}
        line.split(',').forEach((col, i) => {
            let cleaned = col.trim();
            temp[headers[i]] = cleaned
        });

        jsonData.push(temp)
    });

    jsonData.forEach(el => {
        let orderData = {
            user_id: 1,//324,
            producto: el.TipoServicio,
            callback_url: 'https://vmltechnologies.com/',
            numero: el.Idsolicitud,
            intermediario: el.Intermediario,
            clave_intermediario: el.clave,
            fecha: (new Date(el.Fecha)),
            placa: el.Placa,
            marca: el.Marca,
            linea: 'Linea',
            clase: 'Clase',
            modelo: '0000',
            cilindraje: 'Cilindraje',
            color: 'Color',
            servicio: 'Servicio',
            motor: 'Motor',
            chasis: 'Chasis',
            vin: 'Vin',
            carroceria: 'Carroceria',
            combustible: 'Combustible',
            cod_fasecolda: '00000',
            tipo_doc: 'CC',
            num_doc: el.Identificacion_Cliente,
            nombre_cliente: el.Nombre_Cliente,
            celular_cliente: el.Celular,
            correo_cliente: 'dummy@dummy.com',
            nombre_contacto: el.Nombre_Cliente,
            celular_contacto: el.Celular,
            correo_contacto: 'dummy@dummy.com',
            status: 1, // Cambiado de string a number

            // Campos opcionales
            sede_id: 1,//42,
            sucursal: el.Sucursal,
        }

        if (el.Celular != '') {
            modelsData.push(orderData)
        }
    })

    let contador = 0;

    // Usar for...of en lugar de forEach para manejar async correctamente
    for (const el of modelsData) {
        if (el.clave_intermediario != 'clave') {
            console.clear()
        console.log(`Creando orden: ${el.numero}`)
        console.log("--------------------------------")
        console.log(el)
        console.log("--------------------------------")

            const [inspectionOrder, created] = await InspectionOrder.findOrCreate({
            where: {
                numero: el.numero,
            },
            defaults: {
                ...el
            }
        })

            // Lógica corregida: usar el segundo elemento del array para verificar si fue creada
            if (created) {
                console.log(`✅ Orden creada: ${inspectionOrder.id}`)
        } else {
            console.log(`🔍 Orden ya existe: ${inspectionOrder.id}`)
        }

        contador++
            console.log(`📊 Ordenes procesadas: ${contador}/${modelsData.length}`)
        }
    }

    console.log(`🎉 Proceso completado. Total de órdenes procesadas: ${contador}`)
}


main().catch(error => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
});