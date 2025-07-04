import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import UserRole from '../models/userRole.js';
import bcrypt from 'bcryptjs';

// Importar modelos para establecer relaciones
import '../models/index.js';

dotenv.config();

const seedUsers = async () => {
    try {
        console.log('👥 Iniciando seed de usuarios con nuevos roles...');

        // Verificar que los roles existan
        const comercialRole = await Role.findOne({ where: { name: 'comercial_mundial' } });
        const agenteRole = await Role.findOne({ where: { name: 'agente_contacto' } });
        const adminRole = await Role.findOne({ where: { name: 'super_admin' } });

        if (!comercialRole || !agenteRole) {
            console.log('⚠️  Los roles comercial_mundial o agente_contacto no existen. Ejecuta primero el seed de RBAC.');
            return;
        }

        const hashedPassword = await bcrypt.hash('123456', 10);

        // Crear usuarios con los nuevos roles
        const users = [
            {
                userData: {
                    sede_id: 1,
                    name: 'María Comercial',
                    email: 'comercial@vmlperito.com',
                    phone: '300-7654321',
                    password: hashedPassword,
                    is_active: true,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                },
                roles: ['comercial_mundial']
            },
            {
                userData: {
                    sede_id: 1,
                    name: 'Carlos Agente',
                    email: 'agente@vmlperito.com',
                    phone: '300-1357924',
                    password: hashedPassword,
                    is_active: true,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                },
                roles: ['agente_contacto']
            },
            {
                userData: {
                    sede_id: 1,
                    name: 'Ana Supervisora',
                    email: 'supervisora@vmlperito.com',
                    phone: '300-2468135',
                    password: hashedPassword,
                    is_active: true,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                },
                roles: ['comercial_mundial', 'agente_contacto'] // Usuario con múltiples roles
            }
        ];

        console.log('👤 Creando usuarios...');
        for (const { userData, roles } of users) {
            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                where: { email: userData.email }
            });

            if (existingUser) {
                console.log(`⚠️  El usuario ${userData.email} ya existe.`);
                continue;
            }

            // Crear usuario
            const user = await User.create(userData);
            console.log(`✅ Usuario creado: ${user.name} (${user.email})`);

            // Asignar roles
            for (const roleName of roles) {
                const role = await Role.findOne({ where: { name: roleName } });
                if (role) {
                    await UserRole.findOrCreate({
                        where: {
                            user_id: user.id,
                            role_id: role.id
                        }
                    });
                    console.log(`   🔗 Rol "${roleName}" asignado a ${user.name}`);
                } else {
                    console.log(`   ⚠️  Rol "${roleName}" no encontrado`);
                }
            }
        }

        console.log('🎉 Seed de usuarios completado exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('\n👩‍💼 COMERCIAL MUNDIAL:');
        console.log('   Email: comercial@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👨‍💼 Agente de Contact:');
        console.log('   Email: agente@vmlperito.com');
        console.log('   Contraseña: 123456');
        console.log('\n👩‍💼 SUPERVISORA (AMBOS ROLES):');
        console.log('   Email: supervisora@vmlperito.com');
        console.log('   Contraseña: 123456');

    } catch (error) {
        console.error('❌ Error al crear usuarios:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedUsers()
        .then(() => {
            console.log('✅ Seed de usuarios completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default seedUsers; 