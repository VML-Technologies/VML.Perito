import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { NotificationProvider, useNotificationContext } from "@/contexts/notification-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LoginForm } from "@/components/login-form"
import { LoginBackground } from "@/components/loginBackground"

function AppContent() {
    const { toast, hideToast } = useNotificationContext();

    return (
        <>
            <SidebarProvider>
                <SidebarInset>
                    <SiteHeader />
                    <LoginBackground>
                        <div className="flex flex-col">
                            <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6">
                                <div className="w-full max-w-md">
                                    <LoginForm />
                                </div>
                            </div>
                        </div>
                    </LoginBackground>
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
        </>
    )
}

function Login() {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    )
}

export default Login
