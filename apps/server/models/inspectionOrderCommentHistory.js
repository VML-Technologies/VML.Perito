import { DataTypes } from 'sequelize';
import { createModelWithSoftDeletes } from './baseModel.js';

const InspectionOrderCommentHistory = createModelWithSoftDeletes('InspectionOrderCommentHistory', {
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
    inspection_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'inspection_orders',
            key: 'id'
        },
        comment: 'ID de la orden de inspección'
    },
    comentarios: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Contenido del comentario (máximo 1000 caracteres)'
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'ID del usuario que creó el comentario'
    }
}, {
    tableName: 'inspection_order_comment_history',
    paranoid: true,
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
        {
            name: 'idx_comment_history_inspection_order',
            fields: ['inspection_order_id']
        },
        {
            name: 'idx_comment_history_user',
            fields: ['user_id']
        },
        {
            name: 'idx_comment_history_created_at',
            fields: ['created_at']
        }
    ],
    
    hooks: {
        beforeCreate: async (comment, options) => {
            // Validar longitud del comentario
            if (comment.comentarios && comment.comentarios.length > 1000) {
                throw new Error('El comentario no puede exceder 1000 caracteres');
            }
            
            // Sanitizar contenido para prevenir XSS
            if (comment.comentarios) {
                comment.comentarios = comment.comentarios
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<[^>]*>/g, '')
                    .trim();
            }
        },
        
        beforeUpdate: async (comment, options) => {
            // Los comentarios son inmutables, no se pueden editar
            throw new Error('Los comentarios no se pueden editar una vez creados');
        }
    }
});

export default InspectionOrderCommentHistory;


