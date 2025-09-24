import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppName } from "@/components/ui/app-name"
import { NavUser } from "@/components/nav-user";
import { NotificationMenu } from "@/components/notification-menu";
import { WebSocketStatus } from "@/components/websocket-status";

export function SiteHeader() {
  const user = {
    name: "Simon bolivar",
    email: "simon.bolivar@holdingvml.net",
    avatar: "/avatars/shadcn.jpg",
  }
  return (
    <header className="border-b h-16 flex items-center gap-2 w-full">
      <div className="flex w-full items-center gap-1 px-2 sm:px-4 lg:gap-2 lg:px-6">
        {/* Logo/App Name - Responsive */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <AppName />
        </div>

        {/* Right section - User controls */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* WebSocket Status - Mobile only */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <WebSocketStatus />
          </div>

          {/* Notification Menu */}
          <div className="hidden sm:block">
            <NotificationMenu />
          </div>

          {/* User Menu */}
          <div className="min-w-0">
            <NavUser user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
