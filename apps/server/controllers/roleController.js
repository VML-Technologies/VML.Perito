import Role from '../models/role.js';
import Permission from '../models/permission.js';

const roleController = {
    // Listar roles y sus permisos
    async index(req, res) {
        try {
            const roles = await Role.findAll({
                include: [{
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] }
                }]
            });
            res.json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener roles', error: error.message });
        }
    }
};

export default roleController; 