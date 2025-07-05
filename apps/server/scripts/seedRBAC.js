import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import RolePermission from '../models/rolePermission.js';
import UserRole from '../models/userRole.js';
import User from '../models/user.js';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde el directorio padre (apps/server/)
dotenv.config({ path: path.join(__dirname, '../.env') });

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
            },
            // ===== NUEVOS PERMISOS - ÓRDENES DE INSPECCIÓN =====
            {
                name: 'inspection_orders.read',
                description: 'Ver órdenes de inspección',
                resource: 'inspection_orders',
                action: 'read',
                endpoint: '/api/inspection-orders',
                method: 'GET'
            },
            {
                name: 'inspection_orders.create',
                description: 'Crear órdenes de inspección',
                resource: 'inspection_orders',
                action: 'create',
                endpoint: '/api/inspection-orders',
                method: 'POST'
            },
            {
                name: 'inspection_orders.update',
                description: 'Actualizar órdenes de inspección',
                resource: 'inspection_orders',
                action: 'update',
                endpoint: '/api/inspection-orders/:id',
                method: 'PUT'
            },
            {
                name: 'inspection_orders.delete',
                description: 'Eliminar órdenes de inspección',
                resource: 'inspection_orders',
                action: 'delete',
                endpoint: '/api/inspection-orders/:id',
                method: 'DELETE'
            },
            // ===== NUEVOS PERMISOS - Agente de Contact =====
            {
                name: 'contact_agent.read',
                description: 'Ver órdenes como Agente de Contact',
                resource: 'contact_agent',
                action: 'read',
                endpoint: '/api/contact-agent',
                method: 'GET'
            },
            {
                name: 'contact_agent.create_call',
                description: 'Registrar llamadas',
                resource: 'contact_agent',
                action: 'create_call',
                endpoint: '/api/contact-agent/call-logs',
                method: 'POST'
            },
            {
                name: 'contact_agent.create_appointment',
                description: 'Crear agendamientos',
                resource: 'contact_agent',
                action: 'create_appointment',
                endpoint: '/api/contact-agent/appointments',
                method: 'POST'
            },
            // ===== NUEVOS PERMISOS - Coordinador de Contacto =====
            {
                name: 'coordinador_contacto.read',
                description: 'Ver órdenes como Coordinador de Contacto',
                resource: 'coordinador_contacto',
                action: 'read',
                endpoint: '/api/coordinador-contacto',
                method: 'GET'
            },
            {
                name: 'coordinador_contacto.assign',
                description: 'Asignar agentes a órdenes',
                resource: 'coordinador_contacto',
                action: 'assign',
                endpoint: '/api/coordinador-contacto/assign',
                method: 'POST'
            },
            {
                name: 'coordinador_contacto.stats',
                description: 'Ver estadísticas de órdenes',
                resource: 'coordinador_contacto',
                action: 'stats',
                endpoint: '/api/coordinador-contacto/stats',
                method: 'GET'
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

        // Crear roles básicos (incluyendo nuevos roles)
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
            },
            // ===== NUEVOS ROLES =====
            {
                name: 'comercial_mundial',
                description: 'Comercial Mundial - Puede crear y gestionar órdenes de inspección'
            },
            {
                name: 'agente_contacto',
                description: 'Agente de Contact - Gestiona llamadas y agendamientos'
            },
            {
                name: 'coordinador_contacto',
                description: 'Coordinador de Contacto - Supervisa y asigna agentes'
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

        // ===== NUEVOS ROLES =====

        // Comercial Mundial: Permisos para órdenes de inspección
        const comercialRole = createdRoles.find(r => r.name === 'comercial_mundial');
        if (comercialRole) {
            const comercialPermissions = createdPermissions.filter(p =>
                p.name.startsWith('inspection_orders.') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read')
            );
            for (const permission of comercialPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: comercialRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de comercial asignados a ${comercialRole.name}`);
        }

        // Agente de Contact: Permisos para gestión de llamadas y agendamientos
        const agenteRole = createdRoles.find(r => r.name === 'agente_contacto');
        if (agenteRole) {
            const agentePermissions = createdPermissions.filter(p =>
                p.name.startsWith('contact_agent.') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name === 'inspection_orders.read'
            );
            for (const permission of agentePermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: agenteRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Agente de Contact asignados a ${agenteRole.name}`);
        }

        // Coordinador de Contacto: Permisos para supervisión y asignación
        const coordinadorRole = createdRoles.find(r => r.name === 'coordinador_contacto');
        if (coordinadorRole) {
            const coordinadorPermissions = createdPermissions.filter(p =>
                p.name.startsWith('coordinador_contacto.') ||
                p.name.startsWith('contact_agent.read') ||
                p.name.startsWith('contact_agent.assign') ||
                p.name.startsWith('contact_agent.stats') ||
                p.name === 'inspection_orders.read' ||
                p.name === 'users.read' // Necesario para acceder al perfil
            );
            for (const permission of coordinadorPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: coordinadorRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Coordinador de Contacto asignados a ${coordinadorRole.name}`);
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
if (import.meta.url === `file://${process.argv[1]}`) {
    seedRBAC()
        .then(() => {
            console.log('✅ Seed de RBAC completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export default seedRBAC; 