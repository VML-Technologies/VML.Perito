import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { NotificationToast } from "@/components/notification-toast"
import { NotificationDemo } from "@/components/notification-demo"
import { NotificationProvider, useNotificationContext } from "@/contexts/notification-context"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import data from "./data.json"
import { LoginForm } from "@/components/login-form"

function AppContent() {
  const { toast, hideToast } = useNotificationContext();

  return (
    <>
      <SidebarProvider>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                  <div className="w-full max-w-sm">
                    <LoginForm />
                  </div>
                </div>
                <div className="px-4 lg:px-6">
                  <NotificationDemo />
                </div>
                {/* <SectionCards /> */}
                {/* <ChartAreaInteractive /> */}
                {/* <DataTable data={data} /> */}
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

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  )
}

export default App
