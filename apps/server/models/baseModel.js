import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Modelo base con soft deletes y timestamps
export const BaseModel = {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
};

// Opciones base para todos los modelos
export const BaseOptions = {
    timestamps: false,
    paranoid: true, // Habilita soft deletes
    deletedAt: 'deleted_at', // Nombre de la columna
    createdAt: 'created_at',
    updatedAt: 'updated_at',
};

// Función helper para crear modelos con soft deletes
export const createModelWithSoftDeletes = (modelName, attributes, options = {}) => {
    return sequelize.define(modelName, {
        ...BaseModel,
        ...attributes,
    }, {
        ...BaseOptions,
        ...options,
    });
}; 