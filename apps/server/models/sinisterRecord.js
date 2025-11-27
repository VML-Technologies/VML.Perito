import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const SinisterRecord = createModelWithSoftDeletes('SinisterRecord', {
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la orden de inspección relacionada'
    },
    correlation_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'ID de correlación de la consulta API que agrupa todos los siniestros'
    },
    codigo_compania: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Código de la compañía aseguradora'
    },
    nombre_compania: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nombre de la compañía aseguradora'
    },
    numero_siniestro: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número del siniestro'
    },
    numero_poliza: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número de póliza'
    },
    orden: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Orden del siniestro'
    },
    placa: {
        type: DataTypes.STRING(6),
        allowNull: false,
        comment: 'Placa del vehículo'
    },
    motor: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número de motor del vehículo'
    },
    chasis: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número de chasis del vehículo'
    },
    fecha_siniestro: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha del siniestro'
    },
    codigo_guia: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Código de guía Fasecolda'
    },
    marca: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Marca del vehículo'
    },
    clase: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Clase del vehículo'
    },
    tipo: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Tipo/línea del vehículo'
    },
    modelo: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: 'Modelo del vehículo'
    },
    tipo_documento_asegurado: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Tipo de documento del asegurado'
    },
    numero_documento: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: 'Número de documento del asegurado'
    },
    asegurado: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Nombre del asegurado'
    },
    valor_asegurado: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Valor asegurado del vehículo'
    },
    tipo_cruce: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Tipo de cruce de información'
    },
    amparos: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Array de amparos del siniestro en formato JSON'
    }
}, {
    tableName: 'sinister_records',
    paranoid: true,
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_sinister_records_placa',
            fields: ['placa']
        },
        {
            name: 'idx_sinister_records_inspection_order',
            fields: ['inspection_order_id']
        },
        {
            name: 'idx_sinister_records_correlation',
            fields: ['correlation_id', 'numero_siniestro']
        }
    ]
});

export default SinisterRecord;
