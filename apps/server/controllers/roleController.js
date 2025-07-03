import Role from '../models/role.js';
import Permission from '../models/permission.js';
import User from '../models/user.js';
import RolePermission from '../models/rolePermission.js';
import UserRole from '../models/userRole.js';

const roleController = {
    // Listar roles con sus permisos
    async index(req, res) {
        try {
            const roles = await Role.findAll({
                include: [
                    {
                        model: Permission,
                        through: { attributes: [] }
                    }
                ]
            });
            res.json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener roles', error: error.message });
        }
    },
    // Crear rol
    async store(req, res) {
        try {
            const { name, description, permissions } = req.body;
            const role = await Role.create({ name, description });

            // Asignar permisos si se proporcionan
            if (permissions && permissions.length > 0) {
                const permissionIds = permissions.map(p => typeof p === 'object' ? p.id : p);
                await role.setPermissions(permissionIds);
            }

            res.status(201).json(role);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear rol', error: error.message });
        }
    },
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
                const permissionIds = permissions.map(p => typeof p === 'object' ? p.id : p);
                await role.setPermissions(permissionIds);
            }

            res.json(role);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar rol', error: error.message });
        }
    },
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
    },
    // Asignar permisos a un rol
    async assignPermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissions } = req.body;

            const role = await Role.findByPk(id);
            if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

            const permissionIds = permissions.map(p => typeof p === 'object' ? p.id : p);
            await role.setPermissions(permissionIds);

            res.json({ message: 'Permisos asignados al rol' });
        } catch (error) {
            res.status(400).json({ message: 'Error al asignar permisos', error: error.message });
        }
    },
    // Obtener permisos de un rol
    async getPermissions(req, res) {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id, {
                include: [
                    {
                        model: Permission,
                        through: { attributes: [] }
                    }
                ]
            });

            if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

            res.json(role.Permissions);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener permisos del rol', error: error.message });
        }
    },
    // Asignar roles a un usuario
    async assignUserRoles(req, res) {
        try {
            const { userId } = req.params;
            const { roles } = req.body;

            const user = await User.findByPk(userId);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            const roleIds = roles.map(r => typeof r === 'object' ? r.id : r);
            await user.setRoles(roleIds);

            res.json({ message: 'Roles asignados al usuario' });
        } catch (error) {
            res.status(400).json({ message: 'Error al asignar roles', error: error.message });
        }
    },
    // Obtener roles de un usuario
    async getUserRoles(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findByPk(userId, {
                include: [
                    {
                        model: Role,
                        through: { attributes: [] }
                    }
                ]
            });

            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            res.json(user.Roles);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener roles del usuario', error: error.message });
        }
    },
    // Listar usuarios con sus roles
    async getUsersWithRoles(req, res) {
        try {
            const users = await User.findAll({
                include: [
                    {
                        model: Role,
                        through: { attributes: [] }
                    }
                ]
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios con roles', error: error.message });
        }
    }
};

export default roleController; 