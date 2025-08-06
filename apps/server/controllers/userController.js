import { BaseController } from './baseController.js';
import User from '../models/user.js';
import Sede from '../models/sede.js';
import Company from '../models/company.js';
import Role from '../models/role.js';
import Permission from '../models/permission.js';
import PasswordService from '../services/passwordService.js';
import webSocketSystem from '../websocket/index.js';
import EventRegistry from '../services/eventRegistry.js';
import automatedEventTriggers from '../services/automatedEventTriggers.js';

class UserController extends BaseController {
    constructor() {
        super(User);

        // Bind methods to preserve context
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.destroy = this.destroy.bind(this);
        this.forceDestroy = this.forceDestroy.bind(this);
        this.restore = this.restore.bind(this);
        this.indexWithTrashed = this.indexWithTrashed.bind(this);
        this.onlyTrashed = this.onlyTrashed.bind(this);
        this.profile = this.profile.bind(this);
    }

    // Sobrescribir el método store para hashear la contraseña
    async store(req, res) {
        try {
            const { password, ...userData } = req.body;

            // Validar contraseña según la política
            const passwordValidation = PasswordService.validatePassword(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    message: 'La contraseña no cumple con los requisitos de seguridad',
                    errors: passwordValidation.errors
                });
            }

            const hashedPassword = await PasswordService.hashPassword(password);

            const user = await this.model.create({
                ...userData,
                password: hashedPassword,
                temporary_password: false, // Por defecto no es temporal
            });

            // No devolver la contraseña en la respuesta
            const { password: _, ...userResponse } = user.toJSON();

            // Disparar evento de usuario creado
            try {
                await automatedEventTriggers.triggerUserEvents('created', {
                    id: userResponse.id,
                    email: userResponse.email,
                    first_name: userResponse.first_name,
                    last_name: userResponse.last_name,
                    role: userResponse.roles?.[0]?.name || 'user'
                }, {
                    created_by: req.user?.id,
                    ip_address: req.ip
                });
            } catch (eventError) {
                console.error('Error disparando evento user.created:', eventError);
            }

            // Enviar notificación de nuevo usuario a administradores
            if (webSocketSystem.isInitialized()) {
                await webSocketSystem.sendNotificationToRole('super_admin', {
                    type: 'user',
                    title: 'Nuevo usuario creado',
                    message: `Se ha creado el usuario: ${userResponse.name}`,
                    priority: 'normal',
                    category: 'user_management',
                    data: { userId: userResponse.id, userName: userResponse.name }
                });
            }

            res.status(201).json(userResponse);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear usuario', error: error.message });
        }
    }

    // Sobrescribir el método update para manejar contraseñas
    async update(req, res) {
        try {
            const { password, currentPassword, ...userData } = req.body;
            const user = await this.model.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Si se está actualizando la contraseña, validar la contraseña actual
            if (password) {
                if (!currentPassword) {
                    return res.status(400).json({ message: 'La contraseña actual es requerida para cambiar la contraseña' });
                }

                // Verificar que la contraseña actual sea correcta
                const isValidCurrentPassword = await PasswordService.verifyPassword(currentPassword, user.password);
                if (!isValidCurrentPassword) {
                    return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
                }

                // Validar la nueva contraseña según la política
                const passwordValidation = PasswordService.validatePassword(password);
                if (!passwordValidation.isValid) {
                    return res.status(400).json({
                        message: 'La nueva contraseña no cumple con los requisitos de seguridad',
                        errors: passwordValidation.errors
                    });
                }

                // Hashear la nueva contraseña
                userData.password = await PasswordService.hashPassword(password);

                // Si el usuario tenía contraseña temporal, marcarla como permanente
                if (user.temporary_password) {
                    userData.temporary_password = false;
                }
            }

            await user.update(userData);

            // No devolver la contraseña en la respuesta
            const { password: _, ...userResponse } = user.toJSON();

            // Disparar evento de cambio de contraseña si se actualizó la contraseña
            if (password) {
                try {
                    await automatedEventTriggers.triggerUserEvents('password_changed', {
                        id: userResponse.id,
                        email: userResponse.email,
                        first_name: userResponse.first_name,
                        last_name: userResponse.last_name
                    }, {
                        changed_by: req.user?.id,
                        ip_address: req.ip,
                        changed_at: new Date().toISOString()
                    });
                } catch (eventError) {
                    console.error('Error disparando evento user.password_changed:', eventError);
                }
            }

            // Disparar evento de usuario actualizado
            try {
                await automatedEventTriggers.triggerUserEvents('updated', {
                    id: userResponse.id,
                    email: userResponse.email,
                    first_name: userResponse.first_name,
                    last_name: userResponse.last_name,
                    role: userResponse.roles?.[0]?.name || 'user'
                }, {
                    updated_by: req.user?.id,
                    ip_address: req.ip,
                    changes: Object.keys(userData)
                });
            } catch (eventError) {
                console.error('Error disparando evento user.updated:', eventError);
            }

            // Enviar notificación de actualización al usuario
            if (webSocketSystem.isInitialized()) {
                await webSocketSystem.sendNotification(user.id, {
                    type: 'user',
                    title: 'Perfil actualizado',
                    message: 'Tu perfil ha sido actualizado exitosamente.',
                    priority: 'normal',
                    category: 'profile_update'
                });
            }

            res.json(userResponse);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar usuario', error: error.message });
        }
    }

    // Sobrescribir el método destroy para disparar eventos
    async destroy(req, res) {
        try {
            const user = await this.model.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Guardar datos del usuario antes de eliminarlo
            const userData = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.roles?.[0]?.name || 'user'
            };

            await user.destroy(); // Soft delete

            // Disparar evento de usuario eliminado
            try {
                await automatedEventTriggers.triggerUserEvents('deleted', userData, {
                    deleted_by: req.user?.id,
                    ip_address: req.ip,
                    deleted_at: new Date().toISOString()
                });
            } catch (eventError) {
                console.error('Error disparando evento user.deleted:', eventError);
            }

            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
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
            const user = req.user;
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