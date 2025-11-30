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
  }
);

export default ListName;
