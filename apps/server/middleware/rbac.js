import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import UserRole from '../models/userRole.js';
import RolePermission from '../models/rolePermission.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

export const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            // 1. Verificar JWT
            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
            const token = authHeader.split(' ')[1];
            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ message: 'Token inválido' });
            }

            // 2. Obtener usuario y roles
            const user = await User.findByPk(decoded.id, {
                include: [{
                    model: Role,
                    as: 'roles',
                    include: [{
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] }
                    }],
                    through: { attributes: [] }
                }]
            });
            if (!user) return res.status(401).json({ message: 'Usuario no válido' });

            // 3. Verificar si el usuario tiene el permiso
            const userPermissions = new Set();
            for (const role of user.roles) {
                for (const perm of role.permissions) {
                    userPermissions.add(perm.name);
                }
            }
            if (!userPermissions.has(permissionName)) {
                return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
            }

            // 4. Permiso concedido
            req.user = user;
            next();
        } catch (error) {
            console.error('Error en requirePermission:', error);
            res.status(500).json({ message: 'Error interno de autorización', error: error.message });
        }
    };
}; 