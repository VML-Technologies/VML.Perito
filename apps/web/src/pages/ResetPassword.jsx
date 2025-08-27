import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { NotificationProvider, useNotificationContext } from "@/contexts/notification-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ResetPasswordForm } from "@/components/reset-password-form"

function AppContent() {
    const { toast, hideToast } = useNotificationContext();

    return (
        <>
            <SidebarProvider>
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-col">
                        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                            <div className="w-full max-w-sm">
                                <ResetPasswordForm />
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
        </>
    )
}

function ResetPassword() {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    )
}

export default ResetPassword
