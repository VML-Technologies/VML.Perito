import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import UserRole from '../models/userRole.js';
import Sede from '../models/sede.js';
import bcrypt from 'bcryptjs';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

/**
 * Parsear CSV a JSON
 */
const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    console.log('🔍 Primera línea (headers):', lines[0]);
    
    // Detectar separador (coma o punto y coma)
    const separator = lines[0].includes(';') ? ';' : ',';
    console.log('🔍 Separador detectado:', separator);
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    console.log('🔍 Headers parseados:', headers);
    
    return lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
};

/**
 * Mapear ciudad a sede comercial
 */
const getSedeIdByCity = async (cityName) => {
    try {
        const sedeMapping = {
            'CALI': 'Cali Comercial',
            'Cali': 'Cali Comercial', 
            'cali': 'Cali Comercial',
            'PASTO': 'Pasto Comercial',
            'Pasto': 'Pasto Comercial',
            'pasto': 'Pasto Comercial'
        };

        const sedeName = sedeMapping[cityName];
        if (!sedeName) {
            console.log(`⚠️ Ciudad no válida: ${cityName}. Solo se permiten Cali o Pasto`);
            return null;
        }
        const sede = await Sede.findOne({ where: { name: sedeName } });
        return sede?.id || null;
    } catch (error) {
        console.error(`❌ Error obteniendo sede para ciudad ${cityName}:`, error.message);
        return null;
    }
};

/**
 * Cargar usuarios desde CSV
 */
const loadUsersFromCSV = async (csvPath, roleName = 'comercial_mundial_4') => {
    try {
        console.log(`📊 Cargando usuarios desde: ${csvPath}`);
        
        // 1. Leer CSV (igual que municipios.json en el proyecto)
        const csvText = fs.readFileSync(csvPath, 'utf8');
        const csvData = parseCSV(csvText);
        
        console.log(`📋 ${csvData.length} registros encontrados en CSV`);
        console.log('🔍 Primeras 3 filas del CSV:', csvData.slice(0, 3));
        console.log('🔍 Headers detectados:', Object.keys(csvData[0] || {}));

        // 2. Verificar rol
        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            throw new Error(`No se encontró el rol: ${roleName}`);
        }

        // 3. Hash de contraseña (se usará la del CSV o por defecto)
        const defaultPassword = 'ComercialMundial#132';
        const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);
        console.log('🔐 Contraseña por defecto hasheada:', hashedDefaultPassword);
        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // 4. Procesar cada usuario
        for (const row of csvData) {
            try {
                const userData = {
                    identification: (row['Identificacion'] || '').toString().trim(),
                    name: (row['Nombre'] || '').toString().trim(),
                    email: (row['Correo Electronico'] || '').toString().trim(),
                    password: (row['Clave'] || '').toString().trim(),
                    city: (row['Ciudad'] || '').toString().trim(),
                    phone: '3000000000' // Por defecto
                };

                // Generar identificación si está vacía
                if (!userData.identification && userData.email) {
                    const emailPrefix = userData.email.split('@')[0];
                    userData.identification = (userData.identification + emailPrefix).slice(0, 45);
                    console.log(`🔄 Identificación generada: ${userData.identification} para ${userData.name}`);
                }

                // Saltar filas completamente vacías
                if (!userData.identification && !userData.name && !userData.email) {
                    continue;
                }

                // Validar datos requeridos
                if (!userData.identification || !userData.name || !userData.email || !userData.city) {
                    console.log(`⚠️ Datos incompletos:`, userData);
                    errorCount++;
                    continue;
                }

                userData.email = userData.email.toLowerCase().trim();

                // Usar contraseña del CSV o por defecto
                const passwordToUse = userData.password || defaultPassword;
                const hashedPassword = hashedDefaultPassword

                // Verificar duplicados por email
                const existingUserByEmail = await User.findOne({
                    where: { email: userData.email }
                });

                if (existingUserByEmail) {
                    console.log(`⚠️ Usuario ya existe: ${userData.email}`);
                    skippedCount++;
                    continue;
                }

                // Verificar duplicados por identificación y generar nueva si está duplicada
                let finalIdentification = userData.identification;
                const existingUserById = await User.findOne({
                    where: { identification: finalIdentification }
                });

                if (existingUserById) {
                    // Generar nueva identificación usando la fórmula
                    const emailPrefix = userData.email.split('@')[0];
                    finalIdentification = (userData.identification + emailPrefix).slice(0, 45);
                    console.log(`🔄 ID duplicado, generando nuevo: ${finalIdentification} para ${userData.name}`);
                }

                // Obtener sede
                const sedeId = await getSedeIdByCity(userData.city);
                if (!sedeId) {
                    console.log(`⚠️ No se encontró sede para: ${userData.city}`);
                    errorCount++;
                    continue;
                }

                // Crear usuario
                const user = await User.create({
                    sede_id: sedeId,
                    identification: finalIdentification,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    password: hashedPassword,
                    is_active: true,
                    temporary_password: true,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true
                });

                // Asignar rol
                await UserRole.create({
                    user_id: user.id,
                    role_id: role.id
                });

                console.log(`✅ Usuario creado: ${user.name} (${userData.city})`);
                createdCount++;

            } catch (error) {
                console.error(`❌ Error procesando usuario ${row.Nombre || 'sin nombre'}:`, error.message);
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.error(`   🔄 Duplicado detectado - Email: ${row['Correo Electronico']}, ID: ${row['Identificacion']}`);
                }
                if (error.errors) {
                    error.errors.forEach(err => {
                        console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
                    });
                }
                errorCount++;
            }
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   - ${createdCount} usuarios creados`);
        console.log(`   - ${skippedCount} usuarios existentes`);
        console.log(`   - ${errorCount} errores`);

    } catch (error) {
        console.error('❌ Error cargando CSV:', error);
        throw error;
    }
};

/**
 * Función principal
 */
const bulkCreateUsersFromCSV = async () => {
    try {
        console.log('👥 Iniciando carga masiva de usuarios desde CSV...');
        
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // Ruta del archivo CSV
        const csvPath = path.join(__dirname, '../usuarios.csv');
        console.log(`📂 Buscando archivo en: ${csvPath}`);
        
        // Verificar que el archivo existe
        if (!fs.existsSync(csvPath)) {
            throw new Error(`❌ Archivo no encontrado: ${csvPath}`);
        }
        
        console.log('✅ Archivo CSV encontrado');
        
        await loadUsersFromCSV(csvPath);
        
        console.log('✅ Carga masiva completada');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📍 Stack:', error.stack);
    } finally {
        await sequelize.close();
        console.log('📴 Conexión cerrada');
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 INICIANDO SCRIPT...');
    console.log('📂 Directorio actual:', __dirname);
    console.log('📄 Buscando archivo CSV...');
    
    const csvPath = path.join(__dirname, '../usuarios.csv');
    console.log('📍 Ruta completa:', csvPath);
    
    if (fs.existsSync(csvPath)) {
        console.log('✅ Archivo encontrado!');
        bulkCreateUsersFromCSV();
    } else {
        console.log('❌ Archivo NO encontrado');
        console.log('💡 Coloca el archivo usuarios.csv en:', path.join(__dirname, '..'));
        process.exit(1);
    }
}

export default bulkCreateUsersFromCSV;