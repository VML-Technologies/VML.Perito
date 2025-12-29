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
      <div className="flex w-full items-center gap-2 px-4 py-2 sm:px-6 lg:gap-3 rounded-xl bg-[#EAF4FF] shadow-sm border border-[#D3E3F5]">
        
        {/* Desktop Layout */}
        <div className="hidden md:flex w-full items-center gap-2">
          {/* Logo/App Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AppName />
          </div>

          {/* Center - WebSocket Status */}
          <div className="flex items-center justify-center">
            <WebSocketStatus />
          </div>

          {/* Right section - User controls */}
          <div className="flex items-center gap-2 min-w-0">
            <NotificationMenu />
            <NavUser user={user} />
          </div>
        </div>

        {/* Mobile Layout - Only status, notifications and user */}
        <div className="flex md:hidden w-full items-center justify-between">
          {/* Left - WebSocket Status */}
          <div className="flex items-center">
            <WebSocketStatus />
          </div>

          {/* Right - Notifications and User */}
          <div className="flex items-center gap-2">
            <NotificationMenu />
            <NavUser user={user} />
          </div>
        </div>
        
      </div>
    </header>
  );
}
