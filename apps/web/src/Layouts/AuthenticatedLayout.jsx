import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { useNotificationContext } from "@/contexts/notification-context"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

function AuthenticatedLayout({ children }) {
    const { toast, hideToast } = useNotificationContext();
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
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
