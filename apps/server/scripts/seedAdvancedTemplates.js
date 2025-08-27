import NotificationTemplate from '../models/notificationTemplate.js';
import User from '../models/user.js';

/**
 * Seeder para plantillas avanzadas que correspondan a los tipos de notificación específicos
 */
const seedAdvancedTemplates = async () => {
    try {
        console.log('📝 Configurando plantillas avanzadas...');

        const adminUser = await User.findOne({ where: { email: 'admin@vmltechnologies.com' } });
        if (!adminUser) {
            console.log('⚠️ Usuario admin no encontrado, saltando seeding de plantillas');
            return;
        }

        const advancedTemplates = [
            // ===== USER.CREATED =====
            {
                name: 'user_welcome',
                description: 'Email de bienvenida para usuario creado',
                category: 'user',
                channels: {
                    email: {
                        subject: '¡Bienvenido a Movilidad Mundial, {{user.name}}!',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 28px;">¡Bienvenido a Movilidad Mundial!</h1>
                                    <p style="margin: 10px 0 0 0; font-size: 16px;">Sistema de Inspecciones Automotrices</p>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">Hola {{user.name}},</h2>
                                    
                                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                                        Tu cuenta ha sido creada exitosamente en nuestro sistema de inspecciones automotrices.
                                    </p>
                                    
                                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <h3 style="color: #333; margin-top: 0;">Detalles de tu cuenta:</h3>
                                        <ul style="color: #555; line-height: 1.8;">
                                            <li><strong>Email:</strong> {{user.email}}</li>
                                            <li><strong>Rol:</strong> {{user.role}}</li>
                                            <li><strong>Fecha de registro:</strong> {{user.created_at}}</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #555; line-height: 1.6;">
                                        Ya puedes acceder al sistema y comenzar a utilizar todas las funcionalidades disponibles.
                                    </p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{{login_url}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Acceder al Sistema</a>
                                    </div>
                                    
                                    <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
                                        Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.
                                    </p>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">© 2024 Movilidad Mundial. Todos los derechos reservados.</p>
                                </div>
                            </div>
                        `,
                        variables: ['user.name', 'user.email', 'user.role', 'user.created_at', 'login_url']
                    }
                },
                variables: ['user.name', 'user.email', 'user.role', 'user.created_at', 'login_url'],
                is_active: true,
                created_by: adminUser.id
            },

            // ===== INSPECTION_ORDER.CREATED =====
            {
                name: 'order_created_commercial_email',
                description: 'Email al comercial que creó la orden',
                category: 'inspection_order',
                channels: {
                    email: {
                        subject: 'Orden de Inspección Creada - {{inspection_order.numero}}',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #28a745; color: white; padding: 25px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">✅ Orden Creada Exitosamente</h1>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">Hola {{user.name}},</h2>
                                    
                                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                                        Has creado exitosamente una nueva orden de inspección. Aquí están los detalles:
                                    </p>
                                    
                                    <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                                        <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Detalles de la Orden</h3>
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Número:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.numero}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Cliente:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.nombre_cliente}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Email Cliente:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.correo_cliente}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Vehículo:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Placa:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.placa}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Fecha Creación:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.created_at}}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <p style="color: #555; line-height: 1.6;">
                                        La orden ha sido asignada a nuestro equipo de coordinación. Recibirás notificaciones sobre el progreso.
                                    </p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{{order_url}}" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Orden</a>
                                    </div>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">Movilidad Mundial - Sistema de Inspecciones Automotrices</p>
                                </div>
                            </div>
                        `,
                        variables: ['user.name', 'inspection_order.numero', 'inspection_order.nombre_cliente', 'inspection_order.correo_cliente', 'inspection_order.marca', 'inspection_order.linea', 'inspection_order.modelo', 'inspection_order.placa', 'inspection_order.created_at', 'order_url']
                    }
                },
                variables: ['user.name', 'inspection_order.numero', 'inspection_order.nombre_cliente', 'inspection_order.correo_cliente', 'inspection_order.marca', 'inspection_order.linea', 'inspection_order.modelo', 'inspection_order.placa', 'inspection_order.created_at', 'order_url'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_created_coordinator_email',
                description: 'Email a coordinadores de contacto',
                category: 'inspection_order',
                channels: {
                    email: {
                        subject: 'Nueva Orden Requiere Asignación - {{inspection_order.numero}}',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #ffc107; color: #333; padding: 25px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">🔄 Nueva Orden Pendiente</h1>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">Hola {{user.name}},</h2>
                                    
                                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                                        Se ha creado una nueva orden de inspección que requiere asignación de agente:
                                    </p>
                                    
                                    <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                                        <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #ffc107; padding-bottom: 10px;">Detalles de la Orden</h3>
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Número:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.numero}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Cliente:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.nombre_cliente}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Email:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.correo_cliente}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Teléfono:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.celular_cliente}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Vehículo:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Comercial:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{user.name}} ({{user.email}})</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <p style="color: #555; line-height: 1.6;">
                                        Por favor, asigna un agente de contacto lo antes posible para dar seguimiento al cliente.
                                    </p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="{{assignment_url}}" style="background: #ffc107; color: #333; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Asignar Agente</a>
                                    </div>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">Movilidad Mundial - Sistema de Inspecciones Automotrices</p>
                                </div>
                            </div>
                        `,
                        variables: ['user.name', 'user.email', 'inspection_order.numero', 'inspection_order.nombre_cliente', 'inspection_order.correo_cliente', 'inspection_order.celular_cliente', 'inspection_order.marca', 'inspection_order.linea', 'inspection_order.modelo', 'assignment_url'],
                        is_active: true,
                        created_by: adminUser.id
                    }
                },
                variables: ['user.name', 'user.email', 'inspection_order.numero', 'inspection_order.nombre_cliente', 'inspection_order.correo_cliente', 'inspection_order.celular_cliente', 'inspection_order.marca', 'inspection_order.linea', 'inspection_order.modelo', 'assignment_url'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_created_commercial_inapp',
                description: 'Notificación in-app al comercial',
                category: 'inspection_order',
                channels: {
                    in_app: {
                        template: {
                            title: '✅ Orden Creada',
                            body: 'Orden {{inspection_order.numero}} creada para {{inspection_order.nombre_cliente}}',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                reference: '{{inspection_order.numero}}',
                                customer_name: '{{inspection_order.nombre_cliente}}',
                                action: 'view_order'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero', 'inspection_order.nombre_cliente']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero', 'inspection_order.nombre_cliente'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_created_coordinator_inapp',
                description: 'Notificación in-app a coordinadores',
                category: 'inspection_order',
                channels: {
                    in_app: {
                        template: {
                            title: '🔄 Nueva Orden',
                            body: 'Orden {{inspection_order.numero}} requiere asignación',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                reference: '{{inspection_order.numero}}',
                                customer_name: '{{inspection_order.nombre_cliente}}',
                                action: 'assign_agent'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero', 'inspection_order.nombre_cliente']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero', 'inspection_order.nombre_cliente'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_created_commercial_push',
                description: 'Push notification al comercial',
                category: 'inspection_order',
                channels: {
                    push: {
                        template: {
                            title: '✅ Orden Creada',
                            body: 'Orden {{inspection_order.numero}} creada exitosamente',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                action: 'view_order'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_created_coordinator_push',
                description: 'Push notification a coordinadores',
                category: 'inspection_order',
                channels: {
                    push: {
                        template: {
                            title: '🔄 Nueva Orden',
                            body: 'Orden {{inspection_order.numero}} requiere asignación',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                action: 'assign_agent'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero'],
                is_active: true,
                created_by: adminUser.id
            },

            // ===== INSPECTION_ORDER.ASSIGNED =====
            {
                name: 'order_assigned_commercial_inapp',
                description: 'Notificación in-app de asignación al comercial',
                category: 'inspection_order',
                channels: {
                    in_app: {
                        template: {
                            title: '👤 Agente Asignado',
                            body: 'Orden {{inspection_order.numero}} asignada a {{agent.name}}',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                agent_id: '{{agent.id}}',
                                action: 'view_order'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero', 'agent.id', 'agent.name']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero', 'agent.id', 'agent.name'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_assigned_coordinator_inapp',
                description: 'Notificación in-app de asignación a coordinadores',
                category: 'inspection_order',
                channels: {
                    in_app: {
                        template: {
                            title: '✅ Asignación Completada',
                            body: 'Orden {{inspection_order.numero}} asignada a {{agent.name}}',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                agent_id: '{{agent.id}}',
                                action: 'view_order'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero', 'agent.id', 'agent.name']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero', 'agent.id', 'agent.name'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_assigned_commercial_push',
                description: 'Push notification de asignación al comercial',
                category: 'inspection_order',
                channels: {
                    push: {
                        template: {
                            title: '👤 Agente Asignado',
                            body: 'Orden {{inspection_order.numero}} asignada',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                action: 'view_order'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'order_assigned_coordinator_push',
                description: 'Push notification de asignación a coordinadores',
                category: 'inspection_order',
                channels: {
                    push: {
                        template: {
                            title: '✅ Asignación Completada',
                            body: 'Orden {{inspection_order.numero}} asignada a {{agent.name}}',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                action: 'view_order'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.numero', 'agent.name']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.numero', 'agent.name'],
                is_active: true,
                created_by: adminUser.id
            },

            // ===== INSPECTION_ORDER.SCHEDULED =====
            {
                name: 'appointment_confirmation_client_email',
                description: 'Email de confirmación de cita al cliente',
                category: 'appointment',
                channels: {
                    email: {
                        subject: 'Confirmación de Cita - {{appointment.scheduled_date}}',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #17a2b8; color: white; padding: 25px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">📅 Cita Confirmada</h1>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">Hola {{inspection_order.nombre_cliente}},</h2>
                                    
                                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                                        Su cita de inspección ha sido confirmada exitosamente. Aquí están los detalles:
                                    </p>
                                    
                                    <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                                        <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #17a2b8; padding-bottom: 10px;">Detalles de la Cita</h3>
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Fecha:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{appointment.scheduled_date}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Hora:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{appointment.scheduled_time}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Sede:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{appointment.location}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Orden:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.numero}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Vehículo:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.marca}} {{inspection_order.linea}} {{inspection_order.modelo}}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
                                        <h4 style="color: #333; margin-top: 0;">📋 Instrucciones importantes:</h4>
                                        <ul style="color: #555; line-height: 1.6;">
                                            <li>Llegue 15 minutos antes de la hora programada</li>
                                            <li>Traiga la documentación del vehículo</li>
                                            <li>El vehículo debe estar limpio y en buen estado</li>
                                            <li>Si no puede asistir, contáctenos con anticipación</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #555; line-height: 1.6;">
                                        Si tiene alguna pregunta o necesita reprogramar, contáctenos inmediatamente.
                                    </p>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">Movilidad Mundial - Sistema de Inspecciones Automotrices</p>
                                </div>
                            </div>
                        `,
                        variables: ['inspection_order.nombre_cliente', 'inspection_order.numero', 'inspection_order.marca', 'inspection_order.linea', 'inspection_order.modelo', 'appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location']
                    }
                },
                variables: ['inspection_order.nombre_cliente', 'inspection_order.numero', 'inspection_order.marca', 'inspection_order.linea', 'inspection_order.modelo', 'appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'appointment_confirmation_client_sms',
                description: 'SMS de confirmación de cita al cliente',
                category: 'appointment',
                channels: {
                    sms: {
                        template: 'Movilidad Mundial: Su cita está confirmada para {{appointment.scheduled_date}} a las {{appointment.scheduled_time}} en {{appointment.location}}. Orden: {{inspection_order.numero}}',
                        variables: ['appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location', 'inspection_order.numero']
                    }
                },
                variables: ['appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location', 'inspection_order.numero'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'appointment_scheduled_commercial_inapp',
                description: 'Notificación in-app de cita programada al comercial',
                category: 'appointment',
                channels: {
                    in_app: {
                        template: {
                            title: '📅 Cita Programada',
                            body: 'Cita programada para {{inspection_order.nombre_cliente}} el {{appointment.scheduled_date}}',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                appointment_id: '{{appointment.id}}',
                                action: 'view_appointment'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.nombre_cliente', 'appointment.id', 'appointment.scheduled_date']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.nombre_cliente', 'appointment.id', 'appointment.scheduled_date'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'appointment_scheduled_commercial_push',
                description: 'Push notification de cita programada al comercial',
                category: 'appointment',
                channels: {
                    push: {
                        template: {
                            title: '📅 Cita Programada',
                            body: 'Cita confirmada para {{inspection_order.nombre_cliente}}',
                            data: {
                                order_id: '{{inspection_order.id}}',
                                action: 'view_appointment'
                            }
                        },
                        variables: ['inspection_order.id', 'inspection_order.nombre_cliente']
                    }
                },
                variables: ['inspection_order.id', 'inspection_order.nombre_cliente'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'appointment_reminder_client_email',
                description: 'Recordatorio por email al cliente (1 día antes)',
                category: 'appointment',
                channels: {
                    email: {
                        subject: 'Recordatorio: Su cita es mañana - {{appointment.scheduled_date}}',
                        template: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: #ffc107; color: #333; padding: 25px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px;">⏰ Recordatorio de Cita</h1>
                                </div>
                                
                                <div style="padding: 30px; background: #f8f9fa;">
                                    <h2 style="color: #333; margin-bottom: 20px;">Hola {{inspection_order.nombre_cliente}},</h2>
                                    
                                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                                        Le recordamos que <strong>mañana</strong> tiene programada su cita de inspección:
                                    </p>
                                    
                                    <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                                        <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #ffc107; padding-bottom: 10px;">Detalles de la Cita</h3>
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Fecha:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{appointment.scheduled_date}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Hora:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{appointment.scheduled_time}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Sede:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{appointment.location}}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #555;"><strong>Orden:</strong></td>
                                                <td style="padding: 8px 0; color: #333;">{{inspection_order.numero}}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                                        <h4 style="color: #333; margin-top: 0;">⚠️ Importante:</h4>
                                        <ul style="color: #555; line-height: 1.6;">
                                            <li>Llegue 15 minutos antes de la hora programada</li>
                                            <li>Traiga la documentación del vehículo</li>
                                            <li>Si no puede asistir, contáctenos <strong>inmediatamente</strong></li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #555; line-height: 1.6;">
                                        Esperamos verlo mañana. Si tiene alguna pregunta, no dude en contactarnos.
                                    </p>
                                </div>
                                
                                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">Movilidad Mundial - Sistema de Inspecciones Automotrices</p>
                                </div>
                            </div>
                        `,
                        variables: ['inspection_order.nombre_cliente', 'inspection_order.numero', 'appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location']
                    }
                },
                variables: ['inspection_order.nombre_cliente', 'inspection_order.numero', 'appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location'],
                is_active: true,
                created_by: adminUser.id
            },

            {
                name: 'appointment_reminder_client_sms',
                description: 'Recordatorio por SMS al cliente (1 día antes)',
                category: 'appointment',
                channels: {
                    sms: {
                        template: 'Movilidad Mundial: Recordatorio - Su cita es mañana {{appointment.scheduled_date}} a las {{appointment.scheduled_time}} en {{appointment.location}}. Orden: {{inspection_order.numero}}',
                        variables: ['appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location', 'inspection_order.numero']
                    }
                },
                variables: ['appointment.scheduled_date', 'appointment.scheduled_time', 'appointment.location', 'inspection_order.numero'],
                is_active: true,
                created_by: adminUser.id
            }
        ];

        let createdCount = 0;
        let updatedCount = 0;

        for (const templateData of advancedTemplates) {
            try {
                const [template, created] = await NotificationTemplate.findOrCreate({
                    where: { name: templateData.name },
                    defaults: templateData
                });

                if (created) {
                    console.log(`✅ Plantilla creada: ${templateData.name}`);
                    createdCount++;
                } else {
                    // Actualizar plantilla existente
                    await template.update(templateData);
                    console.log(`🔄 Plantilla actualizada: ${templateData.name}`);
                    updatedCount++;
                }

            } catch (error) {
                console.error(`❌ Error procesando plantilla ${templateData.name}:`, error.message);
            }
        }

        console.log(`\n🎉 Configuración de plantillas avanzadas completada:`);
        console.log(`   - ${createdCount} plantillas creadas`);
        console.log(`   - ${updatedCount} plantillas actualizadas`);

        // Mostrar estadísticas finales
        const totalTemplates = await NotificationTemplate.count();
        console.log(`📈 Total de plantillas en BD: ${totalTemplates}`);

    } catch (error) {
        console.error('❌ Error configurando plantillas avanzadas:', error);
        throw error;
    }
};

export default seedAdvancedTemplates; 