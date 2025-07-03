import { BaseController } from './baseController.js';
import Department from '../models/department.js';

class DepartmentController extends BaseController {
    constructor() {
        super(Department);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.store = this.store.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.forceDestroy = this.forceDestroy.bind(this);
        this.restore = this.restore.bind(this);
    }

    // Sobrescribir index para incluir ciudades
    async index(req, res) {
        try {
            const departments = await this.model.findAll({
                include: [{
                    model: Department.sequelize.models.City,
                    as: 'cities',
                    attributes: ['id', 'name']
                }]
            });
            res.json(departments);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener departamentos', error: error.message });
        }
    }

    // Sobrescribir show para incluir ciudades
    async show(req, res) {
        try {
            const department = await this.model.findByPk(req.params.id, {
                include: [{
                    model: Department.sequelize.models.City,
                    as: 'cities',
                    attributes: ['id', 'name']
                }]
            });

            if (!department) {
                return res.status(404).json({ message: 'Departamento no encontrado' });
            }

            res.json(department);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener departamento', error: error.message });
        }
    }
}

export default new DepartmentController(); 