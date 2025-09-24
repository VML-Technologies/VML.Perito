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

function AuthenticatedLayout({ children }) {
    const { user, logout } = useAuth();
    const { hasRole, loading } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
    const canAccessHelpDesk = hasRole('help_desk') || hasRole('super_admin');
    const { toast, hideToast } = useNotificationContext();
    const navigate = useNavigate();
    const location = useLocation();

    useWebSocket();

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
                {
                    (canAccessAdmin || canAccessHelpDesk) && (
                        <AppSidebar />
                    )
                }
                <SidebarInset>
                    <div className="flex items-center gap-2 p-4 border-b">
                        {(canAccessAdmin || canAccessHelpDesk) && (
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
