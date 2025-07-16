import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Permission from '../models/permission.js';
import Role from '../models/role.js';
import RolePermission from '../models/rolePermission.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar modelos para establecer relaciones
import '../models/index.js';

const updatePermissions = async () => {
    try {
        console.log('🔧 Actualizando permisos para rol comercial_mundial...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Crear el permiso de estadísticas si no existe
        const [statsPermission, created] = await Permission.findOrCreate({
            where: { name: 'inspection_orders.stats' },
            defaults: {
                name: 'inspection_orders.stats',
                description: 'Ver estadísticas de órdenes de inspección',
                resource: 'inspection_orders',
                action: 'stats',
                endpoint: '/api/inspection-orders/stats',
                method: 'GET'
            }
        });

        if (created) {
            console.log('✅ Permiso de estadísticas creado');
        } else {
            console.log('ℹ️ Permiso de estadísticas ya existe');
        }

        // Buscar el rol comercial_mundial
        const comercialRole = await Role.findOne({
            where: { name: 'comercial_mundial' }
        });

        if (!comercialRole) {
            console.log('❌ Rol comercial_mundial no encontrado');
            return;
        }

        // Buscar todos los permisos de inspection_orders
        const inspectionPermissions = await Permission.findAll({
            where: {
                name: {
                    [sequelize.Sequelize.Op.like]: 'inspection_orders.%'
                }
            }
        });

        console.log(`📋 Encontrados ${inspectionPermissions.length} permisos de inspection_orders`);

        // Asignar todos los permisos de inspection_orders al rol comercial
        for (const permission of inspectionPermissions) {
            await RolePermission.findOrCreate({
                where: {
                    role_id: comercialRole.id,
                    permission_id: permission.id
                }
            });
            console.log(`✅ Permiso ${permission.name} asignado a comercial_mundial`);
        }

        // También asignar permisos básicos necesarios
        const basicPermissions = await Permission.findAll({
            where: {
                name: {
                    [sequelize.Sequelize.Op.in]: [
                        'users.read',
                        'departments.read',
                        'cities.read',
                        'sedes.read'
                    ]
                }
            }
        });

        for (const permission of basicPermissions) {
            await RolePermission.findOrCreate({
                where: {
                    role_id: comercialRole.id,
                    permission_id: permission.id
                }
            });
            console.log(`✅ Permiso ${permission.name} asignado a comercial_mundial`);
        }

        console.log('🎉 Permisos actualizados exitosamente para comercial_mundial');

    } catch (error) {
        console.error('❌ Error actualizando permisos:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    updatePermissions()
        .then(() => {
            console.log('✅ Actualización de permisos completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default updatePermissions; 