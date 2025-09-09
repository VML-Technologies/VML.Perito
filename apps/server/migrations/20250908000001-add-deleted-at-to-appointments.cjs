'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna deleted_at para soft delete
    await queryInterface.addColumn('appointments', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de eliminación para soft delete (paranoid)'
    });

    // Crear índice para mejorar performance en consultas de soft delete
    await queryInterface.addIndex('appointments', ['deleted_at'], {
      name: 'appointments_deleted_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice primero
    await queryInterface.removeIndex('appointments', 'appointments_deleted_at_idx');
    
    // Remover columna
    await queryInterface.removeColumn('appointments', 'deleted_at');
  }
};
