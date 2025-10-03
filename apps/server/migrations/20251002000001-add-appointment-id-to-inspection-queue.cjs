'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna appointment_id a inspection_queue
    await queryInterface.addColumn('inspection_queue', 'appointment_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'appointments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID del appointment asociado a esta entrada de cola'
    });

    // Crear índice para mejorar performance
    await queryInterface.addIndex('inspection_queue', ['appointment_id'], {
      name: 'inspection_queue_appointment_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice
    await queryInterface.removeIndex('inspection_queue', 'inspection_queue_appointment_id_idx');
    
    // Eliminar columna
    await queryInterface.removeColumn('inspection_queue', 'appointment_id');
  }
};
