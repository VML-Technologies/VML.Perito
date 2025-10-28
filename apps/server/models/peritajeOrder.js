import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const PeritajeOrder = createModelWithSoftDeletes('PeritajeOrder', {
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    sede_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    assigned_agent_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    commercial_user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    producto: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    callback_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    numero: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    intermediario: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    clave_intermediario: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    cilindraje: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING(50),
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
    cod_fasecolda: {
        type: DataTypes.STRING(10),
        allowNull: true,
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
        allowNull: true,
    },
    celular_contacto: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    correo_contacto: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
    peritaje_result: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    peritaje_result_details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    metodo_peritaje_recomendado: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            isIn: [['Virtual', 'Presencial', 'A Domicilio']]
        }
    },
    peritaje_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    webhook_notification: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    webhook_response: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    momento: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Momento 3',
        validate: {
            isIn: [['Momento 3', 'Momento 4']]
        }
    },
    estado_momento: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Pendiente',
    },
    fecha_momento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    observaciones_momento: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    session_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    general_observations: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    numero_reclamacion: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'SIN-RECLAMACION',
    },
    fecha_hora_agendamiento: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    notas_agendamiento: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'peritaje_orders',
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at', // Nombre de la columna
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'peritaje_orders_numero_idx', fields: ['numero'] }
    ]
});

export default PeritajeOrder;
