import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RoleBasedRoute } from '@/components/RoleBasedRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { Shield, Save, RefreshCw, UserCheck, Users, Key, UserPlus, Bell, BarChart3 } from 'lucide-react';
import { UserCreationForm } from './admin/UserCreationForm';
import { RoleAssignments } from './admin/RoleAssignments';
import { RoleManagement } from './admin/RoleManagement';
import { PermissionsList } from './admin/PermissionsList';
import { NotificationsPanel } from './admin/NotificationsPanel';
import { EventsPanel } from './admin/EventsPanel';
import { useAuth } from '@/contexts/auth-context';

export default function Admin() {
    const { user } = useAuth();
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
    const [activeTab, setActiveTab] = useState('create-user');

    // Estados para notificaciones
    const [notificationTypes, setNotificationTypes] = useState([]);
    const [notificationChannels, setNotificationChannels] = useState([]);
    const [notificationConfigs, setNotificationConfigs] = useState([]);
    const [notificationStats, setNotificationStats] = useState(null);
    const [notificationLogs, setNotificationLogs] = useState([]);

    // User roles
    const isSuperAdmin = user?.roles?.some(role => role.name === 'super_admin');
    const isAdminHelpDesk = user?.roles?.some(role => role.name === 'admin_help_desk');
    const isAdminOperations = user?.roles?.some(role => role.name === 'admin_operations');

    // Estados para eventos
    const [events, setEvents] = useState([]);
    const [eventListeners, setEventListeners] = useState([]);
    const [eventStats, setEventStats] = useState(null);

    // Estados para creación de usuarios
    const [sedes, setSedes] = useState([]);

    // Cargar datos iniciales
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            showToast('Cargando datos de administración...', 'info');

            if (isSuperAdmin) {
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
            }
        } catch (e) {
            setError(e.message);
            showToast('Error al cargar datos: ' + e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos de notificaciones
    const fetchNotificationData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [typesRes, channelsRes, configsRes, statsRes] = await Promise.all([
                fetch(API_ROUTES.NOTIFICATIONS_ADMIN.TYPES, { headers }),
                fetch(API_ROUTES.NOTIFICATIONS_ADMIN.CHANNELS, { headers }),
                fetch(API_ROUTES.NOTIFICATIONS_ADMIN.CONFIGS, { headers }),
                fetch(API_ROUTES.NOTIFICATIONS_ADMIN.ADMIN_STATS, { headers })
            ]);

            if (typesRes.ok) {
                const typesData = await typesRes.json();
                setNotificationTypes(typesData.data || []);
            }

            if (channelsRes.ok) {
                const channelsData = await channelsRes.json();
                setNotificationChannels(channelsData.data || []);
            }

            if (configsRes.ok) {
                const configsData = await configsRes.json();
                setNotificationConfigs(configsData.data || []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setNotificationStats(statsData.data);
            }

        } catch (e) {
            console.error('Error cargando datos de notificaciones:', e);
        }
    };

    // Cargar datos de eventos
    const fetchEventData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [eventsRes, statsRes] = await Promise.all([
                fetch(API_ROUTES.EVENTS.LIST, { headers }),
                fetch(API_ROUTES.EVENTS.STATS, { headers })
            ]);

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData.data || []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setEventStats(statsData.data);
            }

        } catch (e) {
            console.error('Error cargando datos de eventos:', e);
        }
    };

    // Cargar sedes
    const fetchSedes = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const response = await fetch(API_ROUTES.SEDES.LIST, { headers });

            if (response.ok) {
                const sedesData = await response.json();
                setSedes(sedesData || []);
            }
        } catch (e) {
            console.error('Error cargando sedes:', e);
        }
    };

    useEffect(() => {
        fetchData();
        // fetchNotificationData();
        // fetchEventData();
        fetchSedes();
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
                const originalRole = originalData.roles.find(r => r.id == role.id);
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
                const originalUser = originalData.users.find(u => u.id == user.id);
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
                if (role.id == roleId) {
                    const currentPermissions = role.permissions || [];
                    const updatedPermissions = checked
                        ? [...currentPermissions, permissions.find(p => p.id == permissionId)]
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
                if (user.id == userId) {
                    const currentRoles = user.roles || [];
                    const updatedRoles = checked
                        ? [...currentRoles, roles.find(r => r.id == roleId)]
                        : currentRoles.filter(r => r.id !== roleId);

                    return { ...user, roles: updatedRoles };
                }
                return user;
            })
        );
        // Actualizar también el usuario seleccionado para feedback visual inmediato
        if (selectedUser && selectedUser.id == userId) {
            setSelectedUser(prevSelectedUser => {
                const currentRoles = prevSelectedUser.roles || [];
                const updatedRoles = checked
                    ? [...currentRoles, roles.find(r => r.id == roleId)]
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
            const roleData = roles.find(r => r.id == role.id);
            if (roleData && roleData.permissions) {
                roleData.permissions.forEach(permission => {
                    userPermissions.add(permission.id);
                });
            }
        });
        return Array.from(userPermissions);
    };

    // Callback cuando se crea un usuario exitosamente
    const handleUserCreated = async () => {
        await fetchData();
    };

    // Filtrar usuarios
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrar roles para creación de usuarios (solo los tres específicos)
    const availableRoles = roles.filter(role =>
        ['comercial_mundial', 'agente_contacto', 'coordinador_contacto'].includes(role.name)
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
                        <TabsList className="grid w-full grid-cols-6">
                            {
                                isSuperAdmin && <>
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
                                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                                        <Bell className="h-4 w-4" />
                                        Notificaciones
                                    </TabsTrigger>
                                    <TabsTrigger value="events" className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4" />
                                        Eventos
                                    </TabsTrigger>
                                </>
                            }
                            {
                                (isAdminHelpDesk || isSuperAdmin) && <>
                                    <TabsTrigger value="create-user" className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Crear Usuario
                                    </TabsTrigger>
                                </>
                            }

                        </TabsList>

                        {/* Tab de Asignaciones */}
                        <TabsContent value="assignments" className="space-y-6">
                            <RoleAssignments
                                users={users}
                                roles={roles}
                                permissions={permissions}
                                selectedUser={selectedUser}
                                setSelectedUser={setSelectedUser}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                handleUserRoleChange={handleUserRoleChange}
                                getUserPermissions={getUserPermissions}
                            />
                        </TabsContent>

                        {/* Tab de Roles */}
                        <TabsContent value="roles" className="space-y-6">
                            <RoleManagement
                                roles={roles}
                                permissions={permissions}
                                selectedRole={selectedRole}
                                setSelectedRole={setSelectedRole}
                                handleRolePermissionChange={handleRolePermissionChange}
                            />
                        </TabsContent>

                        {/* Tab de Permisos */}
                        <TabsContent value="permissions">
                            <PermissionsList permissions={permissions} />
                        </TabsContent>

                        {/* Tab de Crear Usuario */}
                        <TabsContent value="create-user">
                            <UserCreationForm
                                sedes={sedes}
                                availableRoles={availableRoles}
                                onUserCreated={handleUserCreated}
                                showToast={showToast}
                            />
                        </TabsContent>

                        {/* Tab de Notificaciones */}
                        {/* <TabsContent value="notifications" className="space-y-6">
                            <NotificationsPanel
                                notificationTypes={notificationTypes}
                                notificationChannels={notificationChannels}
                                notificationConfigs={notificationConfigs}
                                notificationStats={notificationStats}
                                fetchNotificationData={fetchNotificationData}
                            />
                        </TabsContent> */}

                        {/* Tab de Eventos */}
                        {/* <TabsContent value="events" className="space-y-6">
                            <EventsPanel
                                events={events}
                                eventStats={eventStats}
                                fetchEventData={fetchEventData}
                            />
                        </TabsContent> */}
                    </Tabs>

                    
                    <div>
                        <pre>
                            {JSON.stringify(user.roles, null, 2)}
                        </pre>
                    </div>
                </div>
            </AuthenticatedLayout>
        </RoleBasedRoute>
    );
} 