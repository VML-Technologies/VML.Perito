'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Modificar campos de inspection_orders para permitir valores nulos
    const fieldsToModify = [
      'marca',
      'linea', 
      'clase',
      'modelo',
      'cilindraje',
      'color',
      'servicio',
      'motor',
      'chasis',
      'vin',
      'carroceria',
      'combustible'
    ];

    for (const field of fieldsToModify) {
      await queryInterface.changeColumn('inspection_orders', field, {
        type: Sequelize.STRING(50), // Mantener el tipo original
        allowNull: true,
        comment: `Campo ${field} modificado para permitir valores nulos`
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Revertir cambios - hacer los campos obligatorios nuevamente
    const fieldsToRevert = [
      'marca',
      'linea', 
      'clase',
      'modelo',
      'cilindraje',
      'color',
      'servicio',
      'motor',
      'chasis',
      'vin',
      'carroceria',
      'combustible'
    ];

    for (const field of fieldsToRevert) {
      await queryInterface.changeColumn('inspection_orders', field, {
        type: Sequelize.STRING(50), // Mantener el tipo original
        allowNull: false,
        comment: `Campo ${field} revertido a obligatorio`
      });
    }
  }
};
