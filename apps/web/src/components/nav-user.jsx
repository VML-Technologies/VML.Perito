import {
  LogOut,
  Lock,
  User,
  HeadsetIcon,
  MoreVertical,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/contexts/auth-context"
import { useNotificationContext } from "@/contexts/notification-context"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function NavUser() {
  const { user, logout } = useAuth()
  const { showToast } = useNotificationContext()
  const navigate = useNavigate()

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout()
      showToast('Sesión cerrada exitosamente', 'success')
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      showToast('Error al cerrar sesión', 'error')
    }
  }

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) return null

  return (
    <DropdownMenu>
      {/* Mobile trigger - entire button clickable */}
      <DropdownMenuTrigger asChild className="md:hidden">
        <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 h-auto p-1 sm:p-2">
          <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {
                user.roles && user.roles.find(role => role.name == 'agente_contacto') ?
                  <HeadsetIcon className="size-4" /> : <>
                    {getUserInitials(user.name)}
                  </>
              }
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Desktop layout - only 3 dots clickable */}
      <div className="hidden md:flex items-center gap-1 sm:gap-2">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {
              user.roles && user.roles.find(role => role.name == 'agente_contacto') ?
                <HeadsetIcon className="size-4" /> : <>
                  {getUserInitials(user.name)}
                </>
            }
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 bg-[#EAF4FF] px-3 py-2 rounded-lg">
          <div className="min-w-0 max-w-full text-left">
            <div className="truncate font-medium text-sm">{user.name || 'Usuario'}</div>
            <div className="text-muted-foreground truncate text-xs">{user.email || 'Sin email'}</div>
          </div>
        </div>

        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-1 cursor-pointer">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
      </div>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium">{user.name || 'Usuario'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email || 'Sin email'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile#changePassword">
                  <Lock className="mr-2 h-4 w-4" />
                  Cambiar contraseña
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
    </DropdownMenu>
  );
}
