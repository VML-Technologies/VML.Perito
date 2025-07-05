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
    <header className="border-b h-16 flex items-center gap-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <AppName />
        <div className="ml-auto flex items-center gap-2">
          <WebSocketStatus />
          <NotificationMenu />
          <NavUser user={user} />
        </div>
      </div>
    </header>
  );
}
