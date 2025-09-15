'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar índice único para password_reset_token
    // Solo para valores no nulos
    try {
      await queryInterface.addIndex('users', ['password_reset_token'], {
        unique: true,
        name: 'users_password_reset_token_unique',
        where: {
          password_reset_token: {
            [Sequelize.Op.ne]: null
          }
        }
      });
      console.log('✅ Índice único creado para password_reset_token');
    } catch (error) {
      console.log('⚠️ No se pudo crear el índice único para password_reset_token:', error.message);
      console.log('⚠️ Continuando sin el índice único...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover índice único
    try {
      await queryInterface.removeIndex('users', 'users_password_reset_token_unique');
      console.log('✅ Índice único removido para password_reset_token');
    } catch (error) {
      console.log('⚠️ No se pudo remover el índice único:', error.message);
    }
  }
};
