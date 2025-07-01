
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { NotificationProvider } from "@/contexts/notification-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNotificationContext } from "@/contexts/notification-context"
import { LoginForm } from "@/components/login-form"

function GuestLayout() {
    const { toast, hideToast } = useNotificationContext();

    return (
        <NotificationProvider>
            <SidebarProvider>
                <SidebarInset>
                    <div className="flex flex-col">
                        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                            <div className="w-full max-w-sm">
                                <LoginForm />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Sistema de Toasts */}
            {toast && (
                <NotificationToast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </NotificationProvider>
    )
}

export default GuestLayout
