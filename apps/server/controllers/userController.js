import { BaseController } from './baseController.js';
import User from '../models/user.js';
import Sede from '../models/sede.js';
import Company from '../models/company.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import bcrypt from 'bcryptjs';

class UserController extends BaseController {
    constructor() {
        super(User);
    }

    // Sobrescribir el método store para hashear la contraseña
    async store(req, res) {
        try {
            const { password, ...userData } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await this.model.create({
                ...userData,
                password: hashedPassword,
            });

            // No devolver la contraseña en la respuesta
            const { password: _, ...userResponse } = user.toJSON();
            res.status(201).json(userResponse);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear usuario', error: error.message });
        }
    }

    // Sobrescribir el método update para manejar contraseñas
    async update(req, res) {
        try {
            const { password, ...userData } = req.body;
            const user = await this.model.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Si se está actualizando la contraseña, hashearla
            if (password) {
                userData.password = await bcrypt.hash(password, 10);
            }

            await user.update(userData);

            // No devolver la contraseña en la respuesta
            const { password: _, ...userResponse } = user.toJSON();
            res.json(userResponse);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar usuario', error: error.message });
        }
    }

    // Sobrescribir el método index para excluir contraseñas e incluir sede
    async index(req, res) {
        try {
            const users = await this.model.findAll({
                attributes: { exclude: ['password'] },
                include: [{
                    model: User.sequelize.models.Sede,
                    as: 'sede',
                    attributes: ['id', 'name'],
                    include: [{
                        model: User.sequelize.models.Company,
                        as: 'company',
                        attributes: ['id', 'name']
                    }]
                }]
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
        }
    }

    // Sobrescribir el método show para excluir contraseña e incluir sede
    async show(req, res) {
        try {
            const user = await this.model.findByPk(req.params.id, {
                attributes: { exclude: ['password'] },
                include: [{
                    model: User.sequelize.models.Sede,
                    as: 'sede',
                    attributes: ['id', 'name'],
                    include: [{
                        model: User.sequelize.models.Company,
                        as: 'company',
                        attributes: ['id', 'name']
                    }]
                }]
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
        }
    }

    // Método para obtener el perfil del usuario autenticado con roles y permisos
    async profile(req, res) {
        try {
            const userId = req.user.id;
            const user = await this.model.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Sede,
                        as: 'sede',
                        attributes: ['id', 'name'],
                        include: [{
                            model: Company,
                            as: 'company',
                            attributes: ['id', 'name']
                        }]
                    },
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: [] },
                        include: [{
                            model: Permission,
                            as: 'permissions',
                            through: { attributes: [] }
                        }]
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Extraer roles y permisos únicos
            const roles = Array.isArray(user.roles) ? user.roles.map(role => role.name) : [];
            const permissions = Array.isArray(user.roles)
                ? [...new Set(
                    user.roles.flatMap(role =>
                        Array.isArray(role.permissions)
                            ? role.permissions.map(permission => permission.name)
                            : []
                    )
                )]
                : [];

            const userResponse = {
                ...user.toJSON(),
                roles,
                permissions
            };

            res.json(userResponse);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
        }
    }
}

export default new UserController(); 