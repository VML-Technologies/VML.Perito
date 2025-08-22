'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar campo metodo_inspeccion_recomendado a inspection_orders
    await queryInterface.addColumn('inspection_orders', 'metodo_inspeccion_recomendado', {
      type: Sequelize.ENUM('Virtual', 'Presencial', 'A Domicilio'),
      allowNull: true,
      defaultValue: 'Virtual',
      comment: 'Método de inspección recomendado para la orden'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover campo metodo_inspeccion_recomendado de inspection_orders
    await queryInterface.removeColumn('inspection_orders', 'metodo_inspeccion_recomendado');
    
    // Remover el tipo ENUM
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inspection_orders_metodo_inspeccion_recomendado";');
  }
};
