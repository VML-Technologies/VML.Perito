import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import UserRole from '../models/userRole.js';
import bcrypt from 'bcryptjs';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

const createAdminUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Verificar si el usuario administrador ya existe
        const existingUser = await User.findOne({
            where: { email: 'admin@vmlperito.com' }
        });

        if (existingUser) {
            console.log('⚠️  El usuario administrador ya existe.');
            return existingUser;
        }

        // Buscar una sede existente o crear una temporal
        const { Sede } = await import('../models/index.js');
        let sedeId = null;

        // Intentar encontrar una sede existente
        const existingSede = await Sede.findOne();
        if (existingSede) {
            sedeId = existingSede.id;
            console.log(`✅ Usando sede existente: ${existingSede.name} (ID: ${sedeId})`);
        } else {
            // Si no hay sedes, crear una temporal para el administrador
            console.log('⚠️  No se encontraron sedes. Creando sede temporal para administrador...');
            const { City, Company, SedeType } = await import('../models/index.js');

            // Buscar ciudad de Bogotá
            const bogota = await City.findOne({ where: { name: 'Bogotá' } });
            if (!bogota) {
                throw new Error('No se encontró la ciudad de Bogotá. Ejecuta primero el seed de datos básicos.');
            }

            // Buscar empresa Previcar
            const previcar = await Company.findOne({ where: { name: 'Previcar' } });
            if (!previcar) {
                throw new Error('No se encontró la empresa Previcar. Ejecuta primero el seed de datos básicos.');
            }

            // Buscar tipo de sede Comercial (o crear si no existe)
            let sedeType = await SedeType.findOne({ where: { code: 'COMERCIAL' } });
            if (!sedeType) {
                // Si no existe, crear el tipo de sede Comercial
                sedeType = await SedeType.create({
                    name: 'Comercial',
                    code: 'COMERCIAL',
                    description: 'Sede comercial y administrativa',
                    active: true
                });
                console.log('✅ Tipo de sede Comercial creado para sede temporal');
            }

            // Crear sede temporal
            const tempSede = await Sede.create({
                name: 'Sede Administrativa Temporal',
                address: 'Sede temporal para administrador',
                phone: '601-000-0000',
                email: 'admin@vmlperito.com',
                city_id: bogota.id,
                company_id: previcar.id,
                sede_type_id: sedeType.id,
                active: true
            });

            sedeId = tempSede.id;
            console.log(`✅ Sede temporal creada: ${tempSede.name} (ID: ${sedeId})`);
        }

        // Crear usuario administrador
        const hashedPassword = await bcrypt.hash('123456', 10);

        const adminUser = await User.create({
            sede_id: sedeId,
            name: 'Administrador del Sistema',
            email: 'admin@vmlperito.com',
            phone: '123456789',
            password: hashedPassword,
            is_active: true,
            notification_channel_in_app_enabled: true,
            notification_channel_sms_enabled: true,
            notification_channel_email_enabled: true,
            notification_channel_whatsapp_enabled: true,
        });

        console.log('✅ Usuario administrador creado exitosamente:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Contraseña: 123456`);
        console.log(`   ID: ${adminUser.id}`);

        // Asignar rol super_admin al usuario administrador
        const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
        if (superAdminRole) {
            await UserRole.findOrCreate({
                where: {
                    user_id: adminUser.id,
                    role_id: superAdminRole.id
                }
            });
            console.log(`✅ Rol ${superAdminRole.name} asignado al usuario administrador`);
        } else {
            console.log('⚠️  Rol super_admin no encontrado. Ejecuta primero el seed de RBAC.');
        }

        return adminUser;

    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminUser()
        .then(() => {
            console.log('✅ Usuario administrador creado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default createAdminUser; 