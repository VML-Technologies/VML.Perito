import { Op } from 'sequelize';
import { 
    User, 
    Role, 
    UserRole, 
    Sede, 
    SedeType, 
    City 
} from '../models/index.js';

async function testQueries() {
    try {
        console.log('🧪 === INICIO PRUEBAS DE CONSULTAS ===\n');
        
        // Prueba 1: Buscar roles de inspector
        console.log('🔍 Prueba 1: Buscando roles de inspector...');
        const inspectorRoles = await Role.findAll({
            where: {
                name: {
                    [Op.in]: ['inspector_vml_virtual', 'inspector_vml_cda', 'inspector_aliado']
                }
            },
            attributes: ['id', 'name'],
            raw: true
        });
        console.log('✅ Roles encontrados:', inspectorRoles);
        
        if (inspectorRoles.length > 0) {
            const roleIds = inspectorRoles.map(role => role.id);
            console.log('🆔 IDs de roles:', roleIds);
            
            // Prueba 2: Buscar UserRoles
            console.log('\n🔍 Prueba 2: Buscando UserRoles...');
            const userRoles = await UserRole.findAll({
                where: {
                    role_id: {
                        [Op.in]: roleIds
                    }
                },
                raw: true
            });
            console.log('✅ UserRoles encontrados:', userRoles);
            
            if (userRoles.length > 0) {
                const userIds = [...new Set(userRoles.map(ur => ur.user_id))];
                console.log('👥 IDs de usuarios únicos:', userIds);
                
                // Prueba 3: Buscar usuarios activos
                console.log('\n🔍 Prueba 3: Buscando usuarios activos...');
                const inspectors = await User.findAll({
                    where: {
                        id: {
                            [Op.in]: userIds
                        },
                        is_active: true
                    },
                    attributes: ['id', 'name', 'email', 'phone'],
                    raw: true
                });
                console.log('✅ Inspectores encontrados:', inspectors);
            }
        }
        
        // Prueba 4: Buscar SedeType CDA
        console.log('\n🔍 Prueba 4: Buscando SedeType CDA...');
        const sedeType = await SedeType.findOne({
            where: {
                code: 'CDA'
            },
            attributes: ['id', 'name', 'code'],
            raw: true
        });
        console.log('✅ SedeType CDA encontrado:', sedeType);
        
        if (sedeType) {
            // Prueba 5: Buscar sedes CDA
            console.log('\n🔍 Prueba 5: Buscando sedes CDA...');
            const sedes = await Sede.findAll({
                where: {
                    sede_type_id: sedeType.id,
                    active: true
                },
                attributes: ['id', 'name', 'address', 'email', 'phone', 'sede_type_id', 'city_id'],
                raw: true
            });
            console.log('✅ Sedes CDA encontradas:', sedes);
            
            if (sedes.length > 0) {
                const cityIds = [...new Set(sedes.map(s => s.city_id))];
                console.log('🏙️ IDs de ciudades únicas:', cityIds);
                
                // Prueba 6: Buscar ciudades
                console.log('\n🔍 Prueba 6: Buscando ciudades...');
                const cities = await City.findAll({
                    where: {
                        id: {
                            [Op.in]: cityIds
                        }
                    },
                    attributes: ['id', 'name'],
                    raw: true
                });
                console.log('✅ Ciudades encontradas:', cities);
            }
        }
        
        console.log('\n🧪 === FIN PRUEBAS DE CONSULTAS ===');
        
    } catch (error) {
        console.error('❌ Error en pruebas:', error);
        console.error('📍 Stack:', error.stack);
    }
}

// Ejecutar pruebas
testQueries().then(() => {
    console.log('\n✅ Pruebas completadas');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Error ejecutando pruebas:', error);
    process.exit(1);
});
