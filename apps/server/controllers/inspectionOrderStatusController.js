import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import { registerPermission } from '../middleware/permissionRegistry.js';

/**
 * Controller for InspectionOrderStatus
 * Manages CRUD operations for inspection order statuses
 */
class InspectionOrderStatusController {
    constructor() {
        // Register permissions
        registerPermission({
            name: 'inspection_order_statuses.read',
            description: 'Ver estados de órdenes de inspección',
            resource: 'inspection_order_statuses',
            action: 'read',
            endpoint: '/api/inspection-order-statuses',
            method: 'GET'
        });

        // Bind methods
        this.getAll = this.getAll.bind(this);
    }

    /**
     * GET /api/inspection-order-statuses
     * Get all inspection order statuses
     */
    async getAll(req, res) {
        try {
            const statuses = await InspectionOrderStatus.findAll({
                where: { deleted_at: null },
                order: [['id', 'ASC']],
                attributes: ['id', 'name', 'description']
            });

            return res.json({
                success: true,
                data: statuses
            });
        } catch (error) {
            console.error('Error fetching inspection order statuses:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los estados de órdenes de inspección',
                error: error.message
            });
        }
    }
}

export default InspectionOrderStatusController;
