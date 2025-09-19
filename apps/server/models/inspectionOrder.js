import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrder = createModelWithSoftDeletes('InspectionOrder', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'sedes',
            key: 'id'
        }
    },
    assigned_agent_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del agente de contact center asignado a esta orden'
    },
    commercial_user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del usuario comercial que creó la orden (basado en clave_intermediario)'
    },
    producto: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    callback_url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    numero: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    intermediario: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    clave_intermediario: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    sucursal: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    cod_oficina: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    vigencia: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    avaluo: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    vlr_accesorios: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    placa: {
        type: DataTypes.STRING(6),
        allowNull: false,
    },
    marca: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    linea: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    clase: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    modelo: {
        type: DataTypes.STRING(4),
        allowNull: true,
    },
    cilindraje: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    servicio: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    motor: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    chasis: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    vin: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    carroceria: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    combustible: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    metodo_inspeccion_recomendado: {
        type: DataTypes.ENUM('Virtual', 'Presencial', 'A Domicilio'),
        allowNull: true,
        defaultValue: 'Virtual',
        comment: 'Método de inspección recomendado para la orden'
    },
    cod_fasecolda: {
        type: DataTypes.STRING(8),
        allowNull: true,
        comment: 'Código FASECOLDA del vehículo (opcional)'
    },
    inspection_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Link único para acceder a la inspección de asegurabilidad'
    },
    tipo_doc: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    num_doc: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    nombre_cliente: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    celular_cliente: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    correo_cliente: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    nombre_contacto: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    celular_contacto: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    correo_contacto: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    inspection_result: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    inspection_result_details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders_statuses',
            key: 'id'
        }
    },
}, {
    tableName: 'inspection_orders',
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at', // Nombre de la columna
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
        beforeCreate: async (inspectionOrder, options) => {
            // Auto-asignar commercial_user_id basado en clave_intermediario
            if (inspectionOrder.clave_intermediario && !inspectionOrder.commercial_user_id) {
                try {
                    const { User } = await import('./index.js');
                    const commercialUser = await User.findOne({
                        where: {
                            intermediary_key: inspectionOrder.clave_intermediario,
                            is_active: true
                        }
                    });

                    if (commercialUser) {
                        inspectionOrder.commercial_user_id = commercialUser.id;
                        console.log(`🔗 Auto-asignado commercial_user_id: ${commercialUser.id} para clave_intermediario: ${inspectionOrder.clave_intermediario}`);
                    } else {
                        console.log(`⚠️ No se encontró usuario comercial para clave_intermediario: ${inspectionOrder.clave_intermediario}`);
                    }
                } catch (error) {
                    console.error('❌ Error auto-asignando commercial_user_id:', error);
                }
            }

            // Generar link único para la inspección (se completará en afterCreate)
            if (!inspectionOrder.inspection_link) {
                const timestamp = Date.now();
                const uniqueHash = `${inspectionOrder.placa}_temp_${timestamp}`;
                const encodedHash = Buffer.from(uniqueHash).toString('base64').replace(/[+/=]/g, '');
                inspectionOrder.inspection_link = `/inspeccion/${encodedHash}`;
                console.log(`🔗 Link temporal generado: ${inspectionOrder.inspection_link}`);
            }
        },
        beforeUpdate: async (inspectionOrder, options) => {
            // Si cambió clave_intermediario, actualizar commercial_user_id
            if (inspectionOrder.changed('clave_intermediario')) {
                try {
                    const { User } = await import('./index.js');
                    const commercialUser = await User.findOne({
                        where: {
                            intermediary_key: inspectionOrder.clave_intermediario,
                            is_active: true
                        }
                    });

                    if (commercialUser) {
                        inspectionOrder.commercial_user_id = commercialUser.id;
                        console.log(`🔄 Actualizado commercial_user_id: ${commercialUser.id} para clave_intermediario: ${inspectionOrder.clave_intermediario}`);
                    } else {
                        inspectionOrder.commercial_user_id = null;
                        console.log(`⚠️ Removido commercial_user_id para clave_intermediario: ${inspectionOrder.clave_intermediario}`);
                    }
                } catch (error) {
                    console.error('❌ Error actualizando commercial_user_id:', error);
                }
            }
        },
        
        afterCreate: async (inspectionOrder, options) => {
            // Generar link final con el ID real
            try {
                const timestamp = Date.now();
                const uniqueHash = `${inspectionOrder.placa}_${inspectionOrder.id}_${timestamp}`;
                const encodedHash = Buffer.from(uniqueHash).toString('base64').replace(/[+/=]/g, '');
                const finalLink = `/inspeccion/${encodedHash}`;
                
                // Actualizar el link con el hash final
                await inspectionOrder.update({
                    inspection_link: finalLink
                });
                
                console.log(`🔗 Link final generado: ${finalLink}`);
            } catch (error) {
                console.error('❌ Error generando link final:', error);
            }

            // Enviar SMS con el link de inspección (condicionado por FLAG_SEND_SMS_OIN_CREATE)
            if (process.env.FLAG_SEND_SMS_OIN_CREATE === 'true') {
                try {
                    const smsService = await import('../services/channels/smsService.js');
                    
                    // const smsMessage = `Hola ${inspectionOrder.nombre_contacto}, cuando estés listo para tu inspección de asegurabilidad ingresa a este link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}${inspectionOrder.inspection_link}`;
                    const smsMessage = `Hola ${inspectionOrder.nombre_contacto} te hablamos desde Seguros Mundial. Para la inspeccion de ${inspectionOrder.placa} debes tener los documentos, carro limpio, internet, disponibilidad 45Min. Para ingresar dale click aca: ${process.env.FRONTEND_URL || 'http://localhost:3000'}${inspectionOrder.inspection_link}`
                    
                    // Intentar enviar SMS con logging
                    try {
                        const smsLoggingService = await import('../services/smsLoggingService.js');
                        
                        // Loggear SMS con envío automático
                        const smsData = {
                            inspection_order_id: inspectionOrder.id,
                            recipient_phone: inspectionOrder.celular_contacto,
                            recipient_name: inspectionOrder.nombre_contacto,
                            content: smsMessage,
                            priority: 'normal',
                            sms_type: 'initial',
                            trigger_source: 'model_hook',
                            user_id: options.user_id || null,
                            metadata: {
                                placa: inspectionOrder.placa,
                                inspection_link: inspectionOrder.inspection_link,
                                auto_generated: true
                            }
                        };

                        const result = await smsLoggingService.default.logSmsWithSend(smsData, async () => {
                            return await smsService.default.send({
                                recipient_phone: inspectionOrder.celular_contacto,
                                content: smsMessage,
                                priority: 'normal',
                                metadata: {
                                    inspection_order_id: inspectionOrder.id,
                                    placa: inspectionOrder.placa,
                                    nombre_contacto: inspectionOrder.nombre_contacto,
                                    channel_data: {
                                        sms: {
                                            message: smsMessage
                                        }
                                    }
                                }
                            });
                        });
                        
                        if (result.success) {
                            console.log(`📱 SMS enviado y loggeado a ${inspectionOrder.nombre_contacto} (${inspectionOrder.celular_contacto}) con link de inspección`);
                        } else {
                            console.error(`❌ Error enviando SMS: ${result.error}`);
                        }
                    } catch (loggingError) {
                        console.warn('⚠️ Error en logging de SMS, enviando sin log:', loggingError.message);
                        
                        // Enviar SMS sin logging como fallback
                        await smsService.default.send({
                            recipient_phone: inspectionOrder.celular_contacto,
                            content: smsMessage,
                            priority: 'normal',
                            metadata: {
                                inspection_order_id: inspectionOrder.id,
                                placa: inspectionOrder.placa,
                                nombre_contacto: inspectionOrder.nombre_contacto,
                                channel_data: {
                                    sms: {
                                        message: smsMessage
                                    }
                                }
                            }
                        });
                        
                        console.log(`📱 SMS enviado sin logging a ${inspectionOrder.nombre_contacto} (${inspectionOrder.celular_contacto}) con link de inspección`);
                    }
                } catch (error) {
                    console.error('❌ Error enviando SMS con link de inspección:', error);
                }
            } else {
                console.log(`📱 SMS saltado por configuración FLAG_SEND_SMS_OIN_CREATE=${process.env.FLAG_SEND_SMS_OIN_CREATE} para orden ${inspectionOrder.id}`);
            }
        },
        
        afterUpdate: async (inspectionOrder, options) => {
            // Verificar si cambiaron los datos de contacto y guardar en historial
            const contactFieldsChanged = ['nombre_contacto', 'celular_contacto', 'correo_contacto'];
            const hasContactChanges = contactFieldsChanged.some(field => inspectionOrder.changed(field));
            
            if (hasContactChanges && options.user_id) {
                try {
                    const { InspectionOrderContactHistory } = await import('./index.js');
                    
                    // Obtener los valores anteriores
                    const previousValues = inspectionOrder._previousDataValues;
                    
                    await InspectionOrderContactHistory.create({
                        inspection_order_id: inspectionOrder.id,
                        nombre_contacto: previousValues.nombre_contacto,
                        celular_contacto: previousValues.celular_contacto,
                        correo_contacto: previousValues.correo_contacto,
                        user_id: options.user_id
                    });
                    
                    console.log(`📝 Historial de contacto guardado para orden ${inspectionOrder.id}`);
                } catch (error) {
                    console.error('❌ Error guardando historial de contacto:', error);
                }
            }
        }
    }
});

export default InspectionOrder; 