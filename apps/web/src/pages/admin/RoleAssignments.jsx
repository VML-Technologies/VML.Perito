import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Users, Settings } from 'lucide-react';

export function RoleAssignments({ 
    users, 
    roles, 
    permissions, 
    selectedUser, 
    setSelectedUser, 
    searchTerm, 
    setSearchTerm,
    handleUserRoleChange,
    getUserPermissions 
}) {
    // Filtrar usuarios
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
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
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedUser?.id == user.id
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
                                            {user.roles?.length == 0 && (
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
                                        const isAssigned = selectedUser.roles?.some(r => r.id == role.id);
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
                                                const permission = permissions.find(p => p.id == permissionId);
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
    );
}
