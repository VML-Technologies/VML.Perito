'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedule_exclusions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      schedule_template_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'schedule_templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Nombre descriptivo del período de exclusión'
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Hora de inicio del período de exclusión'
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Hora de fin del período de exclusión'
      },
      days_pattern: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Patrón de días específicos para la exclusión'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la exclusión está activa'
      },
      exclusion_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'CUSTOM',
        comment: 'Tipo de exclusión para categorización: BREAK, LUNCH, MAINTENANCE, CUSTOM'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad de la exclusión'
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
    await queryInterface.addIndex('schedule_exclusions', ['schedule_template_id'], {
      name: 'schedule_exclusion_template_idx'
    });

    await queryInterface.addIndex('schedule_exclusions', ['start_time', 'end_time'], {
      name: 'schedule_exclusion_times_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('schedule_exclusions');
  }
};
