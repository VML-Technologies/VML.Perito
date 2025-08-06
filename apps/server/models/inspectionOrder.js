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
        allowNull: false,
    },
    linea: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    clase: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    modelo: {
        type: DataTypes.STRING(4),
        allowNull: false,
    },
    cilindraje: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    servicio: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    motor: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    chasis: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    vin: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    carroceria: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    combustible: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    cod_fasecolda: {
        type: DataTypes.STRING(8),
        allowNull: false,
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
        }
    }
});

export default InspectionOrder; 