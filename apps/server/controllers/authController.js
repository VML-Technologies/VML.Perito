import User from '../models/user.js';
import Role from '../models/role.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where: { email, is_active: true },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'description']
                }
            ]
        });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                sede_id: user.sede_id,
                phone: user.phone,
                roles: user.roles || []
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
};

export const verify = async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });
        try {
            const user = await User.findByPk(decoded.id, {
                include: [
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });
            if (!user || !user.is_active) return res.status(401).json({ message: 'Usuario no válido' });
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                sede_id: user.sede_id,
                phone: user.phone,
                roles: user.roles || []
            });
        } catch (err) {
            res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }
    });
};

export const logout = (req, res) => {
    res.json({ message: 'Sesión cerrada' });
}; 