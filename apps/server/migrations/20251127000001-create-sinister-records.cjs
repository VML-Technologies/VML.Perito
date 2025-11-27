'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sinister_records', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false,
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            inspection_order_id: {
                type: Sequelize.BIGINT,
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
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'ID de correlación de la consulta API que agrupa todos los siniestros'
            },
            codigo_compania: {
                type: Sequelize.STRING(10),
                allowNull: true,
                comment: 'Código de la compañía aseguradora'
            },
            nombre_compania: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Nombre de la compañía aseguradora'
            },
            numero_siniestro: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Número del siniestro'
            },
            numero_poliza: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Número de póliza'
            },
            orden: {
                type: Sequelize.STRING(10),
                allowNull: true,
                comment: 'Orden del siniestro'
            },
            placa: {
                type: Sequelize.STRING(6),
                allowNull: false,
                comment: 'Placa del vehículo'
            },
            motor: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Número de motor del vehículo'
            },
            chasis: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Número de chasis del vehículo'
            },
            fecha_siniestro: {
                type: Sequelize.DATEONLY,
                allowNull: true,
                comment: 'Fecha del siniestro'
            },
            codigo_guia: {
                type: Sequelize.STRING(20),
                allowNull: true,
                comment: 'Código de guía Fasecolda'
            },
            marca: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Marca del vehículo'
            },
            clase: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Clase del vehículo'
            },
            tipo: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Tipo/línea del vehículo'
            },
            modelo: {
                type: Sequelize.STRING(4),
                allowNull: true,
                comment: 'Modelo del vehículo'
            },
            tipo_documento_asegurado: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Tipo de documento del asegurado'
            },
            numero_documento: {
                type: Sequelize.STRING(15),
                allowNull: true,
                comment: 'Número de documento del asegurado'
            },
            asegurado: {
                type: Sequelize.STRING(200),
                allowNull: true,
                comment: 'Nombre del asegurado'
            },
            valor_asegurado: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Valor asegurado del vehículo'
            },
            tipo_cruce: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Tipo de cruce de información'
            },
            amparos: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Array de amparos del siniestro en formato JSON'
            }
        });

        // Crear índices para optimizar consultas
        await queryInterface.addIndex('sinister_records', {
            name: 'idx_sinister_records_placa',
            fields: ['placa']
        });

        await queryInterface.addIndex('sinister_records', {
            name: 'idx_sinister_records_inspection_order',
            fields: ['inspection_order_id']
        });

        await queryInterface.addIndex('sinister_records', {
            name: 'idx_sinister_records_correlation',
            fields: ['correlation_id', 'numero_siniestro']
        });

        await queryInterface.addIndex('sinister_records', {
            name: 'idx_sinister_records_created_at',
            fields: ['created_at']
        });

        await queryInterface.addIndex('sinister_records', {
            name: 'idx_sinister_records_numero_siniestro',
            fields: ['numero_siniestro']
        });
    },

    async down(queryInterface, Sequelize) {
        // Remover índices
        await queryInterface.removeIndex('sinister_records', 'idx_sinister_records_placa');
        await queryInterface.removeIndex('sinister_records', 'idx_sinister_records_inspection_order');
        await queryInterface.removeIndex('sinister_records', 'idx_sinister_records_correlation');
        await queryInterface.removeIndex('sinister_records', 'idx_sinister_records_created_at');
        await queryInterface.removeIndex('sinister_records', 'idx_sinister_records_numero_siniestro');

        // Remover tabla
        await queryInterface.dropTable('sinister_records');
    }
};
