import ListName from '../models/listName.js';

class ListNameController {

  // GET /api/lists
  async index(req, res) {
    try {
      const parents = await ListName.findAll({
        where: { parent_id: null },
        order: [['id', 'ASC']]
      });

      const result = await Promise.all(
        parents.map(async (p) => {
          const count = await ListName.count({ where: { parent_id: p.id } });
          return {
            id: p.id,
            name: p.name,
            label: p.label,
            item_count: count
          };
        })
      );

      return res.json(result);
    } catch (err) {
      console.error('index error', err);
      return res.status(500).json({ message: 'Error cargando listas' });
    }
  }

  // POST /api/lists
  async addList(req, res) {
    try {
      const { name, label } = req.body;

      if (!name)
        return res.status(400).json({ message: 'name es requerido' });

      const exists = await ListName.findOne({
        where: { name, parent_id: null }
      });

      if (exists)
        return res.status(400).json({ message: 'La lista ya existe' });

      const list = await ListName.create({
        name,
        label: label || name,
        parent_id: null
      });

      return res.status(201).json(list);
    } catch (err) {
      console.error('addList error', err);
      return res.status(500).json({ message: 'Error creando lista' });
    }
  }

  // PUT /api/lists/:id
  async updateList(req, res) {
    try {
      const { id } = req.params;
      const { name, label } = req.body;

      const list = await ListName.findByPk(id);

      if (!list || list.parent_id !== null)
        return res.status(404).json({ message: 'Lista no encontrada' });

      if (name !== undefined) list.name = name;
      if (label !== undefined) list.label = label;

      await list.save();

      return res.json(list);
    } catch (err) {
      console.error('updateList error', err);
      return res.status(500).json({ message: 'Error actualizando lista' });
    }
  }

  // DELETE /api/lists/:id
  async removeList(req, res) {
    try {
      const { id } = req.params;

      const list = await ListName.findByPk(id);

      if (!list || list.parent_id !== null)
        return res.status(404).json({ message: 'Lista no encontrada' });

      await list.destroy(); // soft delete

      return res.json({ message: 'Lista eliminada' });
    } catch (err) {
      console.error('removeList error', err);
      return res.status(500).json({ message: 'Error eliminando lista' });
    }
  }

  // GET /api/lists/:id/items
  async getItems(req, res) {
    try {
      const { id } = req.params;

      const parent = await ListName.findByPk(id);

      if (!parent || parent.parent_id !== null)
        return res.status(404).json({ message: 'Lista no encontrada' });

      const items = await ListName.findAll({
        where: { parent_id: id },
        order: [['id', 'ASC']]
      });

      return res.json(items);
    } catch (err) {
      console.error('getItems error', err);
      return res.status(500).json({ message: 'Error cargando ítems' });
    }
  }

  // POST /api/lists/:id/items
  async createItem(req, res) {
    try {
      const { id } = req.params;
      const { value, label } = req.body;

      const parent = await ListName.findByPk(id);

      if (!parent || parent.parent_id !== null)
        return res.status(404).json({ message: 'Lista no encontrada' });

      if (!value)
        return res.status(400).json({ message: 'value es requerido' });

      const item = await ListName.create({
        value,
        label: label || value,
        name: null,
        parent_id: id
      });

      return res.status(201).json(item);
    } catch (err) {
      console.error('createItem error', err);
      return res.status(500).json({ message: 'Error creando ítem' });
    }
  }

  // PUT /api/lists/:id/items/:itemId
  async updateItem(req, res) {
    try {
      const { itemId } = req.params;
      const { value, label } = req.body;

      const item = await ListName.findByPk(itemId);

      if (!item || item.parent_id == null)
        return res.status(404).json({ message: 'Ítem no encontrado' });

      if (value !== undefined) item.value = value;
      if (label !== undefined) item.label = label;

      await item.save();

      return res.json(item);
    } catch (err) {
      console.error('updateItem error', err);
      return res.status(500).json({ message: 'Error actualizando ítem' });
    }
  }

  // DELETE /api/lists/:id/items/:itemId
  async removeItem(req, res) {
    try {
      const { itemId } = req.params;

      const item = await ListName.findByPk(itemId);

      if (!item || item.parent_id == null)
        return res.status(404).json({ message: 'Ítem no encontrado' });

      await item.destroy(); // soft delete

      return res.json({ message: 'Ítem eliminado' });
    } catch (err) {
      console.error('removeItem error', err);
      return res.status(500).json({ message: 'Error eliminando ítem' });
    }
  }
}

export default new ListNameController();
