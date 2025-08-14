import Role from '../models/role.js';
import Permission from '../models/permission.js';
import User from '../models/user.js';
import RolePermission from '../models/rolePermission.js';
import UserRole from '../models/userRole.js';

class RoleController {
    constructor() {
        // Bind methods to preserve context
        this.index = this.index.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.assignPermissions = this.assignPermissions.bind(this);
        this.getPermissions = this.getPermissions.bind(this);
        this.assignUserRoles = this.assignUserRoles.bind(this);
        this.getUserRoles = this.getUserRoles.bind(this);
        this.getUsersWithRoles = this.getUsersWithRoles.bind(this);
        this.updateBulkAssignments = this.updateBulkAssignments.bind(this);
    }

    // Listar roles con sus permisos
    async index(req, res) {
        try {
            const roles = await Role.findAll({
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] }
                    }
                ]
            });
            res.json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener roles', error: error.message });
        }
    }

    // Crear rol
    async store(req, res) {
        try {
            const { name, description, permissions } = req.body;
            const role = await Role.create({ name, description });

            // Asignar permisos si se proporcionan
            if (permissions && permissions.length > 0) {
                const permissionIds = permissions.map(p => typeof p == 'object' ? p.id : p);
                await role.setPermissions(permissionIds);
            }

            res.status(201).json(role);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear rol', error: error.message });
        }
    }

    // Editar rol
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, permissions } = req.body;

            const role = await Role.findByPk(id);
            if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

            Object.assign(role, { name, description });
            await role.save();

            // Actualizar permisos si se proporcionan
            if (permissions !== undefined) {
                const permissionIds = permissions.map(p => typeof p == 'object' ? p.id : p);
                await role.setPermissions(permissionIds);
            }

            res.json(role);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar rol', error: error.message });
        }
    }

    // Eliminar rol
    async destroy(req, res) {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id);
            if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

            await role.destroy();
            res.json({ message: 'Rol eliminado' });
        } catch (error) {
            res.status(400).json({ message: 'Error al eliminar rol', error: error.message });
        }
    }

    // Asignar permisos a un rol
    async assignPermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissions } = req.body;

            const role = await Role.findByPk(id);
            if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

            const permissionIds = permissions.map(p => typeof p == 'object' ? p.id : p);
            await role.setPermissions(permissionIds);

            res.json({ message: 'Permisos asignados al rol' });
        } catch (error) {
            res.status(400).json({ message: 'Error al asignar permisos', error: error.message });
        }
    }

    // Obtener permisos de un rol
    async getPermissions(req, res) {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id, {
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] }
                    }
                ]
            });

            if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

            res.json(role.permissions);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener permisos del rol', error: error.message });
        }
    }

    // Asignar roles a un usuario
    async assignUserRoles(req, res) {
        try {
            const { userId } = req.params;
            const { roles } = req.body;

            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            const roleIds = roles.map(r => typeof r == 'object' ? r.id : r);
            await user.setRoles(roleIds);

            res.json({ message: 'Roles asignados al usuario' });
        } catch (error) {
            res.status(400).json({ message: 'Error al asignar roles', error: error.message });
        }
    }

    // Obtener roles de un usuario
    async getUserRoles(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findByPk(userId, {
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: [] }
                    }
                ]
            });

            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            res.json(user.roles);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener roles del usuario', error: error.message });
        }
    }

    // Listar usuarios con sus roles
    async getUsersWithRoles(req, res) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: [] }
                    }
                ]
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios con roles', error: error.message });
        }
    }

    // Actualizar asignaciones en lote
    async updateBulkAssignments(req, res) {
        try {
            const { assignments } = req.body;

            if (!Array.isArray(assignments)) {
                return res.status(400).json({ message: 'Las asignaciones deben ser un array' });
            }

            const results = [];

            for (const assignment of assignments) {
                const { type, id, permissions, roles } = assignment;

                if (type == 'role' && permissions) {
                    // Actualizar permisos de un rol
                    const role = await Role.findByPk(id);
                    if (role) {
                        const permissionIds = permissions.map(p => typeof p == 'object' ? p.id : p);
                        await role.setPermissions(permissionIds);
                        results.push({ type: 'role', id, action: 'permissions_updated', count: permissionIds.length });
                    }
                } else if (type == 'user' && roles) {
                    // Actualizar roles de un usuario
                    const user = await User.findByPk(id);
                    if (user) {
                        const roleIds = roles.map(r => typeof r == 'object' ? r.id : r);
                        await user.setRoles(roleIds);
                        results.push({ type: 'user', id, action: 'roles_updated', count: roleIds.length });
                    }
                }
            }

            res.json({
                message: 'Asignaciones actualizadas exitosamente',
                results,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar asignaciones', error: error.message });
        }
    }
}

export default new RoleController(); 