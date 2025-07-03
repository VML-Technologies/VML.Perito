import { BaseController } from './baseController.js';
import Company from '../models/company.js';

class CompanyController extends BaseController {
    constructor() {
        super(Company);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.forceDestroy = this.forceDestroy.bind(this);
        this.restore = this.restore.bind(this);
    }

    // Sobrescribir index para incluir ciudad
    async index(req, res) {
        try {
            const companies = await this.model.findAll({
                include: [{
                    model: Company.sequelize.models.City,
                    as: 'city',
                    attributes: ['id', 'name'],
                    include: [{
                        model: Company.sequelize.models.Department,
                        as: 'department',
                        attributes: ['id', 'name']
                    }]
                }]
            });
            res.json(companies);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener empresas', error: error.message });
        }
    }

    // Sobrescribir show para incluir ciudad y sedes
    async show(req, res) {
        try {
            const company = await this.model.findByPk(req.params.id, {
                include: [
                    {
                        model: Company.sequelize.models.City,
                        as: 'city',
                        attributes: ['id', 'name'],
                        include: [{
                            model: Company.sequelize.models.Department,
                            as: 'department',
                            attributes: ['id', 'name']
                        }]
                    },
                    {
                        model: Company.sequelize.models.Sede,
                        as: 'sedes',
                        attributes: ['id', 'name', 'email', 'phone', 'address']
                    }
                ]
            });

            if (!company) {
                return res.status(404).json({ message: 'Empresa no encontrada' });
            }

            res.json(company);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener empresa', error: error.message });
        }
    }
}

export default new CompanyController(); 