import { BaseController } from './baseController.js';
import Sede from '../models/sede.js';

class SedeController extends BaseController {
    constructor() {
        super(Sede);
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
}

export default new SedeController(); 