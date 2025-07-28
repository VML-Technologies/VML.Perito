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
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    sucursal: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    cod_oficina: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    vigencia: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    avaluo: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    vlr_accesorios: {
        type: DataTypes.STRING(50),
        allowNull: false,
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

});

export default InspectionOrder; 