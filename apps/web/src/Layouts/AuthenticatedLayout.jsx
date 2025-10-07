import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { useNotificationContext } from "@/contexts/notification-context"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useWebSocket } from "@/hooks/use-websocket"
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function AuthenticatedLayout({ children, routesMap }) {
    const { user, logout } = useAuth();
    const { hasRole, loading, roles } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
    const canAccessHelpDesk = hasRole('help_desk') || hasRole('super_admin');
    const { toast, hideToast } = useNotificationContext();
    const navigate = useNavigate();
    const location = useLocation();

    useWebSocket();

    // Filtrar rutas disponibles según los roles del usuario
    const availableRoutes = routesMap ? Object.values(routesMap).filter(route => 
        route.roles.some(role => roles.includes(role))
    ) : [];
    
    // Mostrar sidebar solo si tiene más de 1 módulo disponible O es admin/help_desk
    const shouldShowSidebar = (canAccessAdmin || canAccessHelpDesk) || availableRoutes.length > 1;

    useEffect(() => {
        if (user?.temporary_password && location.pathname !== '/forced-password-change') {
            navigate('/forced-password-change', { replace: true });
        }
    }, [user?.temporary_password, location.pathname, navigate]);

    if (user?.temporary_password && location.pathname !== '/forced-password-change') {
        return null;
    }

    return (
        <ProtectedRoute>
            <SidebarProvider>
                {shouldShowSidebar && (
                    <AppSidebar routesMap={routesMap} />
                )}
                <SidebarInset>
                    <div className="flex items-center gap-2 p-4 border-b">
                        {shouldShowSidebar && (
                            <SidebarTrigger />
                        )}
                        <SiteHeader />
                    </div>
                    <div className="m-4">
                        {children}
                    </div>
                </SidebarInset>

                {/* Sistema de Toasts */}
                {toast && (
                    <NotificationToast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </SidebarProvider>
        </ProtectedRoute>
    )
}

export default AuthenticatedLayout;
