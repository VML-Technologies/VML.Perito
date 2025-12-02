'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('inspection_orders', 'tipo_vehiculo', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Tipo de vehículo seleccionado de la lista configurable'
      });
      console.log('✅ Columna tipo_vehiculo agregada exitosamente a inspection_orders');
    } catch (error) {
      console.error('❌ Error al agregar columna tipo_vehiculo:', error);
      // Si la columna ya existe, no lanzar error
      if (error.message && error.message.includes('already exists')) {
        console.log('⚠️ La columna tipo_vehiculo ya existe, omitiendo...');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('inspection_orders', 'tipo_vehiculo');
      console.log('✅ Columna tipo_vehiculo eliminada exitosamente de inspection_orders');
    } catch (error) {
      console.error('❌ Error al eliminar columna tipo_vehiculo:', error);
      // Si la columna no existe, no lanzar error
      if (error.message && error.message.includes('does not exist')) {
        console.log('⚠️ La columna tipo_vehiculo no existe, omitiendo...');
      } else {
        throw error;
      }
    }
  }
};

