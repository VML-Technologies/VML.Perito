import { InspectionOrderContactHistory, InspectionOrder, User, Role } from '../models/index.js';
import { Op } from 'sequelize';

class ContactHistoryController {
    /**
     * Obtener historial de cambios de contacto de una orden
     */
    async getContactHistory(req, res) {
        try {
            const { orderId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const offset = (page - 1) * limit;
            
            const history = await InspectionOrderContactHistory.findAndCountAll({
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
            
            const totalPages = Math.ceil(history.count / limit);
            
            res.json({
                success: true,
                data: {
                    contactHistory: history.rows,
                    total: history.count,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems: history.count,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo historial de contactos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    
    /**
     * Obtener un registro específico del historial
     */
    async getContactHistoryItem(req, res) {
        try {
            const { orderId, historyId } = req.params;
            
            const historyItem = await InspectionOrderContactHistory.findOne({
                where: {
                    id: historyId,
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
            
            if (!historyItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro de historial no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: historyItem
            });
        } catch (error) {
            console.error('❌ Error obteniendo item del historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
    
    /**
     * Obtener estadísticas del historial de contactos
     */
    async getContactHistoryStats(req, res) {
        try {
            const { orderId } = req.params;
            
            const stats = await InspectionOrderContactHistory.findOne({
                where: {
                    inspection_order_id: orderId
                },
                attributes: [
                    [InspectionOrderContactHistory.sequelize.fn('COUNT', InspectionOrderContactHistory.sequelize.col('id')), 'totalChanges'],
                    [InspectionOrderContactHistory.sequelize.fn('MIN', InspectionOrderContactHistory.sequelize.col('created_at')), 'firstChange'],
                    [InspectionOrderContactHistory.sequelize.fn('MAX', InspectionOrderContactHistory.sequelize.col('created_at')), 'lastChange']
                ]
            });
            
            res.json({
                success: true,
                data: stats || {
                    totalChanges: 0,
                    firstChange: null,
                    lastChange: null
                }
            });
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas del historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export default new ContactHistoryController();

