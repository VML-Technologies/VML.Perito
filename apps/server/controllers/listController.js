import ListName from '../models/listName.js';
import { UniqueConstraintError } from 'sequelize';

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
      let { name, label } = req.body;

      if (!name)
        return res.status(400).json({ message: 'name es requerido' });

      // Normalizar entradas para reducir duplicados por espacios/case
      name = String(name).trim();
      label = (label === undefined || label === null) ? name : String(label).trim();

      // Intentar restaurar un registro soft-deleted que coincida (paranoid:false)
      const soft = await ListName.findOne({ where: { name, parent_id: null }, paranoid: false });
      if (soft && soft.deleted_at) {
        try {
          await soft.restore();
          soft.label = label || soft.label;
          await soft.save();
          return res.status(200).json({ message: 'Lista restaurada', restored: soft });
        } catch (restoreErr) {
          console.error('restore error', restoreErr);
          // continuar al flujo normal si falla la restauración
        }
      }

      // Usar findOrCreate para reducir condiciones de carrera
      const [list, created] = await ListName.findOrCreate({
        where: { name, parent_id: null },
        defaults: { label, parent_id: null }
      });

      if (!created) {
        // Devolver información del recurso existente para que el frontend pueda manejar el conflicto
        return res.status(409).json({ message: 'La lista ya existe', existingId: list.id, existing: list });
      }

      return res.status(201).json(list);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return res.status(409).json({ message: 'La lista ya existe' });
      }
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
      if (err instanceof UniqueConstraintError) {
        return res.status(409).json({ message: 'Nombre de lista duplicado' });
      }
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
      let { value, label } = req.body;

      const parent = await ListName.findByPk(id);

      if (!parent || parent.parent_id !== null)
        return res.status(404).json({ message: 'Lista no encontrada' });

      if (!value)
        return res.status(400).json({ message: 'value es requerido' });

      // Normalizar
      value = String(value).trim();
      label = (label === undefined || label === null) ? value : String(label).trim();

      // Intentar restaurar un soft-deleted con mismo parent/value
      const softItem = await ListName.findOne({ where: { parent_id: id, value }, paranoid: false });
      if (softItem && softItem.deleted_at) {
        try {
          await softItem.restore();
          softItem.label = label || softItem.label;
          await softItem.save();
          return res.status(200).json({ message: 'Ítem restaurado', restored: softItem });
        } catch (restoreErr) {
          console.error('restore item error', restoreErr);
          // continuar al flujo normal si falla la restauración
        }
      }

      // Evitar duplicados bajo el mismo padre
      const [item, created] = await ListName.findOrCreate({
        where: { parent_id: id, value },
        defaults: { label, name: null, parent_id: id }
      });

      if (!created) {
        return res.status(409).json({ message: 'El ítem ya existe en esta lista', existingId: item.id, existing: item });
      }

      return res.status(201).json(item);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return res.status(409).json({ message: 'El ítem ya existe' });
      }
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
      if (err instanceof UniqueConstraintError) {
        return res.status(409).json({ message: 'Ítem duplicado en la lista' });
      }
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

  // GET /api/lists/by-name/:name/items
  async getItemsByName(req, res) {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({ message: 'El nombre de la lista es requerido' });
      }

      // Buscar la lista por nombre
      const parent = await ListName.findOne({
        where: { name: name.trim(), parent_id: null }
      });

      if (!parent) {
        return res.status(404).json({ message: 'Lista no encontrada' });
      }

      // Obtener los ítems de la lista
      const items = await ListName.findAll({
        where: { parent_id: parent.id },
        order: [['id', 'ASC']]
      });

      return res.json(items);
    } catch (err) {
      console.error('getItemsByName error', err);
      return res.status(500).json({ message: 'Error cargando ítems' });
    }
  }
}

export default new ListNameController();
