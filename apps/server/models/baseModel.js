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

/**
 * Factory function to create TIME field getters
 * This ensures consistent behavior across different databases (MySQL vs SQL Server)
 * and maintains correct timezone handling
 */
export const createTimeFieldGetter = (fieldName) => {
    return function () {
        const value = this.getDataValue(fieldName);

        if (value) {
            // Convertir a string en formato hh:mm:ss
            if (typeof value === 'string') return value;
            if (value instanceof Date) {
                // Usar UTC para mantener la hora original de la base de datos
                const hours = value.getUTCHours();
                const minutes = value.getUTCMinutes();
                const seconds = value.getUTCSeconds();
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            // Si es un objeto con propiedades de tiempo
            if (typeof value === 'object' && value.hours !== undefined) {
                const hours = String(value.hours).padStart(2, '0');
                const minutes = String(value.minutes || 0).padStart(2, '0');
                const seconds = String(value.seconds || 0).padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
            }
        }
        return value;
    };
}; 