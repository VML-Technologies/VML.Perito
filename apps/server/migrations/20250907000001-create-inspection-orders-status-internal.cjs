'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_orders_status_internal', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre del estado interno'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del estado interno'
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
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Crear índice único para el nombre
    await queryInterface.addIndex('inspection_orders_status_internal', ['name'], {
      name: 'idx_inspection_orders_status_internal_name',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('inspection_orders_status_internal', 'idx_inspection_orders_status_internal_name');
    
    // Remover tabla
    await queryInterface.dropTable('inspection_orders_status_internal');
  }
};
