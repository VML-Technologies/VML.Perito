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
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        this.createUserWithEmail = this.createUserWithEmail.bind(this);
        this.validateIdentification = this.validateIdentification.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
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

            // Cargar el usuario completo con roles y permisos desde la base de datos
            const userWithRoles = await this.model.findByPk(user.id, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: User.sequelize.models.Role,
                        as: 'roles',
                        through: { attributes: [] },
                        include: [
                            {
                                model: User.sequelize.models.Permission,
                                as: 'permissions',
                                through: { attributes: [] }
                            }
                        ]
                    }
                ]
            });

            if (!userWithRoles) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Extraer roles y permisos únicos
            const roles = Array.isArray(userWithRoles.roles) ? userWithRoles.roles.map(role => role.name) : [];
            const permissions = Array.isArray(userWithRoles.roles)
                ? [...new Set(
                    userWithRoles.roles.flatMap(role =>
                        Array.isArray(role.permissions)
                            ? role.permissions.map(permission => permission.name)
                            : []
                    )
                )]
                : [];

            const userResponse = {
                ...userWithRoles.toJSON(),
                roles,
                permissions
            };

            res.json(userResponse);
        } catch (error) {
            console.error('Error en profile:', error);
            res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
        }
    }

    // Método para validar identificación única
    async validateIdentification(req, res) {
        try {
            const { identification, userId } = req.query;

            if (!identification) {
                return res.status(400).json({ 
                    message: 'Identificación es requerida',
                    isValid: false 
                });
            }

            const whereClause = { identification };
            
            // Si se está editando un usuario, excluirlo de la validación
            if (userId) {
                whereClause.id = { [User.sequelize.Sequelize.Op.ne]: userId };
            }

            const existingUser = await User.findOne({
                where: whereClause,
                paranoid: false // Incluir usuarios eliminados
            });

            if (existingUser) {
                return res.status(409).json({
                    message: 'La identificación ya está en uso',
                    isValid: false,
                    existingUser: {
                        id: existingUser.id,
                        name: existingUser.name,
                        email: existingUser.email,
                        is_active: existingUser.is_active,
                        deletedAt: existingUser.deletedAt
                    }
                });
            }

            res.json({
                message: 'Identificación disponible',
                isValid: true
            });

        } catch (error) {
            console.error('Error validando identificación:', error);
            res.status(500).json({ 
                message: 'Error interno del servidor',
                isValid: false 
            });
        }
    }

    // Método para validar email único
    async validateEmail(req, res) {
        try {
            const { email, userId } = req.query;

            if (!email) {
                return res.status(400).json({ 
                    message: 'Email es requerido',
                    isValid: false 
                });
            }

            const whereClause = { email: email.toLowerCase() };
            
            // Si se está editando un usuario, excluirlo de la validación
            if (userId) {
                whereClause.id = { [User.sequelize.Sequelize.Op.ne]: userId };
            }

            const existingUser = await User.findOne({
                where: whereClause,
                paranoid: false // Incluir usuarios eliminados
            });

            if (existingUser) {
                return res.status(409).json({
                    message: 'El email ya está en uso',
                    isValid: false,
                    existingUser: {
                        id: existingUser.id,
                        name: existingUser.name,
                        email: existingUser.email,
                        is_active: existingUser.is_active,
                        deletedAt: existingUser.deletedAt
                    }
                });
            }

            res.json({
                message: 'Email disponible',
                isValid: true
            });

        } catch (error) {
            console.error('Error validando email:', error);
            res.status(500).json({ 
                message: 'Error interno del servidor',
                isValid: false 
            });
        }
    }

    // Función para reemplazar variables en la plantilla de email
    replaceTemplateVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        }
        return result;
    }

    // Función para enviar email de bienvenida
    async sendWelcomeEmail(userEmail, userName, temporaryPassword) {
        try {
            // Configurar transporter de nodemailer
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Leer la plantilla HTML desde el directorio raíz del proyecto
            const templatePath = path.join(__dirname, '../../../email.html');
            let emailTemplate;
            
            try {
                emailTemplate = fs.readFileSync(templatePath, 'utf8');
            } catch (templateError) {
                console.error('❌ Error leyendo plantilla de email:', templateError.message);
                throw new Error('No se pudo cargar la plantilla de email');
            }

            // Variables para la plantilla
            const templateVariables = {
                user_name: userName,
                PASSWORD_TEMPORAL: temporaryPassword,
                login_url: process.env.FRONTEND_URL || 'https://movilidadmundial.vmltechnologies.com/',
                current_year: new Date().getFullYear()
            };

            // Generar contenido HTML
            const htmlContent = this.replaceTemplateVariables(emailTemplate, templateVariables);

            // Verificar que la imagen existe
            const imagePath = path.join(__dirname, '../../../image.png');
            const attachments = [];
            
            if (fs.existsSync(imagePath)) {
                attachments.push({
                    filename: 'mesa-ayuda.png',
                    path: imagePath,
                    cid: 'mesa-ayuda'
                });
            } else {
                console.warn('⚠️ Imagen de mesa de ayuda no encontrada, enviando email sin imagen');
            }

            // Configurar opciones del email
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'Movilidad Mundial'}" <${process.env.EMAIL_FROM}>`,
                to: userEmail,
                subject: '¡Bienvenido a Movilidad Mundial! Activa tu cuenta',
                html: htmlContent,
                attachments: attachments
            };

            // Enviar email
            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Email de bienvenida enviado a ${userEmail}: ${info.messageId}`);
            
            return { success: true, messageId: info.messageId };

        } catch (error) {
            console.error(`❌ Error enviando email de bienvenida a ${userEmail}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // Método para crear usuario con envío de email
    async createUserWithEmail(req, res) {
        try {
            const { sede_id, identification, name, email, phone, password } = req.body;

            // Validaciones básicas
            if (!sede_id || !identification || !name || !email || !password) {
                return res.status(400).json({
                    message: 'Todos los campos son obligatorios: sede_id, identification, name, email, password'
                });
            }

            // Verificar que la sede existe
            const sede = await Sede.findByPk(sede_id);
            if (!sede) {
                return res.status(400).json({
                    message: 'La sede especificada no existe'
                });
            }

            // Verificar que la identificación no existe
            const existingIdUser = await User.findOne({
                where: { identification },
                paranoid: false
            });

            if (existingIdUser) {
                return res.status(409).json({
                    message: 'La identificación ya está en uso',
                    field: 'identification',
                    existingUser: {
                        id: existingIdUser.id,
                        name: existingIdUser.name,
                        email: existingIdUser.email,
                        is_active: existingIdUser.is_active
                    }
                });
            }

            // Verificar que el email no existe
            const existingEmailUser = await User.findOne({
                where: { email: email.toLowerCase() },
                paranoid: false
            });

            if (existingEmailUser) {
                return res.status(409).json({
                    message: 'El email ya está en uso',
                    field: 'email',
                    existingUser: {
                        id: existingEmailUser.id,
                        name: existingEmailUser.name,
                        email: existingEmailUser.email,
                        is_active: existingEmailUser.is_active
                    }
                });
            }

            // Hash de la contraseña
            const hashedPassword = await PasswordService.hashPassword(password);

            // Crear usuario con configuraciones por defecto
            const user = await User.create({
                sede_id,
                identification,
                name,
                email: email.toLowerCase(),
                phone,
                password: hashedPassword,
                is_active: true,
                notification_channel_in_app_enabled: true,
                notification_channel_sms_enabled: true,
                notification_channel_email_enabled: true,
                notification_channel_whatsapp_enabled: true,
                temporary_password: true
            });

            // Enviar email de bienvenida
            const emailResult = await this.sendWelcomeEmail(email, name, password);

            // Preparar respuesta (sin incluir password)
            const { password: _, ...userResponse } = user.toJSON();
            userResponse.sede = sede;

            // Disparar evento de usuario creado
            try {
                await automatedEventTriggers.triggerUserEvents('created', {
                    id: userResponse.id,
                    email: userResponse.email,
                    name: userResponse.name,
                    role: 'user'
                }, {
                    created_by: req.user?.id,
                    ip_address: req.ip,
                    created_with_email: true
                });
            } catch (eventError) {
                console.error('Error disparando evento user.created:', eventError);
            }

            // Enviar notificación WebSocket
            if (webSocketSystem.isInitialized()) {
                await webSocketSystem.sendNotificationToRole('super_admin', {
                    type: 'user',
                    title: 'Nuevo usuario creado',
                    message: `Se ha creado el usuario: ${userResponse.name} con envío de email`,
                    priority: 'normal',
                    category: 'user_management',
                    data: { 
                        userId: userResponse.id, 
                        userName: userResponse.name,
                        emailSent: emailResult.success
                    }
                });
            }

            res.status(201).json({
                user: userResponse,
                emailSent: emailResult.success,
                emailError: emailResult.success ? null : emailResult.error,
                message: emailResult.success 
                    ? 'Usuario creado exitosamente y email de bienvenida enviado'
                    : 'Usuario creado exitosamente, pero no se pudo enviar el email de bienvenida'
            });

        } catch (error) {
            console.error('Error en createUserWithEmail:', error);
            res.status(500).json({ 
                message: 'Error interno del servidor al crear usuario',
                error: error.message 
            });
        }
    }
}

export default new UserController(); 