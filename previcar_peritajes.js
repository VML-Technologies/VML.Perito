// Previcar
import Company from "./apps/server/models/company.js";
import Sede from "./apps/server/models/sede.js";
import User from "./apps/server/models/user.js";
import SedeType from "./apps/server/models/sedeType.js";
import bcrypt from "bcryptjs";

async function main() {

    const [previcar] = await Company.findOrCreate({
        where: {
            name: 'Previcar'
        }
    })

    const [sedeType] = await SedeType.findOrCreate({
        where: {
            name: 'CDA'
        }
    })

    // Crear sede
    console.log("Creando sede...")
    const [sede] = await Sede.findOrCreate({
        where: {
            name: 'Peritajes',
        },
        defaults: {
            name: 'Peritajes',
            address: 'Sede temporal para administrador',
            phone: '601-000-0000',
            email: 'info@previcarperitajes.com',
            city_id: 1,
            company_id: previcar.id,
            sede_type_id: sedeType.id,
            active: true
        }
    });

    // Crear usuario
    const hashedPassword = await bcrypt.hash('Comerc1al3sp3c1al&', 10);
    console.log("Creando usuario...")
    const [user] = await User.findOrCreate({
        where: {
            identification: 'PERITAJES',
        },
        defaults: {
            sede_id: sede.id,
            identification: 'PERITAJES',
            name: 'Peritajes',
            email: 'peritajes@previcar.com',
            phone: '3043425127',
            password: hashedPassword,
            is_active: true,
            intermediary_key: 'PERITAJES',
            notification_channel_in_app_enabled: true,
            notification_channel_sms_enabled: true,
            notification_channel_email_enabled: true,
            notification_channel_whatsapp_enabled: true,
        },
        roles: ['comercial_mundial']
    })
}

main()