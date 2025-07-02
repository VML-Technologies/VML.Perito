import { useAuth } from '@/contexts/auth-context';

export const Dashboard = () => {
    const { user, logout } = useAuth();

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