import sequelize from '../config/database.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import RolePermission from '../models/rolePermission.js';
import UserRole from '../models/userRole.js';
import User from '../models/user.js';

// Importar modelos para establecer relaciones
import '../models/index.js';

const seedRBAC = async () => {
    try {
        console.log('🌱 Iniciando seed de RBAC...');

        // Crear permisos básicos del sistema
        const permissions = [
            // Usuarios
            {
                name: 'users.read',
                description: 'Ver usuarios',
                resource: 'users',
                action: 'read',
                endpoint: '/api/users',
                method: 'GET'
            },
            {
                name: 'users.create',
                description: 'Crear usuarios',
                resource: 'users',
                action: 'create',
                endpoint: '/api/users',
                method: 'POST'
            },
            {
                name: 'users.update',
                description: 'Actualizar usuarios',
                resource: 'users',
                action: 'update',
                endpoint: '/api/users/:id',
                method: 'PUT'
            },
            {
                name: 'users.delete',
                description: 'Eliminar usuarios',
                resource: 'users',
                action: 'delete',
                endpoint: '/api/users/:id',
                method: 'DELETE'
            },
            // Departamentos
            {
                name: 'departments.read',
                description: 'Ver departamentos',
                resource: 'departments',
                action: 'read',
                endpoint: '/api/departments',
                method: 'GET'
            },
            {
                name: 'departments.create',
                description: 'Crear departamentos',
                resource: 'departments',
                action: 'create',
                endpoint: '/api/departments',
                method: 'POST'
            },
            {
                name: 'departments.update',
                description: 'Actualizar departamentos',
                resource: 'departments',
                action: 'update',
                endpoint: '/api/departments/:id',
                method: 'PUT'
            },
            {
                name: 'departments.delete',
                description: 'Eliminar departamentos',
                resource: 'departments',
                action: 'delete',
                endpoint: '/api/departments/:id',
                method: 'DELETE'
            },
            // Ciudades
            {
                name: 'cities.read',
                description: 'Ver ciudades',
                resource: 'cities',
                action: 'read',
                endpoint: '/api/cities',
                method: 'GET'
            },
            {
                name: 'cities.create',
                description: 'Crear ciudades',
                resource: 'cities',
                action: 'create',
                endpoint: '/api/cities',
                method: 'POST'
            },
            {
                name: 'cities.update',
                description: 'Actualizar ciudades',
                resource: 'cities',
                action: 'update',
                endpoint: '/api/cities/:id',
                method: 'PUT'
            },
            {
                name: 'cities.delete',
                description: 'Eliminar ciudades',
                resource: 'cities',
                action: 'delete',
                endpoint: '/api/cities/:id',
                method: 'DELETE'
            },
            // Empresas
            {
                name: 'companies.read',
                description: 'Ver empresas',
                resource: 'companies',
                action: 'read',
                endpoint: '/api/companies',
                method: 'GET'
            },
            {
                name: 'companies.create',
                description: 'Crear empresas',
                resource: 'companies',
                action: 'create',
                endpoint: '/api/companies',
                method: 'POST'
            },
            {
                name: 'companies.update',
                description: 'Actualizar empresas',
                resource: 'companies',
                action: 'update',
                endpoint: '/api/companies/:id',
                method: 'PUT'
            },
            {
                name: 'companies.delete',
                description: 'Eliminar empresas',
                resource: 'companies',
                action: 'delete',
                endpoint: '/api/companies/:id',
                method: 'DELETE'
            },
            // Sedes
            {
                name: 'sedes.read',
                description: 'Ver sedes',
                resource: 'sedes',
                action: 'read',
                endpoint: '/api/sedes',
                method: 'GET'
            },
            {
                name: 'sedes.create',
                description: 'Crear sedes',
                resource: 'sedes',
                action: 'create',
                endpoint: '/api/sedes',
                method: 'POST'
            },
            {
                name: 'sedes.update',
                description: 'Actualizar sedes',
                resource: 'sedes',
                action: 'update',
                endpoint: '/api/sedes/:id',
                method: 'PUT'
            },
            {
                name: 'sedes.delete',
                description: 'Eliminar sedes',
                resource: 'sedes',
                action: 'delete',
                endpoint: '/api/sedes/:id',
                method: 'DELETE'
            },
            // Roles y Permisos (Administración RBAC)
            {
                name: 'roles.read',
                description: 'Ver roles',
                resource: 'roles',
                action: 'read',
                endpoint: '/api/roles',
                method: 'GET'
            },
            {
                name: 'roles.create',
                description: 'Crear roles',
                resource: 'roles',
                action: 'create',
                endpoint: '/api/roles',
                method: 'POST'
            },
            {
                name: 'roles.update',
                description: 'Actualizar roles',
                resource: 'roles',
                action: 'update',
                endpoint: '/api/roles/:id',
                method: 'PUT'
            },
            {
                name: 'roles.delete',
                description: 'Eliminar roles',
                resource: 'roles',
                action: 'delete',
                endpoint: '/api/roles/:id',
                method: 'DELETE'
            },
            {
                name: 'permissions.read',
                description: 'Ver permisos',
                resource: 'permissions',
                action: 'read',
                endpoint: '/api/permissions',
                method: 'GET'
            },
            {
                name: 'permissions.create',
                description: 'Crear permisos',
                resource: 'permissions',
                action: 'create',
                endpoint: '/api/permissions',
                method: 'POST'
            },
            {
                name: 'permissions.update',
                description: 'Actualizar permisos',
                resource: 'permissions',
                action: 'update',
                endpoint: '/api/permissions/:id',
                method: 'PUT'
            },
            {
                name: 'permissions.delete',
                description: 'Eliminar permisos',
                resource: 'permissions',
                action: 'delete',
                endpoint: '/api/permissions/:id',
                method: 'DELETE'
            }
        ];

        // Crear permisos
        console.log('📝 Creando permisos...');
        const createdPermissions = [];
        for (const permissionData of permissions) {
            const [permission, created] = await Permission.findOrCreate({
                where: { name: permissionData.name },
                defaults: permissionData
            });
            createdPermissions.push(permission);
            if (created) {
                console.log(`✅ Permiso creado: ${permission.name}`);
            } else {
                console.log(`ℹ️ Permiso ya existe: ${permission.name}`);
            }
        }

        // Crear roles básicos
        const roles = [
            {
                name: 'super_admin',
                description: 'Administrador del sistema con todos los permisos'
            },
            {
                name: 'admin',
                description: 'Administrador con permisos de gestión'
            },
            {
                name: 'manager',
                description: 'Gerente con permisos de lectura y escritura'
            },
            {
                name: 'user',
                description: 'Usuario básico con permisos de lectura'
            }
        ];

        console.log('👥 Creando roles...');
        const createdRoles = [];
        for (const roleData of roles) {
            const [role, created] = await Role.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData
            });
            createdRoles.push(role);
            if (created) {
                console.log(`✅ Rol creado: ${role.name}`);
            } else {
                console.log(`ℹ️ Rol ya existe: ${role.name}`);
            }
        }

        // Asignar permisos a roles
        console.log('🔗 Asignando permisos a roles...');

        // Super Admin: Todos los permisos
        const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
        if (superAdminRole) {
            for (const permission of createdPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: superAdminRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Todos los permisos asignados a ${superAdminRole.name}`);
        }

        // Admin: Todos excepto administración de roles/permisos
        const adminRole = createdRoles.find(r => r.name === 'admin');
        if (adminRole) {
            const adminPermissions = createdPermissions.filter(p =>
                !p.name.includes('roles.') && !p.name.includes('permissions.')
            );
            for (const permission of adminPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: adminRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de administración asignados a ${adminRole.name}`);
        }

        // Manager: Permisos de lectura y escritura básicos
        const managerRole = createdRoles.find(r => r.name === 'manager');
        if (managerRole) {
            const managerPermissions = createdPermissions.filter(p =>
                p.action === 'read' ||
                (p.action === 'create' && !p.name.includes('roles.') && !p.name.includes('permissions.'))
            );
            for (const permission of managerPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: managerRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de gerencia asignados a ${managerRole.name}`);
        }

        // User: Solo permisos de lectura
        const userRole = createdRoles.find(r => r.name === 'user');
        if (userRole) {
            const userPermissions = createdPermissions.filter(p => p.action === 'read');
            for (const permission of userPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: userRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de usuario asignados a ${userRole.name}`);
        }

        // Asignar rol super_admin al primer usuario existente (si existe)
        const firstUser = await User.findOne();
        if (firstUser && superAdminRole) {
            await UserRole.findOrCreate({
                where: {
                    user_id: firstUser.id,
                    role_id: superAdminRole.id
                }
            });
            console.log(`✅ Rol ${superAdminRole.name} asignado al usuario ${firstUser.email}`);
        }

        console.log('🎉 Seed de RBAC completado exitosamente!');
        console.log(`📊 Resumen:`);
        console.log(`   - Permisos creados: ${createdPermissions.length}`);
        console.log(`   - Roles creados: ${createdRoles.length}`);

    } catch (error) {
        console.error('❌ Error en seed de RBAC:', error);
        throw error;
    }
};

// Ejecutar si se llama directamente
seedRBAC()
    .then(() => {
        console.log('✅ Seed de RBAC completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });


export default seedRBAC; 