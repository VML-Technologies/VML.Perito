// Plantillas predefinidas para casos comunes
export const predefinedTemplates = {
    appointment_confirmation: {
        name: 'Confirmación de Cita',
        description: 'Notificación de confirmación de cita programada',
        category: 'appointment',
        channels: {
            email: {
                subject: 'Confirmación de Cita - {{appointment.date}}',
                template: `
          <h2>Confirmación de Cita</h2>
          <p>Hola {{user.name}},</p>
          <p>Su cita ha sido confirmada con los siguientes detalles:</p>
          <ul>
            <li><strong>Fecha:</strong> {{appointment.date}}</li>
            <li><strong>Hora:</strong> {{appointment.time}}</li>
            <li><strong>Sede:</strong> {{sede.name}}</li>
            <li><strong>Dirección:</strong> {{sede.address}}</li>
          </ul>
          <p>Por favor, llegue 15 minutos antes de la hora programada.</p>
          <p>Si necesita cancelar o reprogramar, contáctenos con anticipación.</p>
          <p>Saludos,<br>{{company.name}}</p>
        `,
                variables: ['user.name', 'appointment.date', 'appointment.time', 'sede.name', 'sede.address', 'company.name']
            },
            sms: {
                template: 'Cita confirmada: {{appointment.date}} a las {{appointment.time}} en {{sede.name}}. Llegue 15 min antes.',
                variables: ['appointment.date', 'appointment.time', 'sede.name']
            }
        }
    },

    appointment_reminder: {
        name: 'Recordatorio de Cita',
        description: 'Recordatorio enviado 24 horas antes de la cita',
        category: 'appointment',
        channels: {
            email: {
                subject: 'Recordatorio: Su cita es mañana - {{appointment.date}}',
                template: `
          <h2>Recordatorio de Cita</h2>
          <p>Hola {{user.name}},</p>
          <p>Le recordamos que tiene una cita programada para mañana:</p>
          <ul>
            <li><strong>Fecha:</strong> {{appointment.date}}</li>
            <li><strong>Hora:</strong> {{appointment.time}}</li>
            <li><strong>Sede:</strong> {{sede.name}}</li>
          </ul>
          <p>No olvide traer su documentación y llegar 15 minutos antes.</p>
          <p>Para cancelar o reprogramar, contáctenos inmediatamente.</p>
        `,
                variables: ['user.name', 'appointment.date', 'appointment.time', 'sede.name']
            },
            sms: {
                template: 'Recordatorio: Su cita es mañana {{appointment.date}} a las {{appointment.time}} en {{sede.name}}.',
                variables: ['appointment.date', 'appointment.time', 'sede.name']
            }
        }
    },

    inspection_order_created: {
        name: 'Orden de Inspección Creada',
        description: 'Notificación cuando se crea una nueva orden de inspección',
        category: 'inspection_order',
        channels: {
            email: {
                subject: 'Nueva Orden de Inspección - {{inspection_order.numero}}',
                template: `
          <h2>Orden de Inspección Creada</h2>
          <p>Hola {{user.name}},</p>
          <p>Se ha creado una nueva orden de inspección con los siguientes detalles:</p>
          <ul>
            <li><strong>Número de Orden:</strong> {{inspection_order.numero}}</li>
            <li><strong>Vehículo:</strong> {{inspection_order.vehicle_type}} - {{inspection_order.vehicle_plate}}</li>
            <li><strong>Modalidad:</strong> {{inspection_order.modality}}</li>
            <li><strong>Fecha de Creación:</strong> {{inspection_order.created_at}}</li>
          </ul>
          <p>Nos pondremos en contacto pronto para programar la inspección.</p>
        `,
                variables: ['user.name', 'inspection_order.numero', 'inspection_order.vehicle_type', 'inspection_order.vehicle_plate', 'inspection_order.modality', 'inspection_order.created_at']
            },
            sms: {
                template: 'Orden {{inspection_order.numero}} creada para {{inspection_order.vehicle_plate}}. Modalidad: {{inspection_order.modality}}.',
                variables: ['inspection_order.numero', 'inspection_order.vehicle_plate', 'inspection_order.modality']
            }
        }
    },

    inspection_completed: {
        name: 'Inspección Completada',
        description: 'Notificación cuando se completa una inspección',
        category: 'inspection_order',
        channels: {
            email: {
                subject: 'Inspección Completada - {{inspection_order.numero}}',
                template: `
          <h2>Inspección Completada</h2>
          <p>Hola {{user.name}},</p>
          <p>Su inspección ha sido completada exitosamente:</p>
          <ul>
            <li><strong>Número de Orden:</strong> {{inspection_order.numero}}</li>
            <li><strong>Vehículo:</strong> {{inspection_order.vehicle_plate}}</li>
            <li><strong>Fecha de Completado:</strong> {{inspection_order.completed_at}}</li>
          </ul>
          <p>El certificado estará disponible en su perfil en las próximas 24 horas.</p>
          <p>Gracias por confiar en {{company.name}}.</p>
        `,
                variables: ['user.name', 'inspection_order.numero', 'inspection_order.vehicle_plate', 'inspection_order.completed_at', 'company.name']
            },
            sms: {
                template: 'Inspección {{inspection_order.numero}} completada. Certificado disponible en 24h.',
                variables: ['inspection_order.numero']
            }
        }
    },

    welcome_user: {
        name: 'Bienvenida de Usuario',
        description: 'Mensaje de bienvenida para nuevos usuarios',
        category: 'user',
        channels: {
            email: {
                subject: '¡Bienvenido a {{company.name}}, {{user.name}}!',
                template: `
          <h2>¡Bienvenido a {{company.name}}!</h2>
          <p>Hola {{user.name}},</p>
          <p>Nos complace darle la bienvenida a {{company.name}}.</p>
          <p>Su cuenta ha sido creada exitosamente con el email: {{user.email}}</p>
          <p>Para comenzar a usar nuestros servicios:</p>
          <ol>
            <li>Complete su perfil de usuario</li>
            <li>Explore nuestros servicios disponibles</li>
            <li>Programe su primera inspección</li>
          </ol>
          <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
          <p>Saludos,<br>El equipo de {{company.name}}</p>
        `,
                variables: ['user.name', 'user.email', 'company.name']
            },
            sms: {
                template: '¡Bienvenido {{user.name}} a {{company.name}}! Su cuenta está lista.',
                variables: ['user.name', 'company.name']
            }
        }
    },

    password_reset: {
        name: 'Restablecimiento de Contraseña',
        description: 'Notificación para restablecer contraseña',
        category: 'user',
        channels: {
            email: {
                subject: 'Restablecimiento de Contraseña - {{company.name}}',
                template: `
          <h2>Restablecimiento de Contraseña</h2>
          <p>Hola {{user.name}},</p>
          <p>Hemos recibido una solicitud para restablecer su contraseña.</p>
          <p>Si usted no realizó esta solicitud, puede ignorar este mensaje.</p>
          <p>Para restablecer su contraseña, haga clic en el siguiente enlace:</p>
          <p><a href="{{reset_link}}">Restablecer Contraseña</a></p>
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <p>Si tiene problemas, contáctenos.</p>
        `,
                variables: ['user.name', 'reset_link', 'company.name']
            },
            sms: {
                template: 'Código de restablecimiento: {{reset_code}}. Válido por 1 hora.',
                variables: ['reset_code']
            }
        }
    }
};

// Función para obtener plantillas por categoría
export const getTemplatesByCategory = (category) => {
    return Object.entries(predefinedTemplates)
        .filter(([key, template]) => template.category == category)
        .map(([key, template]) => ({
            id: key,
            ...template
        }));
};

// Función para obtener todas las plantillas
export const getAllPredefinedTemplates = () => {
    return Object.entries(predefinedTemplates).map(([key, template]) => ({
        id: key,
        ...template
    }));
}; 