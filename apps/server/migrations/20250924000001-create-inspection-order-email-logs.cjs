'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_order_email_logs', {
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
        comment: 'ID de la orden de inspección relacionada'
      },
      recipient_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Dirección de email del destinatario'
      },
      recipient_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Nombre del destinatario del email'
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Asunto del email enviado'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Contenido del email en texto plano'
      },
      html_content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Contenido HTML del email'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'error'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del envío del email'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Prioridad del email'
      },
      provider_response: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Respuesta del proveedor de email (JSON)'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si el envío falló'
      },
      message_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID del mensaje del proveedor de email'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se envió el email'
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se confirmó la entrega'
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se abrió el email'
      },
      clicked_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se hizo click en un enlace'
      },
      email_type: {
        type: Sequelize.ENUM('initial', 'resend', 'reminder', 'notification', 'webhook'),
        allowNull: false,
        defaultValue: 'initial',
        comment: 'Tipo de email enviado'
      },
      trigger_source: {
        type: Sequelize.ENUM('model_hook', 'controller', 'webhook', 'manual', 'automated'),
        allowNull: false,
        defaultValue: 'model_hook',
        comment: 'Fuente que disparó el envío del email'
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION',
        comment: 'ID del usuario que inició el envío (si aplica)'
      },
      webhook_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'ID del webhook que disparó el envío (si aplica)'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de intentos de reenvío'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del envío (JSON)'
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_inspection_order',
      fields: ['inspection_order_id']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_recipient_email',
      fields: ['recipient_email']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_status',
      fields: ['status']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_sent_at',
      fields: ['sent_at']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_email_type',
      fields: ['email_type']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_trigger_source',
      fields: ['trigger_source']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_created_at',
      fields: ['created_at']
    });

    await queryInterface.addIndex('inspection_order_email_logs', {
      name: 'idx_email_logs_message_id',
      fields: ['message_id']
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_inspection_order');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_recipient_email');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_status');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_sent_at');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_email_type');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_trigger_source');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_created_at');
    await queryInterface.removeIndex('inspection_order_email_logs', 'idx_email_logs_message_id');
    
    // Remover tabla
    await queryInterface.dropTable('inspection_order_email_logs');
  }
};
