import crypto from 'crypto';
import User from '../models/user.js';
import PasswordService from './passwordService.js';
import EmailService from './channels/emailService.js';
import automatedEventTriggers from './automatedEventTriggers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PasswordResetService {
    constructor() {
        this.tokenExpirationHours = 24; // 24 horas
        this.maxAttempts = 5; // Máximo 5 intentos
        this.lockoutDurationMinutes = 30; // 30 minutos de bloqueo
    }

    /**
     * Generar token de recuperación de contraseña
     */
    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Calcular fecha de expiración del token
     */
    calculateExpirationDate() {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + this.tokenExpirationHours);
        return expirationDate;
    }

    /**
     * Calcular fecha de desbloqueo
     */
    calculateLockoutExpiration() {
        const lockoutDate = new Date();
        lockoutDate.setMinutes(lockoutDate.getMinutes() + this.lockoutDurationMinutes);
        return lockoutDate;
    }

    /**
     * Verificar si el usuario está bloqueado por intentos fallidos
     */
    isUserLocked(user) {
        if (!user.password_reset_locked_until) {
            return false;
        }
        return new Date() < new Date(user.password_reset_locked_until);
    }

    /**
     * Solicitar recuperación de contraseña
     */
    async requestPasswordReset(email) {
        try {
            // Buscar usuario por email
            const user = await User.findOne({ where: { email, is_active: true } });
            if (!user) {
                // Por seguridad, no revelar si el email existe o no
                return { success: true, message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.' };
            }

            // Verificar si el usuario está bloqueado
            if (this.isUserLocked(user)) {
                const lockoutTime = new Date(user.password_reset_locked_until);
                const remainingMinutes = Math.ceil((lockoutTime - new Date()) / (1000 * 60));
                return { 
                    success: false, 
                    message: `Demasiados intentos. Intenta nuevamente en ${remainingMinutes} minutos.` 
                };
            }

            // Generar token y fecha de expiración
            const resetToken = this.generateResetToken();
            const expirationDate = this.calculateExpirationDate();

            // Actualizar usuario con token de recuperación
            await user.update({
                password_reset_token: resetToken,
                password_reset_expires: expirationDate,
                password_reset_attempts: 0,
                password_reset_locked_until: null
            });

            // Enviar email de recuperación
            await this.sendPasswordResetEmail(user, resetToken);

            // Disparar evento de solicitud de recuperación
            try {
                await automatedEventTriggers.triggerUserEvents('password_reset_requested', {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                }, {
                    requested_at: new Date().toISOString(),
                    expires_at: expirationDate.toISOString()
                });
            } catch (eventError) {
                console.error('Error disparando evento user.password_reset_requested:', eventError);
            }

            return { 
                success: true, 
                message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.' 
            };

        } catch (error) {
            console.error('Error en requestPasswordReset:', error);
            return { 
                success: false, 
                message: 'Error al procesar la solicitud de recuperación de contraseña.' 
            };
        }
    }

    /**
     * Verificar token de recuperación
     */
    async verifyResetToken(token) {
        try {
            const user = await User.findOne({
                where: {
                    password_reset_token: token,
                    is_active: true
                }
            });

            if (!user) {
                return { valid: false, message: 'Token de recuperación inválido.' };
            }

            // Verificar si el token ha expirado
            if (new Date() > new Date(user.password_reset_expires)) {
                // Limpiar token expirado
                await user.update({
                    password_reset_token: null,
                    password_reset_expires: null
                });
                return { valid: false, message: 'El enlace de recuperación ha expirado.' };
            }

            return { valid: true, user };

        } catch (error) {
            console.error('Error en verifyResetToken:', error);
            return { valid: false, message: 'Error al verificar el token.' };
        }
    }

    /**
     * Resetear contraseña con token
     */
    async resetPassword(token, newPassword) {
        try {
            // Verificar token
            const tokenVerification = await this.verifyResetToken(token);
            if (!tokenVerification.valid) {
                return tokenVerification;
            }

            const user = tokenVerification.user;

            // Validar nueva contraseña
            const passwordValidation = PasswordService.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                return {
                    success: false,
                    message: 'La nueva contraseña no cumple con los requisitos de seguridad.',
                    errors: passwordValidation.errors
                };
            }

            // Hashear nueva contraseña
            const hashedPassword = await PasswordService.hashPassword(newPassword);

            // Actualizar contraseña y limpiar token
            await user.update({
                password: hashedPassword,
                password_reset_token: null,
                password_reset_expires: null,
                password_reset_attempts: 0,
                password_reset_locked_until: null,
                temporary_password: false
            });

            // Disparar evento de cambio de contraseña
            try {
                await automatedEventTriggers.triggerUserEvents('password_reset_completed', {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                }, {
                    reset_at: new Date().toISOString()
                });
            } catch (eventError) {
                console.error('Error disparando evento user.password_reset_completed:', eventError);
            }

            return { 
                success: true, 
                message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.' 
            };

        } catch (error) {
            console.error('Error en resetPassword:', error);
            return { 
                success: false, 
                message: 'Error al actualizar la contraseña.' 
            };
        }
    }

    /**
     * Incrementar intentos fallidos y bloquear si es necesario
     */
    async incrementFailedAttempts(user) {
        const newAttempts = (user.password_reset_attempts || 0) + 1;
        
        if (newAttempts >= this.maxAttempts) {
            // Bloquear usuario
            await user.update({
                password_reset_attempts: newAttempts,
                password_reset_locked_until: this.calculateLockoutExpiration()
            });
        } else {
            // Solo incrementar intentos
            await user.update({
                password_reset_attempts: newAttempts
            });
        }
    }

        /**
     * Reemplazar variables en la plantilla de email
     */
    replaceTemplateVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        }
        return result;
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordResetEmail(user, token) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
            
            // Configurar EmailService desde variables de entorno si no está configurado
            if (!EmailService.transporter) {
                console.log('📧 Configurando EmailService desde variables de entorno...');
                EmailService.configureFromEnv();
            }
            
            // Leer la plantilla HTML
            const templatePath = path.join(__dirname, '../mailTemplates/passwordRecovery.html');
            let emailTemplate;
            
            try {
                emailTemplate = fs.readFileSync(templatePath, 'utf8');
            } catch (templateError) {
                console.error('❌ Error leyendo plantilla de email de recuperación:', templateError.message);
                throw new Error('No se pudo cargar la plantilla de email de recuperación');
            }

            // Variables para la plantilla
            const templateVariables = {
                user_name: user.name,
                reset_url: resetUrl,
                expiration_hours: this.tokenExpirationHours,
                current_year: new Date().getFullYear()
            };

            // Generar contenido HTML
            const htmlContent = this.replaceTemplateVariables(emailTemplate, templateVariables);
            
            // Crear objeto de notificación compatible con EmailService.send()
            const notification = {
                recipient_email: user.email,
                title: 'Recuperación de Contraseña - Movilidad Mundial TEST',
                content: `Hola ${user.name}, has solicitado recuperar tu contraseña. Haz clic en el enlace para crear una nueva contraseña: ${resetUrl}`,
                priority: 'normal',
                metadata: {
                    channel_data: {
                        email: {
                            subject: 'Recuperación de Contraseña - Movilidad Mundial',
                            html: htmlContent
                        }
                    }
                }
            };

            await EmailService.send(notification, htmlContent);
            console.log(`📧 Email de recuperación enviado a ${user.email}`);

        } catch (error) {
            console.error('Error enviando email de recuperación:', error);
            throw error;
        }
    }

    /**
     * Limpiar tokens expirados (método de mantenimiento)
     */
    async cleanupExpiredTokens() {
        try {
            const result = await User.update({
                password_reset_token: null,
                password_reset_expires: null
            }, {
                where: {
                    password_reset_expires: {
                        [require('sequelize').Op.lt]: new Date()
                    }
                }
            });

            console.log(`🧹 Limpiados ${result[0]} tokens expirados`);
            return result[0];

        } catch (error) {
            console.error('Error limpiando tokens expirados:', error);
            return 0;
        }
    }
}

export default new PasswordResetService();
