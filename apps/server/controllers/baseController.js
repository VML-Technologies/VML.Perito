// Controlador base con métodos CRUD y soft deletes
export class BaseController {
    constructor(model) {
        this.model = model;
    }

    // Listar todos (excluye soft deleted)
    async index(req, res) {
        try {
            const items = await this.model.findAll();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener registros', error: error.message });
        }
    }

    // Obtener uno por ID (excluye soft deleted)
    async show(req, res) {
        try {
            const item = await this.model.findByPk(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            res.json(item);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener registro', error: error.message });
        }
    }

    // Crear nuevo registro
    async store(req, res) {
        try {
            const item = await this.model.create(req.body);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear registro', error: error.message });
        }
    }

    // Actualizar registro
    async update(req, res) {
        try {
            const item = await this.model.findByPk(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            await item.update(req.body);
            res.json(item);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar registro', error: error.message });
        }
    }

    // Soft delete (marca como eliminado)
    async destroy(req, res) {
        try {
            const item = await this.model.findByPk(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            await item.destroy(); // Esto hace soft delete automáticamente
            res.json({ message: 'Registro eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar registro', error: error.message });
        }
    }

    // Hard delete (elimina permanentemente)
    async forceDestroy(req, res) {
        try {
            const item = await this.model.findByPk(req.params.id, { paranoid: false });
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            await item.destroy({ force: true }); // Eliminación permanente
            res.json({ message: 'Registro eliminado permanentemente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar registro', error: error.message });
        }
    }

    // Restaurar registro soft deleted
    async restore(req, res) {
        try {
            const item = await this.model.findByPk(req.params.id, { paranoid: false });
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            if (!item.deleted_at) {
                return res.status(400).json({ message: 'El registro no está eliminado' });
            }
            await item.restore();
            res.json({ message: 'Registro restaurado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al restaurar registro', error: error.message });
        }
    }

    // Listar incluyendo soft deleted
    async indexWithTrashed(req, res) {
        try {
            const items = await this.model.findAll({ paranoid: false });
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener registros', error: error.message });
        }
    }

    // Obtener solo soft deleted
    async onlyTrashed(req, res) {
        try {
            const items = await this.model.findAll({
                paranoid: false,
                where: {
                    deleted_at: { [this.model.sequelize.Op.ne]: null }
                }
            });
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener registros eliminados', error: error.message });
        }
    }
} 