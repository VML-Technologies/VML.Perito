import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import InspectionOrder from '../models/inspectionOrder.js';
import InspectionOrderStatus from '../models/inspectionOrderStatus.js';
import PlateQuery from '../models/plateQuery.js';

class PlateQueryController {
    constructor() {
        this.checkPlate = this.checkPlate.bind(this);
    }

    // Consultar placa sin autenticación
    async checkPlate(req, res) {
        const startTime = Date.now();
        
        try {
            const { placa } = req.params;
            
            // Validar que la placa esté presente
            if (!placa) {
                return res.status(400).json({
                    success: false,
                    message: 'La placa es requerida'
                });
            }

            // Normalizar la placa (mayúsculas, sin espacios)
            const normalizedPlaca = placa.toUpperCase().replace(/\s/g, '');

            // Buscar orden de inspección activa
            const order = await InspectionOrder.findOne({
                where: {
                    placa: normalizedPlaca,
                    // deleted_at: null
                },
                include: [
                    {
                        model: InspectionOrderStatus,
                        as: 'InspectionOrderStatus',
                        attributes: ['id', 'name', 'description']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            const responseTime = Date.now() - startTime;
            const foundOrder = !!order;

            // Registrar la consulta
            await PlateQuery.create({
                placa: normalizedPlaca,
                ip_address: req.realIP || req.ip,
                user_agent: req.get('User-Agent'),
                found_order: foundOrder,
                order_id: order?.id || null,
                response_time_ms: responseTime
            });

            // Preparar respuesta
            const response = {
                success: true,
                data: {
                    placa: normalizedPlaca,
                    found_order: foundOrder,
                    query_timestamp: new Date().toISOString()
                }
            };

            // Si se encontró una orden, incluir los datos del vehículo
            if (foundOrder && order) {
                response.data.vehicle = {
                    marca: order.marca,
                    linea: order.linea,
                    modelo: order.modelo,
                    color: order.color,
                    clase: order.clase,
                    servicio: order.servicio,
                    motor: order.motor,
                    chasis: order.chasis,
                    vin: order.vin,
                    carroceria: order.carroceria,
                    combustible: order.combustible,
                    cilindraje: order.cilindraje
                };
                
                response.data.order = {
                    id: order.id,
                    numero: order.numero,
                    fecha: order.fecha,
                    status: order.InspectionOrderStatus?.name || 'Sin estado',
                    status_description: order.InspectionOrderStatus?.description || ''
                };
            }

            res.json(response);

        } catch (error) {
            console.error('Error checking plate:', error);
            
            // Registrar consulta con error
            try {
                await PlateQuery.create({
                    placa: req.params.placa?.toUpperCase().replace(/\s/g, '') || 'UNKNOWN',
                    ip_address: req.realIP || req.ip,
                    user_agent: req.get('User-Agent'),
                    found_order: false,
                    order_id: null,
                    response_time_ms: Date.now() - startTime
                });
            } catch (logError) {
                console.error('Error logging plate query:', logError);
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas de consultas (requiere autenticación)
    async getStats(req, res) {
        try {
            const stats = await PlateQuery.findAll({
                attributes: [
                    'found_order',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('AVG', sequelize.col('response_time_ms')), 'avg_response_time']
                ],
                group: ['found_order'],
                raw: true
            });

            const totalQueries = await PlateQuery.count();
            const todayQueries = await PlateQuery.count({
                where: {
                    created_at: {
                        [Op.gte]: new Date().setHours(0, 0, 0, 0)
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    stats,
                    total_queries: totalQueries,
                    today_queries: todayQueries
                }
            });

        } catch (error) {
            console.error('Error getting plate query stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }
}

export default new PlateQueryController();
