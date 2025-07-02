import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createTestUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida.');

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            where: { email: 'admin@vmlperito.com' }
        });

        if (existingUser) {
            console.log('⚠️  El usuario de prueba ya existe.');
            return;
        }

        // Crear usuario de prueba
        const hashedPassword = await bcrypt.hash('123456', 10);

        const testUser = await User.create({
            sede_id: 1,
            name: 'Administrador',
            email: 'admin@vmlperito.com',
            phone: '123456789',
            password: hashedPassword,
            is_active: true,
            notification_channel_in_app_enabled: true,
            notification_channel_sms_enabled: true,
            notification_channel_email_enabled: true,
            notification_channel_whatsapp_enabled: true,
        });

        console.log('✅ Usuario de prueba creado exitosamente:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Contraseña: 123456`);
        console.log(`   ID: ${testUser.id}`);

    } catch (error) {
        console.error('❌ Error al crear usuario de prueba:', error);
    } finally {
        await sequelize.close();
    }
};

createTestUser(); 