import { Bell, Check, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useNotificationContext } from "@/contexts/notification-context"

export function NotificationMenu() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        removeNotification
    } = useNotificationContext();

    const handleNotificationItemClick = async (notification) => {
        // Marcar como leída si no lo está
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        handleNotificationClick(notification);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleRemoveNotification = (e, notificationId) => {
        e.stopPropagation();
        removeNotification(notificationId);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-6 px-2 text-xs"
                        >
                            Marcar todas como leídas
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Cargando notificaciones...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No hay notificaciones
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`p-3 my-2 cursor-pointer hover:bg-muted/50 ${!notification.read ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                    }`}
                                onClick={() => handleNotificationItemClick(notification)}
                            >
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex justify-between items-start">
                                        <span className={`font-medium text-sm ${!notification.read ? 'text-blue-900' : ''}`}>
                                            {notification.title}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">
                                                {notification.time}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                                                onClick={(e) => handleRemoveNotification(e, notification.id)}
                                            >
                                                <X size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className={`text-xs ${!notification.read ? 'text-blue-700' : 'text-muted-foreground'}`}>
                                        {notification.description}
                                    </p>
                                    {!notification.read && (
                                        <div className="flex items-center gap-1 text-xs text-blue-600">
                                            <Check size={12} />
                                            <span>Nueva</span>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuGroup>
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
                            Ver todas las notificaciones
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}