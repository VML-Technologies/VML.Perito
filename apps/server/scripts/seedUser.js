import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import UserRole from '../models/userRole.js';
import bcrypt from 'bcryptjs';

// Importar modelos para establecer relaciones
import '../models/index.js';

dotenv.config();

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

        // Crear usuario administrador
        const hashedPassword = await bcrypt.hash('123456', 10);

        const adminUser = await User.create({
            sede_id: 1,
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