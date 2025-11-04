'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna status_internal (VARCHAR(50)) a inspection_orders
    await queryInterface.addColumn('inspection_orders', 'status_internal', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: null,
      comment: 'Estado interno textual de la orden (uso operativo)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir: eliminar la columna status_internal de inspection_orders
    await queryInterface.removeColumn('inspection_orders', 'status_internal');
  }
};
