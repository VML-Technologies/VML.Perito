'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_states', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      inspection_order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inspection_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'ID de la orden de inspección relacionada'
      },
      appointment_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'ID del agendamiento relacionado'
      },
      inspection_order_status: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inspection_orders_statuses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'Estado de la orden de inspección (1-5)'
      },
      inspection_order_status_internal: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inspection_orders_status_internal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'Estado interno de la orden de inspección'
      },
      appointment_status: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'appointment_statuses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'Estado del agendamiento (pending, assigned, completed, etc.)'
      },
      system_calculated_state: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Estado calculado por el sistema (completed, not_insurable, partial, failed)'
      },
      system_calculated_state_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón calculada por el sistema'
      },
      user_decision_state: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Estado decidido por el usuario (completed, not_insurable, partial, failed)'
      },
      user_decision_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón de la decisión tomada por el usuario'
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
        comment: 'ID del usuario que realizó la acción'
      },
      user_role: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'user_roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
        comment: 'Rol del usuario que realizó la acción (supervisor, inspector, etc.)'
      },
      webhook_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si se envió notificación al webhook externo'
      },
      webhook_response: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Respuesta del webhook externo'
      },
      webhook_provider: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'API externo utilizado (SegurosMundial, TaxisColectivo, etc.)'
      },
      state_change_type: {
        type: Sequelize.ENUM('system_auto', 'user_override', 'user_decision'),
        allowNull: false,
        comment: 'Tipo de cambio: automático del sistema, override del usuario, o decisión del usuario'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del cambio de estado'
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
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Crear índices
    await queryInterface.addIndex('inspection_states', ['appointment_id'], {
      name: 'idx_inspection_states_appointment_id'
    });

    await queryInterface.addIndex('inspection_states', ['inspection_order_id'], {
      name: 'idx_inspection_states_inspection_order_id'
    });

    await queryInterface.addIndex('inspection_states', ['user_id'], {
      name: 'idx_inspection_states_user_id'
    });

    await queryInterface.addIndex('inspection_states', ['created_at'], {
      name: 'idx_inspection_states_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('inspection_states', 'idx_inspection_states_appointment_id');
    await queryInterface.removeIndex('inspection_states', 'idx_inspection_states_inspection_order_id');
    await queryInterface.removeIndex('inspection_states', 'idx_inspection_states_user_id');
    await queryInterface.removeIndex('inspection_states', 'idx_inspection_states_created_at');
    
    // Remover tabla
    await queryInterface.dropTable('inspection_states');
  }
};
