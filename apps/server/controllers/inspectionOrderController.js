import { BaseController } from './baseController.js';
import InspectionOrder from '../models/inspectionOrder.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import User from '../models/user.js';
import { registerPermission } from '../middleware/permissionRegistry.js';
import { Op } from 'sequelize';

// Registrar permisos
registerPermission({
    name: 'inspection_orders.read',
    resource: 'inspection_orders',
    action: 'read',
    endpoint: '/api/inspection-orders',
    method: 'GET',
    description: 'Ver órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.create',
    resource: 'inspection_orders',
    action: 'create',
    endpoint: '/api/inspection-orders',
    method: 'POST',
    description: 'Crear órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.update',
    resource: 'inspection_orders',
    action: 'update',
    endpoint: '/api/inspection-orders/:id',
    method: 'PUT',
    description: 'Actualizar órdenes de inspección',
});

registerPermission({
    name: 'inspection_orders.delete',
    resource: 'inspection_orders',
    action: 'delete',
    endpoint: '/api/inspection-orders/:id',
    method: 'DELETE',
    description: 'Eliminar órdenes de inspección',
});

class InspectionOrderController extends BaseController {
    constructor() {
        super(InspectionOrder);

        // Bind methods
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getStats = this.getStats.bind(this);
        this.search = this.search.bind(this);
    }

    // Listar órdenes con paginación, búsqueda y ordenamiento
    async index(req, res) {
        try {
            // Respuesta simple para diagnosticar
            res.json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 0,
                    limit: 10
                },
                debug: 'Respuesta desde controlador simplificado'
            });
        } catch (error) {
            console.error('Error detallado en index:', error);
            res.status(500).json({ message: 'Error al obtener órdenes de inspección', error: error.message });
        }
    }

    // Obtener estadísticas
    async getStats(req, res) {
        try {
            const { user_id = '' } = req.query;

            const whereConditions = {};
            if (user_id) {
                whereConditions.user_id = user_id;
            }

            const total = await this.model.count({ where: whereConditions });

            const statusStats = await this.model.findAll({
                where: whereConditions,
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'statusInfo',
                        attributes: ['id', 'name']
                    }
                ],
                attributes: [
                    'status',
                    [this.model.sequelize.fn('COUNT', this.model.sequelize.col('InspectionOrder.id')), 'count']
                ],
                group: ['status', 'statusInfo.id', 'statusInfo.name'],
                raw: false
            });

            res.json({
                total,
                statusStats: statusStats.map(stat => ({
                    status_id: stat.status,
                    status_name: stat.statusInfo?.name || 'Desconocido',
                    count: parseInt(stat.get('count'))
                }))
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
        }
    }

    // Crear orden con validaciones
    async store(req, res) {
        try {
            // Agregar el user_id y sede_id del usuario autenticado
            const orderData = {
                ...req.body,
                user_id: req.user.id,
                sede_id: req.user.sede_id
            };

            const order = await this.model.create(orderData);

            // Cargar la orden completa con relaciones
            const fullOrder = await this.model.findByPk(order.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'statusInfo',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            res.status(201).json(fullOrder);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear orden de inspección', error: error.message });
        }
    }

    // Obtener orden específica
    async show(req, res) {
        try {
            const order = await this.model.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'statusInfo',
                        attributes: ['id', 'name', 'description']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ message: 'Orden de inspección no encontrada' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener orden de inspección', error: error.message });
        }
    }

    // Búsqueda rápida por placa
    async search(req, res) {
        try {
            const { placa } = req.query;

            if (!placa) {
                return res.status(400).json({ message: 'Placa es requerida para la búsqueda' });
            }

            const orders = await this.model.findAll({
                where: {
                    placa: { [Op.like]: `%${placa}%` }
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: InspectionOrderStatus,
                        as: 'statusInfo',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                limit: 10,
                order: [['created_at', 'DESC']]
            });

            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Error en la búsqueda', error: error.message });
        }
    }
}

export default new InspectionOrderController(); 