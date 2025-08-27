import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import User from '../models/user.js';
import Role from '../models/role.js';
import UserRole from '../models/userRole.js';
import Department from '../models/department.js';
import City from '../models/city.js';
import Sede from '../models/sede.js';
import Company from '../models/company.js';
import SedeType from '../models/sedeType.js';
import bcrypt from 'bcryptjs';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

/**
 * Crear departamentos faltantes
 */
const createMissingDepartments = async () => {
    try {
        console.log('🏛️ Verificando departamentos faltantes...');
        
        const departmentsToCreate = [
            { name: 'Nariño' }, // Para Pasto
            { name: 'Tolima' }, // Para Ibagué
            { name: 'Caldas' }, // Para Manizales
            { name: 'Risaralda' }, // Para Armenia
            { name: 'Cesar' }, // Para Valledupar
            { name: 'Meta' }, // Para Villavicencio
            { name: 'Boyacá' }, // Para Duitama
            { name: 'Sucre' }, // Para Sincelejo
        ];

        for (const deptData of departmentsToCreate) {
            const [dept, created] = await Department.findOrCreate({
                where: { name: deptData.name },
                defaults: deptData
            });
            
            if (created) {
                console.log(`✅ Departamento creado: ${dept.name}`);
            } else {
                console.log(`ℹ️ Departamento ya existe: ${dept.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Error creando departamentos:', error.message);
        throw error;
    }
};

/**
 * Crear ciudades faltantes
 */
const createMissingCities = async () => {
    try {
        console.log('🏙️ Verificando ciudades faltantes...');
        
        // Obtener departamentos
        const nariño = await Department.findOne({ where: { name: 'Nariño' } });
        const tolima = await Department.findOne({ where: { name: 'Tolima' } });
        const caldas = await Department.findOne({ where: { name: 'Caldas' } });
        const risaralda = await Department.findOne({ where: { name: 'Risaralda' } });
        const cesar = await Department.findOne({ where: { name: 'Cesar' } });
        const meta = await Department.findOne({ where: { name: 'Meta' } });
        const boyaca = await Department.findOne({ where: { name: 'Boyacá' } });
        const sucre = await Department.findOne({ where: { name: 'Sucre' } });
        const cundinamarca = await Department.findOne({ where: { name: 'Cundinamarca' } });
        const valle = await Department.findOne({ where: { name: 'Valle del Cauca' } });
        const santander = await Department.findOne({ where: { name: 'Santander' } });

        const citiesToCreate = [
            { name: 'Sincelejo', department_id: sucre?.id },
        ];

        for (const cityData of citiesToCreate) {
            if (cityData.department_id) {
                const [city, created] = await City.findOrCreate({
                    where: { name: cityData.name },
                    defaults: cityData
                });
                
                if (created) {
                    console.log(`✅ Ciudad creada: ${city.name}`);
                } else {
                    console.log(`ℹ️ Ciudad ya existe: ${city.name}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error creando ciudades:', error.message);
        throw error;
    }
};

/**
 * Crear sedes faltantes
 */
const createMissingSedes = async () => {
    try {
        console.log('🏢 Verificando sedes faltantes...');
        
        // Obtener empresa Previcar
        const previcar = await Company.findOne({ where: { name: 'Previcar' } });
        if (!previcar) {
            throw new Error('No se encontró la empresa Previcar');
        }

        // Obtener tipo de sede Comercial
        const comercialType = await SedeType.findOne({ where: { code: 'COMERCIAL' } });
        if (!comercialType) {
            throw new Error('No se encontró el tipo de sede Comercial');
        }

        // Obtener ciudades
        const bogota = await City.findOne({ 
            where: { name: 'Bogotá' },
            include: [{ model: Department, as: 'department', where: { name: 'Cundinamarca' } }]
        });
        const cali = await City.findOne({ 
            where: { name: 'Cali' },
            include: [{ model: Department, as: 'department', where: { name: 'Valle del Cauca' } }]
        });
        const pasto = await City.findOne({ 
            where: { name: 'Pasto' },
            include: [{ model: Department, as: 'department', where: { name: 'Nariño' } }]
        });
        const bucaramanga = await City.findOne({ 
            where: { name: 'Bucaramanga' },
            include: [{ model: Department, as: 'department', where: { name: 'Santander' } }]
        });
        const armenia = await City.findOne({ 
            where: { name: 'Armenia' },
            include: [{ model: Department, as: 'department', where: { name: 'Risaralda' } }]
        });
        const sincelejo = await City.findOne({ 
            where: { name: 'Sincelejo' },
            include: [{ model: Department, as: 'department', where: { name: 'Sucre' } }]
        });

        const sedesToCreate = [
            {
                name: 'CEN SUCRE',
                address: 'Calle 20 # 15-30',
                phone: '605-234-5013',
                email: 'sucre@previcar.com',
                city_id: sincelejo?.id,
                company_id: previcar.id,
                sede_type_id: comercialType.id
            }
        ];

        for (const sedeData of sedesToCreate) {
            if (sedeData.city_id) {
                const [sede, created] = await Sede.findOrCreate({
                    where: { name: sedeData.name },
                    defaults: sedeData
                });
                
                if (created) {
                    console.log(`✅ Sede creada: ${sede.name}`);
                } else {
                    console.log(`ℹ️ Sede ya existe: ${sede.name}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error creando sedes:', error.message);
        throw error;
    }
};

/**
 * Mapear sede por ubicación del usuario
 */
const getSedeIdByLocation = async (location) => {
    try {
        // Mapeo de ubicaciones a sedes
        const sedeMapping = {
            'CALI': 'CEN CALI SUR',
            'Cali': 'CEN CALI SUR',
            'cali': 'CEN CALI SUR',
            'Pasto': 'CEN PASTO',
            'BOGOTA': 'DIRECCIÓN GENERAL',
            'BOGOTÁ': 'DIRECCIÓN GENERAL',
            'ARMENIA': 'CEN ARMENIA',
            'Bucarmanga': 'AGENCIA BUCARAMANGA',
            'Bucaramanga': 'AGENCIA BUCARAMANGA',
            'SINCELEJO': 'CEN SUCRE',
            'Barranquilla': 'SUC BARRANQUILLIA',
            'Cartagena': 'SUC CARTAGENA',
            // Mapeos adicionales para usuarios específicos
            'CEN BOGOTA OCCIDENTE': 'CEN BTÁ OCCIDENTE',
            'SUCURSAL BOGOTÁ': 'SUCURSAL BOGOTA',
            'BOGOTA': 'DIRECCIÓN GENERAL'
        };

        const sedeName = sedeMapping[location];
        if (!sedeName) {
            console.log(`⚠️ No se encontró mapeo para ubicación: ${location}`);
            return null;
        }

        const sede = await Sede.findOne({ where: { name: sedeName } });
        if (!sede) {
            console.log(`⚠️ No se encontró la sede: ${sedeName}`);
            return null;
        }

        return sede.id;
    } catch (error) {
        console.error(`❌ Error obteniendo sede para ubicación ${location}:`, error.message);
        return null;
    }
};

/**
 * Crear usuarios comerciales
 */
const createComercialUsers = async () => {
    try {
        console.log('👥 Creando usuarios comerciales...');

        // Verificar que el rol comercial_mundial exista
        const comercialRole = await Role.findOne({ where: { name: 'comercial_mundial' } });
        if (!comercialRole) {
            throw new Error('No se encontró el rol comercial_mundial. Ejecuta primero el seed de RBAC.');
        }

        const hashedPassword = await bcrypt.hash('ComercialMundial#132', 10);

        // Lista de usuarios comerciales
        const users = [
            {
                identification: '31308729',
                name: 'Isabel Cristina Gonzalez Castro',
                email: 'cenisgonzalez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'DIRECTO MUNDIAL',
                location: 'CALI'
            },
            {
                identification: '1110523050',
                name: 'Lina Marcela Villalobos Cabal',
                email: 'lvillalobos@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '1193395049',
                name: 'Saday Jareth Garcia Montealegre',
                email: 'sgarcia@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '1010110835',
                name: 'Cristhian Alexander Sanchez Angulo',
                email: 'crisanchez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '1144141402',
                name: 'Miriam del Mar Hidalgo Garcia',
                email: 'mhidalgo@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '87061821',
                name: 'Luis Eduardo Cordoba Gomez',
                email: 'lucordoba@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Pasto',
                location: 'Pasto'
            },
            {
                identification: '36953176',
                name: 'Yadira Lizeth Bermudez Males',
                email: 'yabermudez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Pasto',
                location: 'Pasto'
            },
            {
                identification: '15814481',
                name: 'Andrés Montero Fernández',
                email: 'lmontero@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Pasto',
                location: 'Pasto'
            },
            {
                identification: '1061697480',
                name: 'Germán Zapata Azcarate',
                email: 'gerzapata@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '66834039',
                name: 'Luz Edith Solarte D',
                email: 'Lsolarte@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '66980351',
                name: 'Maria Claudia Bejarano M.',
                email: 'mcbejarano@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Cali',
                location: 'Cali'
            },
            {
                identification: '1001098233',
                name: 'LEIDY JOHANA MARTINEZ PALOMINO',
                email: 'leimartinez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1000461641',
                name: 'Daniel Santiago Serrano Lopez',
                email: 'daserrano@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1010038091',
                name: 'SANDRA PAOLA VARON MUÑOZ VARON',
                email: 'savaron@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1143859379',
                name: 'SANDRA GABRIELA DOSMAN ORTIZ',
                email: 'sdosman@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1000953941',
                name: 'Juan David Rios Rubio',
                email: 'jdrios@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1000619805',
                name: 'Cesar Andres Parra Caicedo',
                email: 'ceparra@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1121839718',
                name: 'Loren Tatiana Sepulveda Alarcon',
                email: 'losepulveda@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1018502996',
                name: 'Jaime Andres Pulido',
                email: 'Jaime.Pulido@iq-online.com',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            },
            {
                identification: '1094952527',
                name: 'NATALIA LONDOÑO TORO',
                email: 'cennatlondono@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: '90',
                location: 'ARMENIA'
            },
            {
                identification: '1107103194',
                name: 'Jhon Edinson Fiole Quintero',
                email: 'jhonquintero@finesaseguros.com.co',
                phone: '3000000000',
                intermediary_key: '80000322',
                location: 'Cali'
            },
            {
                identification: '37558398',
                name: 'CLAUDIA CARDENAS',
                email: 'cardenas_claudia@hotmail.com',
                phone: '3000000000',
                intermediary_key: '80002226',
                location: 'Bucarmanga'
            },
            {
                identification: '1102849840',
                name: 'YEISON RAFAEL PEREZ DURAN',
                email: 'cenjperez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'SINCELEJO'
            },
            // Nuevos usuarios comerciales
            {
                identification: '1002353828',
                name: 'ANGIE LORENA GONZALEZ CERPA',
                email: 'cenagonzalez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: '80000441',
                location: 'BOGOTA'
            },
            {
                identification: '1001820480',
                name: 'Danna Vanessa Santos Payare',
                email: 'dsantos@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'Barranquilla'
            },
            {
                identification: '1140826678',
                name: 'Julieth Ortiz Muñoz',
                email: 'julortiz@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'Barranquilla'
            },
            {
                identification: '1007458283',
                name: 'Yoleis Segura Melendez',
                email: 'ysegura@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'Barranquilla'
            },
            {
                identification: '45758887',
                name: 'Tania Yepes Cadena',
                email: 'tyepes@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'Cartagena'
            },
            {
                identification: '128061537',
                name: 'Katiusca Sierra Madachi',
                email: 'ksierra@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'Cartagena'
            },
            {
                identification: '1065378132',
                name: 'Maria Teresa Carracal Serrano',
                email: 'mcarrascal@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'Cartagena'
            },
            {
                identification: '1023009630',
                name: 'Jojhan Leonardo Torres Sepulveda',
                email: 'jotorres@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTÁ'
            },
            {
                identification: '1024511490',
                name: 'Ginna Lizeth Torres Rubiano',
                email: 'gitorres@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTÁ'
            },
            {
                identification: '1075629981',
                name: 'Gissell Andrea Cifuentes Barbosa',
                email: 'giscifuentes@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTÁ'
            },
            {
                identification: '1019136833',
                name: 'Yineth Paola Vanegas Lopez',
                email: 'yivanegas@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'DIRECTO',
                location: 'BOGOTA'
            },
            {
                identification: '1022352441',
                name: 'MARIA CLAUDIA MORA CASALLAS',
                email: 'mmora@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'DIRECTO',
                location: 'BOGOTA'
            },
            {
                identification: '1010227847',
                name: 'BRAYAN ALBERTO TORRES VARON',
                email: 'BTORRES@SEGUROSMUNDIAL.COM.CO',
                phone: '3000000000',
                intermediary_key: 'DIRECTO',
                location: 'BOGOTA'
            },
            {
                identification: '1003631054',
                name: 'Erika Fernanda Gonzalez',
                email: 'ergonzalez@segurosmundial.com.co',
                phone: '3000000000',
                intermediary_key: 'Directo Mundial',
                location: 'BOGOTA'
            }
        ];

        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const userData of users) {
            try {
                // Verificar si el usuario ya existe
                const existingUser = await User.findOne({
                    where: { email: userData.email }
                });

                if (existingUser) {
                    console.log(`⚠️ Usuario ya existe: ${userData.email}`);
                    skippedCount++;
                    continue;
                }

                // Obtener sede_id basado en la ubicación
                const sedeId = await getSedeIdByLocation(userData.location);
                if (!sedeId) {
                    console.log(`⚠️ No se pudo determinar sede para: ${userData.name} (${userData.location})`);
                    errorCount++;
                    continue;
                }

                // Crear usuario
                const user = await User.create({
                    sede_id: sedeId,
                    identification: userData.identification,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    password: hashedPassword,
                    is_active: true,
                    intermediary_key: userData.intermediary_key,
                    notification_channel_in_app_enabled: true,
                    notification_channel_sms_enabled: true,
                    notification_channel_email_enabled: true,
                    notification_channel_whatsapp_enabled: true,
                });

                // Asignar rol comercial_mundial
                await UserRole.create({
                    user_id: user.id,
                    role_id: comercialRole.id
                });

                console.log(`✅ Usuario creado: ${user.name} (${user.email}) - Sede: ${userData.location}`);
                createdCount++;

            } catch (error) {
                console.error(`❌ Error creando usuario ${userData.email}:`, error.message);
                if (error.errors) {
                    error.errors.forEach(err => {
                        console.error(`   - Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
                    });
                }
                errorCount++;
            }
        }

        console.log(`\n📊 Resumen de usuarios comerciales:`);
        console.log(`   - ${createdCount} usuarios creados`);
        console.log(`   - ${skippedCount} usuarios existentes`);
        console.log(`   - ${errorCount} errores`);

    } catch (error) {
        console.error('❌ Error creando usuarios comerciales:', error.message);
        throw error;
    }
};

/**
 * Función principal
 */
const seedComercialUsers = async () => {
    try {
        console.log('👥 Iniciando seed de usuarios comerciales...');

        // 1. Crear departamentos faltantes
        await createMissingDepartments();

        // 2. Crear ciudades faltantes
        await createMissingCities();

        // 3. Crear sedes faltantes
        await createMissingSedes();

        // 4. Crear usuarios comerciales
        await createComercialUsers();

        console.log('✅ Seed de usuarios comerciales completado exitosamente');

    } catch (error) {
        console.error('❌ Error en seed de usuarios comerciales:', error);
        throw error;
    }
};

export default seedComercialUsers;
