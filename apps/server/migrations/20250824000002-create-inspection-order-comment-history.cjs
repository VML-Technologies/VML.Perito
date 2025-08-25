'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_order_comment_history', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      inspection_order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inspection_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la orden de inspección'
      },
      comentarios: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido del comentario (máximo 1000 caracteres)'
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'ID del usuario que creó el comentario'
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('inspection_order_comment_history', {
      name: 'idx_comment_history_inspection_order',
      fields: ['inspection_order_id']
    });

    await queryInterface.addIndex('inspection_order_comment_history', {
      name: 'idx_comment_history_user',
      fields: ['user_id']
    });

    await queryInterface.addIndex('inspection_order_comment_history', {
      name: 'idx_comment_history_created_at',
      fields: ['created_at']
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('inspection_order_comment_history', 'idx_comment_history_inspection_order');
    await queryInterface.removeIndex('inspection_order_comment_history', 'idx_comment_history_user');
    await queryInterface.removeIndex('inspection_order_comment_history', 'idx_comment_history_created_at');
    
    // Remover tabla
    await queryInterface.dropTable('inspection_order_comment_history');
  }
};


