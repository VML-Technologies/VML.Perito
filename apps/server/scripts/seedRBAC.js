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
        console.log('🌱 Iniciando seed de RBAC con terminología actualizada...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

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
            {
                name: 'inspection_orders.search_by_plate',
                description: 'Buscar órdenes de inspección por placa',
                resource: 'inspection_orders',
                action: 'search_by_plate',
                endpoint: '/api/inspection-orders/search-by-plate',
                method: 'GET'
            },
            // ===== NUEVOS PERMISOS - Agente de Contact Center =====
            {
                name: 'contact_agent.read',
                description: 'Ver órdenes como Agente de Contact Center',
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
            // ===== NUEVOS PERMISOS - Coordinador de Contact Center =====
            {
                name: 'coordinador_contacto.read',
                description: 'Ver órdenes como Coordinador de Contact Center',
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
            },
            {
                name: 'coordinador_contacto.recuperacion',
                description: 'Ver órdenes en recuperación',
                resource: 'coordinador_contacto',
                action: 'recuperacion',
                endpoint: '/api/coordinador-contacto/ordenes-recuperacion',
                method: 'GET'
            },
            {
                name: 'coordinador_contacto.no_recuperadas',
                description: 'Ver órdenes no recuperadas',
                resource: 'coordinador_contacto',
                action: 'no_recuperadas',
                endpoint: '/api/coordinador-contacto/ordenes-no-recuperadas',
                method: 'GET'
            },
            // ===== NUEVOS PERMISOS - SISTEMA DE NOTIFICACIONES =====
            {
                name: 'notifications.read',
                description: 'Ver notificaciones del sistema',
                resource: 'notifications',
                action: 'read',
                endpoint: '/api/notifications',
                method: 'GET'
            },
            {
                name: 'notifications.create',
                description: 'Crear notificaciones',
                resource: 'notifications',
                action: 'create',
                endpoint: '/api/notifications',
                method: 'POST'
            },
            {
                name: 'notifications.update',
                description: 'Actualizar notificaciones',
                resource: 'notifications',
                action: 'update',
                endpoint: '/api/notifications/:id',
                method: 'PUT'
            },
            {
                name: 'notifications.delete',
                description: 'Eliminar notificaciones',
                resource: 'notifications',
                action: 'delete',
                endpoint: '/api/notifications/:id',
                method: 'DELETE'
            },
            {
                name: 'notifications.admin',
                description: 'Administrar configuración de notificaciones',
                resource: 'notifications',
                action: 'admin',
                endpoint: '/api/notifications/admin',
                method: 'GET'
            },
            {
                name: 'notifications.templates',
                description: 'Gestionar plantillas de notificaciones',
                resource: 'notifications',
                action: 'templates',
                endpoint: '/api/notifications/templates',
                method: 'GET'
            },
            {
                name: 'notifications.channels',
                description: 'Gestionar canales de notificaciones',
                resource: 'notifications',
                action: 'channels',
                endpoint: '/api/notifications/channels',
                method: 'GET'
            },
            {
                name: 'notifications.stats',
                description: 'Ver estadísticas de notificaciones',
                resource: 'notifications',
                action: 'stats',
                endpoint: '/api/notifications/stats',
                method: 'GET'
            },
            // ===== PERMISOS DE PLANTILLAS DE NOTIFICACIÓN =====
            {
                name: 'templates.read',
                description: 'Ver plantillas de notificación',
                resource: 'templates',
                action: 'read',
                endpoint: '/api/templates',
                method: 'GET'
            },
            {
                name: 'templates.create',
                description: 'Crear plantillas de notificación',
                resource: 'templates',
                action: 'create',
                endpoint: '/api/templates',
                method: 'POST'
            },
            {
                name: 'templates.update',
                description: 'Actualizar plantillas de notificación',
                resource: 'templates',
                action: 'update',
                endpoint: '/api/templates/:id',
                method: 'PUT'
            },
            {
                name: 'templates.delete',
                description: 'Eliminar plantillas de notificación',
                resource: 'templates',
                action: 'delete',
                endpoint: '/api/templates/:id',
                method: 'DELETE'
            },
            // ===== PERMISOS DE LISTAS =====
            {
                name: 'lists.read',
                description: 'Ver todas las listas',
                resource: 'lists',
                action: 'read',
                endpoint: '/api/lists',
                method: 'GET'
            },
            {
                name: 'lists.create',
                description: 'Crear una nueva lista',
                resource: 'lists',
                action: 'create',
                endpoint: '/api/lists',
                method: 'POST'
            },
            {
                name: 'lists.update',
                description: 'Actualizar una lista existente',
                resource: 'lists',
                action: 'update',
                endpoint: '/api/lists/:id',
                method: 'PUT'
            },
            {
                name: 'lists.delete',
                description: 'Eliminar una lista existente',
                resource: 'lists',
                action: 'delete',
                endpoint: '/api/lists/:id',
                method: 'DELETE'
            },
            // ===== PERMISOS DE ITEMS DE LISTAS =====
            {
                name: 'list_items.read',
                description: 'Ver los items de una lista',
                resource: 'list_items',
                action: 'read',
                endpoint: '/api/lists/:listId/items',
                method: 'GET'
            },
            {
                name: 'list_items.create',
                description: 'Crear un nuevo item dentro de una lista',
                resource: 'list_items',
                action: 'create',
                endpoint: '/api/lists/:listId/items',
                method: 'POST'
            },
            {
                name: 'list_items.update',
                description: 'Actualizar un item específico dentro de una lista',
                resource: 'list_items',
                action: 'update',
                endpoint: '/api/lists/:listId/items/:itemId',
                method: 'PUT'
            },
            {
                name: 'list_items.delete',
                description: 'Eliminar un item específico dentro de una lista',
                resource: 'list_items',
                action: 'delete',
                endpoint: '/api/lists/:listId/items/:itemId',
                method: 'DELETE'
            },


            // ===== PERMISOS DE CANALES DE NOTIFICACIÓN =====
            {
                name: 'channels.read',
                description: 'Ver canales de notificación',
                resource: 'channels',
                action: 'read',
                endpoint: '/api/channels',
                method: 'GET'
            },
            {
                name: 'channels.create',
                description: 'Crear canales de notificación',
                resource: 'channels',
                action: 'create',
                endpoint: '/api/channels',
                method: 'POST'
            },
            {
                name: 'channels.update',
                description: 'Actualizar canales de notificación',
                resource: 'channels',
                action: 'update',
                endpoint: '/api/channels/:channelName',
                method: 'PUT'
            },
            {
                name: 'channels.delete',
                description: 'Eliminar canales de notificación',
                resource: 'channels',
                action: 'delete',
                endpoint: '/api/channels/:channelName',
                method: 'DELETE'
            },
            {
                name: 'channels.test',
                description: 'Probar canales de notificación',
                resource: 'channels',
                action: 'test',
                endpoint: '/api/channels/:channelName/test',
                method: 'POST'
            },
            // ===== PERMISOS DE EVENTOS DEL SISTEMA =====
            {
                name: 'events.read',
                description: 'Ver eventos del sistema',
                resource: 'events',
                action: 'read',
                endpoint: '/api/events',
                method: 'GET'
            },
            {
                name: 'events.create',
                description: 'Crear eventos del sistema',
                resource: 'events',
                action: 'create',
                endpoint: '/api/events',
                method: 'POST'
            },
            {
                name: 'events.update',
                description: 'Actualizar eventos del sistema',
                resource: 'events',
                action: 'update',
                endpoint: '/api/events/:id',
                method: 'PUT'
            },
            {
                name: 'events.delete',
                description: 'Eliminar eventos del sistema',
                resource: 'events',
                action: 'delete',
                endpoint: '/api/events/:id',
                method: 'DELETE'
            },
            {
                name: 'events.trigger',
                description: 'Disparar eventos del sistema',
                resource: 'events',
                action: 'trigger',
                endpoint: '/api/events/:id/trigger',
                method: 'POST'
            },
            // help_desk
            {
                name: 'help_desk.view',
                description: 'Ver panel de ayuda técnica',
                resource: 'help_desk',
                action: 'view',
                endpoint: '/api/help-desk',
                method: 'GET'
            },
            // Appointments
            {
                name: 'appointments.read',
                description: 'Ver agendamientos',
                resource: 'appointments',
                action: 'read',
                endpoint: '/api/appointments',
                method: 'GET'
            },
            {
                name: 'appointments.create',
                description: 'Crear agendamientos',
                resource: 'appointments',
                action: 'create',
                endpoint: '/api/appointments',
                method: 'POST'
            },
            {
                name: 'appointments.update',
                description: 'Actualizar agendamientos',
                resource: 'appointments',
                action: 'update',
                endpoint: '/api/appointments/:id',
                method: 'PUT'
            },
            {
                name: 'appointments.delete',
                description: 'Eliminar agendamientos',
                resource: 'appointments',
                action: 'delete',
                endpoint: '/api/appointments/:id',
                method: 'DELETE'
            },
            {
                name: 'reports.read',
                description: 'Ver reportes',
                resource: 'reports',
                action: 'read',
                endpoint: '/api/reports',
                method: 'GET'
            },
            {
                name: 'reports.download',
                description: 'Descargar reportes',
                resource: 'reports',
                action: 'download',
                endpoint: '/api/reports/download',
                method: 'GET'
            },
            {
                name: 'inspections.create',
                description: 'Crear inspecciones',
                resource: 'inspections',
                action: 'create',
                endpoint: '/api/inspections',
                method: 'POST'
            },
            {
                name: 'inspections.fpv',
                description: 'Hacer inspecciones en FPV',
                resource: 'inspections',
                action: 'fpv',
                endpoint: '/api/inspections/fpv',
                method: 'POST'
            },
            {
                name: 'peritajes.read',
                description: 'Ver peritajes',
                resource: 'peritajes',
                action: 'read',
                endpoint: '/api/peritajes',
                method: 'GET'
            },
            {
                name: 'peritajes.read',
                description: 'Ver un peritaje',
                resource: 'peritajes',
                action: 'read',
                endpoint: '/api/peritajes/:id',
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
            {
                name: 'help_desk',
                description: 'Usuario de ayuda técnica'
            },
            // ===== NUEVOS ROLES =====
            {
                name: 'comercial_mundial',
                description: 'Comercial Mundial - Puede crear y gestionar órdenes de inspección'
            },
            {
                name: 'comercial_mundial_4',
                description: 'Comercial Mundial - Puede ver las órdenes de inspección'
            },
            {
                name: 'agente_contacto',
                description: 'Agente de Contact Center - Gestiona llamadas y agendamientos'
            },
            {
                name: 'coordinador_contacto',
                description: 'Coordinador de Contact Center - Supervisa y asigna agentes'
            },
            // ===== ROLES DE INSPECTORES VML =====
            {
                name: 'inspector_vml_virtual',
                description: 'Inspector VML Virtual - Realiza inspecciones virtuales'
            },
            {
                name: 'inspector_vml_cda',
                description: 'Inspector VML CDA - Realiza inspecciones en CDAs'
            },
            {
                name: 'coordinador_vml',
                description: 'Coordinador VML - Supervisa y coordina inspectores VML'
            },
            // ===== ROLES DE ALIADOS =====
            {
                name: 'inspector_aliado',
                description: 'Inspector Aliado - Realiza inspecciones para aliados'
            },
            {
                name: 'inspector_aliado_2',
                description: 'Inspector Aliado Nivel 2- Tiene acceso a FPV'
            },
            {
                name: 'coordinador_aliado',
                description: 'Coordinador Aliado - Supervisa y coordina inspectores aliados'
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
                !p.name.startsWith('roles.') &&
                !p.name.startsWith('permissions.')
            );

            for (const permission of adminPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: adminRole.id,
                        permission_id: permission.id
                    }
                });
            }

            console.log(`✅ Permisos administrativos asignados a ${adminRole.name}`);
        }

        // Manager: Permisos de lectura y escritura básicos
        const managerRole = createdRoles.find(r => r.name == 'manager');
        if (managerRole) {
            const managerPermissions = createdPermissions.filter(p =>
                p.action == 'read' ||
                (p.action == 'create' && !p.name.includes('roles.') && !p.name.includes('permissions.'))
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
        const userRole = createdRoles.find(r => r.name == 'user');
        if (userRole) {
            const userPermissions = createdPermissions.filter(p => p.action == 'read');
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
        const comercialRole = createdRoles.find(r => r.name == 'comercial_mundial');
        if (comercialRole) {
            const comercialPermissions = createdPermissions.filter(p =>
                p.name.startsWith('inspection_orders.') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name.startsWith('inspections.create') ||
                p.name == 'users.read' || // Necesario para acceder al perfil
                p.name == 'lists.read' // Permiso para ver listas e ítems
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

        const comercialRole4 = createdRoles.find(r => r.name == 'comercial_mundial_4');
        if (comercialRole4) {
            const comercialPermissions = createdPermissions.filter(p =>
                p.name.startsWith('inspection_orders.') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name == 'users.read' || // Necesario para acceder al perfil
                p.name == 'lists.read' // Permiso para ver listas e ítems
            );
            for (const permission of comercialPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: comercialRole4.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de comercial asignados a ${comercialRole4.name}`);
        }

        // Agente de Contact Center: Permisos para gestión de llamadas y agendamientos
        const agenteRole = createdRoles.find(r => r.name == 'agente_contacto');
        if (agenteRole) {
            const agentePermissions = createdPermissions.filter(p =>
                p.name.startsWith('contact_agent.') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name.startsWith('inspection_orders.') // Permisos completos para órdenes
            );
            for (const permission of agentePermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: agenteRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Agente de Contact Center asignados a ${agenteRole.name}`);
        }

        // Coordinador de Contact Center: Permisos para supervisión y asignación
        const coordinadorRole = createdRoles.find(r => r.name == 'coordinador_contacto');
        if (coordinadorRole) {
            const coordinadorPermissions = createdPermissions.filter(p =>
                p.name.startsWith('coordinador_contacto.') ||
                p.name.startsWith('contact_agent.') ||
                p.name.startsWith('inspection_orders.') || // Permisos completos para órdenes
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name.startsWith('peritajes.read') ||
                p.name.startsWith('peritajes.update') ||
                p.name == 'users.read' // Necesario para acceder al perfil
            );

            console.log(`🔍 Permisos que se asignarán al coordinador:`, coordinadorPermissions.map(p => p.name));

            for (const permission of coordinadorPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: coordinadorRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Coordinador de Contact Center asignados a ${coordinadorRole.name}`);
        }

        // ===== ROLES DE INSPECTORES VML =====

        // Inspector VML Virtual: Permisos para inspecciones virtuales
        const inspectorVirtualRole = createdRoles.find(r => r.name == 'inspector_vml_virtual');
        if (inspectorVirtualRole) {
            const inspectorVirtualPermissions = createdPermissions.filter(p =>
                p.name.startsWith('inspections.') ||
                p.name.startsWith('inspection_orders.read') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name == 'users.read' // Necesario para acceder al perfil
            );
            for (const permission of inspectorVirtualPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: inspectorVirtualRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Inspector VML Virtual asignados a ${inspectorVirtualRole.name}`);
        }

        // Inspector VML CDA: Permisos para inspecciones en CDAs
        const inspectorCDARole = createdRoles.find(r => r.name == 'inspector_vml_cda');
        if (inspectorCDARole) {
            const inspectorCDAPermissions = createdPermissions.filter(p =>
                p.name.startsWith('inspections.') ||
                p.name.startsWith('inspection_orders.read') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name == 'users.read' // Necesario para acceder al perfil
            );
            for (const permission of inspectorCDAPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: inspectorCDARole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Inspector VML CDA asignados a ${inspectorCDARole.name}`);
        }

        // Coordinador VML: Permisos para supervisar inspectores VML
        const coordinadorVMLRole = createdRoles.find(r => r.name == 'coordinador_vml');
        if (coordinadorVMLRole) {
            // Definir permisos específicos necesarios para el coordinador VML
            const coordinadorVMLPermissionNames = [
                'users.read',           // Para obtener inspectores
                'sedes.read',           // Para obtener sedes CDA
                'inspection_orders.read', // Para ver órdenes
                'inspection_orders.update', // Para iniciar inspecciones virtuales
                'appointments.read',    // Para ver agendamientos en sede
                'appointments.update',  // Para actualizar estados de agendamientos
                'departments.read',     // Para datos geográficos
                'cities.read',          // Para datos geográficos
                'inspections.read',     // Para ver cola de inspecciones
                'inspections.update',    // Para actualizar estados
                'reports.read',          // Para ver reportes
                'reports.download'      // Para descargar reportes
            ];

            const coordinadorVMLPermissions = createdPermissions.filter(p =>
                coordinadorVMLPermissionNames.includes(p.name)
            );

            console.log(`🔍 Permisos que se asignarán al coordinador VML:`, coordinadorVMLPermissions.map(p => p.name));

            for (const permission of coordinadorVMLPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: coordinadorVMLRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Coordinador VML asignados a ${coordinadorVMLRole.name}`);
        }

        // ===== ROLES DE ALIADOS =====

        // Inspector Aliado: Permisos para inspecciones de aliados
        const inspectorAliadoRole = createdRoles.find(r => r.name == 'inspector_aliado');
        if (inspectorAliadoRole) {
            const inspectorAliadoPermissionNames = [
                'users.read',           // Para acceder al perfil
                'sedes.read',           // Para obtener información de sedes
                'inspection_orders.read', // Para buscar órdenes por placa
                'inspection_orders.search_by_plate', // Para búsqueda específica por placa
                'appointments.read',    // Para ver agendamientos
                'appointments.create',  // Para crear agendamientos
                'departments.read',     // Para datos geográficos
                'cities.read',           // Para datos geográficos
                'reports.read'          // Para ver reportes
            ];

            const inspectorAliadoPermissions = createdPermissions.filter(p =>
                inspectorAliadoPermissionNames.includes(p.name)
            );

            const permissionsNoEncontrados = inspectorAliadoPermissionNames.filter(p => !inspectorAliadoPermissions.some(pp => pp.name == p));

            console.log(`🔍 Permisos no encontrados:`, permissionsNoEncontrados);

            console.log(`🔍 Permisos que se asignarán al Inspector Aliado:`, inspectorAliadoPermissions.map(p => p.name));

            for (const permission of inspectorAliadoPermissions) {
                console.log("Validando permiso:", permission.name);

                const rolePermission = await RolePermission.findOrCreate({
                    where: {
                        role_id: inspectorAliadoRole.id,
                        permission_id: permission.id
                    }
                });

                console.log("Permiso asignado:", rolePermission.name);
            }
            console.log(`✅ Permisos de Inspector Aliado asignados a ${inspectorAliadoRole.name}`);
        }

        // Inspector Aliado: Permisos para inspecciones de aliados
        const inspectorAliadoRole2 = createdRoles.find(r => r.name == 'inspector_aliado_2');
        if (inspectorAliadoRole2) {
            const inspectorAliadoPermissionNames = [
                'users.read',           // Para acceder al perfil
                'sedes.read',           // Para obtener información de sedes
                'inspection_orders.read', // Para buscar órdenes por placa
                'inspection_orders.search_by_plate', // Para búsqueda específica por placa
                'appointments.read',    // Para ver agendamientos
                'appointments.create',  // Para crear agendamientos
                'departments.read',     // Para datos geográficos
                'cities.read',           // Para datos geográficos
                'reports.read',          // Para ver reportes
                'inspections.fpv'       // Para hacer inspecciones en FPV
            ];

            const inspectorAliadoPermissions2 = createdPermissions.filter(p =>
                inspectorAliadoPermissionNames.includes(p.name)
            );

            const permissionsNoEncontrados = inspectorAliadoPermissionNames.filter(p => !inspectorAliadoPermissions2.some(pp => pp.name == p));

            console.log(`🔍 Permisos no encontrados:`, permissionsNoEncontrados);

            console.log(`🔍 Permisos que se asignarán al Inspector Aliado:`, inspectorAliadoPermissions2.map(p => p.name));

            for (const permission of inspectorAliadoPermissions2) {
                console.log("Validando permiso:", permission.name);

                const rolePermission = await RolePermission.findOrCreate({
                    where: {
                        role_id: inspectorAliadoRole2.id,
                        permission_id: permission.id
                    }
                });

                console.log("Permiso asignado:", rolePermission.name);
            }
            console.log(`✅ Permisos de Inspector Aliado asignados a ${inspectorAliadoRole2.name}`);
        }

        // Coordinador Aliado: Permisos para supervisar inspectores aliados
        const coordinadorAliadoRole = createdRoles.find(r => r.name == 'coordinador_aliado');
        if (coordinadorAliadoRole) {
            const coordinadorAliadoPermissions = createdPermissions.filter(p =>
                p.name.startsWith('inspections.') ||
                p.name.startsWith('inspection_orders.') ||
                p.name.startsWith('departments.read') ||
                p.name.startsWith('cities.read') ||
                p.name.startsWith('sedes.read') ||
                p.name.startsWith('users.read') ||
                p.name.startsWith('users.update') // Para asignar inspectores
            );
            for (const permission of coordinadorAliadoPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: coordinadorAliadoRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Permisos de Coordinador Aliado asignados a ${coordinadorAliadoRole.name}`);
        }

        // Help Desk: Permisos para ayuda técnica
        const helpDeskRole = createdRoles.find(r => r.name == 'help_desk');
        if (helpDeskRole) {
            for (const permission of createdPermissions) {
                await RolePermission.findOrCreate({
                    where: {
                        role_id: helpDeskRole.id,
                        permission_id: permission.id
                    }
                });
            }
            console.log(`✅ Todos los permisos asignados a ${helpDeskRole.name}`);
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
if (import.meta.url == `file://${process.argv[1]}`) {
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