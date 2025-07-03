import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RoleBasedRoute } from '@/components/RoleBasedRoute';
import { RolesTable } from '@/components/rbac/RolesTable';
import { PermissionsTable } from '@/components/rbac/PermissionsTable';
import { AssignmentsTable } from '@/components/rbac/AssignmentsTable';

export default function Admin() {
    return (
        <RoleBasedRoute requiredRoles={['admin', 'super_admin']}>
            <AuthenticatedLayout>
                <div className="max-w-5xl mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6">Administración de Roles y Permisos (RBAC)</h1>
                    <Tabs defaultValue="roles">
                        <TabsList>
                            <TabsTrigger value="roles">Roles</TabsTrigger>
                            <TabsTrigger value="permissions">Permisos</TabsTrigger>
                            <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
                        </TabsList>
                        <TabsContent value="roles">
                            <RolesTable />
                        </TabsContent>
                        <TabsContent value="permissions">
                            <PermissionsTable />
                        </TabsContent>
                        <TabsContent value="assignments">
                            <AssignmentsTable />
                        </TabsContent>
                    </Tabs>
                </div>
            </AuthenticatedLayout>
        </RoleBasedRoute>
    );
} 