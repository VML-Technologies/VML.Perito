import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

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
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedRole?.id == role.id
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
                                    const isAssigned = selectedRole.permissions?.some(p => p.id == permission.id);
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
    );
}
