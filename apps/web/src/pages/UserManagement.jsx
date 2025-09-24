import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, Edit, Search, RefreshCw, AlertCircle, Building, Shield, Mail, Phone, Key } from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { UserCreationForm } from './admin/UserCreationForm';

export default function UserManagement() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState(null);

    const { showToast } = useNotificationContext();

    // Cargar datos iniciales
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [usersRes, sedesRes, rolesRes] = await Promise.all([
                fetch(API_ROUTES.USERS.WITH_ROLES, { headers }),
                fetch(API_ROUTES.SEDES.LIST, { headers }),
                fetch(API_ROUTES.ROLES.LIST, { headers })
            ]);

            if (!usersRes.ok || !sedesRes.ok || !rolesRes.ok) {
                throw new Error('Error al cargar datos');
            }

            const usersData = await usersRes.json();
            const sedesData = await sedesRes.json();
            const rolesData = await rolesRes.json();

            setUsers(usersData);
            setSedes(sedesData);
            
            // Filtrar roles para creación/edición de usuarios
            const availableRoles = rolesData.filter(role =>
                true//['comercial_mundial', 'agente_contacto', 'coordinador_contacto'].includes(role.name)
            );
            setRoles(availableRoles);

        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los datos de usuarios');
            showToast('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Callback cuando se crea o edita un usuario exitosamente
    const handleUserSaved = async () => {
        await fetchData();
        setShowForm(false);
        setEditingUser(null);
    };

    // Función para editar usuario
    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    // Función para cancelar edición
    const handleCancelEdit = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    // Función para crear nuevo usuario
    const handleCreateNew = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    // Filtrar usuarios
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identification?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener nombre de sede
    const getSedeName = (sedeId) => {
        const sede = sedes.find(s => s.id === sedeId);
        return sede ? sede.name : 'Sin sede';
    };

    // Obtener roles del usuario como string
    const getUserRoles = (user) => {
        if (!user.roles || user.roles.length === 0) return 'Sin roles';
        return user.roles.map(role => role.name).join(', ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Cargando usuarios...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">
                        Administra los usuarios del sistema, crea nuevos usuarios y edita información existente.
                    </p>
                </div>
                <Button 
                    onClick={handleCreateNew}
                    className="flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Formulario de Usuario (Mostrado/Oculto) */}
                {showForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {editingUser ? (
                                    <>
                                        <Edit className="h-5 w-5" />
                                        Editar Usuario
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        Crear Nuevo Usuario
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {editingUser 
                                    ? `Editando usuario: ${editingUser.name}`
                                    : 'Crea un nuevo usuario en el sistema. Se enviará un email de bienvenida automáticamente.'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserCreationForm
                                sedes={sedes}
                                availableRoles={roles}
                                onUserCreated={handleUserSaved}
                                showToast={showToast}
                                editingUser={editingUser}
                                onCancel={handleCancelEdit}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Lista de Usuarios */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Lista de Usuarios ({filteredUsers.length})
                        </CardTitle>
                        <CardDescription>
                            Gestiona todos los usuarios del sistema. Haz clic en "Editar" para modificar un usuario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Búsqueda */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Buscar usuarios por nombre, email o identificación..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Tabla de Usuarios */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead>Acceso</TableHead>
                                        <TableHead className="w-20">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                {searchTerm ? 'No se encontraron usuarios con ese criterio de búsqueda' : 'No hay usuarios registrados'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Users className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                ID: {user.identification || 'Sin ID'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                                            <span className="truncate max-w-48">{user.email}</span>
                                                        </div>
                                                        {user.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{user.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Building className="h-3 w-3 text-muted-foreground" />
                                                            <span className="truncate max-w-32">{getSedeName(user.sede_id)}</span>
                                                        </div>
                                                        {user.intermediary_key && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Key className="h-3 w-3" />
                                                                <span className="truncate max-w-32">{user.intermediary_key}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles && user.roles.length > 0 ? (
                                                                user.roles.map((role) => (
                                                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        {role.name}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">Sin roles</span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                            {user.temporary_password && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Temporal
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditUser(user)}
                                                        className="flex items-center gap-1 w-full"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        Editar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
        </div>
    );
}
