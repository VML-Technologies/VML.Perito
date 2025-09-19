'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_order_sms_logs', {
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
      recipient_phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
        comment: 'Número de teléfono del destinatario'
      },
      recipient_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Nombre del destinatario del SMS'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido del mensaje SMS enviado'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'delivered', 'failed', 'error'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del envío del SMS'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Prioridad del SMS'
      },
      provider_response: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Respuesta del proveedor de SMS (JSON)'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si el envío falló'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se envió el SMS'
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora cuando se confirmó la entrega'
      },
      sms_type: {
        type: Sequelize.ENUM('initial', 'resend', 'reminder', 'notification', 'webhook'),
        allowNull: false,
        defaultValue: 'initial',
        comment: 'Tipo de SMS enviado'
      },
      trigger_source: {
        type: Sequelize.ENUM('model_hook', 'controller', 'webhook', 'manual', 'automated'),
        allowNull: false,
        defaultValue: 'model_hook',
        comment: 'Fuente que disparó el envío del SMS'
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
    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_inspection_order',
      fields: ['inspection_order_id']
    });

    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_recipient_phone',
      fields: ['recipient_phone']
    });

    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_status',
      fields: ['status']
    });

    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_sent_at',
      fields: ['sent_at']
    });

    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_sms_type',
      fields: ['sms_type']
    });

    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_trigger_source',
      fields: ['trigger_source']
    });

    await queryInterface.addIndex('inspection_order_sms_logs', {
      name: 'idx_sms_logs_created_at',
      fields: ['created_at']
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_inspection_order');
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_recipient_phone');
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_status');
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_sent_at');
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_sms_type');
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_trigger_source');
    await queryInterface.removeIndex('inspection_order_sms_logs', 'idx_sms_logs_created_at');
    
    // Remover tabla
    await queryInterface.dropTable('inspection_order_sms_logs');
  }
};
