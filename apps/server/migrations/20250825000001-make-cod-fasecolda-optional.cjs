'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hacer el campo cod_fasecolda opcional en inspection_orders
    await queryInterface.changeColumn('inspection_orders', 'cod_fasecolda', {
      type: Sequelize.STRING(8),
      allowNull: true,
      comment: 'Código FASECOLDA del vehículo (opcional)'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir el campo cod_fasecolda a obligatorio
    await queryInterface.changeColumn('inspection_orders', 'cod_fasecolda', {
      type: Sequelize.STRING(8),
      allowNull: false,
      comment: 'Código FASECOLDA del vehículo'
    });
  }
};
