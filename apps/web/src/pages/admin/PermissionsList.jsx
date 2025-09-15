import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key } from 'lucide-react';

export function PermissionsList({ permissions }) {
    return (
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
    );
}
