import { useEffect } from "react"
import { NotificationToast } from "@/components/notification-toast"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNotificationContext } from "@/contexts/notification-context"
import { LoginForm } from "@/components/login-form"
import { LoginBackground } from "@/components/loginBackground"
import headerImage from "@/assets/loginAssets/MarcaMobile.png"

function GuestLayout() {
    const { toast, hideToast } = useNotificationContext()

    useEffect(() => {
        // Cambiar color de barra de estado al entrar
        const metaTheme = document.querySelector('meta[name="theme-color"]')
        const originalColor = metaTheme?.content || '#ffffff'
        
        if (metaTheme) {
            metaTheme.content = '#235692'
        } else {
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = '#235692'
            document.head.appendChild(meta)
        }

        // Deshabilitar zoom en móvil
        const metaViewport = document.querySelector('meta[name="viewport"]')
        const originalViewport = metaViewport?.content || 'width=device-width, initial-scale=1'
        
        if (metaViewport) {
            metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        }

        // Restaurar configuraciones originales al salir
        return () => {
            const currentMeta = document.querySelector('meta[name="theme-color"]')
            if (currentMeta) {
                currentMeta.content = originalColor
            }
            
            const currentViewport = document.querySelector('meta[name="viewport"]')
            if (currentViewport) {
                currentViewport.content = originalViewport
            }
        }
    }, [])

    return (
        <SidebarProvider>
            <SidebarInset>
                <div className="flex flex-col">

                    {/* Mobile Header */}
                    <div className="block md:hidden bg-[#235692] py-4 flex justify-center relative z-20">
                        <img
                            src={headerImage}
                            alt="Header"
                            className="h-8 w-auto"
                        />
                    </div>

                    {/* Sun below banner (mobile) */}
                    <div className="block md:hidden absolute top-16 right-0 w-20 h-20 z-10 overflow-hidden">
                        <div
                            className="absolute top-0right-0w-40h-40bg-[#EEB71B]rounded-fulltranslate-x-1/2-translate-y-1/2"
                        />
                    </div>



                    {/* Content */}
                    <LoginBackground>
                        <div className="flex h-svh w-full items-center justify-center p-6 md:p-10">
                            <div className="w-full max-w-sm">
                                <LoginForm />
                            </div>
                        </div>
                    </LoginBackground>

                </div>
            </SidebarInset>

            {/* Toasts */}
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
