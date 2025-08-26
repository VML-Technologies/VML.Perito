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

/**
 * Crear usuario administrador
 */
const createAdminUser = async () => {
    try {
        console.log('👤 Creando usuario administrador...');

        // Verificar si el usuario administrador ya existe
        const existingUser = await User.findOne({
            where: { email: 'admin@vmltechnologies.com' }
        });

        if (existingUser) {
            console.log('⚠️ El usuario administrador ya existe.');
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
            console.log('⚠️ No se encontraron sedes. Creando sede temporal para administrador...');
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
                email: 'admin@vmltechnologies.com',
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
            identification: 'ADMIN001',
            name: 'Administrador del Sistema',
            email: 'admin@vmltechnologies.com',
            phone: '123456789',
            password: hashedPassword,
            is_active: true,
            notification_channel_in_app_enabled: true,
            notification_channel_sms_enabled: true,
            notification_channel_email_enabled: true,
            notification_channel_whatsapp_enabled: true
        });

        // Buscar rol de super_admin
        const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
        if (!superAdminRole) {
            throw new Error('No se encontró el rol super_admin. Ejecuta primero el seed de RBAC.');
        }

        // Asignar rol al usuario
        await UserRole.create({
            user_id: adminUser.id,
            role_id: superAdminRole.id
        });

        console.log('✅ Usuario administrador creado exitosamente');
        console.log(`   - Email: ${adminUser.email}`);
        console.log(`   - Contraseña: 123456`);
        console.log(`   - Rol: ${superAdminRole.name}`);

        return adminUser;

    } catch (error) {
        console.error('❌ Error creando usuario administrador:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Crear usuarios con roles específicos
 */
const createUsersWithRoles = async () => {
    try {
        console.log('👥 Creando usuarios con roles específicos...');

        // Verificar que los roles existan
        const comercialRole = await Role.findOne({ where: { name: 'comercial_mundial' } });
        const agenteRole = await Role.findOne({ where: { name: 'agente_contacto' } });
        const coordinadorRole = await Role.findOne({ where: { name: 'coordinador_contacto' } });

        if (!comercialRole || !agenteRole || !coordinadorRole) {
            console.log('⚠️ Los roles comercial_mundial, agente_contacto o coordinador_contacto no existen. Ejecuta primero el seed de RBAC.');
            return;
        }

        const hashedPassword = await bcrypt.hash('ComercialMundial#132', 10);

        // Crear usuarios con los nuevos roles
        const users = [
            {
                userData: {
                    sede_id: 1,
                    identification: 'COORD001',
                    name: 'Ana Coordinadora',
                    email: 'coordinador_cc@vmltechnologies.com',
                    phone: '3043425127',
                    password: hashedPassword,
                    is_active: true,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                },
                roles: ['coordinador_contacto']
            },
            {
                userData: {
                    sede_id: 1,
                    identification: 'AGENTE001',
                    name: 'Carlos Agente',
                    email: 'agente_cc_1@vmltechnologies.com',
                    phone: '3043425127',
                    password: hashedPassword,
                    is_active: true,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                },
                roles: ['agente_contacto']
            },

            // Usuarios Comerciales Mundiales
            {
                userData: {
                    sede_id: 1,
                    identification: 'OMBEM001',
                    name: 'OMAR JAVIER BENAVIDES MORENO',
                    email: 'omar.benavides@holdingvml.net',
                    phone: '3000000000',
                    password: hashedPassword,
                    is_active: true,
                    intermediary_key: 'OMARBENAVIDES',
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                },
                roles: ['comercial_mundial']
            },
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const userConfig of users) {
            try {
                // Verificar si el usuario ya existe
                const existingUser = await User.findOne({
                    where: { email: userConfig.userData.email }
                });

                if (existingUser) {
                    console.log(`⚠️ Usuario ya existe: ${userConfig.userData.email}`);
                    skippedCount++;
                    continue;
                }

                // Crear usuario
                const user = await User.create(userConfig.userData);

                // Asignar roles
                for (const roleName of userConfig.roles) {
                    const role = await Role.findOne({ where: { name: roleName } });
                    if (role) {
                        await UserRole.create({
                            user_id: user.id,
                            role_id: role.id
                        });
                    }
                }

                console.log(`✅ Usuario creado: ${user.name} (${user.email})`);
                createdCount++;

            } catch (error) {
                console.error(`❌ Error creando usuario ${userConfig.userData.email}:`, error.message);
                if (error.errors) {
                    error.errors.forEach(err => {
                        console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
                    });
                }
            }
        }

        console.log(`\n📊 Resumen de usuarios:`);
        console.log(`   - ${createdCount} usuarios creados`);
        console.log(`   - ${skippedCount} usuarios existentes`);

    } catch (error) {
        console.error('❌ Error creando usuarios con roles:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
            });
        }
        throw error;
    }
};

/**
 * Función principal que ejecuta ambos procesos
 */
const seedUsers = async () => {
    try {
        console.log('👥 Iniciando seed de usuarios...');

        // 1. Crear usuario administrador
        await createAdminUser();

        // 2. Crear usuarios con roles específicos
        await createUsersWithRoles();

        console.log('✅ Seed de usuarios completado exitosamente');

    } catch (error) {
        console.error('❌ Error en seed de usuarios:', error);
        throw error;
    }
};

export default seedUsers;
export { createAdminUser, createUsersWithRoles }; 