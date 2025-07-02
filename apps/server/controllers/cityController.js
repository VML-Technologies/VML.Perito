import { BaseController } from './baseController.js';
import City from '../models/city.js';

class CityController extends BaseController {
    constructor() {
        super(City);
    }

    // Sobrescribir index para incluir departamento
    async index(req, res) {
        try {
            const cities = await this.model.findAll({
                include: [{
                    model: City.sequelize.models.Department,
                    as: 'department',
                    attributes: ['id', 'name']
                }]
            });
            res.json(cities);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener ciudades', error: error.message });
        }
    }

    // Sobrescribir show para incluir departamento
    async show(req, res) {
        try {
            const city = await this.model.findByPk(req.params.id, {
                include: [{
                    model: City.sequelize.models.Department,
                    as: 'department',
                    attributes: ['id', 'name']
                }]
            });

            if (!city) {
                return res.status(404).json({ message: 'Ciudad no encontrada' });
            }

            res.json(city);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener ciudad', error: error.message });
        }
    }

    // Método para obtener ciudades por departamento
    async getByDepartment(req, res) {
        try {
            const { departmentId } = req.params;
            const cities = await this.model.findAll({
                where: { department_id: departmentId },
                include: [{
                    model: City.sequelize.models.Department,
                    as: 'department',
                    attributes: ['id', 'name']
                }]
            });
            res.json(cities);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener ciudades del departamento', error: error.message });
        }
    }
}

export default new CityController(); 