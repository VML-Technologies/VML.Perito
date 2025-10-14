import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Users, Key, CheckCircle, XCircle, Search } from 'lucide-react';

export function RoleManagement({ 
    roles, 
    permissions, 
    selectedRole, 
    setSelectedRole,
    handleRolePermissionChange 
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Roles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Roles del Sistema ({roles.length})
                    </CardTitle>
                    <CardDescription>
                        Selecciona un rol para modificar sus permisos y configuraciones de acceso.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                    selectedRole?.id == role.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => {
                                    setSelectedRole(role);
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Shield className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-medium text-sm truncate">{role.name}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {role.permissions?.length || 0} permisos
                                            </Badge>
                                        </div>
                                        {role.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Permisos del Rol */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        {selectedRole ? `Permisos de ${selectedRole.name}` : 'Permisos del Rol'}
                    </CardTitle>
                    <CardDescription>
                        {selectedRole
                            ? `Gestiona los permisos asignados al rol ${selectedRole.name}. Los cambios se aplicarán inmediatamente.`
                            : 'Selecciona un rol para ver y modificar sus permisos de acceso al sistema.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedRole ? (
                        <div className="space-y-4">
                            {/* Resumen de permisos */}
                            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">
                                        {selectedRole.permissions?.length || 0} permisos asignados
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {permissions.length - (selectedRole.permissions?.length || 0)} disponibles
                                    </span>
                                </div>
                            </div>

                            {/* Lista de permisos */}
                            <div className="max-h-96 overflow-y-auto space-y-3">
                                {permissions.map(permission => {
                                    const isAssigned = selectedRole.permissions?.some(p => p.id == permission.id);
                                    return (
                                        <div key={permission.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                            <Checkbox
                                                id={`role-permission-${permission.id}`}
                                                checked={isAssigned}
                                                onCheckedChange={(checked) =>
                                                    handleRolePermissionChange(selectedRole.id, permission.id, checked)
                                                }
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Label htmlFor={`role-permission-${permission.id}`} className="cursor-pointer">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">{permission.name}</span>
                                                        {isAssigned && (
                                                            <Badge variant="default" className="text-xs">
                                                                Asignado
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {permission.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {permission.description}
                                                        </p>
                                                    )}
                                                </Label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 opacity-50" />
                            </div>
                            <h3 className="font-medium mb-2">Selecciona un rol</h3>
                            <p className="text-sm">Elige un rol de la lista para ver y modificar sus permisos</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
