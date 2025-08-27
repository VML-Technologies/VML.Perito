'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columnas sin restricciones UNIQUE primero
    await queryInterface.addColumn('users', 'password_reset_token', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'password_reset_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'password_reset_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('users', 'password_reset_locked_until', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Nota: El índice único se puede agregar en una migración separada
    // para evitar problemas con SQL Server
  },

  async down(queryInterface, Sequelize) {
    // Remover columnas
    await queryInterface.removeColumn('users', 'password_reset_token');
    await queryInterface.removeColumn('users', 'password_reset_expires');
    await queryInterface.removeColumn('users', 'password_reset_attempts');
    await queryInterface.removeColumn('users', 'password_reset_locked_until');
  }
};
