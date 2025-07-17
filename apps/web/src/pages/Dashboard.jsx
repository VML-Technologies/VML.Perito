import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { Shield, Users, UserCheck, Phone, Building } from 'lucide-react';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const { hasRole, loading } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
    const isCoordinador = hasRole('coordinador_contacto');
    const isComercial = hasRole('comercial_mundial');
    const isAgente = hasRole('agente_contacto');
    const navigate = useNavigate();

    useEffect(() => {
        // Solo redirigir cuando los roles ya se han cargado
        if (!loading) {
            if (isCoordinador) {
                navigate('/coordinador-contacto');
            } else if (isComercial) {
                navigate('/comercial-mundial');
            } else if (isAgente) {
                navigate('/agente-contacto');
            }
        }
    }, [loading, isCoordinador, isComercial, isAgente, navigate]);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.name || 'Usuario'}
                </h1>
                {
                    canAccessAdmin && (
                        <p className="text-gray-600 mt-2">
                            Panel de control del sistema
                        </p>
                    )
                }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {isCoordinador && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-lg shadow-md text-white">
                        <div className="flex items-center mb-2">
                            <Users className="mr-2" />
                            <h3 className="text-lg font-semibold">
                                Coordinador de Contact Center
                            </h3>
                        </div>
                        <p className="text-purple-100 mb-4">
                            Supervisa y asigna agentes a las órdenes de inspección
                        </p>
                        <Link
                            to="/coordinador-contacto"
                            className="inline-block bg-white text-purple-600 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Ir a Coordinación
                        </Link>
                    </div>
                )}

                {isComercial && (
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg shadow-md text-white">
                        <div className="flex items-center mb-2">
                            <Building className="mr-2" />
                            <h3 className="text-lg font-semibold">
                                Dashboard Comercial
                            </h3>
                        </div>
                        <p className="text-green-100 mb-4">
                            Crea y gestiona órdenes de inspección vehicular
                        </p>
                        <Link
                            to="/comercial-mundial"
                            className="inline-block bg-white text-green-600 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Ir a Comercial
                        </Link>
                    </div>
                )}

                {isAgente && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-lg shadow-md text-white">
                        <div className="flex items-center mb-2">
                            <Phone className="mr-2" />
                            <h3 className="text-lg font-semibold">
                                Dashboard Agente CC
                            </h3>
                        </div>
                        <p className="text-orange-100 mb-4">
                            Gestiona llamadas y agendamientos de inspecciones
                        </p>
                        <Link
                            to="/agente-contacto"
                            className="inline-block bg-white text-orange-600 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Ir a Contact Center
                        </Link>
                    </div>
                )}

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