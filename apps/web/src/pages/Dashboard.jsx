import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { Shield } from 'lucide-react';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const { hasRole } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.name || 'Usuario'}
                </h1>
                <p className="text-gray-600 mt-2">
                    Panel de control del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Documentos
                    </h3>
                    <p className="text-gray-600">
                        Gestiona tus documentos y archivos
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Reportes
                    </h3>
                    <p className="text-gray-600">
                        Visualiza reportes y estadísticas
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Configuración
                    </h3>
                    <p className="text-gray-600">
                        Ajusta las preferencias del sistema
                    </p>
                </div>

                {canAccessAdmin && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-md text-white">
                        <div className="flex items-center mb-2">
                            <Shield className="mr-2" />
                            <h3 className="text-lg font-semibold">
                                Administración RBAC
                            </h3>
                        </div>
                        <p className="text-blue-100 mb-4">
                            Gestiona roles, permisos y asignaciones del sistema
                        </p>
                        <Link
                            to="/admin"
                            className="inline-block bg-white text-blue-600 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Ir a Administración
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}; 