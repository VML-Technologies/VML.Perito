import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RoleBasedRoute } from '@/components/RoleBasedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { Users, Shield, Key, Save, RefreshCw, UserCheck, Settings } from 'lucide-react';

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Contexto de notificaciones
    const { showToast } = useNotificationContext();

    // Datos originales
    const [originalData, setOriginalData] = useState({
        roles: [],
        permissions: [],
        users: []
    });

    // Estado local para edición
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);

    // Estados de UI
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('assignments');

    // Cargar datos iniciales
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            showToast('Cargando datos de administración...', 'info');

            const [rolesRes, permissionsRes, usersRes] = await Promise.all([
                fetch(API_ROUTES.ROLES.LIST, { headers }),
                fetch(API_ROUTES.PERMISSIONS.LIST, { headers }),
                fetch(API_ROUTES.USERS.WITH_ROLES, { headers })
            ]);

            if (!rolesRes.ok || !permissionsRes.ok || !usersRes.ok) {
                throw new Error('Error al cargar datos');
            }

            const rolesData = await rolesRes.json();
            const permissionsData = await permissionsRes.json();
            const usersData = await usersRes.json();

            const data = {
                roles: rolesData,
                permissions: permissionsData,
                users: usersData
            };

            setOriginalData(data);
            setRoles(JSON.parse(JSON.stringify(rolesData)));
            setPermissions(JSON.parse(JSON.stringify(permissionsData)));
            setUsers(JSON.parse(JSON.stringify(usersData)));
            setHasChanges(false);

            showToast(`Datos cargados: ${rolesData.length} roles, ${permissionsData.length} permisos, ${usersData.length} usuarios`, 'success');
        } catch (e) {
            setError(e.message);
            showToast('Error al cargar datos: ' + e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Detectar cambios
    useEffect(() => {
        const hasDataChanged = JSON.stringify(originalData) !== JSON.stringify({
            roles,
            permissions,
            users
        });
        setHasChanges(hasDataChanged);
    }, [roles, permissions, users, originalData]);

    // Guardar cambios
    const handleSaveChanges = async () => {
        setSaving(true);
        showToast('Procesando cambios...', 'info');

        try {
            const token = localStorage.getItem('authToken');
            const assignments = [];

            // Comparar roles y sus permisos
            roles.forEach(role => {
                const originalRole = originalData.roles.find(r => r.id === role.id);
                if (originalRole) {
                    const originalPermissions = originalRole.permissions?.map(p => p.id).sort() || [];
                    const currentPermissions = role.permissions?.map(p => p.id).sort() || [];

                    if (JSON.stringify(originalPermissions) !== JSON.stringify(currentPermissions)) {
                        assignments.push({
                            type: 'role',
                            id: role.id,
                            permissions: currentPermissions
                        });
                    }
                }
            });

            // Comparar usuarios y sus roles
            users.forEach(user => {
                const originalUser = originalData.users.find(u => u.id === user.id);
                if (originalUser) {
                    const originalRoles = originalUser.roles?.map(r => r.id).sort() || [];
                    const currentRoles = user.roles?.map(r => r.id).sort() || [];

                    if (JSON.stringify(originalRoles) !== JSON.stringify(currentRoles)) {
                        assignments.push({
                            type: 'user',
                            id: user.id,
                            roles: currentRoles
                        });
                    }
                }
            });

            if (assignments.length > 0) {
                const response = await fetch(API_ROUTES.RBAC.BULK_ASSIGNMENTS, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ assignments })
                });

                if (!response.ok) {
                    throw new Error('Error al guardar cambios');
                }

                const result = await response.json();
                console.log('Cambios guardados:', result);

                // Recargar datos
                await fetchData();
                showToast(`¡Éxito! ${result.results.length} asignaciones actualizadas correctamente`, 'success');
            } else {
                showToast('No hay cambios para guardar', 'warning');
            }
        } catch (e) {
            setError(e.message);
            showToast('Error al guardar cambios: ' + e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Manejar cambios en permisos de rol
    const handleRolePermissionChange = (roleId, permissionId, checked) => {
        setRoles(prevRoles =>
            prevRoles.map(role => {
                if (role.id === roleId) {
                    const currentPermissions = role.permissions || [];
                    const updatedPermissions = checked
                        ? [...currentPermissions, permissions.find(p => p.id === permissionId)]
                        : currentPermissions.filter(p => p.id !== permissionId);

                    return { ...role, permissions: updatedPermissions };
                }
                return role;
            })
        );
        // No notificación aquí
    };

    // Manejar cambios en roles de usuario
    const handleUserRoleChange = (userId, roleId, checked) => {
        setUsers(prevUsers =>
            prevUsers.map(user => {
                if (user.id === userId) {
                    const currentRoles = user.roles || [];
                    const updatedRoles = checked
                        ? [...currentRoles, roles.find(r => r.id === roleId)]
                        : currentRoles.filter(r => r.id !== roleId);

                    return { ...user, roles: updatedRoles };
                }
                return user;
            })
        );
        // Actualizar también el usuario seleccionado para feedback visual inmediato
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(prevSelectedUser => {
                const currentRoles = prevSelectedUser.roles || [];
                const updatedRoles = checked
                    ? [...currentRoles, roles.find(r => r.id === roleId)]
                    : currentRoles.filter(r => r.id !== roleId);

                return { ...prevSelectedUser, roles: updatedRoles };
            });
        }
        // No notificación aquí
    };

    // Obtener permisos de usuario (a través de roles)
    const getUserPermissions = (user) => {
        if (!user.roles) return [];
        const userPermissions = new Set();
        user.roles.forEach(role => {
            const roleData = roles.find(r => r.id === role.id);
            if (roleData && roleData.permissions) {
                roleData.permissions.forEach(permission => {
                    userPermissions.add(permission.id);
                });
            }
        });
        return Array.from(userPermissions);
    };

    // Filtrar usuarios
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Cargando datos de administración...</span>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <RoleBasedRoute requiredRoles={['admin', 'super_admin']}>
            <AuthenticatedLayout>
                <div className="max-w-7xl mx-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Shield className="h-8 w-8" />
                                Administración RBAC
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gestiona roles, permisos y asignaciones de usuarios
                            </p>
                        </div>

                        {hasChanges && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="animate-pulse">
                                    Cambios pendientes
                                </Badge>
                                <Button
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="assignments" className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                Asignaciones
                            </TabsTrigger>
                            <TabsTrigger value="roles" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Roles
                            </TabsTrigger>
                            <TabsTrigger value="permissions" className="flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                Permisos
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab de Asignaciones */}
                        <TabsContent value="assignments" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Panel de Usuarios */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Usuarios
                                        </CardTitle>
                                        <CardDescription>
                                            Selecciona un usuario para ver y modificar sus roles
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="search">Buscar usuario</Label>
                                                <Input
                                                    id="search"
                                                    placeholder="Buscar por nombre o email..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>

                                            <div className="max-h-96 overflow-y-auto space-y-2">
                                                {filteredUsers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedUser?.id === user.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{user.name}</p>
                                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.roles?.map(role => (
                                                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                                                        {role.name}
                                                                    </Badge>
                                                                ))}
                                                                {user.roles?.length === 0 && (
                                                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                        Sin roles
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Panel de Roles y Permisos */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            {selectedUser ? `Gestión de ${selectedUser.name}` : 'Selecciona un usuario'}
                                        </CardTitle>
                                        <CardDescription>
                                            {selectedUser
                                                ? 'Modifica los roles y visualiza los permisos del usuario seleccionado'
                                                : 'Selecciona un usuario de la lista para ver sus roles y permisos'
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedUser ? (
                                            <div className="space-y-6">
                                                {/* Roles del usuario */}
                                                <div>
                                                    <Label className="text-base font-medium">Roles Asignados</Label>
                                                    <div className="mt-2 space-y-2">
                                                        {roles.map(role => {
                                                            const isAssigned = selectedUser.roles?.some(r => r.id === role.id);
                                                            return (
                                                                <div key={role.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`user-role-${role.id}`}
                                                                        checked={isAssigned}
                                                                        onCheckedChange={(checked) =>
                                                                            handleUserRoleChange(selectedUser.id, role.id, checked)
                                                                        }
                                                                        className="transition-all duration-200"
                                                                    />
                                                                    <Label htmlFor={`user-role-${role.id}`} className="flex-1">
                                                                        <span className="font-medium">{role.name}</span>
                                                                        {role.description && (
                                                                            <span className="text-sm text-muted-foreground ml-2">
                                                                                - {role.description}
                                                                            </span>
                                                                        )}
                                                                        {isAssigned && (
                                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                                {role.permissions?.length || 0} permisos
                                                                            </Badge>
                                                                        )}
                                                                    </Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Permisos efectivos */}
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-base font-medium">Permisos Efectivos</Label>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs transition-all duration-300 hover:bg-blue-50"
                                                        >
                                                            {getUserPermissions(selectedUser).length} permisos
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Permisos otorgados a través de los roles asignados
                                                    </p>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {getUserPermissions(selectedUser).length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {getUserPermissions(selectedUser).map(permissionId => {
                                                                    const permission = permissions.find(p => p.id === permissionId);
                                                                    return permission ? (
                                                                        <Badge
                                                                            key={permission.id}
                                                                            variant="outline"
                                                                            className="text-xs transition-all duration-300 hover:scale-105"
                                                                        >
                                                                            {permission.name}
                                                                        </Badge>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4 text-muted-foreground">
                                                                <p className="text-sm">Este usuario no tiene permisos asignados</p>
                                                                <p className="text-xs">Asigna roles para otorgar permisos</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>Selecciona un usuario para ver sus roles y permisos</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Tab de Roles */}
                        <TabsContent value="roles" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Lista de Roles */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Roles del Sistema</CardTitle>
                                        <CardDescription>
                                            Selecciona un rol para modificar sus permisos
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {roles.map(role => (
                                                <div
                                                    key={role.id}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedRole?.id === role.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{role.name}</p>
                                                            <p className="text-sm text-muted-foreground">{role.description}</p>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {role.permissions?.length || 0} permisos
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Permisos del Rol */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {selectedRole ? `Permisos de ${selectedRole.name}` : 'Selecciona un rol'}
                                        </CardTitle>
                                        <CardDescription>
                                            {selectedRole
                                                ? 'Modifica los permisos asignados a este rol'
                                                : 'Selecciona un rol para ver y modificar sus permisos'
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedRole ? (
                                            <div className="space-y-4">
                                                <div className="max-h-96 overflow-y-auto space-y-2">
                                                    {permissions.map(permission => {
                                                        const isAssigned = selectedRole.permissions?.some(p => p.id === permission.id);
                                                        return (
                                                            <div key={permission.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`role-permission-${permission.id}`}
                                                                    checked={isAssigned}
                                                                    onCheckedChange={(checked) =>
                                                                        handleRolePermissionChange(selectedRole.id, permission.id, checked)
                                                                    }
                                                                />
                                                                <Label htmlFor={`role-permission-${permission.id}`} className="flex-1">
                                                                    <span className="font-medium">{permission.name}</span>
                                                                    {permission.description && (
                                                                        <span className="text-sm text-muted-foreground ml-2">
                                                                            - {permission.description}
                                                                        </span>
                                                                    )}
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>Selecciona un rol para ver sus permisos</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Tab de Permisos */}
                        <TabsContent value="permissions">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        Permisos del Sistema
                                    </CardTitle>
                                    <CardDescription>
                                        Lista de todos los permisos disponibles en el sistema
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {permissions.map(permission => (
                                            <Card key={permission.id} className="p-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline">{permission.resource}</Badge>
                                                        <Badge variant="secondary">{permission.action}</Badge>
                                                    </div>
                                                    <h4 className="font-medium">{permission.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                                                    {permission.endpoint && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {permission.method} {permission.endpoint}
                                                        </p>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </AuthenticatedLayout>
        </RoleBasedRoute>
    );
} 