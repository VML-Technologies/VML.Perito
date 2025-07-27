import User from '../models/user.js';
import Role from '../models/role.js';
import PasswordService from '../services/passwordService.js';
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
        const valid = await PasswordService.verifyPassword(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        const token = jwt.sign({ 
            id: user.id, 
            email: user.email, 
            name: user.name,
            temporaryPassword: user.temporary_password 
        }, JWT_SECRET, { expiresIn: '2h' });
        
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                sede_id: user.sede_id,
                phone: user.phone,
                intermediary_key: user.intermediary_key,
                temporary_password: user.temporary_password,
                roles: user.roles || []
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
};

// Endpoint para cambiar contraseña temporal
export const changeTemporaryPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar que el usuario tenga contraseña temporal
        if (!user.temporary_password) {
            return res.status(400).json({ message: 'No tienes una contraseña temporal que cambiar' });
        }

        // Verificar la contraseña actual
        const isValidCurrentPassword = await PasswordService.verifyPassword(currentPassword, user.password);
        if (!isValidCurrentPassword) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Validar la nueva contraseña
        const passwordValidation = PasswordService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'La nueva contraseña no cumple con los requisitos de seguridad',
                errors: passwordValidation.errors
            });
        }

        // Actualizar la contraseña y marcar como no temporal
        const hashedPassword = await PasswordService.hashPassword(newPassword);
        await user.update({
            password: hashedPassword,
            temporary_password: false
        });

        // Obtener el usuario actualizado con roles
        const updatedUser = await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'description']
                }
            ]
        });

        res.json({ 
            message: 'Contraseña cambiada exitosamente',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                sede_id: updatedUser.sede_id,
                phone: updatedUser.phone,
                intermediary_key: updatedUser.intermediary_key,
                temporary_password: false,
                roles: updatedUser.roles || []
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
};

// Endpoint para cambiar contraseña desde el perfil
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña actual
        const isValidCurrentPassword = await PasswordService.verifyPassword(currentPassword, user.password);
        if (!isValidCurrentPassword) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Validar la nueva contraseña
        const passwordValidation = PasswordService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: 'La nueva contraseña no cumple con los requisitos de seguridad',
                errors: passwordValidation.errors
            });
        }

        // Actualizar la contraseña
        const hashedPassword = await PasswordService.hashPassword(newPassword);
        await user.update({
            password: hashedPassword,
            temporary_password: false // Asegurar que no sea temporal
        });

        // Obtener el usuario actualizado con roles
        const updatedUser = await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'description']
                }
            ]
        });

        res.json({ 
            message: 'Contraseña cambiada exitosamente',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                sede_id: updatedUser.sede_id,
                phone: updatedUser.phone,
                intermediary_key: updatedUser.intermediary_key,
                temporary_password: false,
                roles: updatedUser.roles || []
            }
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
                intermediary_key: user.intermediary_key,
                temporary_password: user.temporary_password,
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