
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNotificationContext } from "@/contexts/notification-context"
import { LoginForm } from "@/components/login-form"
import { LoginBackground } from "@/components/loginBackground"

function GuestLayout() {
    const { toast, hideToast } = useNotificationContext();

    return (
        <SidebarProvider>
            <SidebarInset>
                <div className="flex flex-col">
                    <LoginBackground>
                        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                            <div className="w-full max-w-sm">
                                <LoginForm />
                            </div>
                        </div>
                    </LoginBackground>
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
    )
}

export default GuestLayout
