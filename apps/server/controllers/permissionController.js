import Permission from '../models/permission.js';
import { getRegisteredPermissions } from '../middleware/permissionRegistry.js';

const permissionController = {
    // Listar permisos desde la base de datos
    async index(req, res) {
        try {
            const permissions = await Permission.findAll();
            res.json(permissions);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener permisos', error: error.message });
        }
    },
    // Listar permisos registrados dinámicamente
    registered(req, res) {
        try {
            const registered = getRegisteredPermissions();
            res.json(registered);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener permisos registrados', error: error.message });
        }
    },
    // Crear permiso
    async store(req, res) {
        try {
            const { name, description, resource, action, endpoint, method } = req.body;
            const permission = await Permission.create({ name, description, resource, action, endpoint, method });
            res.status(201).json(permission);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear permiso', error: error.message });
        }
    },
    // Editar permiso
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, resource, action, endpoint, method } = req.body;
            const permission = await Permission.findByPk(id);
            if (!permission) return res.status(404).json({ message: 'Permiso no encontrado' });
            Object.assign(permission, { name, description, resource, action, endpoint, method });
            await permission.save();
            res.json(permission);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar permiso', error: error.message });
        }
    },
    // Eliminar permiso
    async destroy(req, res) {
        try {
            const { id } = req.params;
            const permission = await Permission.findByPk(id);
            if (!permission) return res.status(404).json({ message: 'Permiso no encontrado' });
            await permission.destroy();
            res.json({ message: 'Permiso eliminado' });
        } catch (error) {
            res.status(400).json({ message: 'Error al eliminar permiso', error: error.message });
        }
    }
};

export default permissionController; 