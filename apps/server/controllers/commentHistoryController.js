import { InspectionOrderCommentHistory, InspectionOrder, User, Role } from '../models/index.js';
import { Op } from 'sequelize';

class CommentHistoryController {
    /**
     * Obtener comentarios de una orden
     */
    async getComments(req, res) {
        try {
            const { orderId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const offset = (page - 1) * limit;
            
            const comments = await InspectionOrderCommentHistory.findAndCountAll({
                where: {
                    inspection_order_id: orderId
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Role,
                                as: 'roles',
                                attributes: ['name'],
                                through: { attributes: [] }
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            const totalPages = Math.ceil(comments.count / limit);
            
            res.json({
                success: true,
                data: {
                    comments: comments.rows,
                    total: comments.count,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems: comments.count,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo comentarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    
    /**
     * Crear un nuevo comentario
     */
    async createComment(req, res) {
        try {
            const { orderId } = req.params;
            const { comentarios } = req.body;
            const userId = req.user.id;
            
            // Validaciones
            if (!comentarios || comentarios.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El comentario no puede estar vacío'
                });
            }
            
            if (comentarios.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'El comentario no puede exceder 1000 caracteres'
                });
            }
            
            // Verificar que la orden existe
            const order = await InspectionOrder.findByPk(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden de inspección no encontrada'
                });
            }
            
            // Crear el comentario
            const comment = await InspectionOrderCommentHistory.create({
                inspection_order_id: orderId,
                comentarios: comentarios.trim(),
                user_id: userId
            });
            
            // Obtener el comentario con información del usuario
            const commentWithUser = await InspectionOrderCommentHistory.findByPk(comment.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Role,
                                as: 'roles',
                                attributes: ['name'],
                                through: { attributes: [] }
                            }
                        ]
                    }
                ]
            });
            
            res.status(201).json({
                success: true,
                message: 'Comentario creado exitosamente',
                data: commentWithUser
            });
        } catch (error) {
            console.error('❌ Error creando comentario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    
    /**
     * Obtener un comentario específico
     */
    async getComment(req, res) {
        try {
            const { orderId, commentId } = req.params;
            
            const comment = await InspectionOrderCommentHistory.findOne({
                where: {
                    id: commentId,
                    inspection_order_id: orderId
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Role,
                                as: 'roles',
                                attributes: ['name'],
                                through: { attributes: [] }
                            }
                        ]
                    }
                ]
            });
            
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comentario no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: comment
            });
        } catch (error) {
            console.error('❌ Error obteniendo comentario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    
    /**
     * Obtener estadísticas de comentarios
     */
    async getCommentStats(req, res) {
        try {
            const { orderId } = req.params;
            
            // Usar Sequelize directamente
            const { Sequelize } = await import('sequelize');
            
            // Usar findAll con group para evitar problemas con ORDER BY
            const stats = await InspectionOrderCommentHistory.findAll({
                where: {
                    inspection_order_id: orderId
                },
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalComments'],
                    [Sequelize.fn('MIN', Sequelize.col('created_at')), 'firstComment'],
                    [Sequelize.fn('MAX', Sequelize.col('created_at')), 'lastComment']
                ],
                group: ['inspection_order_id'],
                raw: true
            });
            
            // Si no hay comentarios, devolver valores por defecto
            const result = stats.length > 0 ? stats[0] : {
                totalComments: 0,
                firstComment: null,
                lastComment: null
            };
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de comentarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default new CommentHistoryController();

