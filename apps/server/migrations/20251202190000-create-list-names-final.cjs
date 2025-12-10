'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Migraciones para crear tabla list_names con índice único filtrado
  // Compatibles con MSSQL (filtered indexes), Postgres, MySQL, SQLite
  useTransaction: false,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('list_names', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      label: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      parent_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
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
      }
    });

    // Índices relevantes
    await queryInterface.addIndex('list_names', {
      name: 'idx_list_names_parent_id',
      fields: ['parent_id']
    });

    await queryInterface.addIndex('list_names', {
      name: 'idx_list_names_label',
      fields: ['label']
    });

    // Crear índice único filtrado para ítems (parent_id IS NOT NULL, value IS NOT NULL, deleted_at IS NULL)
    // Soporta MSSQL filtered indexes, Postgres partial indexes
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'mssql') {
      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX uq_list_names_parent_value ON list_names (parent_id, value) WHERE parent_id IS NOT NULL AND value IS NOT NULL AND deleted_at IS NULL;`
      );
    } else if (dialect === 'postgres') {
      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX uq_list_names_parent_value ON list_names (parent_id, value) WHERE parent_id IS NOT NULL AND value IS NOT NULL AND deleted_at IS NULL;`
      );
    } else {
      // MySQL/SQLite: recreate standard unique index (MySQL allows multiple NULLs so parents won't conflict)
      await queryInterface.addIndex('list_names', {
        name: 'uq_list_names_parent_value',
        unique: true,
        fields: ['parent_id', 'value']
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('list_names');
  }
};
