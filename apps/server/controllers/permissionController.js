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
    }
};

export default permissionController; 