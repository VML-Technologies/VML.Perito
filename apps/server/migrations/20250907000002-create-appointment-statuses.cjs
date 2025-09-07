'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_statuses', {
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
        comment: 'Nombre del estado de la cita'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del estado de la cita'
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
    await queryInterface.addIndex('appointment_statuses', ['name'], {
      name: 'idx_appointment_statuses_name',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('appointment_statuses', 'idx_appointment_statuses_name');
    
    // Remover tabla
    await queryInterface.dropTable('appointment_statuses');
  }
};
