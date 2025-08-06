import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
        console.log('📧 Servicio Email inicializado');
    }

    /**
     * Configurar proveedor de email
     */
    configureProvider(provider, config) {
        this.provider = provider;
        this.config = config;

        if (provider === 'smtp') {
            this.transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure, // true para 465, false para otros puertos
                auth: {
                    user: config.user,
                    pass: config.pass
                }
            });

            console.log(`📧 Proveedor SMTP configurado: ${config.host}:${config.port}`);
        }
    }

    /**
     * Configurar desde variables de entorno
     */
    configureFromEnv() {
        const config = {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            from: process.env.EMAIL_FROM,
            fromName: process.env.EMAIL_FROM_NAME
        };

        if (config.host && config.user && config.pass) {
            this.configureProvider('smtp', config);
            return true;
        } else {
            console.warn('⚠️ Configuración de email incompleta en variables de entorno');
            return false;
        }
    }

    /**
     * Enviar notificación por Email
     */
    async send(notification) {
        try {
            console.log(`📧 Enviando email a: ${notification.recipient_email}`);

            if (!this.transporter) {
                console.warn('⚠️ Transporter de email no configurado, simulando envío...');
                return this.simulateSend(notification);
            }

            // Extraer datos del canal específico si están disponibles
            const channelData = notification.metadata?.channel_data?.email || {};

            const emailData = {
                from: `"${this.config.fromName}" <${this.config.from}>`,
                to: notification.recipient_email,
                subject: channelData.subject || notification.title,
                html: this.generateHtmlContent(notification, channelData),
                text: channelData.text || notification.content,
                priority: this.mapPriority(notification.priority)
            };

            const result = await this.transporter.sendMail(emailData);

            console.log(`✅ Email enviado exitosamente: ${result.messageId}`);

            return {
                success: true,
                delivered: result.accepted && result.accepted.length > 0,
                external_id: result.messageId,
                response: result
            };

        } catch (error) {
            console.error('❌ Error en servicio Email:', error);
            throw error;
        }
    }

    /**
     * Simular envío para desarrollo
     */
    simulateSend(notification) {
        const channelData = notification.metadata?.channel_data?.email || {};

        console.log(`📧 [SIMULACIÓN] Email a: ${notification.recipient_email}`);
        console.log(`📧 [SIMULACIÓN] Asunto: ${channelData.subject || notification.title}`);
        console.log(`📧 [SIMULACIÓN] Contenido: ${notification.content}`);

        return {
            success: true,
            delivered: false,
            external_id: `email_sim_${Date.now()}`,
            response: {
                channel: 'email',
                provider: 'simulation',
                to: notification.recipient_email,
                subject: channelData.subject || notification.title,
                simulated: true
            }
        };
    }

    /**
     * Generar contenido HTML para el email
     */
    generateHtmlContent(notification, channelData = {}) {


        // Usar contenido específico del canal si está disponible
        const content = channelData.html || channelData.body || notification.content || 'Sin contenido disponible';

        // Template básico HTML
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${channelData.subject || notification.title || 'Notificación VML Perito'}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${channelData.subject || notification.title || 'Notificación VML Perito'}</h1>
                </div>
                <div class="content">
                    <p>${content.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="footer">
                    <p>VML Perito - Sistema de Notificaciones</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Mapear prioridad a configuración de email
     */
    mapPriority(priority) {
        const priorityMap = {
            'urgent': 'high',
            'high': 'high',
            'normal': 'normal',
            'low': 'low'
        };
        return priorityMap[priority] || 'normal';
    }

    /**
     * Enviar con proveedor configurado (implementación futura)
     */
    async sendWithProvider(emailData) {
        // Placeholder para implementación real
        throw new Error('Proveedor de email no implementado');
    }

    /**
     * Validar dirección de email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Obtener estadísticas de envío
     */
    async getStats(dateFrom, dateTo) {
        // TODO: Implementar estadísticas cuando se tenga proveedor
        return {
            sent: 0,
            delivered: 0,
            failed: 0,
            pending: 0
        };
    }
}

export default new EmailService(); 