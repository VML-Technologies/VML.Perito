'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_queue', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      inspection_order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inspection_orders',
          key: 'id'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      },
      placa: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      numero_orden: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      nombre_cliente: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      hash_acceso: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('en_cola', 'en_proceso', 'completada', 'cancelada'),
        defaultValue: 'en_cola',
        allowNull: false
      },
      inspector_asignado_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      },
      tiempo_ingreso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      tiempo_inicio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tiempo_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      prioridad: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('inspection_queue', ['estado'], {
      name: 'inspection_queue_estado_idx'
    });
    
    await queryInterface.addIndex('inspection_queue', ['inspector_asignado_id'], {
      name: 'inspection_queue_inspector_idx'
    });
    
    await queryInterface.addIndex('inspection_queue', ['hash_acceso'], {
      name: 'inspection_queue_hash_idx'
    });
    
    await queryInterface.addIndex('inspection_queue', ['tiempo_ingreso'], {
      name: 'inspection_queue_ingreso_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('inspection_queue');
  }
};
