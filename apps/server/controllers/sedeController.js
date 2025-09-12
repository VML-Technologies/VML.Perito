import { BaseController } from './baseController.js';
import Sede from '../models/sede.js';
import { Op } from 'sequelize';

class SedeController extends BaseController {
    constructor() {
        super(Sede);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.forceDestroy = this.forceDestroy.bind(this);
        this.restore = this.restore.bind(this);
        this.getByCompany = this.getByCompany.bind(this);
        this.getCDASedes = this.getCDASedes.bind(this);
    }

    // Sobrescribir index para incluir empresa y ciudad
    async index(req, res) {
        try {
            const sedes = await this.model.findAll({
                include: [
                    {
                        model: Sede.sequelize.models.Company,
                        as: 'company',
                        attributes: ['id', 'name', 'nit']
                    },
                    {
                        model: Sede.sequelize.models.City,
                        as: 'city',
                        attributes: ['id', 'name'],
                        include: [{
                            model: Sede.sequelize.models.Department,
                            as: 'department',
                            attributes: ['id', 'name']
                        }]
                    }
                ]
            });
            res.json(sedes);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener sedes', error: error.message });
        }
    }

    // Sobrescribir show para incluir empresa, ciudad y usuarios
    async show(req, res) {
        try {
            const sede = await this.model.findByPk(req.params.id, {
                include: [
                    {
                        model: Sede.sequelize.models.Company,
                        as: 'company',
                        attributes: ['id', 'name', 'nit']
                    },
                    {
                        model: Sede.sequelize.models.City,
                        as: 'city',
                        attributes: ['id', 'name'],
                        include: [{
                            model: Sede.sequelize.models.Department,
                            as: 'department',
                            attributes: ['id', 'name']
                        }]
                    },
                    {
                        model: Sede.sequelize.models.User,
                        as: 'users',
                        attributes: ['id', 'name', 'email', 'phone', 'is_active']
                    }
                ]
            });

            if (!sede) {
                return res.status(404).json({ message: 'Sede no encontrada' });
            }

            res.json(sede);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener sede', error: error.message });
        }
    }

    // Método para obtener sedes por empresa
    async getByCompany(req, res) {
        try {
            const { companyId } = req.params;
            const sedes = await this.model.findAll({
                where: { company_id: companyId },
                include: [
                    {
                        model: Sede.sequelize.models.Company,
                        as: 'company',
                        attributes: ['id', 'name', 'nit']
                    },
                    {
                        model: Sede.sequelize.models.City,
                        as: 'city',
                        attributes: ['id', 'name']
                    }
                ]
            });
            res.json(sedes);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener sedes de la empresa', error: error.message });
        }
    }

    /**
     * Obtener sedes tipo CDA activas
     */
    async getCDASedes(req, res) {
        try {
            console.log('🏢 === INICIO getCDASedes ===');
            console.log('🔍 Buscando sedes CDA...');
            
            // Estrategia 1: Buscar SedeType por código
            console.log('📋 Estrategia 1: Buscando SedeType por código "CDA"...');
            const { SedeType } = await import('../models/index.js');
            
            const sedeType = await SedeType.findOne({
                where: {
                    code: 'CDA'
                },
                attributes: ['id', 'name', 'code'],
                raw: true
            });
            
            console.log('🏢 Tipo de sede CDA encontrado:', sedeType);
            
            if (!sedeType) {
                console.log('⚠️ No se encontró el tipo de sede CDA');
                return res.json({
                    success: true,
                    data: []
                });
            }
            
            // Estrategia 2: Buscar sedes con este tipo
            console.log('📋 Estrategia 2: Buscando sedes con sede_type_id:', sedeType.id);
            const sedes = await this.model.findAll({
                where: {
                    sede_type_id: sedeType.id,
                    active: true
                },
                attributes: ['id', 'name', 'address', 'email', 'phone', 'sede_type_id', 'city_id'],
                order: [['name', 'ASC']],
                raw: true
            });

            console.log(`✅ ${sedes.length} sedes CDA encontradas:`, sedes);
            
            // Estrategia 3: Obtener información adicional si hay sedes
            if (sedes.length > 0) {
                console.log('📋 Estrategia 3: Obteniendo información adicional...');
                
                // Obtener ciudades únicas
                const cityIds = [...new Set(sedes.map(s => s.city_id))];
                console.log('🏙️ IDs de ciudades únicas:', cityIds);
                
                const { City } = await import('../models/index.js');
                const cities = await City.findAll({
                    where: {
                        id: {
                            [Op.in]: cityIds
                        }
                    },
                    attributes: ['id', 'name'],
                    raw: true
                });
                
                console.log('🏙️ Ciudades encontradas:', cities);
                
                // Combinar información
                const sedesWithInfo = sedes.map(sede => {
                    const city = cities.find(c => c.id === sede.city_id);
                    return {
                        id: sede.id,
                        name: sede.name,
                        address: sede.address,
                        email: sede.email,
                        phone: sede.phone,
                        sedeType: sedeType,
                        city: city
                    };
                });
                
                console.log('🏢 === FIN getCDASedes ===');
                res.json({
                    success: true,
                    data: sedesWithInfo
                });
            } else {
                console.log('🏢 === FIN getCDASedes (sin sedes) ===');
                res.json({
                    success: true,
                    data: []
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo sedes CDA:', error);
            console.error('📍 Stack:', error.stack);
            console.error('🏢 === ERROR getCDASedes ===');
            res.status(500).json({
                success: false,
                message: 'Error al obtener sedes CDA',
                error: error.message
            });
        }
    }
}

export default new SedeController(); 