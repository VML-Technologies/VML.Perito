import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PermissionsTable() {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', description: '', resource: '', action: '', endpoint: '', method: '' });
    const [saving, setSaving] = useState(false);

    const fetchPermissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(API_ROUTES.PERMISSIONS.LIST, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al obtener permisos');
            setPermissions(await res.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPermissions(); }, []);

    const handleEdit = (perm) => {
        setForm({
            id: perm.id,
            name: perm.name,
            description: perm.description || '',
            resource: perm.resource || '',
            action: perm.action || '',
            endpoint: perm.endpoint || '',
            method: perm.method || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este permiso?')) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_ROUTES.PERMISSIONS.LIST}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar permiso');
            await fetchPermissions();
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
            const url = form.id ? `${API_ROUTES.PERMISSIONS.LIST}/${form.id}` : API_ROUTES.PERMISSIONS.LIST;
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    resource: form.resource,
                    action: form.action,
                    endpoint: form.endpoint,
                    method: form.method
                })
            });
            if (!res.ok) throw new Error('Error al guardar permiso');
            setShowForm(false);
            setForm({ id: null, name: '', description: '', resource: '', action: '', endpoint: '', method: '' });
            await fetchPermissions();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Permisos</h2>
                <Button onClick={() => { setShowForm(true); setForm({ id: null, name: '', description: '', resource: '', action: '', endpoint: '', method: '' }); }}>
                    Crear permiso
                </Button>
            </div>
            {loading ? (
                <div>Cargando permisos...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <table className="w-full border mb-4">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">ID</th>
                            <th className="border px-2 py-1">Nombre</th>
                            <th className="border px-2 py-1">Descripción</th>
                            <th className="border px-2 py-1">Recurso</th>
                            <th className="border px-2 py-1">Acción</th>
                            <th className="border px-2 py-1">Endpoint</th>
                            <th className="border px-2 py-1">Método</th>
                            <th className="border px-2 py-1">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.map(perm => (
                            <tr key={perm.id}>
                                <td className="border px-2 py-1">{perm.id}</td>
                                <td className="border px-2 py-1">{perm.name}</td>
                                <td className="border px-2 py-1">{perm.description}</td>
                                <td className="border px-2 py-1">{perm.resource}</td>
                                <td className="border px-2 py-1">{perm.action}</td>
                                <td className="border px-2 py-1">{perm.endpoint}</td>
                                <td className="border px-2 py-1">{perm.method}</td>
                                <td className="border px-2 py-1 flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(perm)}>Editar</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(perm.id)} disabled={saving}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {showForm && (
                <form onSubmit={handleFormSubmit} className="border p-4 rounded bg-muted mb-4">
                    <h3 className="font-semibold mb-2">{form.id ? 'Editar permiso' : 'Crear permiso'}</h3>
                    <div className="mb-2">
                        <label className="block mb-1">Nombre</label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Descripción</label>
                        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Recurso</label>
                        <Input value={form.resource} onChange={e => setForm(f => ({ ...f, resource: e.target.value }))} required />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Acción</label>
                        <Input value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} required />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Endpoint</label>
                        <Input value={form.endpoint} onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))} />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Método</label>
                        <Input value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} />
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