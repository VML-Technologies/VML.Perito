import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { Shield, Users, UserCheck, Phone, Building, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const { hasRole, loading, roles } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
    const navigate = useNavigate();
    const hasRedirected = useRef(false);

    const routesMap = {
        '/coordinador-contacto': {
            name: 'Coordinador de Contact Center',
            description: 'Supervisa y asigna agentes a las órdenes de inspección',
            route: '/coordinador-contacto',
            icon: Users,
            gradientClass: 'bg-gradient-to-r from-purple-500 to-purple-600',
            textClass: 'text-purple-100',
            buttonClass: 'text-purple-600 hover:text-purple-700',
            type: 'navigate',
            roles: ['coordinador_contacto']
        },
        '/comercial-mundial': {
            name: 'Comercial Mundial',
            description: 'Crea y gestiona órdenes de inspección vehicular',
            route: '/comercial-mundial',
            icon: Building,
            gradientClass: 'bg-gradient-to-r from-green-500 to-green-600',
            textClass: 'text-green-100',
            buttonClass: 'text-green-600 hover:text-green-700',
            type: 'navigate',
            roles: ['comercial_mundial', 'comercial_mundial_4']
        },
        '/agente-contacto': {
            name: 'Agente de Contact Center',
            description: 'Gestiona llamadas y agendamientos de inspecciones',
            route: '/agente-contacto',
            icon: Phone,
            gradientClass: 'bg-gradient-to-r from-orange-500 to-orange-600',
            textClass: 'text-orange-100',
            buttonClass: 'text-orange-600 hover:text-orange-700',
            type: 'navigate',
            roles: ['agente_contacto']
        },
        '/coordinador-vml': {
            name: 'Coordinador de VML',
            description: 'Supervisa y asigna agentes a las órdenes de inspección',
            route: '/coordinador-vml',
            icon: Users,
            gradientClass: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
            textClass: 'text-indigo-100',
            buttonClass: 'text-indigo-600 hover:text-indigo-700',
            type: 'navigate',
            roles: ['coordinador_vml']
        },
        '/inspector-aliado': {
            name: 'Inspector Aliado',
            description: 'Supervisa y asigna agentes a las órdenes de inspección',
            route: '/inspector-aliado',
            icon: Users,
            gradientClass: 'bg-gradient-to-r from-blue-500 to-blue-600',
            textClass: 'text-blue-100',
            buttonClass: 'text-blue-600 hover:text-blue-700',
            type: 'navigate',
            roles: ['inspector_aliado']
        },
        '/inspector': {
            name: 'Inspector',
            description: 'InspectYA | Realiza inspecciones vehiculares',
            route: '/inspector',
            icon: Users,
            gradientClass: 'bg-gradient-to-r from-red-500 to-red-600',
            textClass: 'text-red-100',
            buttonClass: 'text-red-600 hover:text-red-700',
            type: 'redirect',
            redirectUrl: import.meta.env.VITE_INSPECTYA_URL,
            roles: ['inspector']
        },
        '/supervisor': {
            name: 'Supervisor',
            description: 'InspectYA | Supervisa inspecciones vehiculares',
            route: '/supervisor',
            icon: Users,
            gradientClass: 'bg-gradient-to-r from-pink-500 to-pink-600',
            textClass: 'text-pink-100',
            buttonClass: 'text-pink-600 hover:text-pink-700',
            type: 'redirect',
            redirectUrl: import.meta.env.VITE_INSPECTYA_URL,
            roles: ['supervisor']
        }
    }


    useEffect(() => {
        console.log(!loading && !hasRedirected.current && roles.length == 1);
        if (!loading && !hasRedirected.current && roles.length == 1) {

            const role = roles[0];
            console.log(role);
            const route = Object.values(routesMap).find(r => r.roles.includes(role));
            console.log(route);
            if (route) {
                hasRedirected.current = true;
                if (route.type === 'redirect' && route.redirectUrl) {
                    console.log('Redirigiendo a URL externa:', route.redirectUrl);
                    window.location.href = route.redirectUrl;
                } else if (route.type === 'navigate') {
                    console.log('Navegando a ruta interna:', route.route);
                    navigate(route.route);
                } else {
                    console.warn('Tipo de ruta no válido:', route.type);
                }
            }
        }
    }, [loading, roles, navigate]);

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
                <pre>
                    {JSON.stringify(roles, null, 2)}
                </pre>
                {Object.values(routesMap).filter(r => r.roles.some(role => roles.includes(role))).map((route, index) => {
                    const Icon = route.icon;
                    
                    // Función para manejar el clic
                    const handleClick = (e) => {
                        if (route.type === 'redirect') {
                            e.preventDefault();
                            if (route.redirectUrl) {
                                console.log('Redirigiendo a URL externa desde link:', route.redirectUrl);
                                window.location.href = route.redirectUrl;
                            } else {
                                console.warn('redirectUrl no está configurada para la ruta:', route.route);
                            }
                        }
                        // Si es type: 'navigate', no hacemos nada, el Link se encarga
                    };
                    
                    return (
                        <div key={index} className={`${route.gradientClass} p-6 rounded-lg shadow-md text-white hover:shadow-lg transition-shadow cursor-pointer flex justify-between flex-col`}>
                            <div>
                                <div className="flex items-center mb-2">
                                    <Icon className="mr-2 w-5 h-5" />
                                    <h3 className="text-lg font-semibold">
                                        {route.name}
                                    </h3>
                                </div>
                                <p className={`${route.textClass} mb-4`}>
                                    {route.description}
                                </p>
                            </div>
                            <div className='flex justify-end'>
                                <Link 
                                    to={route.route} 
                                    onClick={handleClick}
                                    className={`inline-flex items-center bg-white ${route.buttonClass} font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors`}
                                >
                                    Visitar módulo
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}; 