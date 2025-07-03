import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RolesTable() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', description: '' });
    const [saving, setSaving] = useState(false);

    const fetchRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(API_ROUTES.ROLES.LIST, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al obtener roles');
            setRoles(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoles(); }, []);

    const handleEdit = (role) => {
        setForm({ id: role.id, name: role.name, description: role.description || '' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este rol?')) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_ROUTES.ROLES.LIST}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar rol');
            await fetchRoles();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const method = form.id ? 'PUT' : 'POST';
            const url = form.id ? `${API_ROUTES.ROLES.LIST}/${form.id}` : API_ROUTES.ROLES.LIST;
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: form.name, description: form.description })
            });
            if (!res.ok) throw new Error('Error al guardar rol');
            setShowForm(false);
            setForm({ id: null, name: '', description: '' });
            await fetchRoles();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Roles</h2>
                <Button onClick={() => { setShowForm(true); setForm({ id: null, name: '', description: '' }); }}>
                    Crear rol
                </Button>
            </div>
            {loading ? (
                <div>Cargando roles...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <table className="w-full border mb-4">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">ID</th>
                            <th className="border px-2 py-1">Nombre</th>
                            <th className="border px-2 py-1">Descripción</th>
                            <th className="border px-2 py-1">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td className="border px-2 py-1">{role.id}</td>
                                <td className="border px-2 py-1">{role.name}</td>
                                <td className="border px-2 py-1">{role.description}</td>
                                <td className="border px-2 py-1 flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>Editar</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(role.id)} disabled={saving}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {showForm && (
                <form onSubmit={handleFormSubmit} className="border p-4 rounded bg-muted mb-4">
                    <h3 className="font-semibold mb-2">{form.id ? 'Editar rol' : 'Crear rol'}</h3>
                    <div className="mb-2">
                        <label className="block mb-1">Nombre</label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Descripción</label>
                        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
                    </div>
                </form>
            )}
        </div>
    );
} 