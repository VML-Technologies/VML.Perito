import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Role from '../models/role.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

export const requireAuth = async (req, res, next) => {
    try {
        // 1. Verificar JWT
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Token requerido' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // 2. Obtener usuario
        const user = await User.findByPk(decoded.id, {
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] }
            }]
        });

        if (!user || !user.is_active) {
            return res.status(401).json({ message: 'Usuario no válido' });
        }

        // 3. Establecer usuario en request
        req.user = user;
        next();

    } catch (error) {
        console.error('Error en requireAuth:', error);
        res.status(500).json({ message: 'Error interno de autenticación', error: error.message });
    }
}; 