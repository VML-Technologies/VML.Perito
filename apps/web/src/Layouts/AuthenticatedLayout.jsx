import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { useNotificationContext } from "@/contexts/notification-context"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useWebSocket } from "@/hooks/use-websocket"
import { useAuth } from '@/contexts/auth-context';
import { useRoles } from '@/hooks/use-roles';

function AuthenticatedLayout({ children }) {
    const { user, logout } = useAuth();
    const { hasRole, loading } = useRoles();
    const canAccessAdmin = hasRole('admin') || hasRole('super_admin');
    const { toast, hideToast } = useNotificationContext();
    // Inicializar WebSocket para toda la aplicación autenticada
    useWebSocket();
    return (
        <ProtectedRoute>
            <SidebarProvider>
                {
                    canAccessAdmin && (
                        <AppSidebar />
                    )
                }
                <SidebarInset>
                    <SiteHeader />
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
