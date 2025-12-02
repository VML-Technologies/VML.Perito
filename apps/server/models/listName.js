import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const ListName = createModelWithSoftDeletes(
  'list_names',
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: true, 
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    tableName: 'list_names',
    paranoid: true,
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    indexes: [
      {
        name: 'idx_list_names_parent_id',
        fields: ['parent_id']
      },
      // NOTE: uniqueness for (parent_id, value) is enforced at DB level
      // via a migration (filtered unique index for items). Keeping the
      // model free of a unique index avoids dialect-specific issues
      // (e.g. MSSQL treating NULLs as equal) and prevents sync-time
      // index creation conflicts.
    ],
    validate: {
      labelNotEmpty() {
        if (!this.label || String(this.label).trim() === '') {
          throw new Error('label is required');
        }
      }
    }
  }
);

export default ListName;
