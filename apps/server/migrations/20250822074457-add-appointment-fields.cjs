'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar campos críticos a appointments
    await queryInterface.addColumn('appointments', 'direccion_inspeccion', {
      type: Sequelize.STRING(1000),
      allowNull: true,
      comment: 'Dirección para inspección a domicilio'
    });

    await queryInterface.addColumn('appointments', 'observaciones', {
      type: Sequelize.STRING(1000),
      allowNull: true,
      comment: 'Observaciones del agendamiento'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover campos críticos de appointments
    await queryInterface.removeColumn('appointments', 'direccion_inspeccion');
    await queryInterface.removeColumn('appointments', 'observaciones');
  }
};
