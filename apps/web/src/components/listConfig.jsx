import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings, Database } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';

// Vista para gestionar listas (padres) e ítems (hijos)
// Estilo y estructura basados en tu ejemplo

const ListManager = () => {
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [listForm, setListForm] = useState({ name: '', label: '' });
  const [itemForm, setItemForm] = useState({ id: null, value: '', label: '' });
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('authToken')}` });

  // ===== LISTS =====
  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ROUTES.LIST_CONFIG.LIST, { headers: authHeader() });
      if (!res.ok) throw new Error('Error cargando listas');
      const data = await res.json();
      setLists(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('fetchLists error', err);
      showToast('Error cargando listas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewList = () => {
    setListForm({ name: '', label: '' });
    setSelectedList(null);
    setIsListDialogOpen(true);
  };

  const handleEditList = (list) => {
    setSelectedList(list);
    setListForm({ name: list.name || '', label: list.label || '' });
    setIsListDialogOpen(true);
  };

  const handleSaveList = async () => {
    if (!listForm.name) {
      showToast('El campo name es requerido', 'warning');
      return;
    }

    try {
      const isEdit = !!selectedList?.id;
      const url = isEdit
        ? API_ROUTES.LIST_CONFIG.UPDATE(selectedList.id)
        : API_ROUTES.LIST_CONFIG.CREATE;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ name: listForm.name, label: listForm.label })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error guardando lista');
      }

      showToast(isEdit ? 'Lista actualizada' : 'Lista creada', 'success');
      setIsListDialogOpen(false);
      fetchLists();
    } catch (err) {
      console.error('handleSaveList error', err);
      showToast(err.message || 'Error al guardar lista', 'error');
    }
  };

  const handleDeleteList = async (list) => {
    if (!confirm(`¿Eliminar lista "${list.label}"?`)) return;

    try {
      const res = await fetch(API_ROUTES.LIST_CONFIG.DELETE(list.id), {
        method: 'DELETE',
        headers: authHeader()
      });

      if (!res.ok) throw new Error('Error eliminando lista');

      showToast('Lista eliminada', 'success');

      if (selectedList?.id === list.id) {
        setSelectedList(null);
        setItems([]);
      }

      fetchLists();
    } catch (err) {
      console.error('handleDeleteList error', err);
      showToast('Error eliminando lista', 'error');
    }
  };

  // ===== ITEMS =====
  const fetchItems = async (listId) => {
    try {
      setLoading(true);
      const res = await fetch(API_ROUTES.LIST_CONFIG.ITEMS(listId), { headers: authHeader() });
      if (!res.ok) throw new Error('Error cargando ítems');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('fetchItems error', err);
      showToast('Error cargando ítems', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewItem = (list) => {
    setSelectedList(list);
    setItemForm({ id: null, value: '', label: '' });
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedList(lists.find(l => l.id === item.parent_id) || selectedList);
    setItemForm({ id: item.id, value: item.value || '', label: item.label || '' });
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.value) {
      showToast('El campo value es requerido', 'warning');
      return;
    }

    try {
      const isEdit = !!itemForm.id;
      const url = isEdit
        ? `${API_ROUTES.LIST_CONFIG.ITEMS(selectedList.id)}/${itemForm.id}`
        : API_ROUTES.LIST_CONFIG.ITEMS(selectedList.id);
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ value: itemForm.value, label: itemForm.label })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error guardando ítem');
      }

      showToast(isEdit ? 'Ítem actualizado' : 'Ítem creado', 'success');
      setIsItemDialogOpen(false);
      fetchItems(selectedList.id);
      fetchLists();
    } catch (err) {
      console.error('handleSaveItem error', err);
      showToast(err.message || 'Error al guardar ítem', 'error');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`¿Eliminar ítem "${item.label}"?`)) return;

    try {
      const url = `${API_ROUTES.LIST_CONFIG.ITEMS(item.parent_id)}/${item.id}`;
      const res = await fetch(url, { method: 'DELETE', headers: authHeader() });
      if (!res.ok) throw new Error('Error eliminando ítem');

      showToast('Ítem eliminado', 'success');
      fetchItems(item.parent_id);
      fetchLists();
    } catch (err) {
      console.error('handleDeleteItem error', err);
      showToast('Error eliminando ítem', 'error');
    }
  };

  // Filtrado simple
  const filteredLists = lists.filter(l =>
    (l.label || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listas del Sistema</h1>
          <p className="text-gray-600">Gestiona listas y sus ítems (padres e hijos)</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleOpenNewList}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Lista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle>Total listas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lists.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar listas..." />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.map(list => (
          <Card key={list.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{list.label}</CardTitle>
                  <p className="text-sm text-gray-500">{list.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge>{list.item_count ?? '-'}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">ID: {list.id}</p>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedList(list); fetchItems(list.id); }}>
                    Ver ítems
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditList(list)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNewItem(list)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo ítem
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteList(list)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Panel de ítems del list seleccionado */}
      {selectedList && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ítems de: {selectedList.label}</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => { setSelectedList(null); setItems([]); }}>
                Cerrar
              </Button>
              <Button onClick={() => handleOpenNewItem(selectedList)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo ítem
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(it => (
              <Card key={it.id}>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{it.label}</CardTitle>
                      <p className="text-xs text-gray-500">{it.value}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditItem(it)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteItem(it)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="text-center p-8 col-span-full">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay ítems para esta lista.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog para crear/editar lista */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedList ? 'Editar Lista' : 'Nueva Lista'}</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveList(); }}>
            <div className="space-y-2">
              <Label htmlFor="list-name">Name</Label>
              <Input id="list-name" value={listForm.name} onChange={(e) => setListForm(prev => ({ ...prev, name: e.target.value }))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-label">Label</Label>
              <Input id="list-label" value={listForm.label} onChange={(e) => setListForm(prev => ({ ...prev, label: e.target.value }))} />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsListDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar ítem */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{itemForm.id ? 'Editar Ítem' : `Nuevo Ítem — ${selectedList?.label}`}</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
            <div className="space-y-2">
              <Label htmlFor="item-value">Value</Label>
              <Input id="item-value" value={itemForm.value} onChange={(e) => setItemForm(prev => ({ ...prev, value: e.target.value }))} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-label">Label</Label>
              <Input id="item-label" value={itemForm.label} onChange={(e) => setItemForm(prev => ({ ...prev, label: e.target.value }))} />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListManager;
