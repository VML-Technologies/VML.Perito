import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AssignmentsTable() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [rolesRes, permissionsRes, usersRes] = await Promise.all([
                fetch(API_ROUTES.ROLES.LIST, { headers }),
                fetch(API_ROUTES.PERMISSIONS.LIST, { headers }),
                fetch(API_ROUTES.USERS.WITH_ROLES, { headers })
            ]);

            if (!rolesRes.ok || !permissionsRes.ok || !usersRes.ok) {
                throw new Error('Error al obtener datos');
            }

            setRoles(await rolesRes.json());
            setPermissions(await permissionsRes.json());
            setUsers(await usersRes.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssignPermissionsToRole = async (roleId, permissionIds) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(API_ROUTES.ROLES.ASSIGN_PERMISSIONS(roleId), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ permissions: permissionIds })
            });
            if (!res.ok) throw new Error('Error al asignar permisos');
            alert('Permisos asignados correctamente');
            await fetchData();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAssignRolesToUser = async (userId, roleIds) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(API_ROUTES.USERS.ASSIGN_ROLES(userId), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roles: roleIds })
            });
            if (!res.ok) throw new Error('Error al asignar roles');
            alert('Roles asignados correctamente');
            await fetchData();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const RolePermissionsSection = () => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Asignar Permisos a Roles</h3>
            <div className="mb-4">
                <label className="block mb-2">Seleccionar Rol:</label>
                <Select onValueChange={(value) => setSelectedRole(roles.find(r => r.id == value))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map(role => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name} - {role.description}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedRole && (
                <div>
                    <h4 className="font-medium mb-2">Permisos para: {selectedRole.name}</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {permissions.map(permission => {
                            const isAssigned = selectedRole.Permissions?.some(p => p.id == permission.id);
                            return (
                                <label key={permission.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isAssigned}
                                        onChange={(e) => {
                                            const currentPermissions = selectedRole.Permissions?.map(p => p.id) || [];
                                            const newPermissions = e.target.checked
                                                ? [...currentPermissions, permission.id]
                                                : currentPermissions.filter(id => id !== permission.id);

                                            handleAssignPermissionsToRole(selectedRole.id, newPermissions);
                                        }}
                                        disabled={saving}
                                    />
                                    <span className="text-sm">{permission.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const UserRolesSection = () => (
        <div>
            <h3 className="text-lg font-semibold mb-4">Asignar Roles a Usuarios</h3>
            <div className="mb-4">
                <label className="block mb-2">Seleccionar Usuario:</label>
                <Select onValueChange={(value) => setSelectedUser(users.find(u => u.id == value))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} ({user.email})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedUser && (
                <div>
                    <h4 className="font-medium mb-2">Roles para: {selectedUser.name}</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {roles.map(role => {
                            const isAssigned = selectedUser.Roles?.some(r => r.id == role.id);
                            return (
                                <label key={role.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isAssigned}
                                        onChange={(e) => {
                                            const currentRoles = selectedUser.Roles?.map(r => r.id) || [];
                                            const newRoles = e.target.checked
                                                ? [...currentRoles, role.id]
                                                : currentRoles.filter(id => id !== role.id);

                                            handleAssignRolesToUser(selectedUser.id, newRoles);
                                        }}
                                        disabled={saving}
                                    />
                                    <span className="text-sm">{role.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    if (loading) return <div>Cargando asignaciones...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold">Gestión de Asignaciones</h2>
                <p className="text-gray-600">Asigna permisos a roles y roles a usuarios</p>
            </div>

            <RolePermissionsSection />
            <UserRolesSection />
        </div>
    );
} 