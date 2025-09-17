'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Añadir el campo inspection_link a inspection_orders
    await queryInterface.addColumn('inspection_orders', 'inspection_link', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Link único para acceder a la inspección de asegurabilidad'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover el campo inspection_link de inspection_orders
    await queryInterface.removeColumn('inspection_orders', 'inspection_link');
  }
};
